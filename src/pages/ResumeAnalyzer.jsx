import React, { useState } from 'react';
import { toast } from 'react-toastify';

function ResumeAnalyzer() {
  const [text, setText] = useState('');
  const [score, setScore] = useState(null);
  const [tips, setTips] = useState([]);

  const loadPdfJs = () => new Promise((resolve, reject) => {
    if (window.pdfjsLib) return resolve(window.pdfjsLib);
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.5.136/pdf.min.js';
    s.onload = () => resolve(window.pdfjsLib);
    s.onerror = reject;
    document.body.appendChild(s);
  });

  const extractPdfText = async (arrayBuffer) => {
    const pdfjsLib = await loadPdfJs();
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.5.136/pdf.worker.min.js';
    const typedArray = new Uint8Array(arrayBuffer);
    const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      fullText += content.items.map(it => it.str).join(' ') + '\n';
    }
    return fullText;
  };

  const handleFile = async (file) => {
    if (!file) return;
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (ext === 'txt') {
      const reader = new FileReader();
      reader.onload = e => setText(String(e.target?.result || ''));
      reader.readAsText(file);
    } else if (ext === 'pdf') {
      const reader = new FileReader();
      reader.onload = async e => {
        try {
          const buf = e.target?.result;
          const parsed = await extractPdfText(buf);
          setText(parsed);
        } catch (err) {
          console.error(err);
          toast.error('Could not read PDF text. Please try a .txt export of your resume.');
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      toast.error('Supported files: .pdf, .txt');
    }
  };

  const analyze = () => {
    const t = text || '';
    const tipsOut = [];
    let s = 50;

    if (!/\b(email|@)\b/i.test(t)) { tipsOut.push('Add a professional email.'); s -= 5; }
    if (!/\b(phone|\+?\d{7,})\b/i.test(t)) { tipsOut.push('Include a reachable phone number.'); s -= 5; }
    if (!/\b(education|b\.tech|btech|m\.tech|degree)\b/i.test(t)) { tipsOut.push('Add an Education section.'); s -= 10; }
    if (!/\b(experience|internship|project)\b/i.test(t)) { tipsOut.push('Highlight experience, internships, or projects.'); s -= 10; }
    if (!/\b(skills|technologies|tools)\b/i.test(t)) { tipsOut.push('List key skills and tools.'); s -= 10; }
    if (!/\b(achievements|awards|certifications)\b/i.test(t)) { tipsOut.push('Add achievements or certifications.'); s -= 5; }
    if ((t.match(/\b(responsible for|worked on)\b/gi) || []).length > 3) { tipsOut.push('Use action verbs (built, led, delivered) over passive phrasing.'); }
    if (t.length > 8000) { tipsOut.push('Try to keep the resume concise (1–2 pages).'); s -= 5; }

    s = Math.max(0, Math.min(100, s + Math.min(20, Math.floor((t.match(/\b(project|react|node|ml|api|sql|aws)\b/gi) || []).length * 2))))
    setScore(s);
    setTips(tipsOut.length ? tipsOut : ['Looks good! Consider tailoring to each job’s keywords.']);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Resume Analyzer (ATS)</h1>
        <p className="text-gray-500 mb-4">Upload your resume (.pdf or .txt) or paste text below, then get an ATS-style score with improvement tips.</p>

        <div className="flex items-center gap-3 mb-4">
          <input
            type="file"
            accept=".pdf,.txt"
            onChange={(e) => handleFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
          />
        </div>

        <textarea
          className="w-full h-56 p-4 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Paste your resume text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="mt-4 flex items-center gap-3">
          <button onClick={analyze} className="px-5 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white font-semibold">Analyze</button>
          {score !== null && <span className="text-sm text-gray-500">Score: <span className="font-semibold">{score}/100</span></span>}
        </div>

        {tips.length > 0 && (
          <div className="mt-6 p-4 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <h2 className="text-lg font-semibold mb-2">Suggestions</h2>
            <ul className="list-disc pl-5 text-sm space-y-1">
              {tips.map((t, i) => (<li key={i}>{t}</li>))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResumeAnalyzer;


