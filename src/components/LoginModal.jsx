import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updatePassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  X,
  ArrowLeft,
  Key,
} from 'lucide-react';
import { toast } from 'react-toastify';

const LoginModal = ({ onClose }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const modalRef = useRef();

  // Effect to handle clicks outside the modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        if (onClose) {
          onClose();
        } else {
          navigate(-1);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose, navigate]);


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const { fullName, email, password, confirmPassword } = formData;

    if (showForgotPassword) {
      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        toast.error('Valid email is required.');
        return false;
      }
      return true;
    }

    if (isSignup) {
      if (!fullName.trim()) {
        toast.error('Full Name is required.');
        return false;
      }
      if (!/^[A-Za-z\s]+$/.test(fullName)) {
        toast.error('Full Name can only contain letters and spaces.');
        return false;
      }
      if (password !== confirmPassword) {
        toast.error('Passwords do not match.');
        return false;
      }
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast.error('Valid email is required.');
      return false;
    }
    if (!password || password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return false;
    }
    return true;
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Send password reset email
      await sendPasswordResetEmail(auth, formData.email);
      toast.success('Password reset email sent! Check your inbox and follow the instructions to reset your password.');
      setTimeout(() => {
        setShowForgotPassword(false);
        resetForm();
      }, 3000);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        toast.error('No account found with this email address.');
      } else if (err.code === 'auth/invalid-email') {
        toast.error('Invalid email address.');
      } else {
        toast.error(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      let res;
      if (isSignup) {
        res = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        await setDoc(doc(db, 'users', res.user.uid), {
          fullName: formData.fullName,
          email: formData.email,
          createdAt: serverTimestamp(),
        });
        toast.success('Account created successfully!');
      } else {
        res = await signInWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        toast.success('Signed in successfully!');
      }
      navigate('/');
    } catch (err) {
      const code = err.code;
      if (code === 'auth/email-already-in-use') {
        toast.error('Email already registered. Try logging in.');
      } else if (code === 'auth/invalid-email') {
        toast.error('Invalid email format.');
      } else if (code === 'auth/weak-password') {
        toast.error('Password too weak (min 6 characters).');
      } else if (code === 'auth/user-not-found' || code === 'auth/wrong-password') {
        toast.error('Wrong email or password.');
      } else {
        toast.error(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowNewPassword(false);
    setShowConfirmNewPassword(false);
  };
  
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div ref={modalRef} className="bg-gray-900/95 backdrop-blur-md border border-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md space-y-6 relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer z-40"
          title="Go back"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-purple-600/10 rounded-2xl"></div>
        <div className="relative z-10">
          <div className="text-center space-y-2 mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-500 rounded-full mb-4">
              <span className="text-2xl font-bold text-white">E</span>
            </div>
            <h2 className="text-2xl font-bold text-white">
              {showForgotPassword ? 'Reset Password' : isSignup ? 'Join EDGEx' : 'Welcome Back'}
            </h2>
            <p className="text-gray-400 text-sm">
              {showForgotPassword
                ? 'Enter your email and new password to reset your account'
                : isSignup
                ? 'Create your account to start your AI-powered learning journey'
                : 'Sign in to continue your learning journey'}
            </p>
          </div>
          <form onSubmit={showForgotPassword ? handleForgotPassword : handleAuth} className="space-y-4">
            {showForgotPassword ? (
              <>
                {/* Forgot Password Form */}
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-gray-800/50 border border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 px-10 py-3 rounded-lg text-white placeholder-gray-400 transition-all duration-200 outline-none"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Sending Reset Email...
                    </>
                  ) : (
                    'Send Reset Email'
                  )}
                </button>
              </>
            ) : (
              <>
                {/* Regular Login/Signup Form */}
                {isSignup && (
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full bg-gray-800/50 border border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 px-10 py-3 rounded-lg text-white placeholder-gray-400 transition-all duration-200 outline-none"
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
                    className="w-full bg-gray-800/50 border border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 px-10 py-3 rounded-lg text-white placeholder-gray-400 transition-all duration-200 outline-none"
                    placeholder="Email Address"
                    required
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-gray-800/50 border border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 px-10 pr-12 py-3 rounded-lg text-white placeholder-gray-400 transition-all duration-200 outline-none"
                    placeholder="Password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {isSignup && (
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full bg-gray-800/50 border border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 px-10 pr-12 py-3 rounded-lg text-white placeholder-gray-400 transition-all duration-200 outline-none"
                      placeholder="Confirm Password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : isSignup ? (
                    'Create Account'
                  ) : (
                    'Sign In'
                  )}
                </button>
              </>
            )}
          </form>
          <div className="text-center pt-6 border-t border-gray-700/50 space-y-3">
            {showForgotPassword ? (
              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  resetForm();
                }}
                className="flex items-center justify-center gap-2 text-purple-400 font-semibold hover:text-purple-300 transition-colors hover:underline mx-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </button>
            ) : (
              <>
                {!isSignup && (
                  <button
                    onClick={() => {
                      setShowForgotPassword(true);
                      resetForm();
                    }}
                    className="text-purple-400 font-semibold hover:text-purple-300 transition-colors hover:underline text-sm"
                  >
                    Forgot Password?
                  </button>
                )}
                <p className="text-gray-400 text-sm">
                  {isSignup ? 'Already have an account?' : 'New to EDGEx?'}{' '}
                  <button
                    onClick={() => {
                      setIsSignup(!isSignup);
                      resetForm();
                    }}
                    className="text-purple-400 font-semibold hover:text-purple-300 transition-colors hover:underline"
                  >
                    {isSignup ? 'Sign In' : 'Create Account'}
                  </button>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;