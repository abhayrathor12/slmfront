import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { UserPlus, Mail, Phone, Calendar, Lock, User, Eye, EyeOff, ChevronDown, Sparkles } from "lucide-react";
import api from "../utils/api";
import smallogo from '../public/logo.png';

interface Topic {
  id: number;
  name: string;
  prize: string; // Updated to include prize from the API
}

const durationOptions = [
  { value: "3_months", label: "3 Months", price: 30 },
  { value: "6_months", label: "6 Months", price: 50 },
  { value: "lifetime", label: "Lifetime", price: 100 },
];

const Registration = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<number[]>([]);
  const [showTopicsDropdown, setShowTopicsDropdown] = useState(false);
  const [duration, setDuration] = useState("");
  const [showDurationDropdown, setShowDurationDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch topics from backend
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await api.get("/public/topics/");
        console.log(response.data);
        setTopics(response.data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load topics");
      }
    };
    fetchTopics();
  }, []);

  const handleTopicSelect = (id: number) => {
    setSelectedTopics((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleDurationSelect = (value: string) => {
    setDuration(value);
    setShowDurationDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password || !duration) {
      toast.error("Please fill all required fields");
      return;
    }
    setLoading(true);
    try {
      const response = await api.post("/accounts/register/", {
        username,
        email,
        password,
        phone,
        dob,
        role: "student",
        topics: selectedTopics,
        duration,
      });
      toast.success("Registration successful!");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const getSelectedTopicsText = () => {
    if (selectedTopics.length === 0) return "Select interests";
    if (selectedTopics.length === 1) return topics.find(t => t.id === selectedTopics[0])?.name || "";
    return `${selectedTopics.length} selected`;
  };

  const getSelectedDurationText = () => {
    const selected = durationOptions.find(opt => opt.value === duration);
    return selected ? selected.label : "Select duration";
  };

  const getPrice = () => {
    const selected = durationOptions.find(opt => opt.value === duration);
    return selected ? `$${selected.price}` : "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100 flex items-center justify-center p-2 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-pulse" style={{ backgroundColor: '#203f78' }}></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-pulse" style={{ backgroundColor: '#2c5a9e', animationDelay: '1s' }}></div>
      </div>
      <div className="w-full max-w-4xl relative z-10">
        <div className="bg-white/90 backdrop-blur-xl rounded-xl shadow-xl overflow-hidden border border-white/30">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left Side - Branding */}
            <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 p-6 flex flex-col justify-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #203f78 0%, #2c5a9e 100%)' }}>
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-5 left-5 w-16 h-16 border-2 border-white rounded-full"></div>
                <div className="absolute bottom-5 right-5 w-12 h-12 border-2 border-white rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-2 border-white rounded-full"></div>
              </div>
              <div className="relative z-10">
                <img
                  src={smallogo}
                  alt="Company Logo"
                  className="w-40 h-40 object-contain"
                />
                <h1 className="text-2xl font-bold text-white mb-2">
                  Start Your Learning Journey
                </h1>
                <p className="text-blue-100 text-sm mb-4">
                  Join thousands of students already learning with us.
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">Personalized Learning</p>
                      <p className="text-blue-200 text-xs">Tailored content based on your interests</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">Expert Instructors</p>
                      <p className="text-blue-200 text-xs">Learn from industry professionals</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">Track Progress</p>
                      <p className="text-blue-200 text-xs">Monitor your growth every step</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Right Side - Form */}
            <div className="p-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-800 mb-1">Create Account</h2>
                <p className="text-gray-600 text-xs">Fill in your details to get started</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Compact Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Username */}
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Username *</label>
                    <div className="relative">
                      <User className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-8 pr-2 py-2 text-sm bg-white border border-gray-300 rounded-md outline-none transition-all placeholder:text-gray-400"
                        style={{ transition: 'border-color 0.2s, box-shadow 0.2s' }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#203f78';
                          e.target.style.boxShadow = '0 0 0 2px rgba(32, 63, 120, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.boxShadow = 'none';
                        }}
                        placeholder="Choose username"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  {/* Email */}
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Email *</label>
                    <div className="relative">
                      <Mail className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-8 pr-2 py-2 text-sm bg-white border border-gray-300 rounded-md outline-none transition-all placeholder:text-gray-400"
                        style={{ transition: 'border-color 0.2s, box-shadow 0.2s' }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#203f78';
                          e.target.style.boxShadow = '0 0 0 2px rgba(32, 63, 120, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.boxShadow = 'none';
                        }}
                        placeholder="your@email.com"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  {/* Phone & DOB */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-8 pr-2 py-2 text-sm bg-white border border-gray-300 rounded-md outline-none transition-all placeholder:text-gray-400"
                        style={{ transition: 'border-color 0.2s, box-shadow 0.2s' }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#203f78';
                          e.target.style.boxShadow = '0 0 0 2px rgba(32, 63, 120, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.boxShadow = 'none';
                        }}
                        placeholder="Phone"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Birth Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full pl-8 pr-2 py-2 text-sm bg-white border border-gray-300 rounded-md outline-none transition-all"
                        style={{ transition: 'border-color 0.2s, box-shadow 0.2s' }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#203f78';
                          e.target.style.boxShadow = '0 0 0 2px rgba(32, 63, 120, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.boxShadow = 'none';
                        }}
                        disabled={loading}
                      />
                    </div>
                  </div>
                  {/* Password */}
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-8 pr-8 py-2 text-sm bg-white border border-gray-300 rounded-md outline-none transition-all placeholder:text-gray-400"
                        style={{ transition: 'border-color 0.2s, box-shadow 0.2s' }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#203f78';
                          e.target.style.boxShadow = '0 0 0 2px rgba(32, 63, 120, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.boxShadow = 'none';
                        }}
                        placeholder="Create password"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                        disabled={loading}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  {/* Topics */}
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Interests</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowTopicsDropdown(!showTopicsDropdown)}
                        className="w-full px-2 py-2 text-sm bg-white border border-gray-300 rounded-md outline-none transition-all text-left flex items-center justify-between"
                        style={{
                          borderColor: showTopicsDropdown ? '#203f78' : '#d1d5db',
                          boxShadow: showTopicsDropdown ? '0 0 0 2px rgba(32, 63, 120, 0.1)' : 'none'
                        }}
                        disabled={loading}
                      >
                        <span className={selectedTopics.length === 0 ? 'text-gray-400' : 'text-gray-700'}>
                          {getSelectedTopicsText()}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showTopicsDropdown ? 'rotate-180' : ''}`} />
                      </button>
                      {showTopicsDropdown && (
                        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-32 overflow-y-auto" style={{ borderColor: '#d1d5db' }}>
                          {topics.map((topic) => (
                            <label
                              key={topic.id}
                              className="flex items-center px-2 py-1.5 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                            >
                              <input
                                type="checkbox"
                                checked={selectedTopics.includes(topic.id)}
                                onChange={() => handleTopicSelect(topic.id)}
                                className="w-3 h-3 rounded border-gray-300 mr-2"
                                style={{ accentColor: '#203f78' }}
                              />
                              <span className="text-xs text-gray-700">
                                {topic.name} (${Number(topic.prize).toFixed(2)})
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Duration */}
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Subscription Duration *</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowDurationDropdown(!showDurationDropdown)}
                        className="w-full px-2 py-2 text-sm bg-white border border-gray-300 rounded-md outline-none transition-all text-left flex items-center justify-between"
                        style={{
                          borderColor: showDurationDropdown ? '#203f78' : '#d1d5db',
                          boxShadow: showDurationDropdown ? '0 0 0 2px rgba(32, 63, 120, 0.1)' : 'none'
                        }}
                        disabled={loading}
                      >
                        <span className={duration ? 'text-gray-700' : 'text-gray-400'}>
                          {getSelectedDurationText()}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDurationDropdown ? 'rotate-180' : ''}`} />
                      </button>
                      {showDurationDropdown && (
                        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-32 overflow-y-auto" style={{ borderColor: '#d1d5db' }}>
                          {durationOptions.map((option) => (
                            <div
                              key={option.value}
                              onClick={() => handleDurationSelect(option.value)}
                              className="px-2 py-1.5 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                            >
                              <span className="text-xs text-gray-700">{option.label} (${option.price})</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* Selected Topics */}
                {selectedTopics.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedTopics.map((topicId) => {
                      const topic = topics.find(t => t.id === topicId);
                      return topic ? (
                        <span
                          key={topicId}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ backgroundColor: '#203f7815', color: '#203f78' }}
                        >
                          {topic.name} (${Number(topic.prize).toFixed(2)})
                          <button
                            type="button"
                            onClick={() => handleTopicSelect(topicId)}
                            className="ml-1 hover:text-red-600 font-bold"
                          >
                            ×
                          </button>
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full text-white py-2 rounded-md font-semibold transform hover:scale-[1.01] transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-1.5 text-sm"
                  style={{
                    background: loading ? '#6b7280' : 'linear-gradient(to right, #203f78, #2c5a9e)',
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.background = 'linear-gradient(to right, #1a3461, #234d85)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.currentTarget.style.background = 'linear-gradient(to right, #203f78, #2c5a9e)';
                    }
                  }}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Make Payment {getPrice()}</span>
                      <UserPlus className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
              {/* Footer */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-center text-xs text-gray-600">
                  Already have an account?{' '}
                  <a
                    href="/login"
                    className="font-semibold hover:underline transition-colors"
                    style={{ color: '#203f78' }}
                  >
                    Sign in
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registration;