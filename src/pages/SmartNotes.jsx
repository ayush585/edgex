import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import ChatInput from "../components/chat/ChatInput"; // Assumes ChatInput component exists

function SmartNotes() {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! Paste your class notes and I’ll summarize and tag them for you." },
  ]);

  // The handleSend function now accepts 'text' from the ChatInput component
  const handleSend = async (text) => {
    if (!text.trim()) return;

    const userMessage = { from: "user", text: text };
    setMessages((prev) => [...prev, userMessage]);

    // Add a temporary "Thinking..." message
    setMessages((prev) => [...prev, { from: "bot", text: "Thinking..." }]);

    // Simulate an API call and response
    setTimeout(() => {
      const botResponse = {
        from: "bot",
        text: `✅ Summary:\n- ${text
          .split(".")
          .slice(0, 3)
          .map((s) => s.trim())
          .filter(Boolean)
          .join("\n- ")}\n\n🏷️ Tags: [Conceptual, Important, Notes]`,
      };

      // Replace "Thinking..." with the actual response
      setMessages((prev) => [...prev.slice(0, -1), botResponse]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a14] text-black flex flex-col font-sans">
      <header className="p-4 bg-[#12121c] text-center shadow-md text-xl font-bold text-purple-400 border-b border-purple-900/50">
        📝 Smart Notes AI
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col w-fit max-w-xl p-4 rounded-xl shadow-lg ${
              msg.from === "user"
                ? "ml-auto bg-gradient-to-br from-purple-600 to-indigo-600 text-gray-400"
                : "bg-[#1a1a2e] text-gray-600"
            }`}
          >
            {/* We split by newline to render multi-line messages correctly */}
            {msg.text.split("\n").map((line, j) => (
              <p key={j} className="whitespace-pre-wrap">{line}</p>
            ))}
          </motion.div>
        ))}
      </div>

      {/* The ChatInput component now handles the text area, button, and keydown events */}
      <div className="p-4 bg-[#5157f3] border-t border-white/10">
        <ChatInput onSend={handleSend} />
      </div>
    </div>
  );
}

export default SmartNotes;
