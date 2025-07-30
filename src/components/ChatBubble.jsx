import React, { useEffect, useState } from "react";
import { FaRobot, FaUserCircle } from "react-icons/fa";
import TypingIndicator from "./TypingIndicator"; // <-- This imports the new component

const ChatBubble = ({ role, text }) => {
  const isUser = role === "user";
  const isTyping = text === "__typing__";
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    // Your typewriter effect logic is perfect and doesn't need changes.
    if (isTyping) {
      setDisplayedText(""); 
      return;
    }

    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText((prev) => text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 8); // speed of typewriter
    return () => clearInterval(interval);
  }, [text, isTyping]);

  // If the text is "__typing__", we will render the new animated indicator.
  if (isTyping) {
    return (
      <div className="flex items-start gap-3 mb-4">
        <div className="mt-1">
          <FaRobot className="w-6 h-6 text-gray-500 drop-shadow" />
        </div>
        {/* The indicator is placed inside a bubble for consistent styling */}
        <div className="bg-white/20 border border-white/30 backdrop-blur-lg rounded-2xl rounded-bl-none shadow-inner">
          <TypingIndicator />
        </div>
      </div>
    );
  }

  // Otherwise, render a normal message bubble.
  return (
    <div
      className={`flex items-start gap-3 mb-4 ${
        isUser ? "justify-end flex-row-reverse" : ""
      }`}
    >
      {/* Avatar */}
      <div className="mt-1">
        {isUser ? (
          <FaUserCircle className="w-6 h-6 text-indigo-500 drop-shadow" />
        ) : (
          <FaRobot className="w-6 h-6 text-gray-500 drop-shadow" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[80%] px-4 py-3 text-sm font-medium whitespace-pre-wrap transition-all duration-300
        ${
          isUser
            ? "bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-2xl rounded-br-none shadow-lg"
            : "bg-white/20 text-gray-900 dark:text-white border border-white/30 backdrop-blur-lg rounded-2xl rounded-bl-none shadow-inner"
        }`}
      >
        {displayedText}
      </div>
    </div>
  );
};

export default ChatBubble;
