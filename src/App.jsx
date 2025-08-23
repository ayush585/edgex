import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CareerCrack from "./pages/CareerCrack";
import MoodMirror from "./pages/MoodMirror";
import ScholarshipScout from "./pages/ScholarshipScout";
import SmartNotes from "./pages/SmartNotes";
import VoiceFeedback from "./pages/VoiceFeedback";
import Home from "./pages/Home";
import ScrollToTopButton from "./components/ScrollToTopButton"; // Import the button

const ResourceVault = React.lazy(() => import("./pages/ResourceVault"));

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/careercrack" element={<CareerCrack />} />
        <Route path="/moodmirror" element={<MoodMirror />} />
        <Route path="/scholarships" element={<ScholarshipScout />} />
        <Route path="/smartnotes" element={<SmartNotes />} />
        <Route path="/voicefeedback" element={<VoiceFeedback />} />
        <Route
          path="/resourcevault"
          element={
            <React.Suspense fallback={<div className="p-6 text-gray-500">Loading Resource Vault…</div>}>
              <ResourceVault />
            </React.Suspense>
          }
        />
      </Routes>

      {/* Scroll to Top Button outside routes so it's always available */}
      <ScrollToTopButton />
    </Router>
  );
}

export default App;
