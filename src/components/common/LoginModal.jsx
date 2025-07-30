import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";

const LoginModal = ({ 
  onLogin, 
  title = "Welcome", 
  subtitle = "Sign in to continue",
  appName = "EDGEx",
  theme = "purple", // purple, indigo, or custom
  showFullName = true,
  customStyles = {}
}) => {
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Theme configurations
  const themes = {
    purple: {
      primary: "from-purple-600 to-purple-500",
      primaryHover: "hover:from-purple-700 hover:to-purple-600",
      focus: "focus:border-purple-500 focus:ring-purple-500/20",
      accent: "text-purple-400",
      accentHover: "hover:text-purple-300",
      bgGradient: "from-purple-900/20 via-transparent to-purple-600/10"
    },
    indigo: {
      primary: "from-indigo-600 to-indigo-500",
      primaryHover: "hover:from-indigo-700 hover:to-indigo-600",
      focus: "focus:border-indigo-500 focus:ring-indigo-500/20",
      accent: "text-indigo-400",
      accentHover: "hover:text-indigo-300",
      bgGradient: "from-indigo-900/20 via-transparent to-indigo-600/10"
    }
  };

  const currentTheme = themes[theme] || themes.purple;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const { fullName, email, password, confirmPassword } = formData;
    if (isSignup && showFullName) {
      if (!fullName.trim()) return "Full Name is required.";
      if (!/^[A-Za-z\s]+$/.test(fullName)) return "Full Name can only contain letters and spaces.";
      if (password !== confirmPassword) return "Passwords do not match.";
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) return "Valid email is required.";
    if (!password || password.length < 6) return "Password must be at least 6 characters.";
    return null;
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      let res;
      if (isSignup) {
        res = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        // Save user data to Firestore if full name is provided
        if (showFullName && formData.fullName) {
          await setDoc(doc(db, "users", res.user.uid), {
            fullName: formData.fullName,
            email: formData.email,
            createdAt: serverTimestamp(),
          });
        }
      } else {
        res = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      }
      onLogin(res.user.uid);
    } catch (err) {
      const code = err.code;
      if (code === "auth/email-already-in-use") {
        setError("⚠️ Email already registered. Try logging in.");
      } else if (code === "auth/invalid-email") {
        setError("⚠️ Invalid email format.");
      } else if (code === "auth/weak-password") {
        setError("⚠️ Password too weak (min 6 characters).");
      } else if (
        code === "auth/user-not-found" ||
        code === "auth/wrong-password"
      ) {
        setError("❌ Wrong email or password.");
      } else {
        setError("❌ " + err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ fullName: "", email: "", password: "", confirmPassword: "" });
    setError("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/95 backdrop-blur-md border border-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md space-y-6 relative overflow-hidden" style={customStyles.container}>
        {/* Background gradient accent */}
        <div className={`absolute inset-0 bg-gradient-to-br ${currentTheme.bgGradient} rounded-2xl`}></div>

        <div className="relative z-10">
          {/* Header */}
          <div className="text-center space-y-2 mb-8">
            <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${currentTheme.primary} rounded-full mb-4`}>
              <span className="text-2xl font-bold text-white">{appName.charAt(0)}</span>
            </div>
            <h2 className="text-2xl font-bold text-white">
              {isSignup ? `Join ${appName}` : title}
            </h2>
            <p className="text-gray-400 text-sm">
              {isSignup
                ? `Create your account to start your AI-powered journey`
                : subtitle
              }
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="px-4 py-3 rounded-lg text-sm mb-6 flex items-center gap-2 border"
              style={{
                backgroundColor: 'rgba(220, 38, 38, 0.1)',
                borderColor: 'rgba(220, 38, 38, 0.3)',
                color: '#ef4444'
              }}
            >
              <span style={{ color: '#dc2626' }}>⚠️</span>
              <span style={{ color: '#ef4444' }}>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-4">
            {isSignup && showFullName && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`w-full bg-gray-800/50 border border-gray-700 ${currentTheme.focus} focus:ring-2 px-10 py-3 rounded-lg text-white placeholder-gray-400 transition-all duration-200 outline-none`}
                  placeholder="Full Name"
                  required
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full bg-gray-800/50 border border-gray-700 ${currentTheme.focus} focus:ring-2 px-10 py-3 rounded-lg text-white placeholder-gray-400 transition-all duration-200 outline-none`}
                placeholder="Email Address"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full bg-gray-800/50 border border-gray-700 ${currentTheme.focus} focus:ring-2 px-10 pr-12 py-3 rounded-lg text-white placeholder-gray-400 transition-all duration-200 outline-none`}
                placeholder="Password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {isSignup && (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full bg-gray-800/50 border border-gray-700 ${currentTheme.focus} focus:ring-2 px-10 pr-12 py-3 rounded-lg text-white placeholder-gray-400 transition-all duration-200 outline-none`}
                  placeholder="Confirm Password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-gradient-to-r ${currentTheme.primary} ${currentTheme.primaryHover} text-white py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                isSignup ? "Create Account" : "Sign In"
              )}
            </button>
          </form>

          {/* Switch between login/signup */}
          <div className="text-center pt-6 border-t border-gray-700/50">
            <p className="text-gray-400 text-sm">
              {isSignup ? "Already have an account?" : "New to " + appName + "?"}{" "}
              <button
                onClick={() => {
                  setIsSignup(!isSignup);
                  resetForm();
                }}
                className={`${currentTheme.accent} font-semibold ${currentTheme.accentHover} transition-colors hover:underline`}
              >
                {isSignup ? "Sign In" : "Create Account"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal; 