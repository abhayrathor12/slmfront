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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showFullBio, setShowFullBio] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [showAllModules, setShowAllModules] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      localStorage.clear();

      const res = await api.post('/accounts/login/', {
        email,
        password
      });

      const { user, access, refresh } = res.data;

      localStorage.setItem('access', access);
      localStorage.setItem('refresh', refresh);
      localStorage.setItem('user', JSON.stringify(user));

      toast.success('Login successful!');

      const role = user.role || 'Participant';

      setTimeout(() => {
        if (role === 'admin') {
          navigate('/admin_home');
        } else {
          navigate('/user_home');
        }
      }, 400);

    } catch (err) {
      const message =
        err.response?.data?.detail || err.response?.data?.message ||
        'Invalid email or password';

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    const handleScroll = () => {
      const sections = ['overview', 'coe', 'highlights', 'content', 'why-this-works', 'coordinator', 'certificate', 'contact'];

      if (window.scrollY < 100) {
        setActiveSection('');
        return;
      }

      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const clientHeight = window.innerHeight;

      if (scrollHeight - scrollTop - clientHeight < 50) {
        setActiveSection('contact');
        return;
      }

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 200) {
            setActiveSection(section);
            return;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#overview', label: 'Overview' },
    { href: '#coe', label: 'CoE' },
    { href: '#highlights', label: 'Highlights' },
    { href: '#content', label: 'Content' },
    { href: '#why-this-works', label: 'Why It Works' },
    { href: '#coordinator', label: 'Programme Coordinator' },
    { href: '#certificate', label: 'Certificate' },
    { href: '#contact', label: 'Contact' },
  ];

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 min-h-screen scroll-smooth">
      {/* Custom CSS for animations */}
      <style jsx>{`
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
        .animate-icon-rotate-1 { animation: iconRotate1 8s ease-in-out infinite; }
        .animate-icon-rotate-2 { animation: iconRotate2 8s ease-in-out infinite; }
        .animate-icon-rotate-3 { animation: iconRotate3 8s ease-in-out infinite; }
        .animate-icon-rotate-4 { animation: iconRotate4 8s ease-in-out infinite; }

        .typewriter-text { overflow: hidden; white-space: nowrap; display: inline-block; }

        @keyframes phrase1 {
          0% { opacity: 1; } 25% { opacity: 1; } 33.33% { opacity: 0; } 100% { opacity: 0; }
        }
        @keyframes phrase2 {
          0% { opacity: 0; } 33.33% { opacity: 0; } 33.34% { opacity: 1; }
          58.33% { opacity: 1; } 66.66% { opacity: 0; } 100% { opacity: 0; }
        }
        @keyframes phrase3 {
          0% { opacity: 0; } 66.66% { opacity: 0; } 66.67% { opacity: 1; }
          91.66% { opacity: 1; } 100% { opacity: 0; }
        }
        @keyframes typing1 { 0% { width: 0; } 50% { width: 100%; } 100% { width: 100%; } }
        @keyframes typing2 { 0% { width: 0; } 50% { width: 100%; } 100% { width: 100%; } }
        @keyframes typing3 { 0% { width: 0; } 50% { width: 100%; } 100% { width: 100%; } }

        .animate-typewriter-1 { animation: phrase1 12s ease-in-out infinite; }
        .animate-typewriter-1 .typewriter-text { animation: typing1 4s steps(30) infinite normal both; }
        .animate-typewriter-2 { animation: phrase2 12s ease-in-out infinite; }
        .animate-typewriter-2 .typewriter-text { animation: typing2 4s steps(30) infinite normal both; }
        .animate-typewriter-3 { animation: phrase3 12s ease-in-out infinite; }
        .animate-typewriter-3 .typewriter-text { animation: typing3 4s steps(30) infinite normal both; }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-in-out; }
      `}</style>

      {/* STICKY NAVBAR */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={smallogo} className="w-10 h-10 object-contain" alt="logo" />
            <span className="font-bold text-base sm:text-lg text-[#203f78]">Technoviz Automation</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-600">
            {navLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className={`hover:text-[#203f78] transition-colors pb-1 ${activeSection === href.slice(1) ? 'text-[#203f78] border-b-2 border-[#203f78]' : ''
                  }`}
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Mobile Hamburger */}
          <button
            className="lg:hidden flex flex-col gap-1.5 p-2 rounded-md hover:bg-gray-100 transition-colors"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            aria-label="Toggle navigation"
          >
            <span className={`block w-6 h-0.5 bg-[#203f78] transition-transform duration-300 ${mobileNavOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-[#203f78] transition-opacity duration-300 ${mobileNavOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-[#203f78] transition-transform duration-300 ${mobileNavOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </button>
        </div>

        {/* Mobile Nav Dropdown */}
        {mobileNavOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
            <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
              {navLinks.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMobileNavOpen(false)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeSection === href.slice(1)
                    ? 'text-[#203f78] bg-blue-50'
                    : 'text-gray-600 hover:text-[#203f78] hover:bg-gray-50'
                    }`}
                >
                  {label}
                </a>
              ))}
            </nav>
          </div>
        )}
      </div>


      {/* HERO SECTION */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="flex flex-col lg:flex-row min-h-[auto] lg:min-h-[500px] xl:min-h-[540px] lg:h-[calc(100vh-64px)]">
          {/* Hero Left Content */}
          <div className="w-full lg:w-3/5 xl:w-7/12 relative z-10 flex items-center">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 xl:px-16 py-10 sm:py-12 lg:py-14 space-y-4 sm:space-y-5">

              {/* Headline with animated icon */}
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex-shrink-0 relative w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mt-1">
                  <div className="absolute inset-0 flex items-center justify-center animate-icon-rotate-1">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-[#203f78] to-[#2c5a9e] rounded-lg shadow-lg flex items-center justify-center">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                      </svg>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center animate-icon-rotate-2">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-[#203f78] to-[#2c5a9e] rounded-lg shadow-lg flex items-center justify-center">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                      </svg>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center animate-icon-rotate-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-[#203f78] to-[#2c5a9e] rounded-lg shadow-lg flex items-center justify-center">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center animate-icon-rotate-4">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-[#203f78] to-[#2c5a9e] rounded-lg shadow-lg flex items-center justify-center">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>
                </div>

                <h1 className="flex-1 text-2xl sm:text-3xl lg:text-4xl xl:text-4xl font-bold text-[#203f78] leading-tight">
                  Centre of Excellence in Smart Manufacturing & Industry 4.0
                </h1>
              </div>

              <h2 className="text-base sm:text-lg lg:text-xl xl:text-2xl text-gray-700 font-semibold">
                Industry-ready training in PLC, IIoT, AI-Driven Manufacturing & Digital Transformation
              </h2>

              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                Prepare yourself for real industrial environments through a hands-on Centre of Excellence (CoE) designed by industry experts.
                Learn by doing with real industrial tools, practical use cases, and structured learning that builds job-ready skills.
              </p>

              <div className="flex flex-wrap gap-2 sm:gap-3 pt-1 sm:pt-3">
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-[#203f78]/20 text-xs sm:text-sm">
                  <CheckCircle2 size={14} className="text-[#203f78]" />
                  <span className="font-medium text-gray-700">Industry 4.0 & Smart Manufacturing</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-[#203f78]/20 text-xs sm:text-sm">
                  <CheckCircle2 size={14} className="text-[#203f78]" />
                  <span className="font-medium text-gray-700">PLC to Cloud | IIoT | Automation</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-[#203f78]/20 text-xs sm:text-sm">
                  <CheckCircle2 size={14} className="text-[#203f78]" />
                  <span className="font-medium text-gray-700">Lifetime Learning & Career Support</span>
                </div>
              </div>

              {/* CTA Button with Typewriter */}
              <div className="pt-3 sm:pt-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                <a
                  href="#login-form"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#203f78] to-[#2c5a9e] text-white px-5 sm:px-7 py-2.5 sm:py-3 rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-[1.02] text-sm lg:text-base"
                >
                  Login to Begin Training
                  <ArrowRight size={18} />
                </a>

                <div className="flex flex-col gap-2">
                  <div className="relative h-8 overflow-hidden">
                    <div className="absolute inset-0">
                      <div className="h-8 flex items-center gap-2 animate-typewriter-1">
                        <div className="w-2 h-2 rounded-full bg-[#203f78]"></div>
                        <span className="text-[#203f78] font-bold text-sm sm:text-base lg:text-lg typewriter-text">Do It Yourself</span>
                      </div>
                      <div className="h-8 flex items-center gap-2 absolute top-0 left-0 animate-typewriter-2">
                        <div className="w-2 h-2 rounded-full bg-[#203f78]"></div>
                        <span className="text-[#203f78] font-bold text-sm sm:text-base lg:text-lg typewriter-text">Zero Faculty Dependency</span>
                      </div>
                      <div className="h-8 flex items-center gap-2 absolute top-0 left-0 animate-typewriter-3">
                        <div className="w-2 h-2 rounded-full bg-[#203f78]"></div>
                        <span className="text-[#203f78] font-bold text-sm sm:text-base lg:text-lg typewriter-text">Flexible Learning Framework</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 italic flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-[#203f78]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    100% self-driven, instructor-independent learning
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Right Image - hidden on mobile */}
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
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-12">

        {/* LEFT COLUMN - SECTIONS (was hidden lg:block — now visible on all screens) */}
        <div className="order-2 lg:order-1 lg:col-span-2 space-y-12 text-gray-700">

          {/* OVERVIEW */}
          <section id="overview" className="rounded-2xl p-5 sm:p-8 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-[#203f78]">Overview</h2>
            <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
              Technoviz Automation presents a Centre of Excellence (CoE) on Smart Manufacturing designed to prepare participants for real industrial environments. This initiative focuses on Industry 4.0, IIoT, Smart Automation, AI-driven manufacturing, and digital transformation.
            </p>
            <p className="text-gray-700 leading-relaxed mt-3 text-sm sm:text-base">
              The CoE is built on a subscription-based model, ensuring no upfront payment or investment from the college or university. The entire setup, execution, training delivery, and long-term support are handled by Technoviz Automation, allowing institutions to offer high-value industrial exposure without operational or financial burden.
            </p>
          </section>

          {/* CoE */}
          <section id="coe" className="rounded-2xl p-5 sm:p-8 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-[#203f78]">
              {programmeData?.coe?.title || 'Centre of Excellence on Smart Manufacturing'}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6 sm:mb-8 text-sm sm:text-base">
              {programmeData?.coe?.description || 'Industry-aligned training program designed to build job-ready skills in PLC, IIoT, Smart Automation, and Industry 4.0 through hands-on learning and real industrial use cases.'}
            </p>

            {/* Gallery */}
            <div className="border-t border-gray-200 pt-6 sm:pt-8 mb-6 sm:mb-8">
              <h3 className="text-lg sm:text-xl font-bold text-[#203f78] mb-4 sm:mb-6">Centre of Excellence Gallery</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {[
                  { src: coe1, alt: 'CoE Lab Setup' },
                  { src: coe2, alt: 'PLC Training' },
                  { src: coe3, alt: 'IIoT Dashboard' },
                  { src: coe4, alt: 'Participant Training' },
                ].map(({ src, alt }) => (
                  <div key={alt} className="relative group overflow-hidden rounded-lg border-2 border-gray-200 hover:border-[#203f78] transition-all cursor-pointer">
                    <div className="aspect-square bg-gray-100">
                      <img
                        onClick={() => setSelectedImage(src)}
                        src={src}
                        alt={alt}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs sm:text-sm text-gray-500 text-center mt-3 sm:mt-4 italic">
                Real CoE lab setups showing PLC, IIoT devices, and smart manufacturing equipment
              </p>
            </div>

            {/* Videos */}
            <div className="border-t border-gray-200 pt-6 sm:pt-8">
              <h3 className="text-lg sm:text-xl font-bold text-[#203f78] mb-4 sm:mb-6">Training & Lab Videos</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {[
                  'https://www.youtube.com/embed/XUH_k3acpgA',
                  'https://www.youtube.com/embed/SwbUTWDpaNU',
                  'https://www.youtube.com/embed/8eJrlo8FWag',
                  'https://www.youtube.com/embed/aF8_IaK_4AM',
                ].map((src) => (
                  <div key={src} className="relative rounded-lg overflow-hidden bg-black aspect-video">
                    <iframe
                      className="w-full h-full"
                      src={src}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs sm:text-sm text-gray-500 text-center mt-4 sm:mt-6 italic">
                Watch our training sessions, lab demonstrations, and Participant projects
              </p>
            </div>

            {/* Image Modal */}
            {selectedImage && (
              <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
                <div className="relative max-w-4xl w-full">
                  <img src={selectedImage} alt="Expanded view" className="w-full max-h-[85vh] object-contain rounded-xl shadow-2xl" />
                  <button
                    className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 bg-white text-black rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-lg"
                    onClick={() => setSelectedImage(null)}
                  >✕</button>
                </div>
              </div>
            )}
          </section>

          {/* HIGHLIGHTS */}
          <section id="highlights" className="rounded-2xl p-5 sm:p-8 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold mb-8 sm:mb-12 text-[#203f78]">Highlights</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  icon: <svg className="w-7 h-7 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5M2 12l10 5 10-5" /></svg>,
                  title: "Participant Enrollment & Portal Access",
                  desc: "One-time subscription for lifetime access to the Technoviz Automation Learning Portal with structured SLM, hands-on resources, and continuous updates."
                },
                {
                  icon: <svg className="w-7 h-7 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>,
                  title: "Self-Learning Through Structured Modules",
                  desc: "DIY learning approach with step-by-step theory modules, practical lab guides, real-world examples, and hands-on exercises at your own pace."
                },
                {
                  icon: <svg className="w-7 h-7 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>,
                  title: "Hands-On Practice & Industrial Use Cases",
                  desc: "Work on practical exercises and real industrial problem statements to apply Smart Manufacturing & IIoT concepts and develop problem-solving skills."
                },
                {
                  icon: <svg className="w-7 h-7 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 11h6M9 15h3" /></svg>,
                  title: "Online Assessment & Skill Evaluation",
                  desc: "Comprehensive online assessment evaluating conceptual understanding, practical application skills, and ability to analyze industry problems."
                },
                {
                  icon: <svg className="w-7 h-7 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="9" y1="15" x2="15" y2="15" /></svg>,
                  title: "Certification",
                  desc: "Receive an instant digital certificate that is auto-generated, portal-verifiable, and usable for academics, internships, jobs, and professional profiles."
                },
                {
                  icon: <svg className="w-7 h-7 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><polyline points="17 11 19 13 23 9" /></svg>,
                  title: "Lifetime Learning, Career & Startup Support",
                  desc: "Continuous access to new modules, industry updates, career guidance, startup mentorship, and industry/investor networks even after certification."
                },
              ].map((item, index) => (
                <div key={index} className="flex flex-col items-center text-center">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-4 sm:mb-6">
                    <div className="absolute inset-0 rounded-full border-2 border-red-300 opacity-40"></div>
                    <div className="absolute inset-2 rounded-full bg-[#203f78] flex items-center justify-center text-white shadow-lg">
                      {item.icon}
                    </div>
                  </div>
                  <h4 className="font-bold text-[#203f78] mb-2 sm:mb-3 text-sm sm:text-base">{item.title}</h4>
                  <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CONTENT - Modules */}
          <section id="content" className="rounded-2xl p-5 sm:p-8 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-[#203f78]">Content</h2>
            <p className="text-xs sm:text-sm text-gray-600 mb-6 sm:mb-8">
              Check the curriculum structure of the Smart Manufacturing & IIoT Self Learning Module programme.
            </p>
            <div className="border-t border-gray-300"></div>
            <div className="divide-y divide-gray-300">
              {programmeData.modules.slice(0, showAllModules ? programmeData.modules.length : 8).map((mod, idx) => (
                <details key={idx} className="group">
                  <summary className="flex justify-between items-center cursor-pointer py-4 sm:py-6 font-semibold text-gray-900 hover:text-[#203f78] transition-colors list-none">
                    <span className="text-sm sm:text-base pr-4">Module {idx + 1}: {mod.title}</span>
                    <span className="text-2xl font-bold text-[#203f78] transition-transform group-open:rotate-45 flex-shrink-0">+</span>
                  </summary>
                  <div className="pb-5 -mt-2">
                    <h4 className="text-xs sm:text-sm font-semibold text-[#203f78] mb-3 sm:mb-4">Sub Modules</h4>
                    <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-700">
                      {mod.submodules.map((chapter, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-[#203f78] mr-2 sm:mr-3 mt-0.5 flex-shrink-0">→</span>
                          <span>{chapter}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </details>
              ))}
            </div>
            {programmeData.modules.length > 8 && (
              <div className="mt-5 sm:mt-6 text-center">
                <button
                  onClick={() => setShowAllModules(!showAllModules)}
                  className="text-[#203f78] font-semibold hover:underline transition-all text-sm sm:text-base"
                >
                  {showAllModules ? 'Show Less' : 'Read More'}
                </button>
              </div>
            )}
          </section>

          {/* WHY THIS MODEL WORKS */}
          <section id="why-this-works" className="rounded-2xl p-5 sm:p-8 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold mb-8 sm:mb-10 text-[#203f78]">Why This Model Works</h2>
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                {[
                  { step: 1, icon: <svg className="w-8 h-8 sm:w-10 sm:h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>, title: "Learn at Your Own Pace" },
                  { step: 2, icon: <svg className="w-8 h-8 sm:w-10 sm:h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5M2 12l10 5 10-5" /></svg>, title: "Industry-Ready Skills" },
                  { step: 3, icon: <svg className="w-8 h-8 sm:w-10 sm:h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>, title: "Real Industrial Use Cases" },
                ].map((item) => (
                  <div key={item.step} className="bg-gray-50 rounded-xl p-5 sm:p-6 border border-gray-200 hover:shadow-lg transition-shadow relative">
                    <div className="absolute -top-3 -left-3 w-7 h-7 sm:w-8 sm:h-8 bg-[#203f78] rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-md">{item.step}</div>
                    <div className="flex justify-center mb-3 sm:mb-4 mt-2">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#203f78] flex items-center justify-center text-white shadow-md ring-4 ring-blue-100">{item.icon}</div>
                    </div>
                    <h4 className="font-bold text-[#203f78] text-center text-sm sm:text-base">{item.title}</h4>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto">
                {[
                  { step: 4, icon: <svg className="w-8 h-8 sm:w-10 sm:h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>, title: "One-Time Investment, Lifetime Access" },
                  { step: 5, icon: <svg className="w-8 h-8 sm:w-10 sm:h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>, title: "Career & Startup Support" },
                ].map((item) => (
                  <div key={item.step} className="bg-gray-50 rounded-xl p-5 sm:p-6 border border-gray-200 hover:shadow-lg transition-shadow relative">
                    <div className="absolute -top-3 -left-3 w-7 h-7 sm:w-8 sm:h-8 bg-[#203f78] rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-md">{item.step}</div>
                    <div className="flex justify-center mb-3 sm:mb-4 mt-2">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#203f78] flex items-center justify-center text-white shadow-md ring-4 ring-blue-100">{item.icon}</div>
                    </div>
                    <h4 className="font-bold text-[#203f78] text-center text-sm sm:text-base">{item.title}</h4>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* PROGRAMME COORDINATOR */}
          <section id="coordinator" className="rounded-2xl p-5 sm:p-8 scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-[#203f78]">Programme Coordinator</h2>
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
              <div className="flex-shrink-0 mx-auto sm:mx-0">
                <div className="relative w-36 h-36 sm:w-48 sm:h-48">
                  <div className="absolute inset-0">
                    <svg viewBox="0 0 200 200" className="w-full h-full">
                      <circle cx="100" cy="100" r="95" fill="none" stroke="#dc2626" strokeWidth="3" strokeDasharray="150 350" strokeDashoffset="0" className="transform -rotate-45" />
                    </svg>
                  </div>
                  <div className="absolute inset-3 rounded-full overflow-hidden bg-white border-4 border-gray-200">
                    <img src={kapil} className="w-full h-full object-contain" alt="Kapil Khurana" />
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base mb-4">
                  Kapil Khurana is an Industry 4.0 & IIoT expert with over 20+ years of industrial experience across automation, control systems, and digital transformation domains. He specializes in bridging traditional industrial practices with modern digital technologies, enabling organizations to evolve into truly smart and connected enterprises.
                </p>
                <button
                  onClick={() => setShowFullBio(!showFullBio)}
                  className="text-[#203f78] font-semibold flex items-center gap-2 hover:underline mb-4 text-sm sm:text-base"
                >
                  {showFullBio ? 'See Less' : 'Read more'}
                  <svg className={`w-4 h-4 transition-transform ${showFullBio ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showFullBio && (
                  <div className="space-y-4 text-gray-700 leading-relaxed animate-fadeIn text-sm sm:text-base">
                    <p>Kapil's expertise lies in helping manufacturers understand their current Industry 4.0 readiness, benchmark against global best practices, and define structured transformation roadmaps that drive measurable improvements in productivity, quality, and efficiency.</p>
                    <div className="bg-blue-50 border-l-4 border-[#203f78] p-4 rounded-r-lg">
                      <h4 className="font-bold text-[#203f78] mb-2 flex items-center gap-2 text-sm sm:text-base">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                        Certified SIRI Assessor (CSA) | IIT Delhi
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-700 mb-2"><strong>Assessor ID:</strong> 150126SN003</p>
                      <p className="text-xs sm:text-sm text-gray-700 mb-3">As a SIRI Certified Professional, Kapil has helped organizations:</p>
                      <ul className="space-y-2 text-xs sm:text-sm">
                        {['Understand their current Industry 4.0 readiness', 'Benchmark against global best practices', 'Define structured transformation roadmaps', 'Drive measurable improvements in productivity, quality, and efficiency'].map(item => (
                          <li key={item} className="flex items-start gap-2"><span className="text-[#203f78] mt-1">•</span><span>{item}</span></li>
                        ))}
                      </ul>
                      <p className="text-xs sm:text-sm italic text-gray-600 mt-3 pl-4 border-l-2 border-[#203f78]">
                        "Transformation begins with clarity. SIRI gives manufacturers the clarity to act, evolve, and lead."
                      </p>
                    </div>
                    <p className="text-xs sm:text-sm">
                      <strong>Author:</strong> Kapil Khurana is the author of the globally available book{' '}
                      <span className="font-semibold text-[#203f78]">"Digital Revolution – Industry 4.0 & IIoT,"</span>{' '}
                      a leading resource in smart manufacturing and digital transformation.
                    </p>
                  </div>
                )}
                <div className="mt-5 sm:mt-6 pt-4 border-t border-gray-200">
                  <h4 className="font-bold text-base sm:text-lg text-[#203f78] mb-1">Kapil Khurana</h4>
                  <p className="text-xs sm:text-sm text-gray-600">Founder & CEO | Author | Certified SIRI Assessor | Industry 4.0 & IIoT Expert</p>
                </div>
              </div>
            </div>
          </section>

          {/* CERTIFICATION */}
          <section id="certificate" className="rounded-2xl p-5 sm:p-8 scroll-mt-24 relative">
            <div className="absolute top-0 left-0 w-10 h-10 sm:w-12 sm:h-12">
              <div className="absolute top-0 left-0 w-10 sm:w-12 h-2 bg-[#203f78]"></div>
              <div className="absolute top-0 left-0 w-2 h-10 sm:h-12 bg-[#203f78]"></div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-[#203f78] pt-4">Certificate and Assessment</h2>

            <div className="mb-6 sm:mb-8">
              <h3 className="text-base sm:text-lg font-semibold text-[#203f78] mb-3 sm:mb-4">Assessment & Evaluation</h3>
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <table className="w-full">
                  <tbody>
                    {[
                      ['Module-End MCQ Quiz (16 Modules)', 'Pass All Quizzes'],
                      ['Hands-On Lab Practice', 'For Skill Development'],
                      ['Module Completion', 'All 16 Modules Required'],
                    ].map(([label, value], i) => (
                      <tr key={i} className={i < 2 ? 'border-b border-gray-300' : ''}>
                        <td className="p-3 sm:p-4 bg-gray-50 font-medium text-gray-700 text-xs sm:text-sm">{label}</td>
                        <td className="p-3 sm:p-4 text-gray-700 text-xs sm:text-sm">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mt-3 sm:mt-4">
                Participants must complete all 16 modules and pass each module-end quiz to become eligible for the certificate of completion.
              </p>
            </div>

            <div className="mb-6 sm:mb-8">
              <h3 className="text-base sm:text-lg font-semibold text-[#203f78] mb-3 sm:mb-4">Completion Criteria</h3>
              <p className="text-xs sm:text-sm text-gray-700">
                Complete all 16 modules, practice with hands-on lab documents, and pass the MCQ quiz at the end of each module to unlock the next module.
              </p>
            </div>

            <div className="mb-6 sm:mb-8">
              <h3 className="text-base sm:text-lg font-semibold text-[#203f78] mb-3 sm:mb-4">Certification*</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
                {[
                  'Participants who successfully complete all 16 modules and pass all module-end quizzes will receive a "Certificate of Completion" from Technoviz Automation.',
                  'Participants who complete some modules but not all will receive a "Certificate of Participation".',
                  'All certificates are auto-generated, portal-verifiable, and digitally signed.',
                ].map((text, i) => (
                  <li key={i} className="flex items-start"><span className="mr-2 flex-shrink-0">→</span><span>{text}</span></li>
                ))}
              </ul>
              <p className="text-xs text-gray-600 mt-3 sm:mt-4 italic">
                *Certificates will be issued by Technoviz Automation and are verifiable through the learning portal.
              </p>
            </div>

            <div className="mb-6 sm:mb-8">
              <div className="w-64 sm:w-80 md:w-96 mx-auto">
                <img src={certimg} alt="Technoviz Automation Certificate Sample" className="w-full h-auto" />
              </div>
            </div>

            <div className="absolute bottom-0 right-0 w-10 h-10 sm:w-12 sm:h-12">
              <div className="absolute bottom-0 right-0 w-10 sm:w-12 h-2 bg-[#203f78]"></div>
              <div className="absolute bottom-0 right-0 w-2 h-10 sm:h-12 bg-[#203f78]"></div>
            </div>
          </section>

          {/* CONTACT */}
          <section id="contact" className="bg-gradient-to-br from-[#203f78] to-[#2c5a9e] rounded-2xl p-6 sm:p-8 shadow-md text-white scroll-mt-24">
            <h2 className="text-lg sm:text-xl font-bold mb-4">Get In Touch</h2>
            <div className="space-y-3">
              <p className="flex items-center gap-3 text-sm sm:text-base">
                <Globe size={18} className="flex-shrink-0" />
                <a href={programmeData?.contact?.website || "#"} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-200 transition-colors break-all">
                  {programmeData?.contact?.website || "www.technovizautomation.com"}
                </a>
              </p>
              <p className="flex items-center gap-3 text-sm sm:text-base">
                <Mail size={18} className="flex-shrink-0" />
                <span className="break-all">{programmeData?.contact?.email || "contact@technovizautomation.com"}</span>
              </p>
            </div>
          </section>
        </div>

        {/* RIGHT SIDE - LOGIN FORM */}
        <div id="login-form" className="order-1 lg:order-2 w-full flex justify-center lg:sticky lg:top-24 self-start">
          <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
            <div className="flex justify-center mb-6 lg:hidden">
              <div className="w-20 h-20 flex items-center justify-center">
                <img src={biglogo} className="w-20 h-20 object-contain" alt="logo" />
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
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#203f78] focus:border-transparent transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  placeholder="Enter your email"
                  required
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
        </div>
      </div>
    </div>
  );
};

export default Login;