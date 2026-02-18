import { useEffect, useState, useRef } from 'react';
import {
  Search,
  BookOpen,
  Clock,
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
  Target,
  Lock,
  Layers,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { logout, getUser } from '../utils/auth';
import Navbar from '../components/navbar';
import { toast } from 'react-toastify';

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

// Quiz state per main_content id
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

const StudentHome = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasVideo, setHasVideo] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());
  const [expandedMainContents, setExpandedMainContents] = useState<Set<number>>(new Set());
  const [progressSummary, setProgressSummary] = useState<ProgressSummary>({
    total_modules: 0,
    completed_modules: 0,
    in_progress_modules: 0,
    not_started_modules: 0,
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedPage, setSelectedPage] = useState<PageDetail | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [pageLoading, setPageLoading] = useState(false);

  // Per-mc quiz map: mcId -> QuizState
  const [quizMap, setQuizMap] = useState<{ [mcId: number]: QuizState }>({});
  // Which mc's quiz is currently being shown
  const [activeQuizMcId, setActiveQuizMcId] = useState<number | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);

  const [activeItem, setActiveItem] = useState<string | number | null>(null);
  const [canGoNext, setCanGoNext] = useState(true);
  const [defaultOpened, setDefaultOpened] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const navigate = useNavigate();
  const user = getUser();

  const moduleCompletionPercentage =
    progressSummary.total_modules > 0
      ? Math.round((progressSummary.completed_modules / progressSummary.total_modules) * 100)
      : 0;

  // Helper: get quiz state for a mc, with fallback
  const getQuizState = (mcId: number): QuizState =>
    quizMap[mcId] || defaultQuizState();

  // Helper: update quiz state for a mc
  const updateQuizState = (mcId: number, patch: Partial<QuizState>) =>
    setQuizMap((prev) => ({
      ...prev,
      [mcId]: { ...(prev[mcId] || defaultQuizState()), ...patch },
    }));

  useEffect(() => {

    fetchData();
    fetchProgressSummary();
  }, []);

  useEffect(() => {
    const scriptId = 'bunny-playerjs-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://assets.mediadelivery.net/playerjs/playerjs-latest.min.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    setHasVideo(!!selectedPage?.video_url);
    setCanGoNext(!selectedPage?.video_url || selectedPage?.completed);

    if (!selectedPage?.video_url) return;

    const iframe = iframeRef.current;
    if (!iframe) return;

    let player: any;
    let maxWatchedTime = 0;
    let duration = 0;
    let videoFinished = false;

    const initializePlayer = () => {
      if (!(window as any).playerjs) return;

      player = new (window as any).playerjs.Player(iframe);

      player.on("ready", () => {
        console.log("Player Ready");

        player.getDuration((d: number) => {
          duration = d;
          console.log("Duration:", duration);
        });

        // 🔥 MAIN SKIP PROTECTION
        player.on("timeupdate", (data: any) => {
          const current = data.seconds;

          // Block forward skipping
          if (!videoFinished && current > maxWatchedTime + 1) {
            console.log("Skip attempt blocked 🚫");
            player.setCurrentTime(maxWatchedTime);
            return;
          }

          // Update watched progress
          if (current > maxWatchedTime) {
            maxWatchedTime = current;
          }
        });

        // Extra protection for manual seeking
        player.on("seeked", (data: any) => {
          const current = data.seconds;

          if (!videoFinished && current > maxWatchedTime + 1) {
            console.log("Seek blocked 🚫");
            player.setCurrentTime(maxWatchedTime);
          }
        });

        // Enable next when truly finished
        player.on("ended", () => {
          console.log("VIDEO FINISHED 🔥");

          videoFinished = true;
          maxWatchedTime = duration;
          setCanGoNext(true);
        });
      });
    };

    const checkInterval = setInterval(() => {
      if ((window as any).playerjs) {
        clearInterval(checkInterval);
        initializePlayer();
      }
    }, 200);

    return () => {
      clearInterval(checkInterval);
      if (player) {
        try {
          player.off("timeupdate");
          player.off("seeked");
          player.off("ended");
        } catch { }
      }
    };
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
            time_duration: m.formatted_duration || '',
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

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const isModuleLocked = (module: Module) => {
    const topic = topics.find((t) => t.modules.some((m) => m.id === module.id));
    if (!topic) return false;
    const sortedModules = [...topic.modules].sort((a, b) => a.order - b.order);
    const moduleIndex = sortedModules.findIndex((m) => m.id === module.id);
    if (moduleIndex === 0) return false;
    const prevModule = sortedModules[moduleIndex - 1];
    return (prevModule.completion_percentage ?? 0) < 100;
  };

  const fetchQuizForMc = async (mcId: number) => {
    // Don't re-fetch if already loaded
    if (quizMap[mcId]?.quiz !== undefined && quizMap[mcId]?.quiz !== null) return;
    try {
      const quizRes = await api.get(`/api/quizzes/?main_content=${mcId}`);
      const quizData = quizRes.data.length ? quizRes.data[0] : null;
      updateQuizState(mcId, { quiz: quizData });
    } catch {
      // silently fail – section may not have a quiz
    }
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
      if (next.has(mcId)) {
        next.delete(mcId);
      } else {
        next.add(mcId);
      }
      return next;
    });

    // Auto-fetch quiz for this mc so the sidebar item renders immediately
    await fetchQuizForMc(mcId);
  };

  const handleModuleClick = (module: Module) => {
    if (!expandedModules.has(module.id)) {
      toggleModuleExpand(module.id, { stopPropagation: () => { } } as React.MouseEvent);
    }
  };

  const handlePageClick = async (pageId: number, moduleId: number) => {
    setPageLoading(true);
    setShowQuiz(false);
    setActiveQuizMcId(null);
    setActiveItem(pageId);
    setSelectedModuleId(moduleId);
    try {
      const pageRes = await api.get(`/pages/${pageId}`);
      setSelectedPage(pageRes.data);

      const mcId = pageRes.data.main_content.id;

      // Fetch quiz for this mc (no-op if already loaded)
      await fetchQuizForMc(mcId);

      // Reset answer state for this mc on new page load
      updateQuizState(mcId, {
        answers: {},
        hasSubmitted: false,
        quizResults: null,
      });
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
    if (filteredTopics.length > 0 && !defaultOpened) {
      const firstModule = filteredTopics[0]?.modules?.[0];
      if (firstModule) {
        setExpandedModules(new Set([firstModule.id]));
        setDefaultOpened(true);
      }
    }
  }, [filteredTopics, defaultOpened]);

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

  // Active quiz state (for the quiz panel)
  const activeQS = activeQuizMcId ? getQuizState(activeQuizMcId) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar user={user} handleLogout={handleLogout} />

      <div className="flex flex-col h-[calc(100vh-64px)]">
        <div className="flex flex-1 overflow-hidden">
          {/* SIDEBAR */}
          <div
            className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden bg-white border-r border-gray-200 flex flex-col shadow-lg`}
          >
            <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5" style={{ color: '#203f78' }} />
                <h2
                  className="text-lg font-bold break-words leading-snug"
                  style={{ color: '#203f78' }}
                >
                  {filteredTopics.length > 0 ? filteredTopics[0].name : 'Course'}
                </h2>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search modules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-1 space-y-3">
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
                            className="p-0.5 hover:bg-blue-100 rounded transition-colors"
                          >
                            {isModuleExpanded ? (
                              <ChevronDown className="w-4 h-4 text-[#203f78]" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-indigo-600" />
                            )}
                          </button>
                          <Layers className="w-4 h-4 text-[#203f78] mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-gray-800 break-words leading-snug">
                              {module.title}
                            </h4>
                          </div>
                        </div>

                        {isModuleExpanded && module.main_contents && (
                          <div className="ml-6 mt-2 space-y-3 border-l-2 border-gray-200 pl-4">
                            {module.main_contents
                              .sort((a, b) => a.order - b.order)
                              .map((mc, mcIndex, mcArr) => {
                                const mcExpanded = expandedMainContents.has(mc.id);
                                const mcQuizState = getQuizState(mc.id);
                                const hasQuiz = !!mcQuizState.quiz;

                                return (
                                  <div key={mc.id}>
                                    <div
                                      onClick={() => toggleMainContentExpand(mc.id)}
                                      className="flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors group"
                                    >
                                      {mcExpanded ? (
                                        <ChevronDown className="w-4 h-4 text-[#203f78] flex-shrink-0" />
                                      ) : (
                                        <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-[#203f78] flex-shrink-0" />
                                      )}
                                      <BookText className="w-4 h-4 text-[#203f78] flex-shrink-0" />
                                      {(() => {
                                        const isLab = /lab/i.test(mc.title);
                                        const moduleNumber = mcArr
                                          .slice(0, mcIndex + 1)
                                          .filter((item) => !/lab/i.test(item.title)).length;
                                        return (
                                          <span
                                            className={`text-sm font-semibold text-[#203f78] transition-all ${mcExpanded
                                              ? 'break-words leading-snug'
                                              : 'truncate whitespace-nowrap overflow-hidden'
                                              }`}
                                          >
                                            {isLab ? mc.title : `Module ${moduleNumber}: ${mc.title}`}
                                          </span>
                                        );
                                      })()}
                                    </div>

                                    {mcExpanded && (
                                      <div className="ml-3 mt-1 space-y-1">
                                        {mc.pages
                                          .sort((a, b) => a.order - b.order)
                                          .map((page) => {
                                            const isActive = activeItem === page.id;
                                            const locked = (page as any).locked;
                                            return (
                                              <div key={page.id} className="relative">
                                                <div
                                                  className="absolute left-0 top-1/2 h-px w-3 bg-gray-300"
                                                  style={{ transform: 'translateY(-50%)' }}
                                                />
                                                <div
                                                  onClick={async () => {
                                                    if (locked) {
                                                      toast.error('Please complete the previous module first');
                                                      return;
                                                    }
                                                    await handlePageClick(page.id, module.id);
                                                  }}
                                                  className={`relative flex items-center justify-between gap-3 pl-4 pr-3 py-2 rounded-lg transition-all group ${locked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                                                    } ${isActive ? 'bg-indigo-100' : 'hover:bg-indigo-50'}`}
                                                >
                                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    {page.completed ? (
                                                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                                    ) : locked ? (
                                                      <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                    ) : (
                                                      <Circle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                    )}
                                                    <FileText
                                                      className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#203f78]' : 'text-gray-400'}`}
                                                    />
                                                    <span
                                                      className={`text-sm truncate block ${isActive ? 'text-[#203f78] font-semibold' : 'text-gray-500'}`}
                                                    >
                                                      {page.title}
                                                    </span>
                                                  </div>
                                                  <span
                                                    className={`text-xs font-medium whitespace-nowrap ${isActive ? 'text-[#203f78]' : 'text-gray-500'}`}
                                                  >
                                                    {page.formatted_duration}
                                                  </span>
                                                </div>
                                              </div>
                                            );
                                          })}

                                        {/* Quiz sidebar item — shown as soon as quiz is fetched */}
                                        {hasQuiz && (
                                          <div className="relative">
                                            <div
                                              className="absolute left-0 top-1/2 h-px w-3 bg-gray-300"
                                              style={{ transform: 'translateY(-50%)' }}
                                            />
                                            <div
                                              onClick={() => {
                                                setShowQuiz(true);
                                                setActiveQuizMcId(mc.id);
                                                setActiveItem(`quiz-${mc.id}`);
                                                setSelectedPage(null);
                                              }}
                                              className={`relative flex items-center gap-3 pl-4 pr-3 py-2 rounded-lg cursor-pointer transition-all mt-1 ${activeItem === `quiz-${mc.id}`
                                                ? 'bg-indigo-100 text-[#203f78] font-semibold'
                                                : 'text-gray-600 hover:bg-indigo-50'
                                                }`}
                                            >
                                              <Award
                                                className={`w-4 h-4 flex-shrink-0 ${activeItem === `quiz-${mc.id}` ? 'text-amber-600' : 'text-amber-500'}`}
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
            </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0 shadow-sm">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-all border border-gray-200"
                  title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
                >
                  {sidebarOpen ? (
                    <X className="w-5 h-5 text-gray-600" />
                  ) : (
                    <Menu className="w-5 h-5 text-gray-600" />
                  )}
                </button>
                {selectedPage && !showQuiz && (
                  <h2
                    className="text-base sm:text-lg font-semibold text-[#203f78] truncate max-w-[500px]"
                    title={selectedPage.title}
                  >
                    {selectedPage.title}
                  </h2>
                )}
                {showQuiz && (
                  <h2 className="text-base sm:text-lg font-semibold text-amber-700 truncate max-w-[500px]">
                    Knowledge Check
                  </h2>
                )}
              </div>
              <div className="flex items-center gap-3 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 px-4 py-2 rounded-xl shadow-sm">
                <Trophy className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-bold text-yellow-800">
                  {moduleCompletionPercentage}% Completed
                </span>
                <span className="text-xs text-yellow-700">
                  ({progressSummary.completed_modules}/{progressSummary.total_modules} Modules)
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto relative">
              <div className="max-w-full h-full p-2 sm:p-4">
                {/* Nothing selected */}
                {!selectedPage && !showQuiz && (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center max-w-md px-6">
                      <div className="mb-6 relative">
                        <div className="absolute inset-0 bg-blue-100 rounded-full blur-3xl opacity-30" />
                        <BookOpen className="w-24 h-24 mx-auto text-gray-300 relative" />
                      </div>
                      <h3 className="text-2xl font-bold mb-3" style={{ color: '#203f78' }}>
                        Select a Page to Start Learning
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Choose a module from the sidebar and click on any page to begin your learning journey
                      </p>
                    </div>
                  </div>
                )}

                {/* Page view */}
                {!showQuiz && selectedPage && (
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden h-[calc(100vh-120px)]">
                    <div className="h-[calc(100%-70px)] p-2 sm:p-4">
                      <div className="relative w-full h-full border-2 border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                        {pageLoading && (
                          <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-sm flex items-center justify-center">
                            <div
                              className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
                              style={{ borderColor: '#203f78' }}
                            />
                          </div>
                        )}

                        {selectedPage?.video_url ? (
                          <iframe
                            ref={iframeRef}
                            src={selectedPage.video_url}
                            className="w-full h-full border-0"
                            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture;"
                            allowFullScreen
                          />
                        ) : (
                          <div className="p-6 overflow-y-auto h-full">
                            <div dangerouslySetInnerHTML={{ __html: selectedPage?.content || '' }} />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="h-[70px] p-3 bg-gray-50 border-t border-gray-200">
                      <div className="flex justify-between items-center gap-3">
                        <button
                          onClick={handlePrevious}
                          disabled={
                            !selectedPage ||
                            !selectedModuleId ||
                            (() => {
                              const currentModule = topics
                                .flatMap((t) => t.modules)
                                .find((m) => m.id === selectedModuleId);
                              if (!currentModule?.main_contents) return true;
                              const allPages = currentModule.main_contents
                                .sort((a, b) => a.order - b.order)
                                .flatMap((mc) => (mc.pages || []).sort((a, b) => a.order - b.order));
                              const currentIndex = allPages.findIndex((p) => p.id === selectedPage.id);
                              return currentIndex <= 0;
                            })()
                          }
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-all font-semibold border-2 border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          Previous
                        </button>

                        {(() => {
                          if (!selectedPage || !selectedModuleId) return null;
                          const currentModule = topics
                            .flatMap((t) => t.modules)
                            .find((m) => m.id === selectedModuleId);
                          if (!currentModule?.main_contents) return null;

                          const allPages = currentModule.main_contents
                            .sort((a, b) => a.order - b.order)
                            .flatMap((mc) => (mc.pages || []).sort((a, b) => a.order - b.order));

                          const currentIndex = allPages.findIndex((p) => p.id === selectedPage.id);
                          const isLastPage = currentIndex === allPages.length - 1;

                          // Last page within the current main content section
                          const currentMc = currentModule.main_contents.find(
                            (mc) => mc.id === selectedPage.main_content.id
                          );
                          const currentMcPages = (currentMc?.pages || []).sort((a, b) => a.order - b.order);
                          const currentMcIndex = currentMcPages.findIndex((p) => p.id === selectedPage.id);
                          const isLastPageOfMc = currentMcIndex === currentMcPages.length - 1;

                          const buttonBase = `flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg transition-all font-semibold text-sm shadow-sm`;

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
                                  className={`${buttonBase} ${canGoNext
                                    ? 'text-white hover:shadow-lg'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                  style={
                                    canGoNext
                                      ? { background: 'linear-gradient(135deg, #203f78 0%, #2d5aa0 100%)' }
                                      : {}
                                  }
                                >
                                  Continue to Quiz <ArrowRight className="w-4 h-4" />
                                </button>
                              );
                            }

                            return (
                              <button
                                onClick={() => completeMainContent(selectedPage.main_content.id)}
                                disabled={!canGoNext}
                                className={`${buttonBase} ${canGoNext
                                  ? 'text-white hover:shadow-lg'
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  }`}
                                style={
                                  canGoNext
                                    ? { background: 'linear-gradient(135deg, #203f78 0%, #2d5aa0 100%)' }
                                    : {}
                                }
                              >
                                Finish <CheckCircle className="w-4 h-4" />
                              </button>
                            );
                          }

                          return (
                            <button
                              onClick={handleNext}
                              disabled={!canGoNext}
                              className={`${buttonBase} ${canGoNext
                                ? 'text-white hover:shadow-lg'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                              style={
                                canGoNext
                                  ? { background: 'linear-gradient(135deg, #203f78 0%, #2d5aa0 100%)' }
                                  : {}
                              }
                            >
                              Next <ArrowRight className="w-4 h-4" />
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}

                {/* Quiz view — compact full-width */}
                {showQuiz && activeQuizMcId && activeQS && activeQS.quiz && (
                  <div className="w-full pb-6">

                    {/* Header — compact */}
                    <div
                      className="relative rounded-xl overflow-hidden mb-4 shadow-md"
                      style={{ background: 'linear-gradient(135deg, #0f2147 0%, #203f78 60%, #2d5aa0 100%)' }}
                    >
                      <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-10 bg-white" />
                      <div className="relative z-10 px-5 py-3.5 flex items-center gap-4">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}
                        >
                          <Award className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-semibold tracking-widest uppercase text-blue-200 leading-none mb-0.5">Assessment</p>
                          <h1 className="text-base font-bold text-white leading-tight">Knowledge Check</h1>
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

                    {/* Questions */}
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
                            {/* Question row */}
                            <div
                              className="flex items-center gap-3 px-4 py-2.5"
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
                              <p className="font-semibold text-gray-800 text-sm leading-snug flex-1">
                                {question.text}
                              </p>
                              {isSubmitted && (
                                result.is_correct
                                  ? <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                  : <X className="w-4 h-4 text-red-500 flex-shrink-0" />
                              )}
                            </div>

                            {/* Choices — 2-column grid */}
                            <div className="p-3 grid grid-cols-2 gap-2">
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
                                    className="flex items-center gap-2 p-2.5 rounded-lg transition-all duration-150"
                                    style={{
                                      border: `1.5px solid ${borderColor}`,
                                      background: bgColor,
                                      cursor: isSubmitted ? 'default' : 'pointer',
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
                                      className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0"
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

                    {/* Footer actions */}
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
                              className="flex-1 py-2.5 rounded-lg font-bold text-white text-sm transition-all hover:opacity-90 hover:shadow-md active:scale-[0.98]"
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
                            className="flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all hover:shadow-sm active:scale-[0.98]"
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
    </div>
  );
};

export default StudentHome;