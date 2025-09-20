import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { Home, LogOut, Menu, X, Brain, MessageSquare, BookOpen, Award, Mic, FileText, UserCircle, Sun, Moon } from 'lucide-react';

const Navbar = ({ isAuthenticated, onLogout, user, theme, toggleTheme }) => {
<<<<<<< HEAD
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
=======
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
>>>>>>> e6f53ba870b0d891d41c6fe3456c5e8a89adc30b

  const navigationItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/', description: 'Return to main dashboard' },
    { id: 'careercrack', label: 'CareerCrack', icon: Brain, path: '/careercrack', description: 'AI-powered career advice' },
    { id: 'moodmirror', label: 'MoodMirror', icon: MessageSquare, path: '/moodmirror', description: 'Mental wellness companion' },
    { id: 'smartnotes', label: 'SmartNotes', icon: FileText, path: '/smartnotes', description: 'Intelligent note-taking' },
    { id: 'scholarships', label: 'ScholarshipScout', icon: Award, path: '/scholarships', description: 'Find scholarships' },
    { id: 'voicefeedback', label: 'VoiceFeedback', icon: Mic, path: '/voicefeedback', description: 'Voice-powered insights' },
    { id: 'resourcevault', label: 'ResourceVault', icon: BookOpen, path: '/resourcevault', description: 'Discover resources' }
  ];

  const getCurrentPage = () => {
    const path = location.pathname;
    const currentItem = navigationItems.find(item => item.path === path);
    return currentItem ? currentItem.id : 'home';
  };

  const currentPage = getCurrentPage();

  const handleNavigation = (item) => {
    navigate(item.path);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      if (onLogout) onLogout();
      navigate('/');
      setIsProfileMenuOpen(false);
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => {
      const newState = !prev;
      if (newState) {
        document.body.classList.add("no-scroll");
      } else {
        document.body.classList.remove("no-scroll");
      }
      return newState;
    });
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

<<<<<<< HEAD
  // Close profile menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileMenuOpen && !event.target.closest('.profile-menu-container')) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileMenuOpen]);
