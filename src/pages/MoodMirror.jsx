import React, { useEffect, useRef, useState } from "react";
import {
  doc, collection, addDoc, updateDoc,
  serverTimestamp, onSnapshot, query, orderBy, deleteDoc
} from "firebase/firestore";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../firebase";
import ChatBubble from "../components/ChatBubble";
import { PlusCircle, Moon, Sun } from "lucide-react"; // removed SendHorizonal (handled by ChatInput now)
import axios from "axios";
import jsPDF from "jspdf";

// ✅ Import ChatInput component
import ChatInput from "../components/chat/ChatInput";

// 🔐 Login Modal
const LoginModal = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState("login");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      let userCredential;
      if (mode === "signup") {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      onLogin(userCredential.user.uid);
    } catch (err) {
      const code = err.code;
      if (code === 'auth/email-already-in-use') {
        setError("⚠️ Email already registered. Try logging in.");
      } else if (code === 'auth/invalid-email') {
        setError("⚠️ Invalid email address.");
      } else if (code === 'auth/weak-password') {
        setError("⚠️ Password too weak. Use at least 6 characters.");
      } else if (code === 'auth/user-not-found' || code === 'auth/wrong-password') {
        setError("❌ Invalid email or password.");
      } else {
        setError("⚠️ Something went wrong. Try again.");
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md w-full max-w-md space-y-4">
        <h2 className="text-xl font-bold text-center text-gray-800 dark:text-white">
          {mode === "signup" ? "📝 Create Account" : "🔐 Login to MoodMirror"}
        </h2>
        {error && <p className="text-red-600 text-sm text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            className="w-full border px-3 py-2 rounded-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full border px-3 py-2 rounded-lg"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            {mode === "signup" ? "Create Account" : "Login"}
          </button>
        </form>
        <p className="text-center text-sm">
          {mode === "signup" ? "Already have an account?" : "New here?"}{" "}
          <button
            onClick={() => setMode(mode === "signup" ? "login" : "signup")}
            className="text-indigo-600 hover:underline"
          >
            {mode === "signup" ? "Login" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
};

function MoodMirror() {
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        listenToHistory(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const handleSend = async (text) => {
    if (!text.trim()) return;

    const userMsg = { role: "user", text };
    const typing = { role: "ai", text: "__typing__" };
    const updated = [...messages, userMsg, typing];
    setMessages(updated);

    try {
      const res = await axios.post(
        "https://edgex-backend.onrender.com/groq",
        {
          model: "llama3-8b-8192",
          messages: [
            {
              role: "system",
              content:
                "You are MoodMirror by Mindmorph, a friendly Gen Z AI big sibling who reads chats and gives brutally honest but warm analysis of relationships: flirt, rizz, friendzone, manipulation, or overthinking. End with real advice.",
            },
            { role: "user", content: text },
          ],
          temperature: 0.75,
        }
      );

      const reply = res.data.choices[0].message.content;
      const finalChat = [...updated.slice(0, -1), { role: "ai", text: reply }];
      setMessages(finalChat);
      await saveChat(finalChat);
    } catch (err) {
      console.error("Groq error:", err);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "ai", text: "⚠️ Something went wrong. Try again!" },
      ]);
    }
  };

  const saveChat = async (chatData) => {
    if (!userId) return;

    if (!selectedChatId) {
      const firstMsg = chatData.find((m) => m.role === "user")?.text || "Untitled";
      const docRef = await addDoc(collection(db, "moodmirror", userId, "history"), {
        title: firstMsg.slice(0, 25),
        messages: chatData,
        createdAt: serverTimestamp(),
      });
      setSelectedChatId(docRef.id);
    } else {
      const ref = doc(db, "moodmirror", userId, "history", selectedChatId);
      await updateDoc(ref, { messages: chatData });
    }
  };

  const listenToHistory = (uid) => {
    const q = query(collection(db, "moodmirror", uid, "history"), orderBy("createdAt", "desc"));
    onSnapshot(q, (snap) => {
      const all = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setHistory(all);
    });
  };

  const renameChat = async (id, title) => {
    const ref = doc(db, "moodmirror", userId, "history", id);
    await updateDoc(ref, { title });
  };

  const loadChat = (id) => {
    const chat = history.find((c) => c.id === id);
    if (chat) {
      setMessages(chat.messages || []);
      setSelectedChatId(id);
    }
  };

  const deleteChat = async (id) => {
    if (!userId) return;
    const confirmDelete = window.confirm("Are you sure you want to delete this chat?");
    if (!confirmDelete) return;

    await deleteDoc(doc(db, "moodmirror", userId, "history", id));
    if (selectedChatId === id) {
      setSelectedChatId(null);
      setMessages([]);
    }
  };

  const exportChatToPDF = () => {
    const pdf = new jsPDF();
    let y = 10;

    messages.forEach(({ role, text }) => {
      const label = role === "user" ? "🧍 You:" : "🫀 MoodMirror:";
      const wrapped = pdf.splitTextToSize(`${label} ${text}`, 180);
      wrapped.forEach((line) => {
        if (y > 280) {
          pdf.addPage();
          y = 10;
        }
        pdf.text(line, 10, y);
        y += 8;
      });
      y += 4;
    });

    pdf.save("MoodMirror_Chat.pdf");
  };

  if (!userId) return <LoginModal onLogin={(uid) => setUserId(uid)} />;

  return (
   <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-50 dark:from-[#0f1b2e] dark:via-[#1c1a40] dark:to-[#1a0e2e] font-[Poppins] text-gray-900 dark:text-gray-100 transition-all duration-500 ease-in-out">
  {/* Sidebar */}
  <div className="w-full md:w-64 bg-white/40 dark:bg-white/5 backdrop-blur-md border-r border-white/20 p-4 space-y-4 shadow-md">
    <div className="flex justify-between items-center">
      <h2 className="text-lg font-extrabold bg-gradient-to-r from-indigo-600 via-purple-500 to-blue-400 bg-clip-text text-transparent dark:from-indigo-300 dark:via-purple-300 dark:to-blue-200">
         MoodMirror
      </h2>
      <div className="flex gap-2">
        <button
          onClick={() => {
            setMessages([]);
            setSelectedChatId(null);
          }}
          title="New Chat"
          className="text-indigo-600 dark:text-purple-300 hover:text-purple-700 dark:hover:text-blue-200 transition"
        >
          <PlusCircle size={20} />
        </button>
        <button
          onClick={() => setDarkMode(!darkMode)}
          title="Toggle Dark Mode"
          className="text-indigo-600 dark:text-purple-300 hover:text-purple-700 dark:hover:text-blue-200 transition"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </div>

    {history.map((chat) => (
      <div
        key={chat.id}
        className={`p-2 rounded-md cursor-pointer hover:bg-white/40 dark:hover:bg-white/10 transition ${
          selectedChatId === chat.id ? "bg-white/60 dark:bg-white/10" : ""
        }`}
        onClick={() => loadChat(chat.id)}
      >
        <input
          className="bg-transparent font-medium text-sm w-full dark:text-white focus:outline-none"
          defaultValue={chat.title}
          onBlur={(e) => renameChat(chat.id, e.target.value)}
        />
        {chat.createdAt?.seconds && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            🕒 {new Date(chat.createdAt.seconds * 1000).toLocaleString()}
          </p>
        )}
      </div>
    ))}
  </div>

  {/* Main Chat */}
  <div className="flex-1 p-4 md:p-6">
    <h1 className="text-3xl font-extrabold text-center mb-6 bg-gradient-to-r from-indigo-600 via-purple-500 to-blue-400 bg-clip-text text-transparent dark:from-indigo-300 dark:via-purple-300 dark:to-blue-200">
       MoodMirror: Decode the Vibe
    </h1>

    <div className="h-[65vh] overflow-y-auto space-y-4 p-4 bg-white/60 dark:bg-white/5 rounded-2xl border border-white/20 shadow-inner backdrop-blur-md">
      {messages.map((msg, i) => (
        <ChatBubble key={i} role={msg.role} text={msg.text} />
      ))}
      <div ref={messagesEndRef} />
    </div>

    {/* ✅ Replaced old input with ChatInput */}
    <div className="mt-4">
      <ChatInput onSend={handleSend} />
    </div>

    {/* Export Button */}
    <button
      onClick={exportChatToPDF}
      className="mt-6 flex items-center gap-2 bg-gradient-to-r from-indigo-600 via-purple-500 to-blue-400 text-white px-4 py-2 rounded-full shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-300"
    >
      📄 Export Chat
      <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">PDF</span>
    </button>
  </div>
</div>

  );
}

export default MoodMirror;
