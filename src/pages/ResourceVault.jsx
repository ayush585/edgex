import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  ChevronUp,
  ExternalLink,
  X,
  Filter,
  Trash2,
  User,
  Calendar,
  Tag,
  ArrowUpCircle,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  LogIn,
  UserPlus,
} from "lucide-react";


// Mock data for development - replace with real API later
const mockResources = [
  {
    id: 1,
    title: "Complete React Documentation",
    url: "https://react.dev",
    description: "Official React documentation with hooks, components, and best practices for modern React development.",
    tags: ["React", "JavaScript", "Frontend", "Documentation"],
    upvotes: 45,
    has_upvoted: false,
    posted_by: { id: 1, name: "Sarah Chen", avatar: "SC" },
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    domain: "react.dev"
  },
  {
    id: 2,
    title: "Python for Data Science Handbook",
    url: "https://jakevdp.github.io/PythonDataScienceHandbook/",
    description: "Free online book covering NumPy, Pandas, Matplotlib, and Scikit-Learn for data science.",
    tags: ["Python", "Data Science", "Machine Learning", "Free Book"],
    upvotes: 32,
    has_upvoted: true,
    posted_by: { id: 2, name: "Alex Kumar", avatar: "AK" },
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    domain: "jakevdp.github.io"
  },
  {
    id: 3,
    title: "Coursera Machine Learning Course",
    url: "https://coursera.org/learn/machine-learning",
    description: "Andrew Ng's famous ML course. Perfect for beginners wanting to understand algorithms and applications.",
    tags: ["Machine Learning", "Course", "Beginner", "Mathematics"],
    upvotes: 78,
    has_upvoted: false,
    posted_by: { id: 1, name: "Sarah Chen", avatar: "SC" },
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    domain: "coursera.org"
  }
];


// Utility functions
const timeAgo = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  let diffInSeconds = Math.floor((now - date) / 1000);
  if (diffInSeconds < 0) diffInSeconds = 0; 
  
  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

const extractDomain = (url) => {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return 'invalid-url';
  }
};

const validateUrl = (url) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};


