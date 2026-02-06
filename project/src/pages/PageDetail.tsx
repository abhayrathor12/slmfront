import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, ChevronDown, FileText, Award, Target, Trophy, Menu, X, Clock } from 'lucide-react';
import Loader from '../components/Loader';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/navbar';
import { Layers } from 'lucide-react';

interface Page {
  id: number;
  title: string;
  content: string;
  order: number;
  completed: boolean;
  formatted_duration: string;
  main_content: {
    id: number;
    module?: number;
    module_detail?: {
      id: number;
      title: string;
    };
  };
}

interface Choice {
  id: number;
  text: string;
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

interface User {
  username?: string;
}

interface Module {
  id: number;
  title: string;
}

const PageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [page, setPage] = useState<Page | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<User | undefined>(undefined);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [activeItem, setActiveItem] = useState<string | number | null>(null);
  const [quizResults, setQuizResults] = useState<any>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [module, setModule] = useState<Module | null>(null);
  const moduleId = location.state?.moduleId;
  const [totalModules, setTotalModules] = useState(0);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(1);
  const [allModules, setAllModules] = useState<Module[]>([]);
  const [showModuleDropdown, setShowModuleDropdown] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // ── New states for video-based next control ──
  const [canGoNext, setCanGoNext] = useState(true);
  const [hasVideo, setHasVideo] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (!moduleId) return;

    const PAGES_CACHE_KEY = `pages_module_${moduleId}`;
    const MODULES_CACHE_KEY = `modules_all`;

    const fetchModuleData = async () => {
      try {
        const cachedModules = localStorage.getItem(MODULES_CACHE_KEY);
        if (cachedModules) {
          const parsed = JSON.parse(cachedModules);
          setAllModules(parsed);
          setTotalModules(parsed.length);
          const index = parsed.findIndex((m: any) => m.id === moduleId);
          setCurrentModuleIndex(index !== -1 ? index + 1 : 1);
        }

        const cachedPages = localStorage.getItem(PAGES_CACHE_KEY);
        if (cachedPages) {
          setPages(JSON.parse(cachedPages));
        }

        const modulesRes = await api.get('/api/modules/');
        setAllModules(modulesRes.data || []);
        setTotalModules(modulesRes.data.length);
        localStorage.setItem(MODULES_CACHE_KEY, JSON.stringify(modulesRes.data));

        const index = modulesRes.data.findIndex((m: any) => m.id === moduleId);
        setCurrentModuleIndex(index !== -1 ? index + 1 : 1);

        const moduleRes = await api.get(`/api/modules/${moduleId}`);
        setModule({
          id: moduleRes.data.id,
          title: moduleRes.data.title,
        });

        const pagesRes = await api.get(`/api/pages/?module=${moduleId}`);
        const sortedPages = pagesRes.data.sort((a: Page, b: Page) => a.order - b.order);
        setPages(sortedPages);
        localStorage.setItem(PAGES_CACHE_KEY, JSON.stringify(sortedPages));
      } catch {
        toast.error('Failed to load module data');
      }
    };

