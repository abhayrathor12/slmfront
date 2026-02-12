import { useEffect, useState } from 'react';
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

// Assuming you already have toast imported & configured globally or here
import { toast } from 'react-toastify';// ← adjust if you're using react-toastify

interface Page {
  id: number;
  title: string;
  order: number;
  completed: boolean;
  formatted_duration: string;
}

interface MainContent {
  id: number;
  title: string;
  order: number;
  pages: Page[];
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

const StudentHome = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
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
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [quizResults, setQuizResults] = useState<any>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [canGoNext, setCanGoNext] = useState(true);
  const [hasVideo, setHasVideo] = useState(false);

  const [defaultOpened, setDefaultOpened] = useState(false);
  const navigate = useNavigate();
  const user = getUser();

  const moduleCompletionPercentage =
    progressSummary.total_modules > 0
      ? Math.round((progressSummary.completed_modules / progressSummary.total_modules) * 100)
      : 0;

  useEffect(() => {
    fetchData();
    fetchProgressSummary();
  }, []);

  useEffect(() => {
    setHasVideo(false);
    setCanGoNext(true);

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'VIDEO_PRESENT') {
        setHasVideo(true);
        setCanGoNext(false);
      }
      if (event.data?.type === 'ENABLE_NEXT') {
        setCanGoNext(true);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
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

  const toggleModuleExpand = async (moduleId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
      setExpandedModules(newExpanded);
    } else {
      try {
        const module = topics
          .flatMap((t) => t.modules)
          .find((m) => m.id === moduleId);
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

  const toggleMainContentExpand = (mcId: number) => {
    setExpandedMainContents((prev) => {
      const next = new Set(prev);
      if (next.has(mcId)) {
        next.delete(mcId);
      } else {
        next.add(mcId);
      }
      return next;
    });
  };

  const handleModuleClick = (module: Module) => {
    if (!expandedModules.has(module.id)) {
      toggleModuleExpand(module.id, { stopPropagation: () => { } } as React.MouseEvent);
    }
  };

  const handlePageClick = async (pageId: number, moduleId: number) => {
    setPageLoading(true);
    setShowQuiz(false);
    setSelectedModuleId(moduleId);
    try {
      const pageRes = await api.get(`/pages/${pageId}`);
      setSelectedPage(pageRes.data);

      const quizRes = await api.get(`/api/quizzes/?main_content=${pageRes.data.main_content.id}`);
      const quizData = quizRes.data.length ? quizRes.data[0] : null;
      setQuiz(quizData);

      setAnswers({});
      setHasSubmitted(false);
      setQuizResults(null);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to load page');
      throw err;
    } finally {
      setPageLoading(false);
    }
  };

  const completePage = async (pageId: number) => {
    try {
      await api.post(`/pages/${pageId}/complete/`);

      setTopics((prevTopics) =>
        prevTopics.map((topic) => ({
          ...topic,
          modules: topic.modules.map((module) => ({
            ...module,
            main_contents: module.main_contents?.map((mc) => ({
              ...mc,
              pages: mc.pages?.map((p) =>
                p.id === pageId ? { ...p, completed: true } : p
              ),
            })),
          })),
        }))
      );

      await fetchData();
      await fetchProgressSummary();

      toast.success('Page marked as completed!');
    } catch (error) {
      console.error('Failed to complete page', error);
      toast.error('Failed to complete page');
      throw error;
    }
  };

  const handleNext = async () => {
    if (!selectedPage || !selectedModuleId || !canGoNext) return;

    await completePage(selectedPage.id);

    const currentModule = topics
      .flatMap((t) => t.modules)
      .find((m) => m.id === selectedModuleId);

    if (!currentModule?.main_contents) return;

    const allPages = currentModule.main_contents
      .sort((a, b) => a.order - b.order)
      .flatMap((mc) => (mc.pages || []).sort((a, b) => a.order - b.order));

    const currentIndex = allPages.findIndex((p) => p.id === selectedPage.id);

    if (currentIndex < allPages.length - 1) {
      await handlePageClick(allPages[currentIndex + 1].id, selectedModuleId);
    } else if (quiz && quiz.questions.length > 0) {
      setShowQuiz(true);
    } else {
      await completeMainContent();
    }
  };

  const handlePrevious = async () => {
    if (!selectedPage || !selectedModuleId) return;

    const currentModule = topics
      .flatMap((t) => t.modules)
      .find((m) => m.id === selectedModuleId);

    if (!currentModule?.main_contents) return;

    const allPages = currentModule.main_contents
      .sort((a, b) => a.order - b.order)
      .flatMap((mc) => (mc.pages || []).sort((a, b) => a.order - b.order));

    const currentIndex = allPages.findIndex((p) => p.id === selectedPage.id);

    if (currentIndex > 0) {
      await handlePageClick(allPages[currentIndex - 1].id, selectedModuleId);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!quiz || !selectedPage) return;
    if (Object.keys(answers).length < quiz.questions.length) {
      toast.error('Please answer all questions');
      return;
    }

    setSubmitting(true);
    setHasSubmitted(true);

    try {
      const response = await api.post(`/api/quizzes/${quiz.id}/submit/`, { answers });
      setQuizResults(response.data);

      if (response.data.passed) {
        toast.success(`Quiz passed! Score: ${response.data.percentage}%`);
        await completeMainContent();
      } else {
        toast.error(`Quiz failed. Score: ${response.data.percentage}%. Review your answers below.`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const completeMainContent = async () => {
    if (!selectedPage) return;
    try {
      await api.post(`/maincontents/${selectedPage.main_content.id}/complete/`);
      toast.success('Section completed!');
      await fetchData();
      await fetchProgressSummary();
      setSelectedPage(null);
      setShowQuiz(false);
    } catch (error) {
      toast.error('Failed to complete section');
    }
  };

  const getDifficultyColor = (level?: string | null) => {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'intermediate':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'hard':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const filteredTopics = topics.map((topic) => ({
    ...topic,
    modules: topic.modules.filter(
      (m) =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((topic) => topic.modules.length > 0);

  useEffect(() => {
    if (
      filteredTopics.length > 0 &&
      !defaultOpened   // 👈 Only once
    ) {
      const firstModule = filteredTopics[0]?.modules?.[0];

      if (firstModule) {
        setExpandedModules(new Set([firstModule.id]));
        setDefaultOpened(true);   // 👈 mark as done
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar user={user} handleLogout={handleLogout} />
      <div className="flex flex-col h-[calc(100vh-64px)]">
        <div className="flex flex-1 overflow-hidden">
          {/* SIDEBAR */}
          <div
            className={`${sidebarOpen ? 'w-80' : 'w-0'}
  transition-all duration-300 overflow-hidden bg-white border-r border-gray-200 flex flex-col shadow-lg`}
          >
            {/* HEADER */}
            <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5" style={{ color: '#203f78' }} />
                <h2 className="text-lg font-bold break-words leading-snug" style={{ color: '#203f78' }}>
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

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto p-1 space-y-3">
              {filteredTopics.map((topic) => (
                <div key={topic.id} className="space-y-3">
                  {topic.modules.map((module) => {
                    const isModuleExpanded = expandedModules.has(module.id);

                    return (
                      <div key={module.id} className="mb-3">
                        {/* PHASE LEVEL */}
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

                        {/* MAIN CONTENTS (Modules 1,2,3...) */}
                        {isModuleExpanded && module.main_contents && (
                          <div className="ml-6 mt-2 space-y-3 border-l-2 border-gray-200 pl-4">
                            {module.main_contents
                              .sort((a, b) => a.order - b.order)
                              .map((mc, index, arr) => {
                                const mcExpanded = expandedMainContents.has(mc.id);

                                return (
                                  <div key={mc.id}>
                                    {/* MODULE TITLE */}
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

                                        const moduleNumber =
                                          arr
                                            .slice(0, index + 1)
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

                                    {/* PAGES */}
                                    {mcExpanded && (
                                      <div className="ml-3 mt-1 space-y-1">
                                        {mc.pages
                                          .sort((a, b) => a.order - b.order)
                                          .map((page) => {
                                            const isSelected = selectedPage?.id === page.id;
                                            const moduleLocked = isModuleLocked(module);
                                            const locked = moduleLocked;

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
                                                    try {
                                                      await handlePageClick(page.id, module.id);
                                                    } catch {
                                                      // error already shown in handlePageClick
                                                    }
                                                  }}
                                                  className={`relative flex items-center justify-between gap-3 pl-4 pr-3 py-2 rounded-lg transition-all group
                ${locked
                                                      ? 'opacity-60 cursor-not-allowed'
                                                      : 'cursor-pointer'
                                                    }
              `}
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
                                                      className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-[#203f78]' : 'text-gray-400'
                                                        }`}
                                                    />

                                                    <span
                                                      className={`text-sm truncate block ${isSelected
                                                        ? 'text-[#203f78] font-semibold'
                                                        : 'text-gray-500'
                                                        }`}
                                                    >
                                                      {page.title}
                                                    </span>
                                                  </div>

                                                  <span
                                                    className={`text-xs font-medium whitespace-nowrap ${isSelected ? 'text-[#203f78]' : 'text-gray-500'
                                                      }`}
                                                  >
                                                    {page.formatted_duration}
                                                  </span>
                                                </div>
                                              </div>
                                            );
                                          })}
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
                  title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
                >
                  {sidebarOpen ? (
                    <X className="w-5 h-5 text-gray-600" />
                  ) : (
                    <Menu className="w-5 h-5 text-gray-600" />
                  )}
                </button>

                {selectedPage && (
                  <h2
                    className="text-base sm:text-lg font-semibold text-[#203f78] truncate max-w-[500px]"
                    title={selectedPage.title}
                  >
                    {selectedPage.title}
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
                {!selectedPage && !showQuiz ? (
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
                ) : !showQuiz ? (
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
                        {selectedPage && (
                          <iframe
                            srcDoc={selectedPage.content}
                            className="w-full h-full border-0"

                            title="Page Content"
                          />
                        )}
                      </div>
                    </div>

                    <div className="h-[70px] p-3 bg-gray-50 border-t border-gray-200">
                      <div className="flex justify-between items-center gap-3 relative">
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

                        {hasVideo && !canGoNext && (
                          <div className="absolute left-1/2 -translate-x-1/2 text-sm text-amber-700 bg-amber-50 px-5 py-2 rounded-lg border border-amber-200 shadow-sm flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Watch the video to continue
                          </div>
                        )}

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

                          const buttonBase = `flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg transition-all font-semibold text-sm shadow-sm`;

                          if (isLastPage) {
                            if (quiz && quiz.questions.length > 0) {
                              return (
                                <button
                                  onClick={async () => {
                                    if (!canGoNext) return;
                                    await completePage(selectedPage.id);
                                    setShowQuiz(true);
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
                                  Continue to Quiz
                                  <ArrowRight className="w-4 h-4" />
                                </button>
                              );
                            }

                            return (
                              <button
                                onClick={completeMainContent}
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
                                Finish
                                <CheckCircle className="w-4 h-4" />
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
                              Next
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden max-w-4xl mx-auto">
                    <div
                      className="p-6 border-b border-gray-200"
                      style={{
                        background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
                      }}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-yellow-100 border-2 border-yellow-400 shadow-md">
                          <Award className="w-8 h-8 text-yellow-600" />
                        </div>
                        <div>
                          <h1 className="text-3xl font-bold text-gray-900">Knowledge Check</h1>
                          <p className="text-sm text-gray-700 mt-1">
                            Test your understanding of this lesson
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-white bg-opacity-60 backdrop-blur-sm rounded-lg px-4 py-2 inline-flex border border-yellow-300">
                        <Target className="w-4 h-4 text-yellow-700" />
                        <span className="text-sm font-semibold text-yellow-900">
                          {quiz?.questions.length} Questions
                        </span>
                      </div>
                    </div>

                    <div className="p-6 max-h-[calc(100vh-300px)] overflow-y-auto">
                      <div className="space-y-6">
                        {quiz?.questions.map((question, index) => {
                          const result = quizResults?.results?.find(
                            (r: any) => r.question_id === question.id
                          );
                          const userAnswerId = answers[question.id];
                          const isSubmitted = hasSubmitted && result;

                          return (
                            <div
                              key={question.id}
                              className={`border-2 rounded-xl p-6 transition-all ${isSubmitted
                                ? result.is_correct
                                  ? 'border-emerald-500 bg-emerald-50'
                                  : 'border-red-500 bg-red-50'
                                : 'border-gray-200 bg-gray-50'
                                }`}
                            >
                              <div className="flex items-start gap-3 mb-4">
                                <div
                                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                  style={{ backgroundColor: '#203f78' }}
                                >
                                  <span className="text-white font-bold">{index + 1}</span>
                                </div>
                                <h3 className="font-semibold text-gray-900 text-lg">
                                  {question.text}
                                </h3>
                              </div>

                              <div className="space-y-3 ml-11">
                                {question.choices.map((choice) => {
                                  const isUserAnswer = String(userAnswerId) === String(choice.id);
                                  const isCorrect = choice.is_correct;
                                  const showCorrect = isSubmitted && isUserAnswer && isCorrect;
                                  const showWrong = isSubmitted && isUserAnswer && !isCorrect;

                                  return (
                                    <label
                                      key={choice.id}
                                      className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${showCorrect
                                        ? 'border-emerald-500 bg-emerald-100'
                                        : showWrong
                                          ? 'border-red-500 bg-red-100'
                                          : isUserAnswer && !hasSubmitted
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 bg-white hover:bg-gray-50'
                                        }`}
                                    >
                                      <input
                                        type="radio"
                                        name={`question-${question.id}`}
                                        value={choice.id}
                                        checked={String(answers[question.id]) === String(choice.id)}
                                        onChange={() =>
                                          !hasSubmitted &&
                                          setAnswers({ ...answers, [question.id]: String(choice.id) })
                                        }
                                        disabled={hasSubmitted}
                                        className="w-5 h-5"
                                        style={{ accentColor: '#203f78' }}
                                      />
                                      <span
                                        className={`font-medium text-base flex items-center gap-2 ${showCorrect
                                          ? 'text-emerald-700'
                                          : showWrong
                                            ? 'text-red-700'
                                            : isUserAnswer && !hasSubmitted
                                              ? 'text-blue-700'
                                              : 'text-gray-700'
                                          }`}
                                      >
                                        {choice.text}
                                        {showCorrect && (
                                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                                        )}
                                        {showWrong && <X className="w-4 h-4 text-red-600" />}
                                      </span>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {hasSubmitted ? (
                        <div className="mt-8 flex flex-col gap-3">
                          {quizResults && !quizResults.passed && (
                            <button
                              onClick={() => {
                                setAnswers({});
                                setHasSubmitted(false);
                                setQuizResults(null);
                              }}
                              className="w-full py-3 rounded-lg font-bold text-white transition-all hover:shadow-lg"
                              style={{ background: '#203f78' }}
                            >
                              Try Again
                            </button>
                          )}
                          {quizResults && quizResults.passed && (
                            <button
                              onClick={() => {
                                setShowQuiz(false);
                                setHasSubmitted(false);
                                setAnswers({});
                                setQuizResults(null);
                              }}
                              className="w-full py-3 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
                            >
                              Back to Lessons
                            </button>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={handleSubmitQuiz}
                          disabled={
                            submitting || Object.keys(answers).length < (quiz?.questions.length || 0)
                          }
                          className="mt-8 w-full py-4 rounded-xl font-bold text-lg text-white transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{
                            background: 'linear-gradient(135deg, #203f78 0%, #2d5aa0 100%)',
                          }}
                        >
                          {submitting ? 'Submitting...' : 'Submit Quiz'}
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
