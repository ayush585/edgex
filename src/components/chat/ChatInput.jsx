// src/components/chat/ChatInput.jsx
import { useState } from "react";

export default function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState("");
  const [isComposing, setIsComposing] = useState(false);

  const handleSend = () => {
    const text = value.trim();
    if (!text || disabled) return;
    onSend?.(text);
    setValue("");            // clear after send
  };

  const handleKeyDown = (e) => {
    // Block send if composing with an IME; allow Shift+Enter to newline
    const isEnter = e.key === "Enter" || e.code === "Enter";
    if (isEnter && !e.shiftKey && !isComposing) {
      e.preventDefault();    // stop newline
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-2">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => setIsComposing(false)}
        rows={1}
        placeholder="Type a message…"
        aria-label="Message"
        className="flex-1 resize-none rounded-xl border p-3 outline-none"
      />
      <button
        type="button"
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        className="rounded-xl px-4 py-2 border"
        aria-label="Send message"
      >
        Send
      </button>
    </div>
  );
}
