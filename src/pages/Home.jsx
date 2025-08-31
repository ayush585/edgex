import React, { useRef, useState, useEffect } from "react";
import {FaGithub }from "react-icons/fa";
import {FaLinkedin }from "react-icons/fa";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
  easeInOut,
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
  BookOpen,
} from "lucide-react";

function Home() {
  const [loading, setLoading] = useState(true);
  const countersRef = useRef(null);

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
    {
      title: "Resource Vault",
      desc: "Discover, upvote, and manage useful resources together.",
      icon: <BookOpen className="w-6 h-6 text-purple-400" />,
      link: "/resourcevault"
    },
  ];

  // --- Testimonial Carousel as a child component ---
function TestimonialCarousel() {
  const testimonials = [
    {
      name: "Ananya S.",
      quote: "EDGEx helped me discover a career path I never even considered. Life-changing!",
      role: "Class 12, Delhi",
    },
    {
      name: "Rohan M.",
      quote: "MoodMirror is like talking to a friend who truly understands you. So cool!",
      role: "Class 10, Mumbai",
    },
    {
      name: "Sneha T.",
      quote: "The scholarship tool got me 3 perfect matches. This is the future of guidance!",
      role: "Commerce Student, Kolkata",
    },
  ];

  const [index, setIndex] = useState(0);
  const next = () => setIndex((prev) => (prev + 1) % testimonials.length);
  const prev = () =>
    setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="py-24 px-6 lg:px-20 bg-[#0e0e1a]">
      <h2 className="text-3xl font-bold text-center mb-12 text-white transition duration-300 hover:text-purple-400 hover:scale-105">
        ✨ Hear from Our Students
      </h2>

      <div className="relative max-w-3xl mx-auto overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.6 }}
            className="bg-[#1a1a2e] p-8 rounded-2xl border border-white/10 shadow-xl text-center text-white"
          >
            <p className="text-xl italic mb-6">“{testimonials[index].quote}”</p>
            <p className="font-semibold text-lg">{testimonials[index].name}</p>
            <p className="text-sm text-purple-300">{testimonials[index].role}</p>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-center gap-6 mt-8">
          <button
            onClick={prev}
            className="px-4 py-2 rounded-lg bg-purple-700 text-white hover:bg-purple-500 transition"
          >
            ← Previous
          </button>
          <button
            onClick={next}
            className="px-4 py-2 rounded-lg bg-purple-700 text-white hover:bg-purple-500 transition"
          >
            Next →
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center mt-6 gap-2">
          {testimonials.map((_, i) => (
            <span
              key={i}
              className={`w-3 h-3 rounded-full ${
                i === index ? "bg-purple-500" : "bg-gray-500"
              }`}
            ></span>
          ))}
        </div>
      </div>
    </section>
  );
}



  /*const [[index, direction], setIndex] = useState([0, 0]);
  const paginate = (dir) => {
    setIndex(([prev]) => [(prev + dir + testimonials.length) % testimonials.length, dir]);
  };*/

  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

    const counters = [
    { label: "Students Helped", value: 5700 },
    { label: "Scholarships Found", value: 1300 },
    { label: "Mood Sessions", value: 25000 },
  ];
  const [counts, setCounts] = useState(counters.map(() => 1)); // Start from 1 instead of 0
  const [isAnimating, setIsAnimating] = useState(false)
   
  // Custom scroll detection for counters - triggers only when actively scrolling to section
  useEffect(() => {
    let lastScrollTop = 0;
    let scrollTimeout = null;
    let hasTriggered = false;
    
    const handleScroll = () => {
      if (!countersRef.current || isAnimating) return;
      
      const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const rect = countersRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Clear previous timeout
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      
      // Only trigger when section is 50% visible AND user is actively scrolling
      if (rect.top <= windowHeight * 0.5 && rect.bottom >= windowHeight * 0.5) {
        // Check if user is actually scrolling (not just the section being in view)
        const isScrolling = Math.abs(currentScrollTop - lastScrollTop) > 10;
        
                 if (isScrolling && !hasTriggered) {
           hasTriggered = true;
          startCounterAnimation();
          
          // Reset trigger flag after animation completes
          setTimeout(() => {
            hasTriggered = false;
          }, 3000); // 3 seconds total (2s animation + 1s delay)
        }

      }
      
      lastScrollTop = currentScrollTop;
      
      // Set a timeout to prevent rapid firing
      scrollTimeout = setTimeout(() => {
        // This ensures we don't trigger multiple times for the same scroll
      }, 150);
    };

    // Check on mount and scroll
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [isAnimating]);

  // Separate function to start counter animation
  const startCounterAnimation = () => {
    if (isAnimating) return;
    
    
    setIsAnimating(true);
    
    // Reset counts to 1
    setCounts(counters.map(() => 1));
    
    // Start the counter animation
    const duration = 2000; // 2 seconds total
    const steps = 60; // 60 steps for smooth animation
    const stepDuration = duration / steps;
    
    let currentStep = 0;
    
    const animate = setInterval(() => {
      currentStep++;
      
      setCounts((prev) => {
        const newCounts = prev.map((num, i) => {
          const target = counters[i].value;
          const progress = currentStep / steps;
          const currentValue = Math.floor(1 + (target - 1) * progress);
          return Math.min(currentValue, target);
        });
        
        // Check if animation is complete
        if (currentStep >= steps) {
          clearInterval(animate);
          console.log("Final counts:", newCounts);
          
          // Add a longer delay before allowing next animation
          setTimeout(() => {
            setIsAnimating(false); // Allow next animation to trigger
          }, 10000); // 1 second delay to prevent accidental restarts
        }
        
        return newCounts;
      });
    }, stepDuration);
  };

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
          <h1 className="text-4xl md:text-6xl font-bold leading-tight text-white mb-6 text-white transition duration-300 hover:text-purple-400 hover:scale-105">
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
        <h2 className="text-3xl font-bold text-center mb-12 text-white text-white transition duration-300 hover:text-purple-400 hover:scale-105">What can EDGEx AI do?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto text-white">
          {features.map((feat, i) => {
            const Card = (
              <motion.div
                key={i}
                whileHover={{ scale: 1.03 }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3}}
                viewport={{ once: true }}
                className="bg-glass backdrop-blur-md p-6 rounded-xl border border-white/10 transition-[box-shadow,colors] duration-300  cursor-pointer flex flex-col justify-between h-full hover:shadow-2xl hover:border-white/20 hover:bg-white/5"
              >
                <div className="flex items-center gap-3 mb-3">
                  {feat.icon}
                  <h3 className="text-xl font-semibold">{feat.title}</h3>
                </div>
                <p className="text-gray-400 flex-grow">{feat.desc}</p>
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

      {/* Testimonials */}
      <TestimonialCarousel />

      {/* Counters */}
      <section ref={countersRef} className="py-20 bg-[#0a0a14] text-center">
        <h2 className="text-3xl font-bold text-white mb-12 transition duration-300 hover:text-purple-400 hover:scale-105">
          Our Impact So Far 🚀
        </h2>
        {!isAnimating && (
          <div className="mb-6">
            <button 
              onClick={startCounterAnimation}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {/* 🎯 Click to Start Counter Animation */}
            </button>
            <div className="text-blue-400 text-sm mt-2">
              {/* 💡 Or scroll to this section to trigger automatically */}
            </div>
          </div>
        )}
        {isAnimating && (
          <div className="text-green-400 text-sm mb-6 animate-pulse">
            {/* 🎯 Animation triggered! Counters are counting up... */}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {counters.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              viewport={{ once: true }}
              className="p-6 rounded-xl transition transform hover:scale-105 hover:bg-gray-800 hover:shadow-lg cursor-pointer"
              title={item.label === "Students Helped"
              ? "Number of students who received guidance"
              : item.label === "Scholarships Found"
              ? "Scholarships we helped students find"
              : "Sessions that improved students"}
            >
              <p className="text-4xl font-bold text-purple-400">
                {counts[i].toLocaleString()}+
                                 {isAnimating && counts[i] === 1 && (
                   <span className="text-green-400 text-sm ml-2">→ Starting...</span>
                 )}
              </p>
              <p className="text-gray-400 mt-2">{item.label}</p>
            </motion.div>
          ))}
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
      {/* Added horizontal padding to footer for better spacing */}
      <footer className="py-8  text-gray-500 text-sm px-8 lg:px-20 ">
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

