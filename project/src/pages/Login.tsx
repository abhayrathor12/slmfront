import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../utils/api';

import smallogo from '../public/logo-.png';
import biglogo from '../public/logo1.png';
import loginImage from '../public/roadmap_no_white_bg_v2.png';
import loginVideo from '../public/SLM Roadmap Presentation (1).mp4';
const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      localStorage.clear();

      const response = await api.post('/accounts/login/', {
        username,
        password,
      });

      const { user, access, refresh } = response.data;

      localStorage.setItem('access', access);
      localStorage.setItem('refresh', refresh);
      localStorage.setItem('user', JSON.stringify(user));

      toast.success('Login successful!');

      setTimeout(() => {
        const role = user.role || user.user_type || 'student';
        if (role === 'admin') navigate('/admin_home');
        else if (role === 'instructor') navigate('/instructor_home');
        else navigate('/user_home');
      }, 300);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      
      {/* Background blobs */}
      {/* <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -top-32 -right-32 w-64 h-64 rounded-full blur-xl opacity-20 animate-pulse"
          style={{ backgroundColor: '#203f78' }}
        />
        <div
          className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full blur-xl opacity-20 animate-pulse"
          style={{ backgroundColor: '#2c5a9e', animationDelay: '1s' }}
        />
      </div> */}

      {/* Top Left Logo */}
      <div className="absolute top-4 left-6 z-30 flex items-center gap-2">
        <img src={smallogo} alt="Technoviz Logo" className="w-10 h-10 object-contain" />
        <h1
          className="text-xl font-bold text-transparent bg-clip-text"
          style={{ backgroundImage: 'linear-gradient(to right, #203f78, #2c5a9e)' }}
        >
          Technoviz Automation
        </h1>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex h-screen">
        
        {/* LEFT SIDE IMAGE */}
        <div className="hidden lg:flex lg:w-3/5 xl:w-2/3 items-center justify-center pl-4 xl:pl-2">
  <video
    src={loginVideo}
    autoPlay
    loop
    muted
    playsInline
    className="w-full max-w-[1000px] xl:max-w-[900px] object-contain rounded-xl"
  />
</div>


        {/* RIGHT SIDE FORM */}
        <div className="w-full lg:w-1/2 flex items-center justify-end px-4 lg:px-16">
          <div className="w-full max-w-[420px] bg-white/85 backdrop-blur-md rounded-2xl shadow-xl drop-shadow-2xl p-8 border border-white/30">
            
            {/* Mobile Logo */}
            <div className="lg:hidden flex justify-center mb-4">
              <img src={biglogo} alt="Logo" className="w-20 h-20 object-contain" />
            </div>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-1">
                Welcome Back!
              </h2>
              <p className="text-sm text-gray-600">
                Continue your learning journey
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Username */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  placeholder="Enter your username"
                  className="w-full px-5 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-[#203f78] focus:ring-2 focus:ring-[#203f78]/10 outline-none"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    placeholder="Enter your password"
                    className="w-full px-5 py-2.5 pr-12 border border-gray-200 rounded-lg text-sm focus:border-[#203f78] focus:ring-2 focus:ring-[#203f78]/10 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#203f78]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-[#203f78] to-[#2c5a9e] text-white rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In <GraduationCap className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Register */}
            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-600">
                New to Technoviz?{' '}
                <a href="/register" className="font-semibold text-[#203f78] hover:underline">
                  Create account
                </a>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
