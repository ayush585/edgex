import React, { useEffect, useRef, useState } from "react";
import {
  doc, getDoc, setDoc, collection, addDoc,
  serverTimestamp, onSnapshot, query, orderBy, updateDoc
} from "firebase/firestore";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  createUserWithEmailAndPassword, // ✅ Needed for Sign Up
} from "firebase/auth";
import { auth, db } from "../firebase";
import ChatBubble from "../components/ChatBubble";
import { SendHorizonal, Sun, Moon, PlusCircle } from "lucide-react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // ✅ Import jsPDF and autoTable for PDF generation


// 🧠 Extract name, fav subject, goal
const extractMemory = (text) => {
  const name = text.match(/(?:I am|My name is)\s+(\w+)/i)?.[1];
  const fav = text.match(/(?:I like|enjoy|love)\s+(.+?)(?=[.,]|$)/i)?.[1];
  const goal = text.match(/(?:want to be(?:come)?|dream of being)\s+(.+?)(?=[.,]|$)/i)?.[1];
  return {
    name: name || "friend",
    favSubject: fav || "design",
    goal: goal || "a designer",
  };
};

// 🔐 Login & Signup Modal
const LoginModal = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSignup, setIsSignup] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (isSignup) {
        res = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        res = await signInWithEmailAndPassword(auth, email, password);
      }
      onLogin(res.user.uid);
    } catch (err) {
      const code = err.code;
      if (code === "auth/email-already-in-use") {
        setError("⚠️ Email already registered. Try logging in.");
      } else if (code === "auth/invalid-email") {
        setError("⚠️ Invalid email format.");
      } else if (code === "auth/weak-password") {
        setError("⚠️ Password too weak (min 6 characters).");
      } else if (code === "auth/user-not-found" || code === "auth/wrong-password") {
        setError("❌ Wrong email or password.");
      } else {
        setError("❌ " + err.message);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md w-full max-w-md space-y-4">
        <h2 className="text-xl font-bold text-center text-gray-800 dark:text-white">
          {isSignup ? "📝 Create Account" : "🔐 Login to Edgex"}
        </h2>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <form onSubmit={handleAuth} className="space-y-3">
          <input
            type="email"
            className="w-full border px-3 py-2 rounded-lg"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            className="w-full border px-3 py-2 rounded-lg"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition">
            {isSignup ? "Create Account" : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 dark:text-gray-300">
          {isSignup ? "Already have an account?" : "New here?"}{" "}
          <button
            onClick={() => setIsSignup(!isSignup)}
            className="text-indigo-600 font-semibold hover:underline"
          >
            {isSignup ? "Login" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
};

function CareerCrack() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [useGroq, setUseGroq] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        loadMemory(user.uid);
        listenToHistory(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadMemory = async (uid) => {
    const docRef = doc(db, "memory", uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const { name, favSubject, goal } = snap.data();
      setMessages([
        {
          role: "ai",
          text: `👋 Welcome back, ${name}! I remember you like ${favSubject} and dream of becoming ${goal}.`,
        },
      ]);
    }
  };

  const saveMemory = async (text) => {
    const mem = extractMemory(text);
    if (userId) await setDoc(doc(db, "memory", userId), mem);
  };

  const saveChatToFirestore = async (chatData) => {
    if (!userId) return;
    const firstMsg = chatData.find((m) => m.role === "user")?.text || "Untitled";
    const newDoc = await addDoc(collection(db, "chats", userId, "history"), {
      title: firstMsg.slice(0, 25),
      messages: chatData,
      createdAt: serverTimestamp(),
    });
    setSelectedChatId(newDoc.id);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", text: input };
    const typing = { role: "ai", text: "__typing__" };
    const currentChat = [...messages, userMsg, typing];
    setMessages(currentChat);
    setInput("");

    try {
      let aiReply = "";

      if (useGroq) {
        const res = await axios.post(
          "https://edgex-backend.onrender.com/groq",
          {
            model: "llama3-8b-8192",
            messages: [
              {
                role: "system",
                content:
                  "You're CareerCrack, an AI mentor helping students pick careers. Always refer to their memory and speak like a friendly guide.",
              },
              { role: "user", content: input },
            ],
            temperature: 0.7,
          }
        );
        aiReply = res.data.choices[0].message.content;
      } else {
        const res = await axios.post("http://127.0.0.1:5000/ask", { prompt: input });
        aiReply = res.data.response;
      }

      await saveMemory(input);
      const updatedChat = [...currentChat.slice(0, -1), { role: "ai", text: aiReply }];
      setMessages(updatedChat);
      await saveChatToFirestore(updatedChat);
    } catch (err) {
      console.error("AI error:", err);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "ai", text: "⚠️ Something went wrong. Try again!" },
      ]);
    }
  };

  const listenToHistory = (uid) => {
    const q = query(collection(db, "chats", uid, "history"), orderBy("createdAt", "desc"));
    onSnapshot(q, (snap) => {
      const allChats = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setHistory(allChats);
    });
  };

  const renameChat = async (id, title) => {
    const ref = doc(db, "chats", userId, "history", id);
    await updateDoc(ref, { title });
  };

  const loadChat = (id) => {
    const chat = history.find((c) => c.id === id);
    if (chat) {
      setMessages(chat.messages || []);
      setSelectedChatId(id);
    }
  };

 

  
// Simple bar chart drawer using jsPDF graphics
const drawSimpleBarChart = (doc, data, labels, x, y, width, height, maxVal) => {
  const barWidth = (width / data.length) * 0.6;
  const gap = (width / data.length) * 0.4;

  doc.setFillColor("#7E57C2"); // Purple bars
  doc.setDrawColor("#5E35B1");
  doc.setLineWidth(0.8);

  data.forEach((val, i) => {
    const barHeight = (val / maxVal) * height;
    const xPos = x + i * (barWidth + gap);
    const yPos = y + height - barHeight;

    doc.roundedRect(xPos, yPos, barWidth, barHeight, 3, 3, "F");

    // Label centered below each bar
    doc.setFontSize(9);
    doc.setTextColor("#333");
    const labelWidth = doc.getTextWidth(labels[i]);
    doc.text(labels[i], xPos + barWidth / 2 - labelWidth / 2, y + height + 12);
  });

  // Chart border
  doc.setDrawColor("#AAA");
  doc.rect(x, y, width, height);
};

const exportChatToPDF = async (userId, userMemory, aiSuggestions) => {
  const mem = userMemory || { name: "friend", favSubject: "design", goal: "designer" };
  const {
    recommendedCareers = ["Software Engineer", "Designer"],
    keySkills = ["Problem Solving", "Collaboration"],
    nextSteps = ["Take online course", "Build projects"],
    skillFitScores = [80, 65, 90],
    skillFitLabels = ["Coding", "Communication", "Creativity"],
  } = aiSuggestions || {};

  const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait" });

  // ----- TITLE & HEADER BAR -----
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFillColor("#7E57C2");
  doc.rect(0, 0, pageWidth, 60, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor("#FFFFFF");
  doc.text("Your Career Report", 40, 40);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("powered by Edgex", 40, 55);

  // ----- USER INFO SECTION -----
  let y = 90;
  doc.setFillColor("#F3E5F5"); // Light purple background
  doc.roundedRect(40, y - 20, pageWidth - 80, 80, 10, 10, "F");

  doc.setTextColor("#4A148C");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("User Information", 50, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor("#333333");
  doc.text(`Name: ${mem.name}`, 50, y + 30);
  doc.text(`Dream Career: ${mem.goal}`, 50, y + 50);
  doc.text(`Favorite Subject: ${mem.favSubject}`, 280, y + 30);

  // ----- AI SUGGESTIONS SECTION -----
  y += 100;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor("#5E35B1");
  doc.text("AI Suggestions", 40, y);

  y += 10;

  // Common table styles
  const tableOptionsBase = {
    startY: y,
    margin: { left: 40, right: 40 },
    headStyles: { fillColor: "#CE93D8", textColor: "#4A148C", fontStyle: "bold" },
    styles: { fontSize: 11, cellPadding: 6 },
  };

  // Recommended Careers
  autoTable(doc, {
    ...tableOptionsBase,
    head: [["Recommended Career Fields"]],
    body: recommendedCareers.map((career) => [career]),
  });

  y = doc.lastAutoTable.finalY + 15;

  // Key Skills
  autoTable(doc, {
    ...tableOptionsBase,
    startY: y,
    head: [["Key Skills to Learn"]],
    body: keySkills.map((skill) => [skill]),
  });

  y = doc.lastAutoTable.finalY + 15;

  // Actionable Next Steps
  autoTable(doc, {
    ...tableOptionsBase,
    startY: y,
    head: [["Actionable Next Steps"]],
    body: nextSteps.map((step) => [step]),
  });

  // ----- OPTIONAL SIMPLE BAR CHART -----
  y = doc.lastAutoTable.finalY + 40;

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor("#5E35B1");
  doc.text("Skill Fit Overview", 40, y - 10);

  const chartWidth = pageWidth - 80;
  const chartHeight = 100;
  const maxScore = Math.max(...skillFitScores, 100);

  drawSimpleBarChart(doc, skillFitScores, skillFitLabels, 40, y, chartWidth, chartHeight, maxScore);

  // ----- MOTIVATIONAL FOOTER -----
  doc.setFontSize(10);
  doc.setTextColor("#888888");
  doc.text("Dream big! - Team Edgex", 40, 780);

  // ----- SAVE PDF -----
  doc.save("Career_Report.pdf");
};





  if (!userId) return <LoginModal onLogin={setUserId} />;

  return (
     <div className={`${darkMode ? "dark" : ""}`}>
  <div className="flex min-h-screen bg-gradient-to-br from-[#ffe0ec] via-[#f8bbd0] to-[#f3d1f4] dark:from-[#2a004f] dark:via-[#3c1361] dark:to-[#1b0032] text-gray-900 dark:text-white font-[Poppins] transition-all duration-500 ease-in-out">
    
    {/* Sidebar */}
    <div className="w-64 bg-white/60 dark:bg-[#30104d]/60 backdrop-blur-xl border-r border-white/20 p-4 space-y-4 shadow-xl rounded-tr-3xl rounded-br-3xl transition-all duration-500">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">💬 Your Chats</h2>
        <button onClick={() => setDarkMode(!darkMode)} className="p-1 rounded-full hover:bg-white/20 transition-all">
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-pink-100 to-purple-200 dark:from-purple-800 dark:to-fuchsia-900 rounded-xl">
        <span className="text-xs font-bold text-gray-800 dark:text-white">🧠 AI Mode</span>
        <button
          onClick={() => setUseGroq(!useGroq)}
          className="text-xs bg-white/70 dark:bg-purple-700 px-3 py-1 rounded-full font-bold hover:bg-white dark:hover:bg-purple-600 transition shadow"
        >
          {useGroq ? "🌐 Groq" : "💻 Local"}
        </button>
      </div>

      <button
        onClick={() => {
          setMessages([]);
          setSelectedChatId(null);
        }}
        className="flex items-center gap-2 text-sm bg-gradient-to-r from-pink-500 via-purple-500 to-fuchsia-500 text-white w-full py-2 px-3 rounded-full hover:scale-105 shadow-xl transition-all duration-300"
      >
        <PlusCircle size={16} /> New Chat
      </button>

      {history.map((chat) => (
        <div
          key={chat.id}
          className={`p-2 rounded-xl cursor-pointer hover:scale-[1.02] hover:bg-white/40 dark:hover:bg-purple-800 transition-all shadow-sm ${
            selectedChatId === chat.id ? "bg-white/50 dark:bg-purple-700" : ""
          }`}
          onClick={() => loadChat(chat.id)}
        >
          <input
            className="bg-transparent font-medium text-sm w-full"
            defaultValue={chat.title}
            onBlur={(e) => renameChat(chat.id, e.target.value)}
          />
          {chat.createdAt?.seconds && (
            <p className="text-xs text-gray-600 dark:text-gray-300">
              🕒 {new Date(chat.createdAt.seconds * 1000).toLocaleString()}
            </p>
          )}
        </div>
      ))}
    </div>

    {/* Main Chat Area */}
    <div className="flex-1 p-6 animate-fade-in">
      <div className="flex justify-center items-center mb-6">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-500 to-fuchsia-500 bg-clip-text text-transparent drop-shadow-lg">
          CareerCrack
        </h1>
      </div>

      <div className="h-96 overflow-y-auto space-y-4 p-4 bg-white/70 dark:bg-[#2a004f]/60 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl animate-slide-in-up transition-all">
        {messages.map((msg, i) => (
          <ChatBubble key={i} role={msg.role} text={msg.text} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4 flex items-center bg-white/90 dark:bg-purple-700 border border-gray-300 dark:border-purple-600 rounded-full px-4 shadow-xl backdrop-blur-lg">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="💡 Tell me about your goals, hobbies, dreams..."
          className="flex-1 bg-transparent outline-none py-3 px-2 text-gray-800 dark:text-white placeholder:text-gray-500 dark:placeholder:text-purple-200"
        />
        <button onClick={handleSend} className="p-2 hover:scale-110 transition-all text-pink-600 dark:text-pink-300">
          <SendHorizonal className="w-5 h-5" />
        </button>
      </div>

      <button
        onClick={exportChatToPDF}
        className="mt-6 flex items-center gap-2 bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 text-white px-5 py-3 rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300"
      >
        📄 Export Chat
        <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">PDF</span>
      </button>
    </div>
  </div>
</div>

  );
}

export default CareerCrack;
