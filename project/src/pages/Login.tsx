import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff, Mail, Globe, CheckCircle2, Users, Building2, TrendingUp } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import kapil from '../public/k3-removebg-preview.png'
import smallogo from '../public/logo-.png';
import biglogo from '../public/logo1.png';
import loginVideo from '../public/SLM Roadmap Presentation (1).mp4';
import programmeData from '../data/programmeData.json';

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
      // Optional: clear old tokens just to be safe (like in old code)
      localStorage.clear();
  
      const res = await api.post('/accounts/login/', { username, password });
      const { user, access, refresh } = res.data;
  
      localStorage.setItem('access', access);
      localStorage.setItem('refresh', refresh);
      localStorage.setItem('user', JSON.stringify(user));
  
      toast.success('Login successful!');
  
      // ← This is the critical part you were missing
      const role = user.role || user.user_type || 'student'; // fallback to student
  
      // Small delay is optional — helps toast be visible
      setTimeout(() => {
        if (role === 'admin') {
          navigate('/admin_home');
        } else if (role === 'instructor') {
          navigate('/instructor_home');
        } else {
          navigate('/user_home');
        }
      }, 400);
  
    } catch (err: any) {
      // Better error message like in old code
      const message = err.response?.data?.message || err.message || 'Invalid credentials';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 min-h-screen">

      {/* ================= LOGO BAR (ALWAYS STICKY) ================= */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto h-16 px-6 flex items-center gap-3">
          <img src={smallogo} className="w-10 h-10 object-contain" alt="logo" />
          <span className="font-bold text-lg text-[#203f78]">
            {programmeData.organization.name}
          </span>
        </div>
      </div>

      {/* ================= PAGE CONTENT ================= */}
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-12">

        {/* ================= LEFT CONTENT ================= */}
        <div className="lg:col-span-2 space-y-12 text-gray-700">

          {/* VIDEO */}
          <div className="h-[70vh] min-h-[500px] flex items-center justify-center bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
            <video
              src={loginVideo}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-contain"
            />
          </div>

          {/* NAVBAR – BELOW VIDEO, STICKS LATER */}
          <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 rounded-xl shadow-sm">
            <div className="flex flex-wrap gap-6 px-6 py-4 text-sm font-medium text-gray-600">
              <a href="#about" className="hover:text-[#203f78] transition-colors">About</a>
              <a href="#coe" className="hover:text-[#203f78] transition-colors">CoE</a>
              <a href="#model" className="hover:text-[#203f78] transition-colors">Model</a>
              <a href="#process" className="hover:text-[#203f78] transition-colors">Process</a>
              <a href="#curriculum" className="hover:text-[#203f78] transition-colors">Curriculum</a>
              <a href="#infrastructure" className="hover:text-[#203f78] transition-colors">Infrastructure</a>
              <a href="#benefits" className="hover:text-[#203f78] transition-colors">Benefits</a>
              <a href="#designer" className="hover:text-[#203f78] transition-colors">Designer</a>
              <a href="#contact" className="hover:text-[#203f78] transition-colors">Contact</a>
            </div>
          </div>

          {/* SECTIONS */}
          <section id="about" className="bg-white rounded-2xl p-8 shadow-md border border-gray-200 scroll-mt-32">
            <h2 className="text-xl font-bold mb-4 text-[#203f78] flex items-center gap-2">
              <Building2 size={24} />
              About
            </h2>
            <p className="text-gray-700 leading-relaxed">{programmeData.about.overview}</p>
          </section>

          <section id="coe" className="bg-white rounded-2xl p-8 shadow-md border border-gray-200 scroll-mt-32">
            <h2 className="text-xl font-bold mb-4 text-[#203f78]">
              {programmeData.coe.title}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">{programmeData.coe.description}</p>
            <div className="bg-blue-50 border-l-4 border-[#203f78] p-4 rounded">
              <p className="font-semibold text-[#203f78]">
                {programmeData.coe.model}
              </p>
            </div>
          </section>

          <section id="model" className="bg-white rounded-2xl p-8 shadow-md border border-gray-200 scroll-mt-32">
            <h2 className="text-xl font-bold mb-4 text-[#203f78]">Zero Investment Model</h2>
            <div className="space-y-2">
              {programmeData.zeroInvestmentModel.collegeResponsibilities.map(
                (item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-[#203f78] mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700">{item}</p>
                  </div>
                )
              )}
            </div>
          </section>

          <section id="process" className="bg-white rounded-2xl p-8 shadow-md border border-gray-200 scroll-mt-32">
            <h2 className="text-xl font-bold mb-6 text-[#203f78]">Implementation Process</h2>
            <div className="space-y-6">
              {programmeData.implementationProcess.map((step) => (
                <div key={step.step} className="border-l-4 border-[#203f78] pl-6 py-2">
                  <h4 className="font-semibold text-[#203f78] mb-2">
                    Step {step.step}: {step.title}
                  </h4>
                  <div className="space-y-2">
                    {step.details.map((d, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-[#203f78] mt-1">•</span>
                        <p className="text-gray-700 text-sm">{d}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="curriculum" className="bg-white rounded-2xl p-8 shadow-md border border-gray-200 scroll-mt-32">
            <h2 className="text-xl font-bold mb-4 text-[#203f78]">
              {programmeData.curriculum.title}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {programmeData.curriculum.modules.map((m, i) => (
                <div key={i} className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg">
                  <CheckCircle2 size={16} className="text-[#203f78] mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">{m}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="infrastructure" className="bg-white rounded-2xl p-8 shadow-md border border-gray-200 scroll-mt-32">
            <h2 className="text-xl font-bold mb-4 text-[#203f78]">
              Infrastructure Checklist
            </h2>
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="text-gray-700">
                <span className="font-semibold text-[#203f78]">Lab Space:</span>{' '}
                {programmeData.infrastructureChecklist.labSpace}
              </p>
            </div>
            <div className="space-y-2">
              {programmeData.infrastructureChecklist.requirements.map(
                (req, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-[#203f78] mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700">{req}</p>
                  </div>
                )
              )}
            </div>
          </section>

          <section id="benefits" className="bg-white rounded-2xl p-8 shadow-md border border-gray-200 scroll-mt-32">
            <h2 className="text-xl font-bold mb-6 text-[#203f78]">Benefits</h2>

            <div className="space-y-6">
              {/* Colleges */}
              <div className="bg-blue-50 rounded-xl p-6">
                <h4 className="font-semibold text-[#203f78] mb-3 flex items-center gap-2">
                  <Building2 size={20} />
                  For Colleges
                </h4>
                <div className="space-y-2">
                  {programmeData.benefits.colleges.map((b, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-[#203f78] mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">{b}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Students */}
              <div className="bg-green-50 rounded-xl p-6">
                <h4 className="font-semibold text-[#203f78] mb-3 flex items-center gap-2">
                  <Users size={20} />
                  For Students
                </h4>
                <div className="space-y-2">
                  {programmeData.benefits.students.map((b, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-[#203f78] mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">{b}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Industry */}
              <div className="bg-purple-50 rounded-xl p-6">
                <h4 className="font-semibold text-[#203f78] mb-3 flex items-center gap-2">
                  <TrendingUp size={20} />
                  For Industry
                </h4>
                <div className="space-y-2">
                  {programmeData.benefits.industry.map((b, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-[#203f78] mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">{b}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section id="designer" className="bg-white rounded-2xl p-8 shadow-md border border-gray-200 scroll-mt-32">
            <h2 className="text-xl font-bold mb-6 text-[#203f78]">
              Programme Designer
            </h2>
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32  flex items-center justify-center ">
                <img
                  src={kapil}
                  className="w-28 h-28 object-contain"
                  alt="logo"
                />
                </div>
              </div>
              {/* Details */}
              <div className="flex-1">
                <p className="font-bold text-lg text-[#203f78] mb-1">
                  {programmeData.programmeDesigner.name}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  {programmeData.programmeDesigner.designation}
                </p>
                <p className="text-gray-700 leading-relaxed">
                  {programmeData.programmeDesigner.experience}
                </p>
              </div>
            </div>
          </section>

          <section id="contact" className="bg-gradient-to-br from-[#203f78] to-[#2c5a9e] rounded-2xl p-8 shadow-md text-white scroll-mt-32">
            <h2 className="text-xl font-bold mb-4">Get In Touch</h2>
            <div className="space-y-3">
              <p className="flex items-center gap-3">
                <Globe size={20} className="flex-shrink-0" />
                <a
                  href={programmeData.contact.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-200 transition-colors"
                >
                  {programmeData.contact.website}
                </a>
              </p>
              <p className="flex items-center gap-3">
                <Mail size={20} className="flex-shrink-0" />
                <span>{programmeData.contact.email}</span>
              </p>
            </div>
          </section>

        </div>

        {/* ================= RIGHT LOGIN (STICKY, NO SCROLL) ================= */}
        <div className="lg:sticky lg:top-24 self-start">
          <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-xl p-8 border border-gray-200">

            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 flex items-center justify-center ">
                <img
                  src={biglogo}
                  className="w-20 h-20 object-contain"
                  alt="logo"
                />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-center mb-2 text-[#203f78]">
              Welcome Back!
            </h2>
            <p className="text-center text-sm text-gray-500 mb-6">
              Sign in to access your dashboard
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Username */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Username
                </label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#203f78] focus:border-transparent transition-all"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  placeholder="Enter your username"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#203f78] focus:border-transparent transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-[42px] text-gray-500 hover:text-[#203f78] transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-[#203f78] to-[#2c5a9e] text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <>
                    Sign In
                    <GraduationCap size={20} />
                  </>
                )}
              </button>

            </form>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;