    fetchModuleData();
  }, [moduleId]);

  useEffect(() => {
    if (!id) return;

    const PAGE_CACHE_KEY = `page_${id}`;
    const QUIZ_CACHE_KEY = `quiz_page_${id}`;

    const fetchPageContent = async () => {
      try {
        setPageLoading(true);

        const cachedPage = localStorage.getItem(PAGE_CACHE_KEY);
        if (cachedPage) {
          const parsed = JSON.parse(cachedPage);
          setPage(parsed);
          setActiveItem(Number(id));
          setPageLoading(false);
        }

        const cachedQuiz = localStorage.getItem(QUIZ_CACHE_KEY);
        if (cachedQuiz) {
          setQuiz(JSON.parse(cachedQuiz));
        }

        const pageRes = await api.get(`/pages/${id}`);
        setPage(pageRes.data);
        setActiveItem(Number(id));
        localStorage.setItem(PAGE_CACHE_KEY, JSON.stringify(pageRes.data));

        const quizRes = await api.get(
          `/api/quizzes/?main_content=${pageRes.data.main_content.id}`
        );

        const quizData = quizRes.data.length ? quizRes.data[0] : null;
        setQuiz(quizData);
        localStorage.setItem(QUIZ_CACHE_KEY, JSON.stringify(quizData));
      } catch {
        toast.error('Failed to load page');
      } finally {
        setPageLoading(false);
      }
    };

    fetchPageContent();
  }, [id]);

  // ── Video progress listener ──
  useEffect(() => {
    // Reset when page changes
    setHasVideo(false);
    setCanGoNext(true);

    const handleMessage = (event: MessageEvent) => {
      // In production → validate event.origin
      if (event.data?.type === 'VIDEO_PRESENT') {
        setHasVideo(true);
        setCanGoNext(false);     // lock until video allows
      }
      if (event.data?.type === 'ENABLE_NEXT') {
        setCanGoNext(true);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [id]);   // reset on page id change

  const handleModuleSwitch = async (moduleId: number) => {
    try {
      const res = await api.get(`/api/modules/${moduleId}/`);
      const firstContent = res.data.main_contents?.[0];
      const firstPage = firstContent?.pages
        ?.sort((a: any, b: any) => a.order - b.order)[0];

      if (!firstPage) {
        toast.error('No pages found in this module');
        return;
      }

      setShowModuleDropdown(false);
      navigate(`/page/${firstPage.id}`, { state: { moduleId } });
    } catch {
      toast.error('Failed to open module');
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await api.get('accounts/users/');
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user data');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const completePage = async (pageId: number) => {
    try {
      await api.post(`/pages/${pageId}/complete/`);
      setPages(prev =>
        prev.map(p =>
          p.id === pageId ? { ...p, completed: true } : p
        )
      );
      toast.success('Page marked as completed!');
    } catch (error) {
      console.error('Failed to complete page', error);
      toast.error('Failed to complete page');
    }
  };

  const handleComplete = async () => {
    if (!page || !canGoNext) return;

    await completePage(page.id);

    const currentIndex = pages.findIndex((p) => p.id === page.id);
    if (currentIndex < pages.length - 1) {
      navigate(`/page/${pages[currentIndex + 1].id}`);
    } else if (quiz && quiz.questions.length > 0) {
      setShowQuiz(true);
      setActiveItem('quiz');
    } else {
      await completeMainContent();
    }
  };

  const handlePrevious = () => {
    const currentIndex = pages.findIndex((p) => p.id === page?.id);
    if (currentIndex > 0) {
      navigate(`/page/${pages[currentIndex - 1].id}`);
    }
  };

  const handleNext = async () => {
    if (!page || !canGoNext) return;

    await completePage(page.id);

    const currentIndex = pages.findIndex((p) => p.id === page.id);
    if (currentIndex < pages.length - 1) {
      navigate(`/page/${pages[currentIndex + 1].id}`);
    } else if (quiz && quiz.questions.length > 0) {
      setShowQuiz(true);
      setActiveItem('quiz');
    } else {
      await completeMainContent();
    }
  };

  const handleSubmitQuiz = async () => {
    if (!quiz || !page) return;

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
    if (!page) return;

    try {
      await completePage(page.id);
      await api.post(`/maincontents/${page.main_content.id}/complete/`);
      toast.success('Section completed!');
      navigate('/user_home');
    } catch (error) {
      toast.error('Failed to complete section');
    }
  };

  const handleBack = () => {
    navigate('/user_home');
  };

  const handleSidebarItemClick = (pageId: number) => {
    navigate(`/page/${pageId}`, { state: { moduleId } });
    setShowQuiz(false);
    setActiveItem(pageId);
    setSidebarOpen(false);
  };

  const currentIndex = pages.findIndex((p) => p.id === page?.id);
  const isLastPage = currentIndex === pages.length - 1;
  const completedPages = pages.filter(p => p.completed).length;
  const progress = pages.length > 0 ? (completedPages / pages.length) * 100 : 0;

  const SidebarContent = () => (
    <>
      {module && (
        <div
          className="p-4 border-b border-blue-200 relative"
          style={{
            background: 'linear-gradient(135deg, #203f78 0%, #2d5aa0 100%)',
          }}
        >
          <button
            onClick={() => setShowModuleDropdown(!showModuleDropdown)}
            className="w-full flex items-center justify-between gap-3 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white bg-opacity-20">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white leading-tight">
                  {module.title}
                </h2>
                <p className="text-xs text-blue-100">
                  Module {currentModuleIndex} / {totalModules}
                </p>
              </div>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-white transition-transform ${showModuleDropdown ? 'rotate-180' : ''}`}
            />
          </button>

          {showModuleDropdown && (
            <div className="absolute left-3 right-3 top-[90%] mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-64 overflow-y-auto">
              {allModules.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleModuleSwitch(m.id)}
                  className={`w-full px-4 py-3 text-left text-sm font-medium transition hover:bg-blue-50 ${
                    m.id === module.id ? 'bg-blue-100 text-blue-800' : 'text-gray-700'
                  }`}
                >
                  {m.title}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto hide-scrollbar p-3 md:p-4">
        <div className="space-y-2">
          {pages.map((p, index) => (
            <div
              key={p.id}
              onClick={() => handleSidebarItemClick(p.id)}
              className={`group flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-xl cursor-pointer transition-all ${
                activeItem === p.id
                  ? 'shadow-md border-2'
                  : p.completed
                  ? 'bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                  : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
              }`}
              style={
                activeItem === p.id && !showQuiz
                  ? { background: 'linear-gradient(135deg, #f0f5ff 0%, #e0ebff 100%)', borderColor: '#203f78' }
                  : {}
              }
            >
              <div className="flex-shrink-0">
                {p.completed ? (
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center bg-emerald-100">
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" />
                  </div>
                ) : (
                  <div
                    className="w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: activeItem === p.id ? '#203f78' : '#f0f5ff' }}
                  >
                    <FileText
                      className="w-4 h-4 md:w-5 md:h-5"
                      style={{ color: activeItem === p.id ? '#fff' : '#203f78' }}
                    />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs md:text-sm font-semibold block truncate">
                  {p.title || `Lesson ${index + 1}`}
                </span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {p.formatted_duration}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="p-4 border-t"
        style={{ background: 'linear-gradient(135deg, #203f78 0%, #2d5aa0 100%)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white bg-opacity-20">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-white">Progress</span>
              <span className="text-sm font-bold text-white">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-white bg-opacity-30 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #10b981, #34d399)',
                }}
              />
            </div>
          </div>
        </div>
        <p className="mt-2 text-xs text-blue-100">
          {completedPages} of {pages.length} lessons completed
        </p>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar
        user={user}
        handleLogout={handleLogout}
        showBackButton={true}
        onBackClick={handleBack}
        currentPage={currentIndex + 1}
        totalPages={pages.length}
        backButtonText="Back to Modules"
      />

      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white"
        style={{ background: 'linear-gradient(135deg, #203f78 0%, #2d5aa0 100%)' }}
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex max-w-full">
        <div
          className="hidden lg:flex flex-col w-80 bg-white shadow-lg border-r border-gray-100 sticky"
          style={{ top: '4rem', height: 'calc(100vh - 4.2rem)' }}
        >
          <SidebarContent />
        </div>

        <div
          className={`lg:hidden fixed top-16 left-0 bottom-0 w-80 bg-white shadow-2xl border-r border-gray-100 overflow-y-auto z-50 transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <SidebarContent />
        </div>

        <div className="flex-1 p-2 sm:p-2 lg:p-4">
          <div className="max-w-5xl mx-auto">
            {!showQuiz ? (
              <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-2 sm:p-4">
                  <div className="relative w-full border-2 border-gray-200 rounded-lg lg:rounded-xl overflow-hidden bg-white shadow-sm">
                    {pageLoading && (
                      <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-sm flex items-center justify-center">
                        <div
                          className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
                          style={{ borderColor: '#203f78' }}
                        />
                      </div>
                    )}

                    {page && (
                    <iframe
                    ref={iframeRef}
                    srcDoc={page.content}
                    className="w-full h-[calc(100vh-190px)] min-h-[400px] border-0"
                    sandbox="allow-same-origin allow-scripts allow-presentation"
                    allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                    allowFullScreen
                    title="Page Content"
                  />
                  
                    )}
                  </div>
                </div>

                <div className="p-3 sm:p-3 lg:p-1 bg-gray-50 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 relative">
                    <button
                      onClick={handlePrevious}
                      disabled={currentIndex === 0}
                      className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2 bg-white text-gray-700 rounded-lg lg:rounded-xl hover:bg-gray-100 transition-all font-semibold border-2 border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md text-sm sm:text-base"
                    >
                      <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                      Previous
                    </button>

                    {/* Video hint (centered) */}
                    {hasVideo && !canGoNext && (
                      <div className="absolute left-1/2 -translate-x-1/2 text-sm text-amber-700 bg-amber-50 px-5 py-2 rounded-lg border border-amber-200 shadow-sm flex items-center gap-2 whitespace-nowrap">
                        <Clock className="w-4 h-4" />
                        Watch the video to continue
                      </div>
                    )}

                    {isLastPage ? (
                      quiz && quiz.questions.length > 0 ? (
                        <button
                          onClick={handleComplete}
                          disabled={!canGoNext}
                          className={`flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2 text-white rounded-lg lg:rounded-xl transition-all font-semibold text-sm sm:text-base shadow-sm ${
                            canGoNext
                              ? 'hover:shadow-lg'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                          style={
                            canGoNext
                              ? { background: 'linear-gradient(135deg, #203f78 0%, #2d5aa0 100%)' }
                              : {}
                          }
                        >
                          Continue to Quiz
                          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      ) : (
                        <button
                          onClick={completeMainContent}
                          disabled={!canGoNext}
                          className={`flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2 text-white rounded-lg lg:rounded-xl transition-all font-semibold text-sm sm:text-base shadow-sm ${
                            canGoNext
                              ? 'hover:shadow-lg'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                          style={
                            canGoNext
                              ? { background: 'linear-gradient(135deg, #203f78 0%, #2d5aa0 100%)' }
                              : {}
                          }
                        >
                          Finish
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      )
                    ) : (
                      <button
                        onClick={handleNext}
                        disabled={!canGoNext}
                        className={`flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2 text-white rounded-lg lg:rounded-xl transition-all font-semibold text-sm sm:text-base shadow-sm ${
                          canGoNext
                            ? 'hover:shadow-lg'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        style={
                          canGoNext
                            ? { background: 'linear-gradient(135deg, #203f78 0%, #2d5aa0 100%)' }
                            : {}
                        }
                      >
                        Next
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div
                  className="p-4 sm:p-6 lg:p-8 border-b border-gray-200"
                  style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)' }}
                >
                  <div className="flex items-center gap-3 sm:gap-4 mb-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl flex items-center justify-center bg-yellow-100 border-2 border-yellow-400 shadow-md">
                      <Award className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-yellow-600" />
                    </div>
                    <div>
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Knowledge Check</h1>
                      <p className="text-sm sm:text-base text-gray-700 mt-1">Test your understanding of this lesson</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-white bg-opacity-60 backdrop-blur-sm rounded-lg px-3 sm:px-4 py-2 inline-flex border border-yellow-300">
                    <Target className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-700" />
                    <span className="text-xs sm:text-sm font-semibold text-yellow-900">
                      {quiz?.questions.length || 0} Questions
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-6 lg:p-8">
                  <div className="space-y-4 sm:space-y-6">
                    {quiz?.questions.map((question, index) => {
                      const result = quizResults?.results?.find((r: any) => r.question_id === question.id);
                      const userAnswerId = answers[question.id];
                      const isSubmitted = hasSubmitted && result;

                      return (
                        <div
                          key={question.id}
                          className={`border-2 rounded-lg lg:rounded-xl p-4 sm:p-6 transition-all ${
                            isSubmitted
                              ? result.is_correct
                                ? 'border-emerald-500 bg-emerald-50'
                                : 'border-red-500 bg-red-50'
                              : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start gap-2 sm:gap-3 mb-4">
                            <div
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: '#203f78' }}
                            >
                              <span className="text-white font-bold text-sm sm:text-base">{index + 1}</span>
                            </div>
                            <h3 className="font-semibold text-gray-900 text-base sm:text-lg">{question.text}</h3>
                          </div>

                          <div className="space-y-2 sm:space-y-3 ml-0 sm:ml-11">
                            {question.choices.map((choice) => {
                              const isUserAnswer = String(userAnswerId) === String(choice.id);
                              const isCorrect = choice.is_correct;
                              const showCorrect = isSubmitted && isUserAnswer && isCorrect;
                              const showWrong = isSubmitted && isUserAnswer && !isCorrect;

                              return (
                                <label
                                  key={choice.id}
                                  className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 border-2 rounded-lg lg:rounded-xl cursor-pointer transition-all ${
                                    showCorrect
                                      ? 'border-emerald-500 bg-emerald-100'
                                      : showWrong
                                      ? 'border-red-500 bg-red-100'
                                      : isUserAnswer && !hasSubmitted
                                      ? 'border-2 shadow-md bg-blue-50 border-blue-500'
                                      : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name={`question-${question.id}`}
                                    value={choice.id}
                                    checked={String(answers[question.id]) === String(choice.id)}
                                    onChange={() =>
                                      !hasSubmitted && setAnswers({ ...answers, [question.id]: String(choice.id) })
                                    }
                                    disabled={hasSubmitted}
                                    className="w-4 h-4 sm:w-5 sm:h-5"
                                    style={{ accentColor: '#203f78' }}
                                  />
                                  <span
                                    className={`font-medium text-sm sm:text-base flex items-center gap-2 ${
                                      showCorrect
                                        ? 'text-emerald-700'
                                        : showWrong
                                        ? 'text-red-700'
                                        : isUserAnswer && !hasSubmitted
                                        ? 'text-blue-700'
                                        : 'text-gray-700'
                                    }`}
                                  >
                                    {choice.text}
                                    {showCorrect && <CheckCircle className="w-4 h-4 text-emerald-600" />}
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
                    <div className="mt-6 sm:mt-8 flex flex-col gap-3">
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
                            setActiveItem(null);
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
                      disabled={submitting || Object.keys(answers).length < (quiz?.questions.length || 0)}
                      className="mt-6 sm:mt-8 w-full py-3 sm:py-4 rounded-lg lg:rounded-xl font-bold text-base sm:text-lg text-white transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: 'linear-gradient(135deg, #203f78 0%, #2d5aa0 100%)' }}
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
  );
};

export default PageDetail;