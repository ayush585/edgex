import React, { useRef, useState, useEffect } from "react";
import {FaGithub }from "react-icons/fa";
import {FaLinkedin }from "react-icons/fa";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  GraduationCap,
  Brain,
  Target,
  NotebookPen,
  Mic,
  FileText,
} from "lucide-react";

function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      title: "Career Mentor",
      desc: "Get career advice powered by your strengths and passions.",
      icon: <GraduationCap className="w-6 h-6 text-purple-400" />,
      link: "/careercrack",
    },
    {
      title: "Mood Mirror",
      desc: "Chat with an AI that understands your emotions and tracks your mood.",
      icon: <Brain className="w-6 h-6 text-purple-400" />,
      link: "/moodmirror",
    },
    {
      title: "Scholarship Scout",
      desc: "Find best-fit scholarships based on your background & interests.",
      icon: <Target className="w-6 h-6 text-purple-400" />,
      link: "/scholarships",
    },
    {
      title: "Smart Notes",
      desc: "Organize your notes with AI tagging and outlines.",
      icon: <NotebookPen className="w-6 h-6 text-purple-400" />,
      link: "/smartnotes",
    },
    {
      title: "Voice to Text",
      desc: "Transcribe your ideas with whisper-accurate AI.",
      icon: <Mic className="w-6 h-6 text-purple-400" />,
      link: "/voicefeedback",
    },
    {
      title: "PDF Exports",
      desc: "Download your chats and notes instantly.",
      icon: <FileText className="w-6 h-6 text-purple-400" />,
      link: "/careercrack"
    },
  ];

  const testimonials = [
    {
      name: "Ananya S.",
      quote:
        "EDGEx helped me discover a career path I never even considered. Life-changing!",
      role: "Class 12, Delhi",
    },
    {
      name: "Rohan M.",
      quote: "MoodMirror is like talking to a friend who truly understands you. So cool!",
      role: "Class 10, Mumbai",
    },
    {
      name: "Sneha T.",
      quote:
        "The scholarship tool got me 3 perfect matches. This is the future of guidance!",
      role: "Commerce Student, Kolkata",
    },
  ];

  const [[index, direction], setIndex] = useState([0, 0]);
  const paginate = (dir) => {
    setIndex(([prev]) => [(prev + dir + testimonials.length) % testimonials.length, dir]);
  };

  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  const counters = [
    { label: "Students Helped", value: 5700 },
    { label: "Scholarships Found", value: 1300 },
    { label: "Mood Sessions", value: 25000 },
  ];
  const [counts, setCounts] = useState(counters.map(() => 0));
  useEffect(() => {
    const animate = setInterval(() => {
      setCounts((prev) =>
        prev.map((num, i) => {
          const target = counters[i].value;
          if (num < target) return num + Math.ceil(target / 40);
          return target;
        })
      );
    }, 50);
    return () => clearInterval(animate);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0a14]">
        <motion.div
          className="w-10 h-10 rounded-full bg-purple-500"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a14] text-white font-sans overflow-x-hidden">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-6 lg:px-20 flex flex-col items-center text-center">
        <motion.div
          style={{ y: y1 }}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-purple-500 opacity-30 blur-3xl rounded-full z-0"
        />
        <motion.svg
          className="absolute inset-0 w-full h-full z-0 opacity-5"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ y: y1 }}
        >
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </motion.svg>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="z-10 max-w-4xl"
        >
          <h1 className="text-4xl md:text-6xl font-bold leading-tight text-white mb-6">
            Think better with <span className="text-purple-400">EDGEx</span>
          </h1>
          <p className="text-lg text-gray-300 mb-8">
            Your all-in-one AI toolkit: career mentor, mood companion, scholarship tracker & more.
          </p>
          <div className="flex justify-center items-center  gap-4">
            <Link
              to="/careercrack"
              className="bg-purple-600 hover:bg-purple-700 transition px-6 py-3 rounded-lg text-white font-semibold flex items-center gap-2"
            >
              Start Exploring <ArrowRight size={18} />
            </Link>
            <a href="#features" className="text-gray-400 hover:text-white underline flex items-center h-full px-6 py-3 rounded-lg font-semibold">
              Learn More
            </a>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 lg:px-20 bg-[#0e0e1a]">
        <h2 className="text-3xl font-bold text-center mb-12 text-white">What can EDGEx AI do?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto text-white">
          {features.map((feat, i) => {
            const Card = (
              <motion.div
                key={i}
                whileHover={{ scale: 1.03 }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-glass backdrop-blur-md p-6 rounded-xl border border-white/10 hover:shadow-xl transition cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-3">
                  {feat.icon}
                  <h3 className="text-xl font-semibold">{feat.title}</h3>
                </div>
                <p className="text-gray-400">{feat.desc}</p>
              </motion.div>
            );
            return feat.link ? (
              <Link to={feat.link} key={i}>
                {Card}
              </Link>
            ) : (
              <div key={i}>{Card}</div>
            );
          })}
        </div>
      </section>

      {/* Counters */}
      <section className="py-20 bg-[#0a0a14] text-center">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {counters.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              viewport={{ once: true }}
            >
              <p className="text-4xl font-bold text-purple-400">{counts[i]}+</p>
              <p className="text-gray-400 mt-2">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 lg:px-20 bg-[#0e0e1a]">
        <h2 className="text-3xl font-bold text-center mb-12 text-white">🌟 What Students Say</h2>
        <div className="relative max-w-3xl mx-auto">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={index}
              className="bg-[#1a1a2e] p-8 rounded-xl border border-white/10 text-white"
              initial={{ x: direction > 0 ? 300 : -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction < 0 ? 300 : -300, opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-lg italic mb-4">“{testimonials[index].quote}”</p>
              <p className="font-semibold">{testimonials[index].name}</p>
              <p className="text-sm text-purple-300">{testimonials[index].role}</p>
            </motion.div>
          </AnimatePresence>
          <div className="flex justify-between mt-6">
            <button
              onClick={() => paginate(-1)}
              className="text-purple-400 hover:text-purple-600 transition"
            >
              ← Previous
            </button>
            <button
              onClick={() => paginate(1)}
              className="text-purple-400 hover:text-purple-600 transition"
            >
              Next →
            </button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 bg-[#12121c] py-20 px-6 lg:px-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-600/30 blur-[150px] rounded-full z-0" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-500/20 blur-[120px] rounded-full z-0" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold mb-4 text-white"
          >
            Ready to <span className="text-purple-400">level up</span> your journey?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-gray-400 text-lg mb-8"
          >
            Start exploring EDGEx’s tools and get ahead in your academic & personal path.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <Link
              to="/careercrack"
              className="inline-block bg-purple-600 hover:bg-purple-700 transition px-8 py-3 text-lg font-semibold rounded-lg text-white shadow-xl"
            >
              Start Now →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8  text-gray-500 text-sm ">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center ">
           © {new Date().getFullYear()} EDGEx by Ayushman. All rights reserved.
         
           <div className="flex  space-x-4 text-purple-400 text-3xl ">
            <a href="https://github.com/ayush585/edgex" target="_blank" 
               className="hover:text-purple-200 transition"> 
                <FaGithub/>
              </a>

              <a href="https://www.linkedin.com/in/ayushman-mukherjee-437a49314/" target="_blank" 
                   className="hover:text-purple-200 transition"> 
                <FaLinkedin/>
              </a>
           </div>
         </div>
      </footer>
    </div>
  );
}

export default Home;
