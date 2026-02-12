import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff, Mail, Globe, CheckCircle2, Users, TrendingUp, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import kapil from '../public/k3-removebg-preview.png';
import smallogo from '../public/logo-.png';
import biglogo from '../public/logo1.png';
import heroimage from '../public/heroimage.webp';
import programmeData from '../data/programmeData.json';
import certimg from '../public/certi.png';
import coe1 from '../public/DSC03518.jpg';
import coe2 from '../public/DSC03520.jpg';
import coe3 from '../public/coe3.png';
import coe4 from '../public/coe4.jpg';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showFullBio, setShowFullBio] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showAllModules, setShowAllModules] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      localStorage.clear();

      const res = await api.post('/accounts/login/', { username, password });
      const { user, access, refresh } = res.data;

      localStorage.setItem('access', access);
      localStorage.setItem('refresh', refresh);
      localStorage.setItem('user', JSON.stringify(user));

      toast.success('Login successful!');

      const role = user.role || user.user_type || 'student';

      setTimeout(() => {
        if (role === 'admin') {
          navigate('/admin_home');
        } else if (role === 'instructor') {
          navigate('/instructor_home');
        } else {
          navigate('/user_home');
        }
      }, 400);
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Invalid credentials';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['overview', 'coe', 'highlights', 'content', 'why-this-works', 'coordinator', 'certificate', 'contact'];

      // Check if we're at the top (hero section)
      if (window.scrollY < 100) {
        setActiveSection('');
        return;
      }

      // Check if we're at the bottom of the page (contact section)
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const clientHeight = window.innerHeight;

      if (scrollHeight - scrollTop - clientHeight < 50) {
        setActiveSection('contact');
        return;
      }

      // Check sections from bottom to top for better accuracy
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Check if section is in viewport (with offset for sticky nav)
          if (rect.top <= 200) {
            setActiveSection(section);
            return;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Call once on mount

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 min-h-screen">
      {/* Custom CSS for animations */}
      <style jsx>{`
        /* Icon Rotation Animations */
        @keyframes iconRotate1 {
          0%, 25% { opacity: 1; transform: scale(1); }
          30%, 100% { opacity: 0; transform: scale(0.8); }
        }
        
        @keyframes iconRotate2 {
          0%, 25% { opacity: 0; transform: scale(0.8); }
          30%, 50% { opacity: 1; transform: scale(1); }
          55%, 100% { opacity: 0; transform: scale(0.8); }
        }
        
        @keyframes iconRotate3 {
          0%, 50% { opacity: 0; transform: scale(0.8); }
          55%, 75% { opacity: 1; transform: scale(1); }
          80%, 100% { opacity: 0; transform: scale(0.8); }
        }
        
        @keyframes iconRotate4 {
          0%, 75% { opacity: 0; transform: scale(0.8); }
          80%, 100% { opacity: 1; transform: scale(1); }
        }
        
        .animate-icon-rotate-1 {
          animation: iconRotate1 8s ease-in-out infinite;
        }
        
        .animate-icon-rotate-2 {
          animation: iconRotate2 8s ease-in-out infinite;
        }
        
        .animate-icon-rotate-3 {
          animation: iconRotate3 8s ease-in-out infinite;
        }
        
        .animate-icon-rotate-4 {
          animation: iconRotate4 8s ease-in-out infinite;
        }

        /* Typewriter Text Animation */
        .typewriter-text {
          overflow: hidden;
          white-space: nowrap;
          display: inline-block;
        }

        /* Phrase visibility animations - 12s total cycle (3s type + 2s hold = 5s per phrase, but overlap) */
        @keyframes phrase1 {
          0% { opacity: 1; }
          25% { opacity: 1; }
          33.33% { opacity: 0; }
          100% { opacity: 0; }
        }

        @keyframes phrase2 {
          0% { opacity: 0; }
          33.33% { opacity: 0; }
          33.34% { opacity: 1; }
          58.33% { opacity: 1; }
          66.66% { opacity: 0; }
          100% { opacity: 0; }
        }

        @keyframes phrase3 {
          0% { opacity: 0; }
          66.66% { opacity: 0; }
          66.67% { opacity: 1; }
          91.66% { opacity: 1; }
          100% { opacity: 0; }
        }

        /* Typing effect with 2s hold - 4s total (2s type + 2s hold) */
        @keyframes typing1 {
          0% { width: 0; }
          50% { width: 100%; }
          100% { width: 100%; }
        }

        @keyframes typing2 {
          0% { width: 0; }
          50% { width: 100%; }
          100% { width: 100%; }
        }

        @keyframes typing3 {
          0% { width: 0; }
          50% { width: 100%; }
          100% { width: 100%; }
        }

        .animate-typewriter-1 {
          animation: phrase1 12s ease-in-out infinite;
        }

        .animate-typewriter-1 .typewriter-text {
          animation: typing1 4s steps(30) infinite normal both;
        }

        .animate-typewriter-2 {
          animation: phrase2 12s ease-in-out infinite;
        }

        .animate-typewriter-2 .typewriter-text {
          animation: typing2 4s steps(30) infinite normal both;
        }

        .animate-typewriter-3 {
          animation: phrase3 12s ease-in-out infinite;
        }

        .animate-typewriter-3 .typewriter-text {
          animation: typing3 4s steps(30) infinite normal both;
        }

        /* Fade in animation for bio expansion */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>

      {/* STICKY NAVBAR */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={smallogo} className="w-10 h-10 object-contain" alt="logo" />
            <span className="font-bold text-lg text-[#203f78]">Technoviz Automation</span>
          </div>

          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-600">
            <a
              href="#overview"
              className={`hover:text-[#203f78] transition-colors pb-1 ${activeSection === 'overview' ? 'text-[#203f78] border-b-2 border-[#203f78]' : ''
                }`}
            >
              Overview
            </a>

            <a
              href="#coe"
              className={`hover:text-[#203f78] transition-colors pb-1 ${activeSection === 'coe' ? 'text-[#203f78] border-b-2 border-[#203f78]' : ''
                }`}
            >
              CoE
            </a>

            <a
              href="#highlights"
              className={`hover:text-[#203f78] transition-colors pb-1 ${activeSection === 'highlights' ? 'text-[#203f78] border-b-2 border-[#203f78]' : ''
                }`}
            >
              Highlights
            </a>

            <a
              href="#content"
              className={`hover:text-[#203f78] transition-colors pb-1 ${activeSection === 'content' ? 'text-[#203f78] border-b-2 border-[#203f78]' : ''
                }`}
            >
              Content
            </a>

            <a
              href="#why-this-works"
              className={`hover:text-[#203f78] transition-colors pb-1 ${activeSection === 'why-this-works' ? 'text-[#203f78] border-b-2 border-[#203f78]' : ''
                }`}
            >
              Why It Works
            </a>

            <a
              href="#coordinator"
              className={`hover:text-[#203f78] transition-colors pb-1 ${activeSection === 'coordinator' ? 'text-[#203f78] border-b-2 border-[#203f78]' : ''
                }`}
            >
              Programme Coordinator
            </a>

            <a
              href="#certificate"
              className={`hover:text-[#203f78] transition-colors pb-1 ${activeSection === 'certificate' ? 'text-[#203f78] border-b-2 border-[#203f78]' : ''
                }`}
            >
              Certificate
            </a>

            <a
              href="#contact"
              className={`hover:text-[#203f78] transition-colors pb-1 ${activeSection === 'contact' ? 'text-[#203f78] border-b-2 border-[#203f78]' : ''
                }`}
            >
              Contact
            </a>
          </nav>
        </div >
      </div >

      {/* HERO SECTION with animated IIoT icon */}
      <div className="relative lg:min-h-[500px] xl:min-h-[540px] lg:h-[calc(100vh-64px)] overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="absolute inset-0 flex flex-col lg:flex-row">
          <div className="w-full lg:w-3/5 xl:w-7/12 relative z-10 flex items-center">
            <div className="max-w-4xl mx-auto px-6 lg:px-10 xl:px-16 py-12 lg:py-14 space-y-5">

              {/* Headline with animated IIoT icon */}
              <div className="flex items-start gap-4">
                {/* Animated IIoT Icon - Rotating between 4 icons */}
                <div className="flex-shrink-0 relative w-16 h-16 lg:w-20 lg:h-20 mt-1">
                  {/* Central Server/Cloud - Icon 1 */}
                  <div className="absolute inset-0 flex items-center justify-center animate-icon-rotate-1">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-[#203f78] to-[#2c5a9e] rounded-lg shadow-lg flex items-center justify-center">
                      <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                      </svg>
                    </div>
                  </div>

                  {/* PLC/Controller - Icon 2 */}
                  <div className="absolute inset-0 flex items-center justify-center animate-icon-rotate-2">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-[#203f78] to-[#2c5a9e] rounded-lg shadow-lg flex items-center justify-center">
                      <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                      </svg>
                    </div>
                  </div>

                  {/* Network/IoT - Icon 3 */}
                  <div className="absolute inset-0 flex items-center justify-center animate-icon-rotate-3">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-[#203f78] to-[#2c5a9e] rounded-lg shadow-lg flex items-center justify-center">
                      <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    </div>
                  </div>

                  {/* Factory/Manufacturing - Icon 4 */}
                  <div className="absolute inset-0 flex items-center justify-center animate-icon-rotate-4">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-[#203f78] to-[#2c5a9e] rounded-lg shadow-lg flex items-center justify-center">
                      <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Headline */}
                <h1 className="flex-1 text-3xl lg:text-4xl xl:text-4xl font-bold text-[#203f78] leading-tight">
                  Centre of Excellence in Smart Manufacturing & Industry 4.0
                </h1>
              </div>

              <h2 className="text-lg lg:text-xl xl:text-2xl text-gray-700 font-semibold">
                Industry-ready training in PLC, IIoT, AI-Driven Manufacturing & Digital Transformation
              </h2>
              <p className="text-gray-600 leading-relaxed text-base hidden lg:block">
                Prepare yourself for real industrial environments through a hands-on Centre of Excellence (CoE) designed by industry experts.
                Learn by doing with real industrial tools, practical use cases, and structured learning that builds job-ready skills.
              </p>
              <div className="flex flex-wrap gap-3 pt-3">
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-[#203f78]/20 text-sm">
                  <CheckCircle2 size={16} className="text-[#203f78]" />
                  <span className="font-medium text-gray-700">Industry 4.0 & Smart Manufacturing</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-[#203f78]/20 text-sm">
                  <CheckCircle2 size={16} className="text-[#203f78]" />
                  <span className="font-medium text-gray-700">PLC to Cloud | IIoT | Automation</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-[#203f78]/20 text-sm">
                  <CheckCircle2 size={16} className="text-[#203f78]" />
                  <span className="font-medium text-gray-700">Lifetime Learning & Career Support</span>
                </div>
              </div>

              {/* CTA Button with Typewriter Animation */}
              <div className="pt-5 flex flex-col lg:flex-row items-start lg:items-center gap-6">
                <a
                  href="#overview"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#203f78] to-[#2c5a9e] text-white px-7 py-3 rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-[1.02] text-sm lg:text-base"
                >
                  Explore the CoE Program
                  <ArrowRight size={18} />
                </a>

                {/* Typewriter Animation Section */}
                <div className="flex flex-col gap-2">
                  {/* Typewriter Keywords */}
                  <div className="relative h-8 overflow-hidden">
                    <div className="absolute inset-0">
                      {/* Phrase 1 */}
                      <div className="h-8 flex items-center gap-2 animate-typewriter-1">
                        <div className="w-2 h-2 rounded-full bg-[#203f78]"></div>
                        <span className="text-[#203f78] font-bold text-base lg:text-lg typewriter-text">
                          Do It Yourself
                        </span>
                      </div>

                      {/* Phrase 2 */}
                      <div className="h-8 flex items-center gap-2 absolute top-0 left-0 animate-typewriter-2">
                        <div className="w-2 h-2 rounded-full bg-[#203f78]"></div>
                        <span className="text-[#203f78] font-bold text-base lg:text-lg typewriter-text">
                          Zero Faculty Dependency
                        </span>
                      </div>

                      {/* Phrase 3 */}
                      <div className="h-8 flex items-center gap-2 absolute top-0 left-0 animate-typewriter-3">
                        <div className="w-2 h-2 rounded-full bg-[#203f78]"></div>
                        <span className="text-[#203f78] font-bold text-base lg:text-lg typewriter-text">
                          Flexible Learning Framework
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tagline */}
                  <p className="text-xs lg:text-sm text-gray-600 italic flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-[#203f78]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    100% self-driven, instructor-independent learning
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="hidden lg:block lg:w-2/5 xl:w-5/12 relative">
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-gray-50 via-gray-50/70 to-transparent z-10 pointer-events-none" />
            <div className="absolute bottom-8 -left-20 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 max-w-sm xl:max-w-md z-20 border border-gray-200">
              <div className="space-y-4">
                <h3 className="text-base font-bold text-[#203f78]">Industry 4.0 Career Accelerator</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-[#203f78] mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">Self-paced DIY learning with guided assessments</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-[#203f78] mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">Real industrial problem statements & projects</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-[#203f78] mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">Continuous learning, certification & career guidance</p>
                  </div>
                </div>
              </div>
            </div>
            <img src={heroimage} alt="Smart Manufacturing Lab" className="w-full h-full object-cover" />
          </div>
        </div >
      </div >

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* LEFT COLUMN - SECTIONS */}
        <div className="hidden lg:block lg:col-span-2 space-y-12 text-gray-700">

          {/* OVERVIEW */}
          <section id="overview" className="rounded-2xl p-8 scroll-mt-32">
            <h2 className="text-3xl font-bold mb-4 text-[#203f78] flex items-center gap-2">
              Overview
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Technoviz Automation presents a Centre of Excellence (CoE) on Smart Manufacturing designed to prepare students for real industrial environments. This initiative focuses on Industry 4.0, IIoT, Smart Automation, AI-driven manufacturing, and digital transformation.
            </p>
            <p className="text-gray-700 leading-relaxed mt-3">
              The CoE is built on a subscription-based model, ensuring no upfront payment or investment from the college or university. The entire setup, execution, training delivery, and long-term support are handled by Technoviz Automation, allowing institutions to offer high-value industrial exposure without operational or financial burden.
            </p>
          </section>

          {/* CoE */}
          <section id="coe" className="rounded-2xl p-8 scroll-mt-32">
            <h2 className="text-3xl font-bold mb-2 text-[#203f78]">
              {programmeData?.coe?.title || 'Centre of Excellence on Smart Manufacturing'}
            </h2>

            {/* Description */}
            <p className="text-gray-700 leading-relaxed mb-8 text-base">
              {programmeData?.coe?.description || 'Industry-aligned training program designed to build job-ready skills in PLC, IIoT, Smart Automation, and Industry 4.0 through hands-on learning and real industrial use cases.'}
            </p>

            {/* Gallery Section */}
            <div className="border-t border-gray-200 pt-8 mb-8">
              <h3 className="text-xl font-bold text-[#203f78] mb-6">Centre of Excellence Gallery</h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Gallery Image 1 */}
                <div className="relative group overflow-hidden rounded-lg border-2 border-gray-200 hover:border-[#203f78] transition-all cursor-pointer">
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    <img
                      onClick={() => setSelectedImage(coe1)}
                      src={coe1}
                      alt="CoE Lab Setup"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                </div>

                {/* Gallery Image 2 */}
                <div className="relative group overflow-hidden rounded-lg border-2 border-gray-200 hover:border-[#203f78] transition-all cursor-pointer">
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    <img
                      onClick={() => setSelectedImage(coe2)}
                      src={coe2}
                      alt="PLC Training"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                </div>

                {/* Gallery Image 3 */}
                <div className="relative group overflow-hidden rounded-lg border-2 border-gray-200 hover:border-[#203f78] transition-all cursor-pointer">
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    <img
                      onClick={() => setSelectedImage(coe3)}
                      src={coe3}
                      alt="IIoT Dashboard"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                </div>

                {/* Gallery Image 4 */}
                <div className="relative group overflow-hidden rounded-lg border-2 border-gray-200 hover:border-[#203f78] transition-all cursor-pointer">
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    <img
                      onClick={() => setSelectedImage(coe4)}
                      src={coe4}
                      alt="Student Training"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-500 text-center mt-4 italic">
                Real CoE lab setups showing PLC, IIoT devices, and smart manufacturing equipment
              </p>
            </div>

            {/* Video Slider Section */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-xl font-bold text-[#203f78] mb-6">Training & Lab Videos</h3>

              <div className="relative">
                {/* Video Container */}
                <div className="overflow-hidden rounded-lg">
                  <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentVideoIndex * 100}%)` }}
                  >
                    {/* Video 1 */}
                    <div className="min-w-full px-2">
                      <div className="relative rounded-lg overflow-hidden bg-black aspect-video max-w-xl mx-auto">
                        <iframe
                          className="w-full h-full"
                          src="https://www.youtube.com/embed/XUH_k3acpgA"
                          title="YouTube video player"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                      <p className="text-sm text-gray-600 text-center mt-2">PLC Programming Session</p>
                    </div>

                    {/* Video 2 */}
                    <div className="min-w-full px-2">
                      <div className="relative rounded-lg overflow-hidden bg-black aspect-video max-w-xl mx-auto">
                        <iframe
                          className="w-full h-full"
                          src="https://www.youtube.com/embed/SwbUTWDpaNU"
                          title="YouTube video player"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                      <p className="text-sm text-gray-600 text-center mt-2">IIoT Lab Setup Demo</p>
                    </div>

                    {/* Video 3 */}
                    <div className="min-w-full px-2">
                      <div className="relative rounded-lg overflow-hidden bg-black aspect-video max-w-xl mx-auto">
                        <iframe
                          className="w-full h-full"
                          src="https://www.youtube.com/embed/8eJrlo8FWag"
                          title="YouTube video player"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                      <p className="text-sm text-gray-600 text-center mt-2">Smart Manufacturing Dashboard</p>
                    </div>


                  </div>
                </div>

                {/* Previous Button */}
                <button
                  onClick={() => setCurrentVideoIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentVideoIndex === 0}
                  className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center ${currentVideoIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#203f78] hover:text-white'
                    } transition-all`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Next Button */}
                <button
                  onClick={() => setCurrentVideoIndex(prev => Math.min(3, prev + 1))}
                  disabled={currentVideoIndex === 3}
                  className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center ${currentVideoIndex === 3 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#203f78] hover:text-white'
                    } transition-all`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Dots Indicator */}
                <div className="flex justify-center gap-2 mt-6">
                  {[0, 1, 2].map((index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentVideoIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${currentVideoIndex === index ? 'bg-[#203f78] w-8' : 'bg-gray-300'
                        }`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-sm text-gray-500 text-center mt-4 italic">
                Watch our training sessions, lab demonstrations, and student projects
              </p>
            </div>

            {/* Image Modal */}
            {selectedImage && (
              <div
                className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
                onClick={() => setSelectedImage(null)}
              >
                <div className="relative max-w-4xl w-full px-4">
                  <img
                    src={selectedImage}
                    alt="Expanded view"
                    className="w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
                  />
                  <button
                    className="absolute -top-4 -right-4 bg-white text-black rounded-full w-8 h-8 flex items-center justify-center font-bold"
                    onClick={() => setSelectedImage(null)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* HIGHLIGHTS */}
          <section id="highlights" className="rounded-2xl p-8 scroll-mt-32">
            <h2 className="text-3xl font-bold mb-12 text-[#203f78]">Highlights</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  icon: (
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                  ),
                  title: "Student Enrollment & Portal Access",
                  desc: "One-time subscription for lifetime access to the Technoviz Automation Learning Portal with structured SLM, hands-on resources, and continuous updates."
                },
                {
                  icon: (
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                    </svg>
                  ),
                  title: "Self-Learning Through Structured Modules",
                  desc: "DIY learning approach with step-by-step theory modules, practical lab guides, real-world examples, and hands-on exercises at your own pace."
                },
                {
                  icon: (
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                    </svg>
                  ),
                  title: "Hands-On Practice & Industrial Use Cases",
                  desc: "Work on practical exercises and real industrial problem statements to apply Smart Manufacturing & IIoT concepts and develop problem-solving skills."
                },
                {
                  icon: (
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="M9 11h6M9 15h3" />
                    </svg>
                  ),
                  title: "Online Assessment & Skill Evaluation",
                  desc: "Comprehensive online assessment evaluating conceptual understanding, practical application skills, and ability to analyze industry problems."
                },
                {
                  icon: (
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="9" y1="15" x2="15" y2="15" />
                    </svg>
                  ),
                  title: "Certification",
                  desc: "Receive an instant digital certificate that is auto-generated, portal-verifiable, and usable for academics, internships, jobs, and professional profiles."
                },
                {
                  icon: (
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="8.5" cy="7" r="4" />
                      <polyline points="17 11 19 13 23 9" />
                    </svg>
                  ),
                  title: "Lifetime Learning, Career & Startup Support",
                  desc: "Continuous access to new modules, industry updates, career guidance, startup mentorship, and industry/investor networks even after certification."
                },
              ].map((item, index) => (
                <div key={index} className="flex flex-col items-center text-center">
                  {/* Icon Circle with outer ring */}
                  <div className="relative w-24 h-24 mb-6">
                    {/* Outer decorative circle */}
                    <div className="absolute inset-0 rounded-full border-2 border-red-300 opacity-40"></div>
                    {/* Inner solid circle */}
                    <div className="absolute inset-2 rounded-full bg-[#203f78] flex items-center justify-center text-white shadow-lg">
                      {item.icon}
                    </div>
                  </div>

                  {/* Title */}
                  <h4 className="font-bold text-[#203f78] mb-3 text-base">
                    {item.title}
                  </h4>

                  {/* Description */}
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* CONTENT - 16 Modules with chapters */}
          <section id="content" className="rounded-2xl p-8 scroll-mt-32">
            <h2 className="text-3xl font-bold mb-4 text-[#203f78]">Content</h2>

            <p className="text-sm text-gray-600 mb-8">
              Check the curriculum structure of the Smart Manufacturing & IIoT Self Learning Module programme.
            </p>

            <div className="border-t border-gray-300"></div>

            <div className="divide-y divide-gray-300">
              {programmeData.modules.slice(0, showAllModules ? programmeData.modules.length : 8).map((mod, idx) => (
                <details key={idx} className="group">
                  <summary className="flex justify-between items-center cursor-pointer py-6 font-semibold text-gray-900 hover:text-[#203f78] transition-colors list-none">
                    <span className="text-base">
                      Module {idx + 1}: {mod.title}
                    </span>
                    <span className="text-2xl font-bold text-[#203f78] transition-transform group-open:rotate-45">+</span>
                  </summary>

                  <div className="pb-6 -mt-2">
                    <h4 className="text-sm font-semibold text-[#203f78] mb-4">Sub Modules</h4>
                    <ul className="space-y-3 text-sm text-gray-700">
                      {mod.submodules.map((chapter, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-[#203f78] mr-3 mt-0.5">→</span>
                          <span>{chapter}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </details>
              ))}
            </div>

            {programmeData.modules.length > 8 && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowAllModules(!showAllModules)}
                  className="text-[#203f78] font-semibold hover:underline transition-all"
                >
                  {showAllModules ? 'Show Less' : 'Read More'}
                </button>
              </div>
            )}
          </section>

          {/* WHY THIS MODEL WORKS */}
          <section id="why-this-works" className=" rounded-2xl p-8  scroll-mt-32">
            <h2 className="text-3xl font-bold mb-10 text-[#203f78]">Why This Model Works</h2>

            <div className="max-w-6xl mx-auto">
              {/* First 3 items in a row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {[
                  {
                    step: 1,
                    icon: (
                      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                      </svg>
                    ),
                    title: "Learn at Your Own Pace"
                  },
                  {
                    step: 2,
                    icon: (
                      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                      </svg>
                    ),
                    title: "Industry-Ready Skills"
                  },
                  {
                    step: 3,
                    icon: (
                      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                      </svg>
                    ),
                    title: "Real Industrial Use Cases"
                  },
                ].map((item, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow relative">
                    {/* Step Number Badge */}
                    <div className="absolute -top-3 -left-3 w-8 h-8 bg-[#203f78] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {item.step}
                    </div>

                    {/* Icon Circle */}
                    <div className="flex justify-center mb-4 mt-2">
                      <div className="w-20 h-20 rounded-full bg-[#203f78] flex items-center justify-center text-white shadow-md ring-4 ring-blue-100">
                        {item.icon}
                      </div>
                    </div>

                    {/* Title */}
                    <h4 className="font-bold text-[#203f78] text-center text-base">
                      {item.title}
                    </h4>
                  </div>
                ))}
              </div>

              {/* Last 2 items centered */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                {[
                  {
                    step: 4,
                    icon: (
                      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    ),
                    title: "One-Time Investment, Lifetime Access"
                  },
                  {
                    step: 5,
                    icon: (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-10 h-10"
                      >
                        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                        <polyline points="16 7 22 7 22 13" />
                      </svg>
                    ),

                    title: "Career & Startup Support"
                  },
                ].map((item, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow relative">
                    {/* Step Number Badge */}
                    <div className="absolute -top-3 -left-3 w-8 h-8 bg-[#203f78] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {item.step}
                    </div>

                    {/* Icon Circle */}
                    <div className="flex justify-center mb-4 mt-2">
                      <div className="w-20 h-20 rounded-full bg-[#203f78] flex items-center justify-center text-white shadow-md ring-4 ring-blue-100">
                        {item.icon}
                      </div>
                    </div>

                    {/* Title */}
                    <h4 className="font-bold text-[#203f78] text-center text-base">
                      {item.title}
                    </h4>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* PROGRAMME COORDINATOR */}
          <section id="coordinator" className=" rounded-2xl p-8  scroll-mt-32">
            <h2 className="text-3xl font-bold mb-8 text-[#203f78]">Programme Coordinator</h2>

            <div className="flex flex-col sm:flex-row gap-8 items-start">
              {/* Profile Image with decorative border */}
              <div className="flex-shrink-0">
                <div className="relative w-48 h-48">
                  {/* Decorative red arc */}
                  <div className="absolute inset-0">
                    <svg viewBox="0 0 200 200" className="w-full h-full">
                      <circle cx="100" cy="100" r="95" fill="none" stroke="#dc2626" strokeWidth="3" strokeDasharray="150 350" strokeDashoffset="0" className="transform -rotate-45" />
                    </svg>
                  </div>
                  {/* Profile image */}
                  <div className="absolute inset-3 rounded-full overflow-hidden bg-white border-4 border-gray-200">
                    <img src={kapil} className="w-full h-full object-contain" alt="Kapil Khurana" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                {/* Short description */}
                <div className="mb-4">
                  <p className="text-gray-700 leading-relaxed">
                    Kapil Khurana is an Industry 4.0 & IIoT expert with over 20+ years of industrial experience across automation, control systems, and digital transformation domains. He specializes in bridging traditional industrial practices with modern digital technologies, enabling organizations to evolve into truly smart and connected enterprises.
                  </p>
                </div>

                {/* Read More button */}
                <button
                  onClick={() => setShowFullBio(!showFullBio)}
                  className="text-[#203f78] font-semibold flex items-center gap-2 hover:underline mb-4"
                >
                  {showFullBio ? 'See Less' : 'Read more'}
                  <svg
                    className={`w-4 h-4 transition-transform ${showFullBio ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Expanded content */}
                {showFullBio && (
                  <div className="space-y-4 text-gray-700 leading-relaxed animate-fadeIn">
                    <p>
                      Kapil's expertise lies in helping manufacturers understand their current Industry 4.0 readiness, benchmark against global best practices, and define structured transformation roadmaps that drive measurable improvements in productivity, quality, and efficiency.
                    </p>

                    {/* SIRI Certification - Highlighted */}
                    <div className="bg-blue-50 border-l-4 border-[#203f78] p-4 rounded-r-lg">
                      <h4 className="font-bold text-[#203f78] mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                        Certified SIRI Assessor (CSA) | IIT Delhi
                      </h4>
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Assessor ID:</strong> 150126SN003
                      </p>
                      <p className="text-sm text-gray-700 mb-3">
                        As a SIRI Certified Professional, Kapil has helped organizations:
                      </p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-[#203f78] mt-1">•</span>
                          <span>Understand their current Industry 4.0 readiness</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#203f78] mt-1">•</span>
                          <span>Benchmark against global best practices</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#203f78] mt-1">•</span>
                          <span>Define structured transformation roadmaps</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#203f78] mt-1">•</span>
                          <span>Drive measurable improvements in productivity, quality, and efficiency</span>
                        </li>
                      </ul>
                      <p className="text-sm italic text-gray-600 mt-3 pl-4 border-l-2 border-[#203f78]">
                        "Transformation begins with clarity. SIRI gives manufacturers the clarity to act, evolve, and lead."
                      </p>
                    </div>

                    <p>
                      <strong>Author:</strong> Kapil Khurana is the author of the globally available book{' '}
                      <span className="font-semibold text-[#203f78]">"Digital Revolution – Industry 4.0 & IIoT,"</span>{' '}
                      a leading resource in smart manufacturing and digital transformation.
                    </p>
                  </div>
                )}

                {/* Name and designation - always visible */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="font-bold text-lg text-[#203f78] mb-1">Kapil Khurana</h4>
                  <p className="text-sm text-gray-600">
                    Founder & CEO | Author | Certified SIRI Assessor | Industry 4.0 & IIoT Expert
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CERTIFICATION */}
          <section id="certificate" className="rounded-2xl p-8 scroll-mt-32 relative">
            {/* Top Left L-shaped corner */}
            <div className="absolute top-0 left-0 w-12 h-12">
              <div className="absolute top-0 left-0 w-12 h-2 bg-[#203f78]"></div>
              <div className="absolute top-0 left-0 w-2 h-12 bg-[#203f78]"></div>
            </div>

            <h2 className="text-3xl font-bold mb-8 text-[#203f78] pt-4">Certificate and Assessment</h2>

            {/* Assessment & Evaluation */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-[#203f78] mb-4">Assessment & Evaluation</h3>

              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <table className="w-full">
                  <tbody>
                    <tr className="border-b border-gray-300">
                      <td className="p-4 bg-gray-50 font-medium text-gray-700">Module-End MCQ Quiz (16 Modules)</td>
                      <td className="p-4 text-gray-700">Pass All Quizzes</td>
                    </tr>
                    <tr className="border-b border-gray-300">
                      <td className="p-4 bg-gray-50 font-medium text-gray-700">Hands-On Lab Practice</td>
                      <td className="p-4 text-gray-700">For Skill Development</td>
                    </tr>
                    <tr>
                      <td className="p-4 bg-gray-50 font-medium text-gray-700">Module Completion</td>
                      <td className="p-4 text-gray-700">All 16 Modules Required</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-sm text-gray-600 mt-4">
                Students must complete all 16 modules and pass each module-end quiz to become eligible for the certificate of completion.
              </p>
            </div>

            {/* Completion Criteria */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-[#203f78] mb-4">Completion Criteria</h3>
              <p className="text-sm text-gray-700">
                Complete all 16 modules, practice with hands-on lab documents, and pass the MCQ quiz at the end of each module to unlock the next module.
              </p>
            </div>

            {/* Certification Details */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-[#203f78] mb-4">Certification*</h3>

              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="mr-2">→</span>
                  <span>Students who successfully complete all 16 modules and pass all module-end quizzes will receive a "Certificate of Completion" from Technoviz Automation.</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">→</span>
                  <span>Students who complete some modules but not all will receive a "Certificate of Participation".</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">→</span>
                  <span>All certificates are auto-generated, portal-verifiable, and digitally signed.</span>
                </li>
              </ul>

              <p className="text-xs text-gray-600 mt-4 italic">
                *Certificates will be issued by Technoviz Automation and are verifiable through the learning portal.
              </p>
            </div>

            {/* Certificate Image */}
            <div className="mb-8">
              <div className="w-[350px] mx-auto">
                <img
                  src={certimg}
                  alt="Technoviz Automation Certificate Sample"
                  className="w-full h-auto"
                />
              </div>
            </div>

            {/* Bottom Right L-shaped corner */}
            <div className="absolute bottom-0 right-0 w-12 h-12">
              <div className="absolute bottom-0 right-0 w-12 h-2 bg-[#203f78]"></div>
              <div className="absolute bottom-0 right-0 w-2 h-12 bg-[#203f78]"></div>
            </div>
          </section>

          {/* CONTACT */}
          <section id="contact" className="bg-gradient-to-br from-[#203f78] to-[#2c5a9e] rounded-2xl p-8 shadow-md text-white scroll-mt-32">
            <h2 className="text-xl font-bold mb-4">Get In Touch</h2>
            <div className="space-y-3">
              <p className="flex items-center gap-3">
                <Globe size={20} className="flex-shrink-0" />
                <a
                  href={programmeData?.contact?.website || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-200 transition-colors"
                >
                  {programmeData?.contact?.website || "www.technovizautomation.com"}
                </a>
              </p>
              <p className="flex items-center gap-3">
                <Mail size={20} className="flex-shrink-0" />
                <span>{programmeData?.contact?.email || "contact@technovizautomation.com"}</span>
              </p>
            </div>
          </section>
        </div >

        {/* RIGHT SIDE - LOGIN FORM */}
        < div className="w-full flex justify-center lg:sticky lg:top-24 self-start" >
          <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
            <div className="flex justify-center mb-6 lg:hidden">
              <div className="w-20 h-20 flex items-center justify-center">
                <img
                  src={biglogo}
                  className="w-20 h-20 object-contain"
                  alt="logo"
                />
              </div>
            </div>
            <h2 className="text-xl font-bold text-center mb-2 text-[#203f78]">
              Welcome Back!
            </h2>
            <p className="text-center text-sm text-gray-500 mb-6">
              Sign in to access your dashboard
            </p>
            <form onSubmit={handleSubmit} className="space-y-5">
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
            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-600">
                New to Technoviz?{' '}
                <a href="/register" className="font-semibold text-[#203f78] hover:underline">
                  Create account
                </a>
              </p>
            </div>
          </div>
        </div >
      </div >
    </div >
  );
};

export default Login;