import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Navbar from './components/Navbar';
import CareerCrack from './pages/CareerCrack';
import MoodMirror from './pages/MoodMirror';
import ScholarshipScout from './pages/ScholarshipScout';
import SmartNotes from './pages/SmartNotes';
import VoiceFeedback from './pages/VoiceFeedback';
import Home from './pages/Home';
import ScrollToTopButton from './components/ScrollToTopButton';
import LoginModal from './components/LoginModal';

const ResourceVault = React.lazy(() => import('./pages/ResourceVault'));

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-500">
        {/* Pass the user object to the Navbar */}
        <Navbar user={user} />
        
        <main className="flex-1">
          <Routes>
            {/* Pass the user object to the Home component */}
            <Route path="/" element={<Home user={user} />} />
            <Route path="/careercrack" element={<CareerCrack user={user} />} />
            <Route path="/moodmirror" element={<MoodMirror user={user} />} />
            <Route path="/scholarships" element={<ScholarshipScout />} />
            <Route path="/smartnotes" element={<SmartNotes />} />
            <Route path="/voicefeedback" element={<VoiceFeedback user={user} />} />
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
      </div>
    </Router>
  );
}

export default App;