import React, { useEffect, useRef, useState } from "react";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
} from "firebase/firestore";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth, db } from "../firebase";
import ChatBubble from "../components/ChatBubble";
import { SendHorizonal, Sun, Moon, PlusCircle, User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// The new ChatInput component with "Enter to Send" logic
function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef(null);

  const handleSend = () => {
    const text = value.trim();
    if (!text || disabled) return;
    onSend?.(text);
    setValue("");
  };

  const handleKeyDown = (e) => {
    // Block send if composing with an IME; allow Shift+Enter to newline
    const isEnter = e.key === "Enter" || e.code === "Enter";
    if (isEnter && !e.shiftKey && !isComposing) {
      e.preventDefault(); // stop newline
      handleSend();
    }
  };

  // Auto-resize textarea height based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      // Set a max height (e.g., 200px) to prevent it from growing indefinitely
      textarea.style.height = `${Math.min(scrollHeight, 200)}px`;
    }
  }, [value]);

  return (
    <div className="flex items-end gap-2 bg-white/90 dark:bg-purple-700 border border-gray-300 dark:border-purple-600 rounded-2xl px-4 py-2 shadow-xl backdrop-blur-lg">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => setIsComposing(false)}
        rows={1}
        placeholder="💡 Tell me about your goals, hobbies, dreams..."
        aria-label="Message"
        disabled={disabled}
        className="flex-1 resize-none bg-transparent outline-none text-gray-800 dark:text-white placeholder:text-gray-500 dark:placeholder:text-purple-200"
      />
      <button
        type="button"
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        className="p-2 rounded-full hover:scale-110 transition-all text-pink-600 dark:text-pink-300 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Send message"
      >
        <SendHorizonal className="w-5 h-5" />
      </button>
    </div>
  );
}


const extractMemory = (text) => {
  const name = text.match(/(?:I am|My name is)\s+(\w+)/i)?.[1];
  const fav = text.match(/(?:I like|enjoy|love)\s+(.+?)(?=[.,]|$)/i)?.[1];
  const goal = text.match(
    /(?:want to be(?:come)?|dream of being)\s+(.+?)(?=[.,]|$)/i
  )?.[1];
  return {
    name: name || "friend",
    favSubject: fav || "design",
    goal: goal || "a designer",
  };
};

