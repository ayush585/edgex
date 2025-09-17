import React, { useState, useRef, useEffect } from "react";
import { Mic, StopCircle, Volume2 } from "lucide-react";
import jsPDF from "jspdf";
import axios from "axios";
import { pipeline } from "@xenova/transformers";
import { auth, db } from "../firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { toast } from "react-toastify";

let transcriber = null;

// Whisper model loader
async function loadModel() {
  if (!transcriber) {
    try {
      console.log("📦 Loading Whisper model from /models/whisper-tiny...");
      transcriber = await pipeline("automatic-speech-recognition", "/models/whisper-tiny", {
        quantized: true,
        local_files_only: true,
      });
      console.log("✅ Whisper model loaded successfully.");
    } catch (err) {
      toast.error("Failed to load Whisper model.");
    }
  }
  return transcriber;
}

export default function VoiceFeedback() {
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [aiReply, setAiReply] = useState("");
  const [userId, setUserId] = useState(null);
  const [reaction, setReaction] = useState("👍");
  const [waveform, setWaveform] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    loadModel();
    return onAuthStateChanged(auth, (user) => {
      if (user) setUserId(user.uid);
    });
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = handleStop;

      mediaRecorderRef.current.start();
      setRecording(true);
      setWaveform(true);
    } catch (err) {
      console.error("🎙️ Mic access failed:", err);
      toast.error("Please allow microphone access.");
    }
  };

  const stopRecording = () => mediaRecorderRef.current?.stop();

  const handleStop = async () => {
    setLoading(true);
    const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });

    try {
      const buffer = await blob.arrayBuffer();
      const model = await loadModel();
      if (!model) {
        setTranscript("❌ Whisper model not available.");
        toast.error("Whisper model not available.");
        return;
      }

      const { text } = await model(buffer);
      setTranscript(text);
      await sendToGroq(text);
    } catch (err) {
      console.error("❌ Transcription failed:", err);
      setTranscript("❌ Could not transcribe audio.");
      toast.error("Could not transcribe audio.");
    } finally {
      setLoading(false);
      setRecording(false);
      setWaveform(false);
    }
  };

  const sendToGroq = async (text) => {
    try {
      const res = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama3-8b-8192",
          messages: [
            {
              role: "system",
              content: "You're VoiceMirror by Mindmorph: give warm, constructive speaking feedback.",
            },
            { role: "user", content: text },
          ],
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
          },
        }
      );

      const reply = res.data.choices[0]?.message?.content || "⚠️ No feedback generated.";
      setAiReply(reply);
      speakText(reply);

      if (userId) {
        await addDoc(collection(db, "voicemirror", userId, "sessions"), {
          transcript: text,
          feedback: reply,
          reaction,
          createdAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.error("⚠️ AI response error:", err);
      setAiReply("⚠️ Could not generate feedback.");
      toast.error("Could not generate AI feedback.");
    }
  };

  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    speechSynthesis.speak(utterance);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("🎙️ Transcript:", 10, 10);
    doc.text(transcript || "None", 10, 20);
    doc.text("🧠 Feedback:", 10, 40);
    doc.text(aiReply || "None", 10, 50);
    doc.save("VoiceMirror.pdf");
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-indigo-100 to-white dark:from-gray-900 dark:to-black text-gray-900 dark:text-white font-poppins">
      <div className="max-w-3xl mx-auto bg-white/30 dark:bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-lg">
        <h1 className="text-center text-3xl font-bold text-indigo-700 dark:text-indigo-300 mb-6">
          🎤 VoiceMirror – Speak. Reflect. Improve.
        </h1>

        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={recording ? stopRecording : startRecording}
            className={`px-6 py-3 rounded-full text-white shadow-md flex items-center gap-2 transition-all ${
              recording ? "bg-red-600 hover:bg-red-700" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {recording ? <StopCircle size={20} /> : <Mic size={20} />}
            {recording ? "Stop" : "Record"}
          </button>
          <button
            onClick={exportPDF}
            className="underline text-indigo-600 hover:text-indigo-800 text-sm self-center"
          >
            📄 Export PDF
          </button>
        </div>

        {waveform && (
          <div className="flex justify-center mb-6 space-x-1 h-10">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="w-2 bg-indigo-400 rounded animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        )}

        {loading && <p className="text-center text-gray-600 mb-4">🧠 Processing…</p>}

        {transcript && (
          <div className="bg-white/40 dark:bg-white/10 p-4 mb-6 rounded-xl border shadow-inner">
            <h2 className="font-semibold text-indigo-700 dark:text-indigo-300 mb-2">📝 Transcript</h2>
            <p>{transcript}</p>
          </div>
        )}

        {aiReply && (
          <div className="bg-indigo-100/40 dark:bg-indigo-300/10 p-4 rounded-xl border shadow-md">
            <h2 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-2">🤖 Feedback</h2>
            <p>{aiReply}</p>
            <div className="mt-3 flex justify-between items-center">
              <button
                onClick={() => speakText(aiReply)}
                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm"
              >
                <Volume2 size={18} /> Hear Again
              </button>
              <div className="flex gap-2 text-xl">
                {["👍", "❤️", "😂", "🤯", "🤔"].map((emo) => (
                  <button
                    key={emo}
                    onClick={() => setReaction(emo)}
                    className={reaction === emo ? "opacity-100" : "opacity-50"}
                  >
                    {emo}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
