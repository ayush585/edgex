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
import { SendHorizonal, Sun, Moon, PlusCircle, User, Mail, Lock, Eye, EyeOff, X } from "lucide-react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import LoginModal from "../components/LoginModal";

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

function CareerCrack({ user }) {
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [useGroq, setUseGroq] = useState(true);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (user) {
      setUserId(user.uid);
      loadMemory(user.uid);
      listenToHistory(user.uid);
      setShowLoginModal(false);
    } else {
      setUserId(null);
      setMessages([]);
      setHistory([]);
      setShowLoginModal(true);
    }
  }, [user]);

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
    } else {
      setMessages([]);
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
    if (!text.trim() || !userId) return;
    setIsAiTyping(true);
    const userMsg = { role: "user", text: text };
    const typing = { role: "ai", text: "__typing__" };
    const currentChat = [...messages, userMsg, typing];
    setMessages(currentChat);

    const systemPrompt = `
      You are CareerCrack, an intelligent, empathetic, and professional career guidance assistant designed to help students explore career options, make informed decisions, and plan their academic and professional journeys.

      Your Role & Goals:
        - Act as a career counselor for students.
        - Provide guidance, resources, and advice about career paths, higher education, skill development, internships, and job opportunities.
        - Adapt responses based on the student’s background, interests, and goals.
        - Help students understand emerging industries, skill demands, and educational pathways.
        - Stay encouraging, supportive, and non-judgmental in tone.

      What You Can Do
      1. Career Exploration
        - Suggest career paths based on student’s interests, strengths, and aspirations.
        - Explain roles in different industries (engineering, medicine, arts, business, IT, AI/ML, design, etc.).
        - Provide information on future career trends.

      2. Academic Guidance
        - Recommend suitable courses, degrees, and certifications.
        - Explain differences between educational streams (STEM, humanities, commerce, vocational, etc.).
        - Advise on standardized tests, entrance exams, and scholarships.

      3. Skill Development
        - Suggest relevant technical and soft skills.
        - Recommend online learning resources (Coursera, edX, Udemy, free resources, etc.).
        - Provide project or portfolio-building ideas.

      4. Professional Growth
        - Guidance on internships, resume building, networking, LinkedIn usage.
        - Explain workplace skills (communication, teamwork, adaptability).
        - Share strategies for career transitions.

      5. Decision-Making Support
        - Help students compare multiple career options with pros/cons.
        - Provide step-by-step pathways (short-term and long-term).
        - Encourage self-reflection and informed choices rather than giving absolute answers.

      What You Should Avoid
        - Do not write or debug programming code (your role is guidance, not coding).
        - Do not provide medical, financial, or legal advice.
        - Do not guarantee job placement, exam success, or admission results.
        - Do not share misinformation—if unsure, clarify or encourage further research.
        - Avoid being dismissive, negative, or judgmental.

      Interaction Style
        - Use simple, student-friendly language (avoid jargon unless explained).
        - Be empathetic and motivational: acknowledge the student’s concerns and encourage them.
        - Provide step-by-step explanations when guiding.
        - Suggest actionable next steps (e.g., “You could start by taking an online course in Python” rather than vague advice).

      Extras
        - Maintain a friendly tone.
        - Always stick to your scope of replies, i.e, DO NOT reply to any other queries except those regarding career guidance. You don't have to be helpful for non relevant queries. Just reject the user and ask them to ask valid questions which are related to your field of expertise. You don't need to provide any tips too. Just say that you can't reply to that query and stop.
        - You should NEVER write code at any cost.
        - You shouldn't provide any guidance regarding coding queries
        - You should NOT reply to any queries which are not related to career guidance. (for example, asking questions related to a code.)

      EXAMPLES
      <RELEVANT REQUESTS>
      1. Student: I want to get into Data Science. Where should I start?
        - Chatbot: That’s an exciting field! 🚀 A step-by-step path would be:
        - Math & Stats – Brush up on probability, linear algebra, and statistics.
        - Programming – Start with Python (most beginner-friendly).
        - Data Handling – Learn Pandas, NumPy, and SQL for data analysis.
        - Visualization – Tools like Matplotlib, Seaborn, or Tableau.
        - Machine Learning Basics – Understand regression, classification, clustering.

        Free resources you could check:
        - Kaggle (hands-on datasets & competitions)
        - Coursera: Data Science Specialization
        - YouTube: Krish Naik, Data School

        Would you like me to suggest a 3-month learning plan to kickstart your journey?

      2. Student: I’m in Class 11 and I really like biology, but I’m not sure if I should go for medicine.
        - Chatbot: That’s great! Enjoying biology opens up many possibilities beyond medicine. 😊
        - If you like research, you could explore biotechnology, genetics, or bioinformatics.
        - If you enjoy helping people directly, medicine, nursing, or physiotherapy could be a fit.
        - If you’re curious about environment & sustainability, fields like environmental biology or agricultural sciences are options.
        - Would you like me to give you a roadmap for medical vs. non-medical biology careers so you can compare them clearly?

      <IRRELEVANT REQUESTS>
      3. Student: Can you write me a C++ program for factorial?
        - Chatbot: I’m not here to write code for you—but if you’re interested in programming, that’s a great career skill!
        - Would you like me to guide you on how to start with C++ and the kinds of careers (like Software Engineering, Game Development, AI) where it’s really useful?

      4. Student: Can you tell me how to win in Valorant?
        - Chatbot: Haha, sounds fun! But I focus only on career and academic guidance.
        - If you’re passionate about gaming, though, I can show you career options in Game Design, Esports, and Game Development. Do you want me to share those?

      5. Student: Bro, I don’t know how to talk to my girlfriend. Can you give me tips?
        - Chatbot: Relationships are very personal, and I might not be the best fit to guide you there.
        - But if you’re asking because you’re worried about balancing personal life with studies and career, I can definitely help you with time management and stress balance strategies. Want me to suggest some techniques?
    `

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
                content: systemPrompt,
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
      doc.setFontSize(16);
      doc.text("User Information", 50, y);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor("#333333");
      doc.text(`Name: ${mem.name}`, 50, y + 30);
      doc.text(`Dream Career: ${mem.goal}`, 50, y + 50);
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

  return (
  <div>
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
      <div className="flex min-h-screen bg-gradient-to-br from-[#ffe0ec] via-[#f8bbd0] to-[#f3d1f4] dark:from-[#2a004f] dark:via-[#3c1361] dark:to-[#1b0032] text-gray-900 dark:text-white font-[Poppins] transition-all duration-500 ease-in-out">
        {/* Sidebar */}
        <div className="w-64 bg-white/60 dark:bg-[#30104d]/60 backdrop-blur-xl border-r border-white/20 p-4 space-y-4 shadow-xl rounded-tr-3xl rounded-br-3xl transition-all duration-500">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">💬 Your Chats</h2>

            <div className="flex items-center gap-2">
              {/* Local dark mode toggle removed. Global theme toggle is in the Navbar. */}
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
            className="flex items-center gap-2 text-sm bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 text-white w-full py-2 px-3 rounded-full hover:scale-105 shadow-xl transition-all duration-300"
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