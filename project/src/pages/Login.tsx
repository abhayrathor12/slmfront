import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, GraduationCap, Target, Sparkles, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../utils/api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/accounts/login/', {
        username,
        password,
      });

      const { user, access, refresh } = response.data;

      localStorage.setItem('access', access);
      localStorage.setItem('refresh', refresh);
      localStorage.setItem('user', JSON.stringify(user));

      toast.success('Login successful!');

      const role = user.role || user.user_type || 'student';

      if (role === 'admin') {
        navigate('/admin_home');
      } else if (role === 'instructor') {
        navigate('/instructor_home');
      } else {
        navigate('/user_home');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ backgroundColor: '#203f78' }}></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ backgroundColor: '#2c5a9e', animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse" style={{ backgroundColor: '#203f78', animationDelay: '2s' }}></div>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 w-full max-w-6xl relative z-10">
        {/* Left side - Inspirational content */}
        <div className="hidden lg:flex flex-col space-y-8 max-w-lg">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl shadow-lg" style={{ background: 'linear-gradient(to bottom right, #203f78, #2c5a9e)' }}>
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl font-bold text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(to right, #203f78, #2c5a9e)' }}>
                Technoviz Automation
              </h1>
            </div>
            <p className="text-xl text-gray-700 font-medium">
              Your Journey to Self-Mastery Begins Here
            </p>
            <p className="text-gray-600 leading-relaxed">
              Empower yourself with personalized learning experiences, track your progress, and unlock your full potential at your own pace.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="space-y-4">
            <div className="flex items-start gap-4 bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow" style={{ borderWidth: '1px', borderColor: '#203f7833' }}>
              <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: '#203f7820' }}>
                <BookOpen className="w-6 h-6" style={{ color: '#203f78' }} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Learn at Your Pace</h3>
                <p className="text-sm text-gray-600">Access courses anytime, anywhere with our flexible learning modules</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow" style={{ borderWidth: '1px', borderColor: '#2c5a9e33' }}>
              <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: '#2c5a9e20' }}>
                <Target className="w-6 h-6" style={{ color: '#2c5a9e' }} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Track Your Progress</h3>
                <p className="text-sm text-gray-600">Monitor achievements and stay motivated with detailed analytics</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow" style={{ borderWidth: '1px', borderColor: '#203f7833' }}>
              <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: '#203f7820' }}>
                <Sparkles className="w-6 h-6" style={{ color: '#203f78' }} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Personalized Learning</h3>
                <p className="text-sm text-gray-600">AI-powered recommendations tailored to your learning style</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-md p-8 lg:p-10 border border-white/20">
          {/* Mobile header */}
          <div className="lg:hidden flex justify-center mb-6">
            <div className="p-3 rounded-2xl shadow-lg" style={{ background: 'linear-gradient(to bottom right, #203f78, #2c5a9e)' }}>
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome Back!
            </h2>
            <p className="text-gray-600">
              Continue your learning journey
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl outline-none transition-all placeholder:text-gray-400"
                style={{ 
                  transition: 'border-color 0.2s, box-shadow 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#203f78';
                  e.target.style.boxShadow = '0 0 0 3px rgba(32, 63, 120, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="Enter your username"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl outline-none transition-all placeholder:text-gray-400 pr-12"
                  style={{ 
                    transition: 'border-color 0.2s, box-shadow 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#203f78';
                    e.target.style.boxShadow = '0 0 0 3px rgba(32, 63, 120, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Enter your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-3.5 rounded-xl font-semibold transform hover:scale-[1.02] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
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
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <GraduationCap className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              New to Technoviz?{' '}
              <a href="#" className="font-semibold hover:underline transition-colors" style={{ color: '#203f78' }}>
                Create an account
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Mobile feature highlights */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 p-4 z-20">
        <div className="flex justify-around max-w-md mx-auto">
          <div className="text-center">
            <BookOpen className="w-6 h-6 mx-auto mb-1" style={{ color: '#203f78' }} />
            <p className="text-xs text-gray-600">Self-Paced</p>
          </div>
          <div className="text-center">
            <Target className="w-6 h-6 mx-auto mb-1" style={{ color: '#2c5a9e' }} />
            <p className="text-xs text-gray-600">Track Progress</p>
          </div>
          <div className="text-center">
            <Sparkles className="w-6 h-6 mx-auto mb-1" style={{ color: '#203f78' }} />
            <p className="text-xs text-gray-600">Personalized</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;