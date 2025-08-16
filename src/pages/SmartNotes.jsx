import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

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
      textarea.style.height = `${Math.min(scrollHeight, 150)}px`;
    }
  }, [value]);


  return (
    <div className="p-4 bg-[#0e0e1a] flex items-end gap-2 border-t border-white/10">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => setIsComposing(false)}
        placeholder="Paste your class notes or questions..."
        className="flex-1 p-3 bg-[#12121c] rounded-lg resize-none text-white border border-white/10 outline-none"
        rows={1}
        disabled={disabled}
      />
      <button
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        className="bg-purple-600 hover:bg-purple-700 p-3 rounded-lg text-white flex items-center justify-center h-12 w-12 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ArrowRight />
      </button>
    </div>
  );
}


function SmartNotes() {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! Paste your class notes and I’ll summarize and tag them for you." },
  ]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  const handleSend = async (text) => {
    if (!text.trim()) return;
    setIsAiTyping(true);

    const userMessage = { from: "user", text: text };
    setMessages((prev) => [...prev, userMessage]);

    // Fake loading response
    setMessages((prev) => [...prev, { from: "bot", text: "Thinking..." }]);

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

      setMessages((prev) => [...prev.slice(0, -1), botResponse]);
      setIsAiTyping(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a14] text-white flex flex-col">
      <header className="p-4 bg-[#12121c] text-center shadow-md text-xl font-bold text-purple-400">
        📝 Smart Notes AI
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`max-w-xl p-4 rounded-lg ${
              msg.from === "user"
                ? "ml-auto bg-purple-600 text-white"
                : "bg-[#1a1a2e] text-gray-200"
            }`}
          >
            {msg.text.split("\n").map((line, j) => (
              <p key={j}>{line}</p>
            ))}
          </motion.div>
        ))}
         <div ref={messagesEndRef} />
      </div>

      <ChatInput onSend={handleSend} disabled={isAiTyping} />
    </div>
  );
}

export default SmartNotes;