=======
  const renderThemeToggle = () => {
    const isDark = theme === 'dark';
    const toggle = toggleTheme ? toggleTheme : () => {
      document.documentElement.classList.toggle('dark');
      try {
        const nowDark = document.documentElement.classList.contains('dark');
        localStorage.setItem('theme', nowDark ? 'dark' : 'light');
      } catch (e) {}
    };

    return (
      <button onClick={toggle} className="p-2 rounded-md text-purple-100 hover:text-white hover:bg-purple-700/30 transition-colors duration-200" title="Toggle theme">
        {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>
    );
  };

  const renderAuthButton = () => {
    if (user) {
      return (
        <div className="relative profile-menu-container">
          <button 
            onClick={toggleProfileMenu}
            className="flex items-center justify-center p-2 bg-purple-700 hover:bg-purple-600 text-white rounded-full text-sm font-medium transition-colors duration-200 w-10 h-10"
            title={user.email || 'User Profile'}
          >
            <UserCircle className="h-6 w-6" />
          </button>
          
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="px-4 py-2 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.email || 'User'}
                </p>
                <p className="text-xs text-gray-500">Signed in</p>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      );
    } else {
      return (
        <Link
          to="/login"
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors duration-200"
          title="Sign in to EDGEx"
        >
          <UserCircle className="h-4 w-5" />
          <span className="hidden xl:block">Sign In</span>
        </Link>
      );
    }
  };

  return (
    <>
      <nav className="bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 border-b border-purple-700/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 gap-6">
            
            {/* Logo and Brand Name */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-purple-600 p-2 rounded-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  EDGE<span className="text-purple-300">x</span>
                </h1>
                <p className="text-xs text-purple-200 hidden sm:block">AI Toolkit</p>
              </div>
            </Link>
>>>>>>> e6f53ba870b0d891d41c6fe3456c5e8a89adc30b

  const renderThemeToggle = () => {
    const isDark = theme === 'dark';
    const toggle = toggleTheme ? toggleTheme : () => {
      document.documentElement.classList.toggle('dark');
      try {
        const nowDark = document.documentElement.classList.contains('dark');
        localStorage.setItem('theme', nowDark ? 'dark' : 'light');
      } catch (e) {}
    };

<<<<<<< HEAD
    return (
      <button
        onClick={toggle}
        className="p-2 rounded-md text-purple-100 hover:text-white hover:bg-purple-700/30 transition-colors duration-200"
        title="Toggle theme"
      >
        {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>
    );
  };

  const renderAuthButton = () => {
    if (user) {
      return (
        <div className="relative profile-menu-container">
          <button
            onClick={toggleProfileMenu}
            className="flex items-center justify-center p-2 bg-purple-700 hover:bg-purple-600 text-white rounded-full text-sm font-medium transition-colors duration-200 w-10 h-10"
            title={user.email || 'User Profile'}
          >
            <UserCircle className="h-6 w-6" />
          </button>
=======
            {/* Auth Button and Mobile Menu Toggle */}
            <div className="flex items-center gap-4">
              {/* Desktop theme toggle and auth button */}
              <div className="hidden lg:flex items-center gap-2">
                {renderThemeToggle()}
                {renderAuthButton()}
              </div>

              {/* Mobile theme toggle */}
              <div className="flex items-center lg:hidden">
                {renderThemeToggle()}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 rounded-lg text-purple-100 hover:text-white hover:bg-purple-700/50 transition-colors duration-200"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
>>>>>>> e6f53ba870b0d891d41c6fe3456c5e8a89adc30b

          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="px-4 py-2 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.email || 'User'}
                </p>
                <p className="text-xs text-gray-500">Signed in</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      );
    } else {
      return (
        <Link
          to="/login"
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors duration-200"
          title="Sign in to EDGEx"
        >
          <UserCircle className="h-4 w-5" />
          <span className="hidden xl:block">Sign In</span>
        </Link>
      );
    }
  };

  return (
    <>
      <nav className="bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 border-b border-purple-700/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 gap-6">

            {/* Logo and Brand Name */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-purple-600 p-2 rounded-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  EDGE<span className="text-purple-300">x</span>
                </h1>
                <p className="text-xs text-purple-200 hidden sm:block">AI Toolkit</p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-2">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = currentPage === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item)}
                    className={`
                      flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                      ${isActive
                        ? 'bg-purple-700 text-white'
                        : 'text-purple-100 hover:text-white hover:bg-purple-700/50'
                      }
                    `}
                    title={item.description}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="hidden xl:block">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Auth Button and Mobile Menu Toggle */}
            <div className="flex items-center gap-4">
              {/* Desktop theme toggle and auth button */}
              <div className="hidden lg:flex items-center gap-2">
                {renderThemeToggle()}
                {renderAuthButton()}
              </div>

              {/* Mobile theme toggle */}
              <div className="flex items-center lg:hidden">
                {renderThemeToggle()}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 rounded-lg text-purple-100 hover:text-white hover:bg-purple-700/50 transition-colors duration-200"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden transition-all duration-300 ${isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}
          style={{
            overflowY: 'auto',
            maxHeight: '100vh',
            width: '100vw',
            position: 'fixed',
            left: 0,
            top: 0,
            zIndex: 1000,
          }}
        >
          <div
            className="px-4 pt-2 pb-4 space-y-1 bg-purple-900/95 backdrop-blur-sm border-t border-purple-700/30 overflow-y-auto max-h-[calc(100vh-4rem)]"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item)}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200
                    ${isActive
                      ? 'bg-purple-700 text-white'
                      : 'text-purple-100 hover:text-white hover:bg-purple-700/50'
                    }
                  `}
                >
                  <IconComponent className="h-5 w-5" />
                  <div>
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-purple-300">{item.description}</div>
                  </div>
                </button>
              );
            })}

            {/* Mobile Auth Section */}
            <div className="mt-4 pt-4 border-t border-purple-700/30">
              {user ? (
                <div className="space-y-2">
                  <div className="px-4 py-2">
                    <p className="text-sm font-medium text-white truncate">
                      {user.email || 'User'}
                    </p>
                    <p className="text-xs text-purple-300">Signed in</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                  >
                    <LogOut className="h-5 w-5" />
                    <div className="font-medium">Sign out</div>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="w-full flex items-center space-x-3 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <UserCircle className="h-5 w-5" />
                  <div className="font-medium">Sign In</div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