// Login Modal Component
const LoginModal = ({ isOpen, onClose, onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Mock authentication - replace with real auth
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      if (mode === "signup") {
        if (password.length < 6) {
          throw new Error("Password too weak. Use at least 6 characters.");
        }
      } else {
        if (email !== "test@example.com" || password !== "password123") {
          throw new Error("Invalid email or password.");
        }
      }
      
      const mockUser = {
        id: Date.now(),
        email: email,
        name: email.split('@')[0],
        avatar: email.charAt(0).toUpperCase() + email.split('@')[0].charAt(1).toUpperCase(),
        role: "mentor"
      };
      
      onLogin(mockUser);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 id="login-modal-title" className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {mode === "signup" ? (
                <>
                  <UserPlus className="w-6 h-6 text-purple-600" />
                  Create Account
                </>
              ) : (
                <>
                  <LogIn className="w-6 h-6 text-purple-600" />
                  Welcome Back
                </>
              )}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {mode === "signup" 
              ? "Join our community to share amazing resources!" 
              : "Sign in to contribute to Resource Vault"
            }
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder={mode === "signup" ? "Create a strong password" : "Enter your password"}
              required
            />
            {mode === "signup" && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Password must be at least 6 characters
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {mode === "signup" ? "Creating Account..." : "Signing In..."}
              </>
            ) : (
              <>
                {mode === "signup" ? (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Create Account
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </>
                )}
              </>
            )}
          </button>
        </form>

        <div className="p-6 pt-0">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            {mode === "signup" ? "Already have an account?" : "New to Resource Vault?"}{" "}
            <button
              onClick={() => {
                setMode(mode === "signup" ? "login" : "signup");
                setError("");
              }}
              className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
            >
              {mode === "signup" ? "Sign In" : "Create Account"}
            </button>
          </p>
          
          {mode === "login" && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                <strong>Demo Login:</strong> test@example.com / password123
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// Components
const ResourceCard = ({ resource, onUpvote, onDelete, onEdit, currentUser }) => {
  const [expanded, setExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const canModify = currentUser?.id === resource.posted_by.id;
  
  const handleUpvote = (e) => {
    e.preventDefault();
    onUpvote(resource.id);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this resource? This action cannot be undone.")) {
      onDelete(resource.id);
      setShowMenu(false);
    }
  };

  const handleEdit = () => {
    onEdit(resource);
    setShowMenu(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white/60 dark:bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-semibold text-purple-800 dark:text-purple-300 hover:text-purple-600 dark:hover:text-purple-200 transition-colors flex items-center gap-2 group"
            >
              {resource.title}
              <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
            <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 text-xs rounded-full">
              {resource.domain}
            </span>
          </div>
          
          <p className={`text-gray-700 dark:text-gray-300 text-sm mb-3 ${!expanded && resource.description.length > 150 ? 'line-clamp-3' : ''}`}>
            {resource.description}
            {!expanded && resource.description.length > 150 && (
              <button
                onClick={() => setExpanded(true)}
                className="text-purple-600 dark:text-purple-400 hover:underline ml-1"
              >
                Show more
              </button>
            )}
            {expanded && resource.description.length > 150 && (
              <button
                onClick={() => setExpanded(false)}
                className="text-purple-600 dark:text-purple-400 hover:underline ml-1"
              >
                Show less
              </button>
            )}
          </p>
        </div>
        
        {/* Options menu */}
        {canModify && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-full hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
            
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10"
                >
                  <button
                    onClick={handleEdit}
                    className="w-full px-4 py-2 text-left text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center gap-2 text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full px-4 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {resource.tags.map((tag) => (
          <span
            key={tag}
            className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 py-1 text-xs rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
              {resource.posted_by.avatar}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {resource.posted_by.name}
            </span>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-500">
            {timeAgo(resource.created_at)}
          </span>
        </div>
        
        <button
          onClick={handleUpvote}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
            resource.has_upvoted
              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
          aria-pressed={resource.has_upvoted}
        >
          <ArrowUpCircle className={`w-4 h-4 ${resource.has_upvoted ? 'fill-current' : ''}`} />
          <span className="font-semibold">{resource.upvotes}</span>
        </button>
      </div>
    </motion.div>
  );
};

const AddResourceModal = ({ isOpen, onClose, onAdd, onEdit, loading, editingResource }) => {
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});
  const isEditing = !!editingResource;

  // Reset form when modal opens/closes or when editing resource changes
  useEffect(() => {
    if (isOpen) {
      if (editingResource) {
        setFormData({
          title: editingResource.title,
          url: editingResource.url,
          description: editingResource.description,
          tags: [...editingResource.tags]
        });
      } else {
        setFormData({ title: '', url: '', description: '', tags: [] });
      }
      setTagInput('');
      setErrors({});
    }
  }, [isOpen, editingResource]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.title.trim() || formData.title.length < 5 || formData.title.length > 120) {
      newErrors.title = 'Title must be 5-120 characters';
    }
    if (!validateUrl(formData.url)) {
      newErrors.url = 'Please enter a valid HTTP/HTTPS URL';
    }
    if (formData.description.length > 500) {
      newErrors.description = 'Description must be under 500 characters';
    }
    if (formData.tags.length === 0) {
      newErrors.tags = 'Please add at least one tag';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      if (isEditing) {
        const success = await onEdit(editingResource.id, {
          ...formData,
          domain: extractDomain(formData.url)
        });
        if (success) {
          onClose();
        }
      } else {
        const success = await onAdd({
          ...formData,
          domain: extractDomain(formData.url)
        });
        if (success) {
          setFormData({ title: '', url: '', description: '', tags: [] });
          setTagInput('');
          setErrors({});
          onClose();
        }
      }
    }
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim() && formData.tags.length < 5) {
      e.preventDefault();
      const tag = tagInput.trim();
      if (tag.length <= 20 && !formData.tags.includes(tag)) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="resource-modal-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 id="resource-modal-title" className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEditing ? 'Edit Resource' : 'Add Resource'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter resource title"
              maxLength={120}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            <p className="text-gray-500 text-xs mt-1">{formData.title.length}/120</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              URL *
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="https://example.com"
            />
            {errors.url && <p className="text-red-500 text-sm mt-1">{errors.url}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={4}
              placeholder="Describe what makes this resource valuable"
              maxLength={500}
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            <p className="text-gray-500 text-xs mt-1">{formData.description.length}/500</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags * (Press Enter to add)
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Add tags (max 5)"
              maxLength={20}
              disabled={formData.tags.length >= 5}
            />
            {errors.tags && <p className="text-red-500 text-sm mt-1">{errors.tags}</p>}
            
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isEditing ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                isEditing ? 'Update Resource' : 'Add Resource'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const ResourceVault = () => {
  const [resources, setResources] = useState(mockResources);
  const [filteredResources, setFilteredResources] = useState(mockResources);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState('top');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [editingResource, setEditingResource] = useState(null);
  
  const searchTimeoutRef = useRef();
  
  // Get all unique tags
  const allTags = useMemo(
    () => [...new Set(resources.flatMap(r => r.tags))].sort(),
    [resources]
  );
  
  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      filterAndSortResources();
    }, 300);
    
    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchQuery, selectedTags, sortBy, resources]);

  const filterAndSortResources = () => {
    let filtered = resources.filter(resource => {
      const matchesSearch = searchQuery === '' || 
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.domain.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTags = selectedTags.length === 0 ||
        selectedTags.every(tag => resource.tags.includes(tag));
      
      return matchesSearch && matchesTags;
    });
    
    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'top') {
        if (a.upvotes !== b.upvotes) {
          return b.upvotes - a.upvotes;
        }
        return new Date(b.created_at) - new Date(a.created_at);
      } else {
        return new Date(b.created_at) - new Date(a.created_at);
      }
    });
    
    setFilteredResources(filtered);
  };

  const handleUpvote = (resourceId) => {
    setResources(prev => prev.map(resource => {
      if (resource.id === resourceId) {
        return {
          ...resource,
          upvotes: resource.has_upvoted ? resource.upvotes - 1 : resource.upvotes + 1,
          has_upvoted: !resource.has_upvoted
        };
      }
      return resource;
    }));
  };

  const handleDelete = (resourceId) => {
    setResources(prev => prev.filter(resource => resource.id !== resourceId));
  };

  // Handle edit resource
  const handleEditResource = (resource) => {
    setEditingResource(resource);
    setShowAddModal(true);
  };

  // Handle update resource
  const handleUpdateResource = async (resourceId, updatedData) => {
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        setResources(prev => prev.map(resource => {
          if (resource.id === resourceId) {
            return {
              ...resource,
              ...updatedData,
              updated_at: new Date().toISOString()
            };
          }
          return resource;
        }));
        setLoading(false);
        setEditingResource(null);
        resolve(true);
      }, 1000);
    });
  };

  const handleAddResource = async (newResource) => {
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        const resource = {
          id: Date.now(),
          ...newResource,
          upvotes: 0,
          has_upvoted: false,
          posted_by: currentUser,
          created_at: new Date().toISOString()
        };
        setResources(prev => [resource, ...prev]);
        setLoading(false);
        resolve(true);
      }, 1000);
    });
  };

  // Handle adding resource with auth check
  const handleAddResourceClick = () => {
    if (!currentUser) {
      setShowLoginModal(true);
    } else {
      setEditingResource(null); // Clear any editing state
      setShowAddModal(true);
    }
  };

  // Handle login
  const handleLogin = (user) => {
    setCurrentUser(user);
    setShowLoginModal(false);
    // After login, show add resource modal
    setTimeout(() => {
      setEditingResource(null); // Clear any editing state
      setShowAddModal(true);
    }, 100);
  };

  // Handle logout
  const handleLogout = () => {
    setCurrentUser(null);
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
    setSortBy('top');
  };

  const isEmpty = filteredResources.length === 0;
  const hasFilters = searchQuery || selectedTags.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100 dark:from-purple-900 dark:via-indigo-900 dark:to-blue-900 transition-all duration-500">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 bg-clip-text text-transparent">
                Resource Vault
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg mt-2">
                Discover, share, and upvote the best learning resources together
              </p>
            </div>
            
            {/* User Auth Section */}
            <div className="flex items-center gap-3">
              {currentUser ? (
                <div className="flex items-center gap-3 bg-white/60 dark:bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {currentUser.avatar}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-800 dark:text-white">{currentUser.name}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">{currentUser.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-red-500 transition-colors p-1"
                    title="Logout"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              ):( 
                <button
                  onClick={() => setShowLoginModal(true)}
                  // className="flex items-center gap-2 bg-white/60 dark:bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20 hover:bg-white/80 dark:hover:bg-white/20 transition-all"
                >
                  {/* <LogIn className="w-4 h-4" /> */}
                  {/* <span className="font-medium">Sign In</span> */}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white/60 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search resources, descriptions, or domains..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
            
            {/* Controls */}
            <div className="flex gap-3 items-center">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  selectedTags.length > 0 || showFilters
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
                    : 'bg-white/50 dark:bg-white/10 text-gray-600 dark:text-gray-400'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
                {selectedTags.length > 0 && (
                  <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                    {selectedTags.length}
                  </span>
                )}
              </button>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="py-2 pl-4  pr-8 bg-white/50 dark:bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="top">Top Rated</option>
                <option value="new">Newest</option>
              </select>
              
              <button
                onClick={handleAddResourceClick}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg transition-all hover:scale-105 shadow-lg"
              >
                <Plus className="w-4 h-4" />
                Add Resource
              </button>
            </div>
          </div>

          {/* Filter Tags */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-white/20"
              >
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-2 rounded-full text-sm transition-all ${
                        selectedTags.includes(tag)
                          ? 'bg-purple-500 text-white shadow-md'
                          : 'bg-white/50 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-white/20'
                      }`}
                    >
                      <Tag className="w-3 h-3 inline mr-1" />
                      {tag}
                    </button>
                  ))}
                </div>
                
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-3 text-purple-600 dark:text-purple-400 hover:underline text-sm"
                  >
                    Clear all filters
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results */}
        <div className="space-y-6">
          <AnimatePresence>
            {filteredResources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onUpvote={handleUpvote}
                onDelete={handleDelete}
                onEdit={handleEditResource}
                currentUser={currentUser}
              />
            ))}
          </AnimatePresence>
          
          {/* Empty States */}
          {isEmpty && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="bg-white/60 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg p-8 max-w-md mx-auto">
                {hasFilters ? (
                  <>
                    <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      No matching resources
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Try adjusting your search or filters
                    </p>
                    <button
                      onClick={clearFilters}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Clear filters
                    </button>
                  </>
                ) : (
                  <>
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      No resources yet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Be the first to share a valuable learning resource!
                    </p>
                    <button
                      onClick={handleAddResourceClick}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Add First Resource
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <LoginModal
            isOpen={showLoginModal}
            onClose={() => setShowLoginModal(false)}
            onLogin={handleLogin}
          />
        )}
      </AnimatePresence>

      {/* Add/Edit Resource Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddResourceModal
            isOpen={showAddModal}
            onClose={() => {
              setShowAddModal(false);
              setEditingResource(null);
            }}
            onAdd={handleAddResource}
            onEdit={handleUpdateResource}
            editingResource={editingResource}
            loading={loading}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResourceVault;