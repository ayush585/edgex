import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { signOut } from "firebase/auth";
import { auth } from './firebase';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CareerCrack from './pages/CareerCrack';
import MoodMirror from './pages/MoodMirror';
import ScholarshipScout from './pages/ScholarshipScout';
import SmartNotes from './pages/SmartNotes';
import VoiceFeedback from './pages/VoiceFeedback';
import Home from './pages/Home';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import ScrollToTopButton from './components/ScrollToTopButton';
import LoginModal from './components/LoginModal';

const ResourceVault = React.lazy(() => import('./pages/ResourceVault'));

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => {
    try {
      // If index.html already applied dark class on html, reflect that
      if (typeof document !== 'undefined') {
        return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      }
    } catch (e) {
      // ignore
    }
    return 'light';
  });

  useEffect(() => {
    try {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    } catch (e) {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-500">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-purple-200 dark:border-purple-900/50"></div>
          <div className="absolute inset-0 rounded-full border-4 border-purple-600 dark:border-purple-400 border-t-transparent animate-spin"></div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            Loading
          </span>
          <span className="flex gap-1.5">
            <span className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full animate-bounce [animation-delay:0ms]"></span>
            <span className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full animate-bounce [animation-delay:150ms]"></span>
            <span className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full animate-bounce [animation-delay:300ms]"></span>
          </span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse mt-1">
          Please wait while we prepare your experience...
        </p>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-500">
        {/* Pass the user object and theme handlers to the Navbar */}
        <Navbar user={user} theme={theme} toggleTheme={toggleTheme} />
        
        <main className="flex-1">
          <Routes>
            {/* Pass the user object to the Home component */}
            <Route path="/" element={<Home user={user} />} />
            <Route path="/careercrack" element={<CareerCrack user={user} />} />
            <Route path="/moodmirror" element={<MoodMirror user={user} />} />
            <Route path="/scholarships" element={<ScholarshipScout />} />
            <Route path="/smartnotes" element={<SmartNotes />} />
            <Route path="/voicefeedback" element={<VoiceFeedback user={user} />} />
            <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
            <Route
              path="/resourcevault"
              element={
                <React.Suspense fallback={<div className="p-6 text-gray-500">Loading Resource Vault…</div>}>
                  <ResourceVault user={user} />
                </React.Suspense>
              }
            />
            <Route path="/login" element={<LoginModal />} />
          </Routes>
        </main>

        <ScrollToTopButton />
        <Footer />
        <ToastContainer />
      </div>
    </Router>
  );

  const handleLogout = async () => {
  try {
    await signOut(auth);
    setUser(null);
  } catch (err) {
    console.error("Logout error:", err.message);
  }
};
}

export default App;