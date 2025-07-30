import React, { useState, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { ArrowRightCircle } from "lucide-react";
import scholarshipsData from "../data/scholarships.json";

export default function ScholarshipScout() {
  const [profile, setProfile] = useState({
    state: "",
    board: "",
    grade: "",
    category: "",
    income: "",
    interests: "",
    achievements: "",
  });

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const aiRef = useRef(null);

  const steps = [
    { label: "State", key: "state", type: "select", options: ["West Bengal", "Bihar", "Maharashtra", "Tamil Nadu", "All"] },
    { label: "Board", key: "board", type: "select", options: ["CBSE", "ICSE", "State Board"] },
    { label: "Grade", key: "grade", type: "select", options: ["9", "10", "11", "12", "College"] },
    { label: "Category", key: "category", type: "select", options: ["General", "SC", "ST", "OBC", "EWS"] },
    { label: "Family Income (₹)", key: "income", type: "number" },
    { label: "Interests", key: "interests", type: "text", placeholder: "e.g. Science, Arts" },
    { label: "Achievements", key: "achievements", type: "text", placeholder: "Optional, e.g. Olympiad winner" },
  ];

  const handleChange = (e) => {
    setProfile((prev) => ({ ...prev, [steps[step].key]: e.target.value }));
  };

  const isValidURL = (url) => {
    try {
      const parsed = new URL(url);
      return ["gov.in", "edu.in", "ac.in", "org", "com"].some((ext) =>
        parsed.hostname.endsWith(ext)
      );
    } catch {
      return false;
    }
  };

  const handleNext = async () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
      return;
    }

    setLoading(true);

    const filtered = scholarshipsData.filter(
      (s) =>
        (s.states.includes(profile.state) || s.states.includes("All")) &&
        s.board.includes(profile.board) &&
        s.grades.includes(profile.grade) &&
        Number(profile.income) <= s.income_limit &&
        (s.category === "All" || s.category === profile.category) &&
        isValidURL(s.url)
    );

    const prompt = `
You are ScholarshipScout, an accurate scholarship advisor for Indian students.

Only recommend real, safe, working scholarships. Use only this list to recommend.
Avoid fake or sketchy URLs. Prioritize trusted sources (NSP, UGC, DST, Buddy4Study, KVPY, etc).

Scholarship Data:
${JSON.stringify(filtered, null, 2)}

Student Profile:
- State: ${profile.state}
- Board: ${profile.board}
- Grade: ${profile.grade}
- Category: ${profile.category}
- Family Income: ₹${profile.income}
- Interests: ${profile.interests}
- Achievements: ${profile.achievements}

Respond with max 5 matches in this format:
1. **Scholarship Name**
Why it's a good match.
🔗 [Apply here](link)
`.trim();

    try {
      const res = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama3-70b-8192",
          messages: [
            {
              role: "system",
              content:
                "You're ScholarshipScout, an AI expert for verified Indian scholarships.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
          },
        }
      );

      const raw = res.data.choices[0].message.content || "";
      const chunks = raw.split(/\n{2,}/).filter(Boolean);
      setMatches(chunks);
    } catch (err) {
      console.error("AI error, using fallback:", err);
      const fallback = filtered.map(
        (s) =>
          `**${s.name}**\nDeadline: **${s.deadline}**\n🔗 [Apply here](${s.url})`
      );
      setMatches(fallback);
    } finally {
      setLoading(false);
      aiRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const current = steps[step];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-200 via-orange-100 to-yellow-300 p-6 font-poppins text-gray-900">
  <div className="max-w-2xl mx-auto bg-white/50 backdrop-blur-xl p-8 rounded-3xl border border-orange-200 shadow-2xl">
    <h1 className="text-4xl font-extrabold text-center bg-gradient-to-r from-yellow-700 via-orange-500 to-red-500 bg-clip-text text-transparent mb-6 drop-shadow-md">
      🎓 ScholarshipScout
    </h1>

    {/* Form Stepper */}
    {matches.length === 0 && (
      <div className="space-y-4 animate-fade-in">
        <label className="block text-lg font-semibold text-orange-800">{current.label}</label>
        {current.type === "select" ? (
          <select
            value={profile[current.key]}
            onChange={handleChange}
            className="w-full p-3 rounded-xl border bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="">Select {current.label}</option>
            {current.options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={current.type}
            placeholder={current.placeholder || current.label}
            value={profile[current.key]}
            onChange={handleChange}
            className="w-full p-3 rounded-xl border bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        )}

        <button
          onClick={handleNext}
          disabled={!profile[current.key] || loading}
          className="mt-4 w-full bg-gradient-to-r from-yellow-600 via-orange-500 to-red-400 hover:scale-105 text-white py-3 rounded-full font-semibold flex justify-center items-center gap-2 shadow-md transition-all duration-300 disabled:opacity-50"
        >
          {step < steps.length - 1
            ? "Next"
            : loading
            ? "🔎 Searching…"
            : "🎯 Find Scholarships"}
          <ArrowRightCircle size={20} />
        </button>
      </div>
    )}

    {/* AI Results */}
    {matches.length > 0 && (
      <div ref={aiRef} className="mt-8 space-y-4 animate-fade-in">
        <h2 className="text-xl font-semibold text-orange-800 mb-3">
          ✅ Top Matches for You:
        </h2>
        {matches.map((m, i) => (
          <div
            key={i}
            className="p-4 bg-yellow-100/80 rounded-2xl border border-orange-200 backdrop-blur-md shadow-inner hover:scale-[1.02] transition-transform duration-300"
          >
            <ReactMarkdown
              components={{
                p: ({ node, ...props }) => (
                  <p className="whitespace-pre-wrap" {...props} />
                ),
                strong: ({ node, ...props }) => (
                  <strong className="text-orange-700 font-bold" {...props} />
                ),
                a: ({ node, ...props }) => (
                  <a
                    className="text-red-600 underline hover:text-red-800 font-medium"
                    target="_blank"
                    rel="noopener noreferrer"
                    {...props}
                  />
                ),
              }}
            >
              {m}
            </ReactMarkdown>
          </div>
        ))}
      </div>
    )}
  </div>
</div>

  );
}
