import { useEffect, useState, useRef } from 'react';
import {
  BookOpen,
  BookText,
  Trophy,
  ChevronRight,
  ChevronDown,
  CheckCircle,
  Circle,
  FileText,
  Menu,
  X,
  ArrowLeft,
  ArrowRight,
  Award,
  Lock,
  Layers,
  MessageSquare,
  PlayCircle,
  Tv
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { logout, getUser } from '../utils/auth';
import Navbar from '../components/navbar';
import { toast } from 'react-toastify';
import SupportSidebar from "../components/SupportSidebar";
import FeedbackModal from "../components/Feedbackmodal";
import avaimage from '../public/avatar2.png';
import CertificateModal from "../components/CertificateModal";
import CertificateLockedModal from "../components/CertificateLockedModal";
import Hls from "hls.js";

interface Page {
  id: number;
  title: string;
  order: number;
  completed: boolean;
  formatted_duration: string;
  video_url?: string | null;
}

interface MainContent {
  id: number;
  title: string;
  order: number;
  pages: Page[];
  quiz?: boolean;
}

interface Module {
  id: number;
  title: string;
  description: string;
  difficulty_level: string;
  topic: number;
  order: number;
  formatted_duration: string;
  completion_percentage?: number;
  main_contents?: MainContent[];
}

interface Topic {
  id: number;
  name: string;
  modules: Module[];
}

interface ProgressSummary {
  total_modules: number;
  completed_modules: number;
  in_progress_modules: number;
  not_started_modules: number;
}

interface PageDetail {
  id: number;
  title: string;
  content: string;
  order: number;
  completed: boolean;
  formatted_duration: string;
  main_content: {
    id: number;
  };
  video_url?: string | null;
}

interface Choice {
  id: number;
  text: string;
  is_correct?: boolean;
}

interface Question {
  id: number;
  text: string;
  choices: Choice[];
}

interface Quiz {
  id: number;
  questions: Question[];
}

interface QuizState {
  quiz: Quiz | null;
  answers: { [key: number]: string };
  hasSubmitted: boolean;
  quizResults: any;
  submitting: boolean;
}

const defaultQuizState = (): QuizState => ({
  quiz: null,
  answers: {},
  hasSubmitted: false,
  quizResults: null,
  submitting: false,
});


const DraggableFAB = ({ onOpen }: { onOpen: () => void }) => {
  const STORAGE_KEY = 'fab_position_y';
  const FAB_SIZE = 64;
  const MARGIN = 24;

  const getSavedY = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) return Number(saved);
    } catch { }
    return null;
  };

  const clampY = (y: number) => {
    const maxY = window.innerHeight - FAB_SIZE - MARGIN;
    return Math.max(MARGIN, Math.min(y, maxY));
  };

  const [posY, setPosY] = useState<number>(() => {
    const saved = getSavedY();
    if (saved !== null) return clampY(saved);
    return window.innerHeight - FAB_SIZE - MARGIN - 40;
  });

  const isDragging = useRef(false);
  const dragStartY = useRef(0);
  const dragStartPosY = useRef(0);
  const hasMoved = useRef(false);
  const fabRef = useRef<HTMLDivElement>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    hasMoved.current = false;
    dragStartY.current = e.clientY;
    dragStartPosY.current = posY;
    fabRef.current?.setPointerCapture(e.pointerId);
    e.preventDefault();
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const deltaY = e.clientY - dragStartY.current;
    if (Math.abs(deltaY) > 4) hasMoved.current = true;
    const newY = clampY(dragStartPosY.current + deltaY);
    setPosY(newY);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    try { localStorage.setItem(STORAGE_KEY, String(posY)); } catch { }
    if (!hasMoved.current) onOpen();
  };

  return (
    <div
      ref={fabRef}
      className="fixed right-6 z-40 flex flex-col items-center select-none"
      style={{ top: posY, touchAction: 'none', cursor: isDragging.current ? 'grabbing' : 'grab' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <div className="relative flex items-center justify-center">
        <span
          className="absolute w-16 h-16 rounded-full animate-ping opacity-20 pointer-events-none"
          style={{ background: "#2d5aa0" }}
        />
        <button
          className="w-16 h-16 rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110 hover:shadow-2xl active:scale-95"
          style={{ background: "linear-gradient(135deg, #0f2147 0%, #203f78 60%, #2d5aa0 100%)" }}
          title="Chat with Sathi"
          tabIndex={-1}
        >
          <img src={avaimage} alt="Sathi" className="w-14 h-14 object-contain pointer-events-none" />
        </button>
      </div>
      <span className="mt-2 text-sm font-semibold text-[#203f78] tracking-wide pointer-events-none">
        Study Buddy
      </span>
    </div>
  );
};

const StudentHome = () => {
  const [showOverview, setShowOverview] = useState(false);
  const OVERVIEW_VIDEO_URL = "https://drive.google.com/file/d/1Sy5bzG21LbuQJTrBNSeAyGQqbA0_WKgf/preview";
  const [topics, setTopics] = useState<Topic[]>([]);
  const [supportOpen, setSupportOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [certificateEligible, setCertificateEligible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [certificateOpen, setCertificateOpen] = useState(false);
  const [certificateLockedOpen, setCertificateLockedOpen] = useState(false);
  const [certificateUrl, setCertificateUrl] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());
  const [expandedMainContents, setExpandedMainContents] = useState<Set<number>>(new Set());
  const [hoveredPage, setHoveredPage] = useState<{ id: number; x: number; y: number } | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [progressSummary, setProgressSummary] = useState<ProgressSummary>({
    total_modules: 0,
    completed_modules: 0,
    in_progress_modules: 0,
    not_started_modules: 0,
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<PageDetail | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [pageLoading, setPageLoading] = useState(false);
  const [quizMap, setQuizMap] = useState<{ [mcId: number]: QuizState }>({});
  const [activeQuizMcId, setActiveQuizMcId] = useState<number | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [activeItem, setActiveItem] = useState<string | number | null>(null);
  const [canGoNext, setCanGoNext] = useState(true);
  const [defaultOpened, setDefaultOpened] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Video Ref for HLS Player
  const videoRef = useRef<HTMLVideoElement>(null);

  const navigate = useNavigate();
  const user = getUser();

  const moduleCompletionPercentage =
    progressSummary.total_modules > 0
      ? Math.round((progressSummary.completed_modules / progressSummary.total_modules) * 100)
      : 0;

  const getQuizState = (mcId: number): QuizState =>
    quizMap[mcId] || defaultQuizState();

  const updateQuizState = (mcId: number, patch: Partial<QuizState>) =>
    setQuizMap((prev) => ({
      ...prev,
      [mcId]: { ...(prev[mcId] || defaultQuizState()), ...patch },
    }));

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchCertificate = async () => {
    try {
      const res = await api.get('/accounts/certificate/');
      setCertificateUrl(res.data.certificate_url || res.data.url || null);
    } catch { }
  };

  const checkCertificateEligibility = async () => {
    try {
      const res = await api.get("/certificate/eligibility/");
      setCertificateEligible(res.data.eligible);
    } catch {
      setCertificateEligible(false);
    }
  };

  const openLastPage = async () => {

    try {

      const res = await api.get("/accounts/last-page/get/");

      const pageId = res.data?.page_id;

      // ✅ CASE 1 — restore last page
      if (pageId) {

        const pageRes = await api.get(`/pages/${pageId}`);

        setSelectedPage(pageRes.data);
        setActiveItem(pageId);

        const module = topics
          .flatMap(t => t.modules)
          .find(m =>
            m.main_contents?.some(mc =>
              mc.pages?.some(p => p.id === pageId)
            )
          );

        if (module) {

          setSelectedModuleId(module.id);

          setExpandedModules(new Set([module.id]));

          const mc = module.main_contents?.find(mc =>
            mc.pages?.some(p => p.id === pageId)
          );

          if (mc) {
            setExpandedMainContents(new Set([mc.id]));
            await fetchQuizForMc(mc.id);
          }
        }

      }

      // ✅ CASE 2 — no last page → open first module
      else {

        const firstModule = topics[0]?.modules?.[0];

        if (firstModule) {
          setExpandedModules(new Set([firstModule.id]));
        }

      }

    } catch (err) {
      console.warn("Could not restore last page", err);
    }

  };

  useEffect(() => {
    fetchData();
    fetchProgressSummary();
    fetchCertificate();
    checkCertificateEligibility();

  }, []);
  useEffect(() => {

    if (!topics.length) return;

    openLastPage();

  }, [topics]);

  // HLS Video Player Logic
  useEffect(() => {
    if (!selectedPage?.video_url || !videoRef.current) return;

    const video = videoRef.current;
    let hls: Hls | null = null;

    const setupVideo = () => {
      if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(selectedPage.video_url!);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setCanGoNext(false);
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = selectedPage.video_url!;
        setCanGoNext(false);
      }
    };

    setupVideo();

    return () => {
      if (hls) {
        hls.destroy();
      }
      if (video) {
        video.src = '';
        video.load();
      }
    };
  }, [selectedPage?.video_url]);

  // Enable Next button when video finishes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      setCanGoNext(true);
    };

    video.addEventListener('ended', handleEnded);
    return () => video.removeEventListener('ended', handleEnded);
  }, [selectedPage?.id]);

  const fetchData = async () => {
    try {
      const res = await api.get('/api/topics/');
      const topicsWithModules = res.data.map((topic: Topic) => ({
        ...topic,
        modules: topic.modules
          .map((m) => ({
            ...m,
            completion_percentage: m.completion_percentage || 0,
          }))
          .sort((a, b) => a.order - b.order),
      }));
      setTopics(topicsWithModules);
    } catch {
      toast.error('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchProgressSummary = async () => {
    try {
      const res = await api.get('/progress/summary/');
      setProgressSummary(res.data);
    } catch {
      toast.error('Failed to fetch progress summary');
    }
  };

  useEffect(() => {

    if (!selectedPage) return;

    const images = document.querySelectorAll(".zoomable");

    images.forEach((img) => {
      img.addEventListener("click", () => {
        const src = (img as HTMLImageElement).src;

        const overlay = document.createElement("div");
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.background = "rgba(0,0,0,0.8)";
        overlay.style.display = "flex";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";
        overlay.style.zIndex = "9999";

        const image = document.createElement("img");
        image.src = src;
        image.style.maxWidth = "90%";
        image.style.maxHeight = "90%";

        overlay.appendChild(image);

        overlay.onclick = () => document.body.removeChild(overlay);

        document.body.appendChild(overlay);
      });
    });
  }, [selectedPage]);
  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const fetchQuizForMc = async (mcId: number) => {
    if (quizMap[mcId]?.quiz !== undefined && quizMap[mcId]?.quiz !== null) return;
    try {
      const quizRes = await api.get(`/api/quizzes/?main_content=${mcId}`);
      const quizData = quizRes.data.length ? quizRes.data[0] : null;
      updateQuizState(mcId, { quiz: quizData });
    } catch { }
  };

  const toggleModuleExpand = async (moduleId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
      setExpandedModules(newExpanded);
    } else {
      try {
        const module = topics.flatMap((t) => t.modules).find((m) => m.id === moduleId);
        if (!module?.main_contents) {
          const res = await api.get(`/api/modules/${moduleId}/`);
          setTopics((prevTopics) =>
            prevTopics.map((topic) => ({
              ...topic,
              modules: topic.modules.map((m) =>
                m.id === moduleId ? { ...m, main_contents: res.data.main_contents } : m
              ),
            }))
          );
        }
        newExpanded.add(moduleId);
        setExpandedModules(newExpanded);
      } catch {
        toast.error('Failed to load module pages');
      }
    }
  };

  const toggleMainContentExpand = async (mcId: number) => {
    setExpandedMainContents((prev) => {
      const next = new Set(prev);
      if (next.has(mcId)) next.delete(mcId);
      else next.add(mcId);
      return next;
    });
    await fetchQuizForMc(mcId);
  };

  const handleModuleClick = (module: Module) => {
    if (!expandedModules.has(module.id)) {
      toggleModuleExpand(module.id, { stopPropagation: () => { } } as React.MouseEvent);
    }
  };

  const closeSidebarOnMobile = () => {
    if (isMobile) setSidebarOpen(false);
  };

  const handlePageClick = async (pageId: number, moduleId: number) => {
    setPageLoading(true);
    setShowQuiz(false);
    setActiveQuizMcId(null);
    setActiveItem(pageId);
    setSelectedModuleId(moduleId);
    closeSidebarOnMobile();

    try {
      await api.post("/accounts/last-page/save/", {
        page_id: pageId
      });
      const pageRes = await api.get(`/pages/${pageId}`);
      setSelectedPage(pageRes.data);
      const mcId = pageRes.data.main_content.id;
      await fetchQuizForMc(mcId);
      updateQuizState(mcId, {
        answers: {},
        hasSubmitted: false,
        quizResults: null,
      });
      setCanGoNext(!pageRes.data.video_url);

      setPageLoading(true);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to load page');
    } finally {
      setPageLoading(false);
    }
  };

  const completePage = async (pageId: number) => {
    try {
      await api.post(`/pages/${pageId}/complete/`);
      toast.success('Page marked as completed!');
      await fetchData();
      await fetchProgressSummary();
      await checkCertificateEligibility();
    } catch {
      toast.error('Failed to complete page');
    }
  };

  const handleNext = async () => {
    if (!selectedPage || !selectedModuleId || !canGoNext) return;
    await completePage(selectedPage.id);
    await fetchData();

    const updatedModule = topics.flatMap((t) => t.modules).find((m) => m.id === selectedModuleId);
    if (!updatedModule?.main_contents) return;

    const allPages = updatedModule.main_contents
      .sort((a, b) => a.order - b.order)
      .flatMap((mc) => (mc.pages || []).sort((a, b) => a.order - b.order));

    const currentIndex = allPages.findIndex((p) => p.id === selectedPage.id);
    if (currentIndex < allPages.length - 1) {
      await handlePageClick(allPages[currentIndex + 1].id, selectedModuleId);
    }
  };

  const handlePrevious = async () => {
    if (!selectedPage || !selectedModuleId) return;
    const currentModule = topics.flatMap((t) => t.modules).find((m) => m.id === selectedModuleId);
    if (!currentModule?.main_contents) return;

    const allPages = currentModule.main_contents
      .sort((a, b) => a.order - b.order)
      .flatMap((mc) => (mc.pages || []).sort((a, b) => a.order - b.order));

    const currentIndex = allPages.findIndex((p) => p.id === selectedPage.id);
    if (currentIndex > 0) {
      await handlePageClick(allPages[currentIndex - 1].id, selectedModuleId);
    }
  };

  const handleSubmitQuiz = async (mcId: number) => {
    const qs = getQuizState(mcId);
    if (!qs.quiz) return;
    if (Object.keys(qs.answers).length < qs.quiz.questions.length) {
      toast.error('Please answer all questions');
      return;
    }

    updateQuizState(mcId, { submitting: true, hasSubmitted: true });

    try {
      const response = await api.post(`/api/quizzes/${qs.quiz.id}/submit/`, { answers: qs.answers });
      updateQuizState(mcId, { quizResults: response.data, submitting: false });

      if (response.data.passed) {
        toast.success(`Quiz passed! Score: ${response.data.percentage}%`);
        await completeMainContent(mcId);
      } else {
        toast.error(`Quiz failed. Score: ${response.data.percentage}%. Review your answers below.`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to submit quiz');
      updateQuizState(mcId, { submitting: false });
    }
  };

  const completeMainContent = async (mcId: number) => {
    try {
      await api.post(`/maincontents/${mcId}/complete/`);
      toast.success('Section completed!');
      await fetchData();
      await fetchProgressSummary();
      await checkCertificateEligibility();
      setSelectedPage(null);
      setShowQuiz(false);
      setActiveQuizMcId(null);
      setActiveItem(null);
    } catch {
      toast.error('Failed to complete section');
    }
  };

  const filteredTopics = topics
    .map((topic) => ({
      ...topic,
      modules: topic.modules.filter(
        (m) =>
          m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          topic.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((topic) => topic.modules.length > 0);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [selectedPage?.id]);



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: '#203f78' }}
        />
      </div>
    );
  }

  const activeQS = activeQuizMcId ? getQuizState(activeQuizMcId) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar user={user} handleLogout={handleLogout} />

      <div className="flex flex-col h-[calc(100vh-64px)]">
        <div className="flex flex-1 overflow-hidden relative">
          {isMobile && sidebarOpen && (
            <div
              className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* SIDEBAR */}
          <div
            className={`
              ${isMobile
                ? `fixed top-[64px] left-0 h-[calc(100vh-64px)] z-40 transform transition-transform duration-300
                   ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
                : `relative transition-all duration-300 ${sidebarOpen ? 'w-80' : 'w-0'} overflow-hidden`
              }
              bg-white border-r border-gray-200 flex flex-col shadow-lg
              ${isMobile ? 'w-[85vw] max-w-sm' : ''}
            `}
          >
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              {isMobile && (
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              )}
              <div className="flex items-center gap-2 mb-3 pr-8">
                <BookOpen className="w-5 h-5 flex-shrink-0" style={{ color: '#203f78' }} />
                <h2
                  className="text-base font-bold break-words leading-snug"
                  style={{ color: '#203f78' }}
                >
                  {filteredTopics.length > 0 ? filteredTopics[0].name : 'Course'}
                </h2>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-1 space-y-3">
              <div className="px-3 pt-2 pb-1">
                <button
                  onClick={() => {
                    setShowOverview(true);
                    setSelectedPage(null);
                    setShowQuiz(false);
                    setActiveItem('overview');
                    setActiveQuizMcId(null);
                    closeSidebarOnMobile();
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all font-semibold text-sm border ${activeItem === 'overview'
                    ? 'bg-indigo-100 text-[#203f78] border-[#203f78]'
                    : 'bg-indigo-50 text-gray-700 border-gray-200 hover:text-[#203f78]'
                    }`}
                >
                  <Tv className="w-4 h-4 flex-shrink-0" />
                  Overview
                  <PlayCircle className="w-4 h-4 flex-shrink-0 ml-auto" />
                </button>
              </div>
              {filteredTopics.map((topic) => (
                <div key={topic.id} className="space-y-3">
                  {topic.modules.map((module) => {
                    const isModuleExpanded = expandedModules.has(module.id);
                    return (
                      <div key={module.id} className="mb-3">
                        <div
                          className="flex items-start gap-2 px-3 py-3 rounded-lg cursor-pointer transition-all hover:bg-indigo-50 group"
                          onClick={() => handleModuleClick(module)}
                        >
                          <button
                            onClick={(e) => toggleModuleExpand(module.id, e)}
                            className="p-1 hover:bg-blue-100 rounded transition-colors flex-shrink-0"
                          >
                            {isModuleExpanded ? (
                              <ChevronDown className="w-4 h-4 text-[#203f78]" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-indigo-600" />
                            )}
                          </button>
                          <Layers className="w-4 h-4 text-[#203f78] mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-800 break-words leading-snug">
                              {module.title}
                            </h4>
                          </div>
                        </div>

                        {isModuleExpanded && module.main_contents && (
                          <div className="ml-6 mt-1 space-y-2 border-l-2 border-gray-200 pl-3">
                            {module.main_contents
                              .sort((a, b) => a.order - b.order)
                              .map((mc, mcIndex) => {
                                const isFirstModule = topics.flatMap(t => t.modules)[0]?.id === module.id;
                                const isLocked = !isFirstModule || mcIndex >= 4;

                                const mcExpanded = expandedMainContents.has(mc.id);
                                const mcQuizState = getQuizState(mc.id);
                                const hasQuiz = !!mcQuizState.quiz;

                                return (
                                  <div key={mc.id}>
                                    {/* ── Section header row ── */}
                                    <div
                                      onClick={() => {
                                        if (isLocked) {
                                          toast.error('This section is not accessible yet.');
                                          return;
                                        }
                                        toggleMainContentExpand(mc.id);
                                      }}
                                      className={`flex items-center gap-2 py-2 px-2 rounded-lg transition-colors group ${isLocked
                                        ? 'cursor-not-allowed opacity-60'
                                        : 'cursor-pointer hover:bg-blue-50'
                                        }`}
                                    >
                                      {/* Icon: lock when inaccessible, chevron otherwise */}
                                      {isLocked ? (
                                        <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                      ) : mcExpanded ? (
                                        <ChevronDown className="w-4 h-4 text-[#203f78] flex-shrink-0" />
                                      ) : (
                                        <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-[#203f78] flex-shrink-0" />
                                      )}

                                      <BookText
                                        className={`w-4 h-4 flex-shrink-0 ${isLocked ? 'text-gray-400' : 'text-[#203f78]'
                                          }`}
                                      />

                                      <span
                                        className={`text-sm font-semibold transition-all ${isLocked ? 'text-gray-400' : 'text-[#203f78]'
                                          } ${mcExpanded && !isLocked
                                            ? 'break-words leading-snug'
                                            : 'truncate whitespace-nowrap overflow-hidden'
                                          }`}
                                      >
                                        {mc.title}
                                      </span>
                                    </div>

                                    {/* ── Pages + quiz (hidden when locked) ── */}
                                    {!isLocked && mcExpanded && (
                                      <div className="ml-3 mt-1 space-y-1">
                                        {mc.pages
                                          .sort((a, b) => a.order - b.order)
                                          .map((page) => {
                                            const isActive = activeItem === page.id;
                                            const locked = (page as any).locked;

                                            return (
                                              <div key={page.id} className="relative">
                                                <div
                                                  onMouseEnter={(e) =>
                                                    setHoveredPage({ id: page.id, x: e.clientX, y: e.clientY })
                                                  }
                                                  onMouseMove={(e) =>
                                                    setHoveredPage({ id: page.id, x: e.clientX, y: e.clientY })
                                                  }
                                                  onMouseLeave={() => setHoveredPage(null)}
                                                  onClick={() => {
                                                    if (locked) {
                                                      toast.error('Please complete the previous module first');
                                                      return;
                                                    }
                                                    handlePageClick(page.id, module.id);
                                                  }}
                                                  className={`relative flex items-center justify-between gap-2 pl-4 pr-2 py-2.5 rounded-lg transition-all group ${locked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                                                    } ${isActive ? 'bg-indigo-100' : 'hover:bg-indigo-50'}`}
                                                >
                                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                                    {page.completed ? (
                                                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                                    ) : locked ? (
                                                      <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                    ) : (
                                                      <Circle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                    )}
                                                    <FileText
                                                      className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#203f78]' : 'text-gray-400'
                                                        }`}
                                                    />
                                                    <span
                                                      className={`text-sm truncate block ${isActive ? 'text-[#203f78] font-semibold' : 'text-gray-600'
                                                        }`}
                                                    >
                                                      {page.title}
                                                    </span>
                                                  </div>
                                                  <span
                                                    className={`text-xs font-medium whitespace-nowrap flex-shrink-0 ${isActive ? 'text-[#203f78]' : 'text-gray-400'
                                                      }`}
                                                  >
                                                    {page.formatted_duration}
                                                  </span>
                                                </div>
                                              </div>
                                            );
                                          })}

                                        {hasQuiz && (
                                          <div className="relative">
                                            <div
                                              onClick={() => {
                                                setShowQuiz(true);
                                                setActiveQuizMcId(mc.id);
                                                setActiveItem(`quiz-${mc.id}`);
                                                setSelectedPage(null);
                                                closeSidebarOnMobile();
                                              }}
                                              className={`relative flex items-center gap-2 pl-4 pr-2 py-2.5 rounded-lg cursor-pointer transition-all mt-1 ${activeItem === `quiz-${mc.id}`
                                                ? 'bg-indigo-100 text-[#203f78] font-semibold'
                                                : 'text-gray-600 hover:bg-indigo-50'
                                                }`}
                                            >
                                              <Award
                                                className={`w-4 h-4 flex-shrink-0 ${activeItem === `quiz-${mc.id}` ? 'text-amber-600' : 'text-amber-500'
                                                  }`}
                                              />
                                              <span className="text-sm truncate block">Knowledge Check</span>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* Certificate */}
              <div className="shrink-0 px-3 py-2 border-t border-gray-200">
                <div
                  onClick={() => {
                    if (!certificateEligible) {
                      setCertificateLockedOpen(true);
                      return;
                    }
                    setCertificateOpen(true);
                    if (isMobile) setSidebarOpen(false);
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${certificateEligible ? "cursor-pointer hover:bg-indigo-50" : "cursor-pointer opacity-80"}`}
                  style={{ border: "1px solid #c7d4ee", borderLeft: "4px solid #203f78" }}
                >
                  <Award className="w-4 h-4 flex-shrink-0 text-[#203f78]" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-[#203f78]">My Certificate</span>
                    <p className="text-xs text-[#203f78]/60 truncate">View & download</p>
                  </div>
                  {certificateEligible ? (
                    <ChevronRight className="w-4 h-4 text-[#203f78]/40 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  ) : (
                    <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            {/* Top Bar */}
            <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-3 py-2.5 flex items-center justify-between shrink-0 shadow-sm gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-all border border-gray-200 flex-shrink-0"
                  title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
                >
                  {sidebarOpen && !isMobile ? (
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  ) : (
                    <Menu className="w-5 h-5 text-gray-600" />
                  )}
                </button>
                {selectedPage && !showQuiz && (
                  <h2 className="text-sm sm:text-base font-semibold text-[#203f78] truncate" title={selectedPage.title}>
                    {selectedPage.title}
                  </h2>
                )}
                {showQuiz && (
                  <h2 className="text-sm sm:text-base font-semibold text-amber-700 truncate">
                    Knowledge Check
                  </h2>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 px-2.5 py-1.5 rounded-xl shadow-sm">
                  <Trophy className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-bold text-yellow-800">
                    {moduleCompletionPercentage}%
                  </span>
                  <span className="text-xs text-yellow-600 hidden md:inline">
                    ({progressSummary.completed_modules}/{progressSummary.total_modules})
                  </span>
                </div>

                <button
                  onClick={() => setFeedbackOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-xl text-white text-sm font-semibold transition-all hover:brightness-110 shadow-sm"
                  style={{ background: "linear-gradient(135deg, #203f78 0%, #2d5aa0 100%)" }}
                >
                  <MessageSquare className="w-4 h-4 text-white" />
                  <span className="hidden sm:inline">Feedback</span>
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="h-full p-2 sm:p-4">
                {!selectedPage && !showQuiz && !showOverview && (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center max-w-sm px-6">
                      <div className="mb-6 relative">
                        <div className="absolute inset-0 bg-blue-100 rounded-full blur-3xl opacity-30" />
                        <BookOpen className="w-20 h-20 mx-auto text-gray-300 relative" />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold mb-3" style={{ color: '#203f78' }}>
                        Select a Page to Start Learning
                      </h3>
                      <p className="text-gray-500 text-sm sm:text-base mb-4">
                        {isMobile
                          ? 'Tap the menu icon to browse modules and select a page.'
                          : 'Choose a module from the sidebar and click on any page to begin.'}
                      </p>
                    </div>
                  </div>
                )}
                {showOverview && activeItem === 'overview' && (
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex flex-col h-[calc(100vh-130px)] sm:h-[calc(100vh-120px)]">
                    <div className="flex-1 p-2 sm:p-3 min-h-0">
                      <div className="relative w-full h-full border-2 border-gray-200 rounded-lg overflow-hidden bg-black shadow-sm">
                        <iframe
                          src={OVERVIEW_VIDEO_URL}
                          className="w-full h-full"
                          allow="autoplay"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Page Content with Video */}
                {!showQuiz && selectedPage && (
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex flex-col h-[calc(100vh-130px)] sm:h-[calc(100vh-120px)]">
                    <div className="flex-1 p-2 sm:p-3 min-h-0">
                      <div className="relative w-full h-full border-2 border-gray-200 rounded-lg overflow-hidden bg-black shadow-sm">
                        {pageLoading && (
                          <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-sm flex items-center justify-center">
                            <div
                              className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
                              style={{ borderColor: '#203f78' }}
                            />
                          </div>
                        )}

                        {selectedPage?.video_url ? (
                          <video
                            ref={videoRef}
                            controls
                            className="w-full h-full object-cover"
                            playsInline
                          />
                        ) : (
                          <div ref={contentRef} className="p-4 sm:p-6 overflow-y-auto h-full prose prose-sm sm:prose max-w-none bg-white">
                            <div dangerouslySetInnerHTML={{ __html: selectedPage?.content || '' }} />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Navigation Bar */}
                    <div className="shrink-0 px-3 py-2.5 bg-gray-50 border-t border-gray-200">
                      <div className="flex justify-between items-center gap-2">
                        <button
                          onClick={handlePrevious}
                          disabled={!selectedPage || !selectedModuleId || (() => {
                            const currentModule = topics.flatMap((t) => t.modules).find((m) => m.id === selectedModuleId);
                            if (!currentModule?.main_contents) return true;
                            const allPages = currentModule.main_contents
                              .sort((a, b) => a.order - b.order)
                              .flatMap((mc) => (mc.pages || []).sort((a, b) => a.order - b.order));
                            const currentIndex = allPages.findIndex((p) => p.id === selectedPage.id);
                            return currentIndex <= 0;
                          })()}
                          className="flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-all font-semibold border-2 border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span className="hidden xs:inline">Previous</span>
                        </button>

                        {(() => {
                          if (!selectedPage || !selectedModuleId) return null;
                          const currentModule = topics.flatMap((t) => t.modules).find((m) => m.id === selectedModuleId);
                          if (!currentModule?.main_contents) return null;

                          const allPages = currentModule.main_contents
                            .sort((a, b) => a.order - b.order)
                            .flatMap((mc) => (mc.pages || []).sort((a, b) => a.order - b.order));

                          const currentIndex = allPages.findIndex((p) => p.id === selectedPage.id);
                          const currentMc = currentModule.main_contents.find((mc) => mc.id === selectedPage.main_content.id);
                          const currentMcPages = (currentMc?.pages || []).sort((a, b) => a.order - b.order);
                          const isLastPageOfMc = currentMcPages.findIndex((p) => p.id === selectedPage.id) === currentMcPages.length - 1;

                          const buttonBase = `flex items-center justify-center gap-1.5 px-4 sm:px-6 py-2 rounded-lg transition-all font-semibold text-xs sm:text-sm shadow-sm`;

                          if (isLastPageOfMc) {
                            const mcId = selectedPage.main_content.id;
                            const mcQuizState = getQuizState(mcId);
                            const hasQuiz = !!mcQuizState.quiz;

                            if (hasQuiz) {
                              return (
                                <button
                                  onClick={async () => {
                                    if (!canGoNext) return;
                                    await completePage(selectedPage.id);
                                    setShowQuiz(true);
                                    setActiveQuizMcId(mcId);
                                    setActiveItem(`quiz-${mcId}`);
                                  }}
                                  disabled={!canGoNext}
                                  className={`${buttonBase} ${canGoNext ? 'text-white hover:shadow-lg' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                                  style={canGoNext ? { background: 'linear-gradient(135deg, #203f78 0%, #2d5aa0 100%)' } : {}}
                                >
                                  Continue to Quiz <ArrowRight className="w-4 h-4" />
                                </button>
                              );
                            }

                            return (
                              <button
                                onClick={() => completeMainContent(selectedPage.main_content.id)}
                                disabled={!canGoNext}
                                className={`${buttonBase} ${canGoNext ? 'text-white hover:shadow-lg' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                                style={canGoNext ? { background: 'linear-gradient(135deg, #203f78 0%, #2d5aa0 100%)' } : {}}
                              >
                                Finish <CheckCircle className="w-4 h-4" />
                              </button>
                            );
                          }

                          return (
                            <button
                              onClick={handleNext}
                              disabled={!canGoNext}
                              className={`${buttonBase} ${canGoNext ? 'text-white hover:shadow-lg' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                              style={canGoNext ? { background: 'linear-gradient(135deg, #203f78 0%, #2d5aa0 100%)' } : {}}
                            >
                              Next <ArrowRight className="w-4 h-4" />
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}
                {/* Quiz view */}
                {showQuiz && activeQuizMcId && activeQS && activeQS.quiz && (
                  <div className="w-full pb-6">

                    <div
                      className="relative rounded-xl overflow-hidden mb-4 shadow-md"
                      style={{ background: 'linear-gradient(135deg, #0f2147 0%, #203f78 60%, #2d5aa0 100%)' }}
                    >
                      <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-10 bg-white" />
                      <div className="relative z-10 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}
                          >
                            <Award className="w-4 h-4 text-white" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold tracking-widest uppercase text-blue-200 leading-none mb-0.5">Assessment</p>
                            <h1 className="text-lg sm:text-xl font-bold text-white leading-tight">Knowledge Check</h1>
                            <p className="text-xs text-blue-200 mt-0.5 font-medium hidden sm:block">Read each question carefully and choose the best answer.</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span
                            className="text-xs font-semibold px-2.5 py-1 rounded-full"
                            style={{ background: 'rgba(255,255,255,0.15)', color: '#bfdbfe' }}
                          >
                            {Object.keys(activeQS.answers).length}/{activeQS.quiz.questions.length} answered
                          </span>
                          {activeQS.hasSubmitted && activeQS.quizResults && (
                            <span
                              className="text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"
                              style={{
                                background: activeQS.quizResults.passed ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)',
                                color: activeQS.quizResults.passed ? '#6ee7b7' : '#fca5a5',
                                border: `1px solid ${activeQS.quizResults.passed ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`,
                              }}
                            >
                              {activeQS.quizResults.passed
                                ? <><CheckCircle className="w-3 h-3" /> Passed &middot; {activeQS.quizResults.percentage}%</>
                                : <><X className="w-3 h-3" /> Failed &middot; {activeQS.quizResults.percentage}%</>}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {activeQS.quiz.questions.map((question, index) => {
                        const result = activeQS.quizResults?.results?.find(
                          (r: any) => r.question_id === question.id
                        );
                        const isSubmitted = activeQS.hasSubmitted && !!result;
                        const questionAnswered = !!activeQS.answers[question.id];

                        return (
                          <div
                            key={question.id}
                            className="bg-white rounded-xl shadow-sm border overflow-hidden transition-all"
                            style={{
                              borderColor: isSubmitted
                                ? result.is_correct ? '#10b981' : '#ef4444'
                                : questionAnswered ? '#203f78' : '#e5e7eb',
                            }}
                          >
                            <div
                              className="flex items-center gap-3 px-4 py-3"
                              style={{
                                background: isSubmitted
                                  ? result.is_correct ? '#f0fdf4' : '#fef2f2'
                                  : questionAnswered ? '#eff6ff' : '#f9fafb',
                                borderBottom: '1px solid',
                                borderColor: isSubmitted
                                  ? result.is_correct ? '#d1fae5' : '#fecaca'
                                  : questionAnswered ? '#dbeafe' : '#f3f4f6',
                              }}
                            >
                              <div
                                className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                style={{
                                  background: isSubmitted
                                    ? result.is_correct ? '#10b981' : '#ef4444'
                                    : '#203f78',
                                }}
                              >
                                {index + 1}
                              </div>
                              <p className="font-semibold text-gray-800 text-sm sm:text-base leading-snug flex-1">
                                {question.text}
                              </p>
                              {isSubmitted && (
                                result.is_correct
                                  ? <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                  : <X className="w-4 h-4 text-red-500 flex-shrink-0" />
                              )}
                            </div>

                            <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {question.choices.map((choice, ci) => {
                                const optionLetters = ['A', 'B', 'C', 'D', 'E'];
                                const isUserAnswer = String(activeQS.answers[question.id]) === String(choice.id);
                                const isCorrect = choice.is_correct;
                                const showCorrect = isSubmitted && isUserAnswer && isCorrect;
                                const showWrong = isSubmitted && isUserAnswer && !isCorrect;

                                let borderColor = '#e5e7eb';
                                let bgColor = '#fff';
                                let textColor = '#374151';
                                let letterBg = '#f3f4f6';
                                let letterColor = '#6b7280';

                                if (showCorrect) {
                                  borderColor = '#10b981'; bgColor = '#ecfdf5'; textColor = '#065f46';
                                  letterBg = '#10b981'; letterColor = '#fff';
                                } else if (showWrong) {
                                  borderColor = '#ef4444'; bgColor = '#fef2f2'; textColor = '#991b1b';
                                  letterBg = '#ef4444'; letterColor = '#fff';
                                } else if (isUserAnswer && !isSubmitted) {
                                  borderColor = '#203f78'; bgColor = '#eff6ff'; textColor = '#203f78';
                                  letterBg = '#203f78'; letterColor = '#fff';
                                }

                                return (
                                  <label
                                    key={choice.id}
                                    className="flex items-center gap-2 p-3 rounded-lg transition-all duration-150 active:scale-[0.98]"
                                    style={{
                                      border: `1.5px solid ${borderColor}`,
                                      background: bgColor,
                                      cursor: isSubmitted ? 'default' : 'pointer',
                                      minHeight: '48px',
                                    }}
                                  >
                                    <input
                                      type="radio"
                                      name={`question-${question.id}`}
                                      value={choice.id}
                                      checked={isUserAnswer}
                                      onChange={() => {
                                        if (!activeQS.hasSubmitted) {
                                          updateQuizState(activeQuizMcId, {
                                            answers: {
                                              ...activeQS.answers,
                                              [question.id]: String(choice.id),
                                            },
                                          });
                                        }
                                      }}
                                      disabled={activeQS.hasSubmitted}
                                      className="sr-only"
                                    />
                                    <span
                                      className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0"
                                      style={{ background: letterBg, color: letterColor }}
                                    >
                                      {optionLetters[ci] || ci + 1}
                                    </span>
                                    <span className="flex-1 text-sm font-medium leading-snug" style={{ color: textColor }}>
                                      {choice.text}
                                    </span>
                                    {showCorrect && <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />}
                                    {showWrong && <X className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />}
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-5 flex gap-3">
                      {activeQS.hasSubmitted ? (
                        <>
                          {activeQS.quizResults && !activeQS.quizResults.passed && (
                            <button
                              onClick={() =>
                                updateQuizState(activeQuizMcId, {
                                  answers: {},
                                  hasSubmitted: false,
                                  quizResults: null,
                                })
                              }
                              className="flex-1 py-3 rounded-lg font-bold text-white text-sm transition-all hover:opacity-90 hover:shadow-md active:scale-[0.98]"
                              style={{ background: 'linear-gradient(135deg, #0f2147 0%, #203f78 100%)' }}
                            >
                              Try Again
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setShowQuiz(false);
                              setActiveQuizMcId(null);
                              setActiveItem(null);
                              if (activeQuizMcId) {
                                updateQuizState(activeQuizMcId, {
                                  answers: {},
                                  hasSubmitted: false,
                                  quizResults: null,
                                });
                              }
                            }}
                            className="flex-1 py-3 rounded-lg font-semibold text-sm transition-all hover:shadow-sm active:scale-[0.98]"
                            style={{ background: '#f1f5f9', color: '#334155', border: '1.5px solid #e2e8f0' }}
                          >
                            ← Back to Lessons
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleSubmitQuiz(activeQuizMcId)}
                          disabled={
                            activeQS.submitting ||
                            Object.keys(activeQS.answers).length < (activeQS.quiz?.questions.length || 0)
                          }
                          className="flex-1 py-3 rounded-lg font-bold text-sm text-white transition-all hover:opacity-90 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                          style={{ background: 'linear-gradient(135deg, #0f2147 0%, #203f78 60%, #2d5aa0 100%)' }}
                        >
                          {activeQS.submitting ? (
                            <span className="flex items-center justify-center gap-2">
                              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                              </svg>
                              Submitting...
                            </span>
                          ) : (
                            `Submit Quiz (${Object.keys(activeQS.answers).length}/${activeQS.quiz?.questions.length})`
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FLOATING SUPPORT BUTTON (FAB) ── */}
      <DraggableFAB onOpen={() => setSupportOpen(true)} />

      <SupportSidebar
        open={supportOpen}
        onClose={() => setSupportOpen(false)}
      />

      <FeedbackModal
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
      />
      <CertificateLockedModal
        open={certificateLockedOpen}
        onClose={() => setCertificateLockedOpen(false)}
      />

      <CertificateModal
        open={certificateOpen}
        onClose={() => setCertificateOpen(false)}
        certificateUrl={certificateUrl}
      />
    </div >
  );
};

export default StudentHome;