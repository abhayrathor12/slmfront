import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, FileText, Award, Target, Trophy, Menu, X, Clock } from 'lucide-react';
import Loader from '../components/Loader';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/navbar';

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

  const moduleId = location.state?.moduleId;

  useEffect(() => {
    const state = location.state as { showQuiz?: boolean; mainContentId?: number } | null;

    fetchPage();
    fetchUserData();
    setActiveItem(Number(id));

    if (state?.showQuiz && state?.mainContentId) {
      setShowQuiz(true);
    } else {
      setShowQuiz(false);
    }
  }, [id, location.state]);

  const fetchUserData = async () => {
    try {
      const response = await api.get('accounts/users/');
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user data');
    }
  };

  const fetchPage = async () => {
    try {
      const response = await api.get(`/pages/${id}/`);
      setPage(response.data);
      console.log(response.data);
      const allPagesRes = await api.get(`/api/pages/`);
      const relatedPages = allPagesRes.data
        .filter((p: Page) => p.main_content.id === response.data.main_content.id)
        .sort((a: Page, b: Page) => a.order - b.order);
      setPages(relatedPages);

      const quizRes = await api.get(`/api/quizzes/?main_content=${response.data.main_content.id}`);
      if (quizRes.data.length > 0) {
        setQuiz(quizRes.data[0]);
      }
    } catch (error) {
      toast.error('Failed to fetch page');
    } finally {
      setLoading(false);
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
    if (!page) return;

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
    if (!page) return;

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
    if (moduleId) {
      navigate(`/module/${moduleId}`);
    } else if (page?.main_content?.module_detail?.id || page?.main_content?.module) {
      navigate(`/module/${page.main_content.module_detail?.id || page.main_content.module}`);
    } else {
      navigate(-1);
    }
  };

  const handleSidebarItemClick = (pageId: number) => {
    navigate(`/page/${pageId}`, { state: { moduleId } });
    setShowQuiz(false);
    setActiveItem(pageId);
    setSidebarOpen(false);
  };

  if (loading) return <Loader />;
  if (!page) return <div>Page not found</div>;

  const currentIndex = pages.findIndex((p) => p.id === page.id);
  const isLastPage = currentIndex === pages.length - 1;
  const completedPages = pages.filter(p => p.completed).length;
  const progress = pages.length > 0 ? (completedPages / pages.length) * 100 : 0;

  const SidebarContent = () => (
    <>
      <div className="p-4 md:p-6 border-b border-gray-200" style={{ background: 'linear-gradient(135deg, #203f78 0%, #2d5aa0 100%)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
            <Trophy className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div>
            <p className="text-xs md:text-sm font-medium text-blue-100">Progress</p>
            <span className="text-xl md:text-2xl font-bold text-white">{Math.round(progress)}%</span>
          </div>
        </div>
        <div className="h-2 bg-white bg-opacity-20 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)'
            }}
          />
        </div>
        <p className="text-xs text-blue-100 mt-2">
          {completedPages} of {pages.length} completed
        </p>
      </div>

      <div className="p-3 md:p-4">
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
                    <FileText className="w-4 h-4 md:w-5 md:h-5" style={{ color: activeItem === p.id ? '#ffffff' : '#203f78' }} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span
                  className={`text-xs md:text-sm font-semibold block truncate ${
                    activeItem === p.id ? 'text-gray-900' : p.completed ? 'text-emerald-700' : 'text-gray-700'
                  }`}
                >
                  {p.title || `Lesson ${index + 1}`}
                </span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {p.formatted_duration}
                </span>
              </div>
            </div>
          ))}

          {quiz && quiz.questions.length > 0 && (
            <div
              onClick={() => {
                setShowQuiz(true);
                setActiveItem('quiz');
                setSidebarOpen(false);
              }}
              className={`group flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-xl cursor-pointer transition-all border ${
                showQuiz
                  ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400 shadow-md'
                  : 'bg-yellow-50 hover:bg-yellow-100 border-yellow-300'
              }`}
            >
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center bg-yellow-100">
                <Award className="w-4 h-4 md:w-5 md:h-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <span className="text-xs md:text-sm font-semibold text-yellow-900 block">
                  Knowledge Check
                </span>
                <span className="text-xs text-yellow-700">
                  {quiz.questions.length} questions
                </span>
              </div>
            </div>
          )}
        </div>
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
        backButtonText="Back to Content"
      />

      {/* Toggle Button for All Screens */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white"
        style={{ background: 'linear-gradient(135deg, #203f78 0%, #2d5aa0 100%)' }}
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar Overlay for All Screens */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex max-w-full">
        {/* Sidebar */}
        <div
          className={`fixed top-16 left-0 bottom-0 w-80 bg-white shadow-2xl border-r border-gray-100 overflow-y-auto z-50 transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <SidebarContent />
        </div>

        {/* Main Content */}
        <div className="flex-1 p-1 sm:p-3 lg:p-3">
          <div className="max-w-7xl mx-auto">
            {!showQuiz ? (
              <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-3 sm:p-4 border-b border-gray-200" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f0f5ff 100%)' }}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1 rounded-lg" style={{ backgroundColor: '#203f78', color: 'white' }}>
                        {currentIndex + 1}
                      </span>
                      <div>
                        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{page.title}</h1>
                        <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          {page.formatted_duration}
                        </span>
                      </div>
                    </div>
                    {page.completed && (
                      <div className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-emerald-300">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="text-xs sm:text-sm font-semibold">Completed</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-2 sm:p-4">
                  <div className="w-full border-2 border-gray-200 rounded-lg lg:rounded-xl overflow-hidden bg-white shadow-sm">
                  <iframe
                      ref={iframeRef}
                      srcDoc={page.content}
                      className="w-full border-0"
                      sandbox="allow-same-origin allow-scripts"
                      title="Page Content"
                      style={{ height: '310px' }}
                      scrolling="auto"
                    />
                  </div>
                </div>

                <div className="p-3 sm:p-4 lg:p-6 bg-gray-50 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                    <button
                      onClick={handlePrevious}
                      disabled={currentIndex === 0}
                      className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-gray-700 rounded-lg lg:rounded-xl hover:bg-gray-100 transition-all font-semibold border-2 border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md text-sm sm:text-base"
                    >
                      <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                      Previous
                    </button>

                    {isLastPage ? (
                      quiz && quiz.questions.length > 0 ? (
                        <button
                          onClick={handleComplete}
                          className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-white rounded-lg lg:rounded-xl transition-all font-semibold hover:shadow-lg text-sm sm:text-base"
                          style={{ background: 'linear-gradient(135deg, #203f78 0%, #2d5aa0 100%)' }}
                        >
                          Continue to Quiz
                          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      ) : (
                        <button
                          onClick={completeMainContent}
                          className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-white rounded-lg lg:rounded-xl transition-all font-semibold hover:shadow-lg text-sm sm:text-base"
                          style={{ background: 'linear-gradient(135deg, #203f78 0%, #2d5aa0 100%)' }}
                        >
                          Finish
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      )
                    ) : (
                      <button
                        onClick={handleNext}
                        className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-white rounded-lg lg:rounded-xl transition-all font-semibold hover:shadow-lg text-sm sm:text-base"
                        style={{ background: 'linear-gradient(135deg, #203f78 0%, #2d5aa0 100%)' }}
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
                <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-200" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)' }}>
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
                      {quiz.questions.length} Questions
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
                                  className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 border-2 rounded-btn-lg lg:rounded-xl cursor-pointer transition-all ${
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
                                    onChange={() => !hasSubmitted && setAnswers({ ...answers, [question.id]: String(choice.id) })}
                                    disabled={hasSubmitted}
                                    className="w-4 h-4 sm:w-5 sm:h-5"
                                    style={{ accentColor: '#203f78' }}
                                  />
                                  <span
                                    className={`font-medium text-sm sm:text-base flex items-center gap-2 ${
                                      showCorrect ? 'text-emerald-700' :
                                      showWrong ? 'text-red-700' :
                                      isUserAnswer && !hasSubmitted ? 'text-blue-700' : 'text-gray-700'
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
                      disabled={submitting || Object.keys(answers).length < quiz.questions.length}
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