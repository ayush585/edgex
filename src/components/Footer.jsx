import React from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaLinkedin, FaTwitter, FaInstagram } from 'react-icons/fa';
import { Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12 px-6 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-purple-400">EDGEx</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your all-in-one AI toolkit for career guidance, mood tracking, scholarship discovery, and more. Empowering Gen Z with intelligent tools.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com/ayush585/edgex"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-purple-400 transition-colors duration-300"
                aria-label="GitHub"
              >
                <FaGithub size={20} />
              </a>
              <a
                href="https://www.linkedin.com/in/ayushman-mukherjee-437a49314/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-purple-400 transition-colors duration-300"
                aria-label="LinkedIn"
              >
                <FaLinkedin size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-purple-400 transition-colors duration-300"
                aria-label="Twitter"
              >
                <FaTwitter size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-purple-400 transition-colors duration-300"
                aria-label="Instagram"
              >
                <FaInstagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-purple-400 transition-colors duration-300 text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/careercrack" className="text-gray-400 hover:text-purple-400 transition-colors duration-300 text-sm">
                  Career Mentor
                </Link>
              </li>
              <li>
                <Link to="/moodmirror" className="text-gray-400 hover:text-purple-400 transition-colors duration-300 text-sm">
                  Mood Mirror
                </Link>
              </li>
              <li>
                <Link to="/scholarships" className="text-gray-400 hover:text-purple-400 transition-colors duration-300 text-sm">
                  Scholarships
                </Link>
              </li>
              <li>
                <Link to="/smartnotes" className="text-gray-400 hover:text-purple-400 transition-colors duration-300 text-sm">
                  Smart Notes
                </Link>
              </li>
            </ul>
          </div>

          {/* Tools & Features */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Tools & Features</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/voicefeedback" className="text-gray-400 hover:text-purple-400 transition-colors duration-300 text-sm">
                  Voice to Text
                </Link>
              </li>
              <li>
                <Link to="/resume-analyzer" className="text-gray-400 hover:text-purple-400 transition-colors duration-300 text-sm">
                  Resume Analyzer
                </Link>
              </li>
              <li>
                <Link to="/resourcevault" className="text-gray-400 hover:text-purple-400 transition-colors duration-300 text-sm">
                  Resource Vault
                </Link>
              </li>
              <li>
                <a href="#features" className="text-gray-400 hover:text-purple-400 transition-colors duration-300 text-sm">
                  All Features
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Contact & Support</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail size={16} className="text-purple-400" />
                <a
                  href="mailto:support@edgex.ai"
                  className="text-gray-400 hover:text-purple-400 transition-colors duration-300 text-sm"
                >
                  support@edgex.ai
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Phone size={16} className="text-purple-400" />
                <span className="text-gray-400 text-sm">+1 (555) 123-EDGX</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin size={16} className="text-purple-400" />
                <span className="text-gray-400 text-sm">Global</span>
              </div>
            </div>
            <div className="pt-4">
              <p className="text-gray-400 text-sm">
                Need help? <a href="#" className="text-purple-400 hover:text-purple-300">Contact us</a>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © {currentYear} EDGEx by Ayushman. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors duration-300">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors duration-300">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors duration-300">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