const LoginModal = ({ onLogin }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const { fullName, email, password, confirmPassword } = formData;
    if (isSignup) {
      if (!fullName.trim()) return "Full Name is required.";
      if (!/^[A-Za-z\s]+$/.test(fullName)) return "Full Name can only contain letters and spaces.";
      if (password !== confirmPassword) return "Passwords do not match.";
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) return "Valid email is required.";
    if (!password || password.length < 6) return "Password must be at least 6 characters.";
    return null;
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      let res;
      if (isSignup) {
        res = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        await setDoc(doc(db, "users", res.user.uid), {
          fullName: formData.fullName,
          email: formData.email,
          createdAt: serverTimestamp(),
        });
      } else {
        res = await signInWithEmailAndPassword(auth, formData.email, formData.password);
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
      } else if (
        code === "auth/user-not-found" ||
        code === "auth/wrong-password"
      ) {
        setError("❌ Wrong email or password.");
      } else {
        setError("❌ " + err.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({ fullName: "", email: "", password: "", confirmPassword: "" });
    setError("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/95 backdrop-blur-md border border-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md space-y-6 relative overflow-hidden">
        {/* Purple gradient background accent */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-purple-600/10 rounded-2xl"></div>

        <div className="relative z-10">
          {/* Header */}
          <div className="text-center space-y-2 mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-500 rounded-full mb-4">
              <span className="text-2xl font-bold text-white">E</span>
            </div>
            <h2 className="text-2xl font-bold text-white">
              {isSignup ? "Join EDGEx" : "Welcome Back"}
            </h2>
            <p className="text-gray-400 text-sm">
              {isSignup
                ? "Create your account to start your AI-powered learning journey"
                : "Sign in to continue your learning journey"
              }
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="px-4 py-3 rounded-lg text-sm mb-6 flex items-center gap-2 border"
              style={{
                backgroundColor: 'rgba(220, 38, 38, 0.1)',
                borderColor: 'rgba(220, 38, 38, 0.3)',
                color: '#ef4444'
              }}
            >
              <span style={{ color: '#dc2626' }}>⚠️</span>
              <span style={{ color: '#ef4444' }}>{error}</span>
            </div>
          )}


          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-4">
            {isSignup && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full bg-gray-800/50 border border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 px-10 py-3 rounded-lg text-white placeholder-gray-400 transition-all duration-200 outline-none"
                  placeholder="Full Name"
                  required
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-gray-800/50 border border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 px-10 py-3 rounded-lg text-white placeholder-gray-400 transition-all duration-200 outline-none"
                placeholder="Email Address"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-gray-800/50 border border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 px-10 pr-12 py-3 rounded-lg text-white placeholder-gray-400 transition-all duration-200 outline-none"
                placeholder="Password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {isSignup && (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full bg-gray-800/50 border border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 px-10 pr-12 py-3 rounded-lg text-white placeholder-gray-400 transition-all duration-200 outline-none"
                  placeholder="Confirm Password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                isSignup ? "Create Account" : "Sign In"
              )}
            </button>
          </form>

          {/* Switch between login/signup */}
          <div className="text-center pt-6 border-t border-gray-700/50">
            <p className="text-gray-400 text-sm">
              {isSignup ? "Already have an account?" : "New to EDGEx?"}{" "}
              <button
                onClick={() => {
                  setIsSignup(!isSignup);
                  resetForm();
                }}
                className="text-purple-400 font-semibold hover:text-purple-300 transition-colors hover:underline"
              >
                {isSignup ? "Sign In" : "Create Account"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


function CareerCrack() {
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [useGroq, setUseGroq] = useState(true);
  const [isAiTyping, setIsAiTyping] = useState(false);
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
    const firstMsg =
      chatData.find((m) => m.role === "user")?.text || "Untitled";
    const newDoc = await addDoc(collection(db, "chats", userId, "history"), {
      title: firstMsg.slice(0, 25),
      messages: chatData,
      createdAt: serverTimestamp(),
    });
    setSelectedChatId(newDoc.id);
  };

  const handleSend = async (text) => {
    if (!text.trim()) return;
    setIsAiTyping(true);
    const userMsg = { role: "user", text: text };
    const typing = { role: "ai", text: "__typing__" };
    const currentChat = [...messages, userMsg, typing];
    setMessages(currentChat);

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
              { role: "user", content: text },
            ],
            temperature: 0.7,
          }
        );
        aiReply = res.data.choices[0].message.content;
      } else {
        const res = await axios.post("http://127.0.0.1:5000/ask", {
          prompt: text,
        });
        aiReply = res.data.response;
      }

      await saveMemory(text);
      const updatedChat = [
        ...currentChat.slice(0, -1),
        { role: "ai", text: aiReply },
      ];
      setMessages(updatedChat);
      await saveChatToFirestore(updatedChat);
    } catch (err) {
      console.error("AI error:", err);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "ai", text: "⚠️ Something went wrong. Try again!" },
      ]);
    } finally {
        setIsAiTyping(false);
    }
  };

  const listenToHistory = (uid) => {
    const q = query(
      collection(db, "chats", uid, "history"),
      orderBy("createdAt", "desc")
    );
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
  if (!data || data.length === 0) return;
  if (!labels || labels.length !== data.length) {
    console.error('Chart data and labels must have the same length');
    return;
  }
  if (maxVal <= 0) maxVal = Math.max(...data, 1);

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
  try {
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
  } catch (error) {
  console.error("Failed to generate PDF:", error);
  // Consider showing a user-friendly error message
   alert("Failed to generate PDF. Please try again.");
 }
};





  if (!userId) return <LoginModal onLogin={setUserId} />;

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <div className="flex min-h-screen bg-gradient-to-br from-[#ffe0ec] via-[#f8bbd0] to-[#f3d1f4] dark:from-[#2a004f] dark:via-[#3c1361] dark:to-[#1b0032] text-gray-900 dark:text-white font-[Poppins] transition-all duration-500 ease-in-out">

        {/* Sidebar */}
        <div className="w-64 bg-white/60 dark:bg-[#30104d]/60 backdrop-blur-xl border-r border-white/20 p-4 space-y-4 shadow-xl rounded-tr-3xl rounded-br-3xl transition-all duration-500">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">💬 Your Chats</h2>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-1 rounded-full hover:bg-white/20 transition-all"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => {
                  signOut(auth).then(() => setUserId(null));
                }}
                className="text-xs text-gray-600 dark:text-gray-300 hover:text-red-500 transition"
                title="Logout"
              >
                ↩ Logout
              </button>
            </div>
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
                selectedChatId === chat.id
                  ? "bg-white/50 dark:bg-purple-700"
                  : ""
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

          <div className="mt-4">
             <ChatInput onSend={handleSend} disabled={isAiTyping} />
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
