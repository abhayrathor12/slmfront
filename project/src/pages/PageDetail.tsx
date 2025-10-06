import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, FileText, Award, Target, Trophy } from 'lucide-react';
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
  main_content: { id: number };
  completed: boolean;
  
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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [activeItem, setActiveItem] = useState<string | number | null>(null);
  

  const moduleId = location.state?.moduleId;

  useEffect(() => {
  const state = location.state as { showQuiz?: boolean; mainContentId?: number } | null;

  fetchPage();
  fetchUserData();
  setActiveItem(Number(id));

  if (state?.showQuiz && state?.mainContentId) {
    // Load quiz directly
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
      // 1️⃣ Update backend
      await api.post(`/pages/${pageId}/complete/`);
  
      // 2️⃣ Update frontend immediately
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

  const handleIframeLoad = () => {
    const iframe = iframeRef.current;
    if (iframe && iframe.contentWindow && iframe.contentDocument) {
      const doc = iframe.contentDocument;
      iframe.style.height = doc?.body.scrollHeight + 20 + "px";
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

    try {
      const response = await api.post(`/api/quizzes/${quiz.id}/submit/`, { answers });

      if (response.data.passed) {
        toast.success(`Quiz passed! Score: ${response.data.score}%`);
        await completeMainContent();
      } else {
        toast.error(`Quiz failed. Score: ${response.data.score}%. Please try again.`);
      }
    } catch (error) {
      toast.error('Failed to submit quiz');
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
    } else if (page?.main_content?.id) {
      navigate(`/module/${page.main_content.id}`);
    } else {
      navigate(-1);
    }
  };

  if (loading) return <Loader />;
  if (!page) return <div>Page not found</div>;

  const currentIndex = pages.findIndex((p) => p.id === page.id);
  const isLastPage = currentIndex === pages.length - 1;
  const completedPages = pages.filter(p => p.completed).length;
  const progress = pages.length > 0 ? (completedPages / pages.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navbar with Back Button and Page Counter */}
      <Navbar 
        user={user} 
        handleLogout={handleLogout}
        showBackButton={true}
        onBackClick={handleBack}
        currentPage={currentIndex + 1}
        totalPages={pages.length}
      />

      <div className="flex max-w-7xl ">
        {/* Sidebar */}
        <div className="w-80 bg-white shadow-lg border-r border-gray-100 sticky overflow-y-auto hide-scrollbar" style={{ top: '4rem', height: 'calc(100vh - 4rem)' }}>
          {/* Progress Card */}
          <div className="p-6 border-b border-gray-200" style={{ background: 'linear-gradient(135deg, #203f78 0%, #2d5aa0 100%)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-100">Progress</p>
                <span className="text-2xl font-bold text-white">{Math.round(progress)}%</span>
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
              {completedPages} of {pages.length}  completed
            </p>
          </div>

          {/* Contents */}
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
              
            </h3>
            <div className="space-y-2">
              {pages.map((p, index) => (
                <div
                  key={p.id}
                  onClick={() => {
                    navigate(`/page/${p.id}`, { state: { moduleId } });
                    setShowQuiz(false);
                    setActiveItem(p.id);
                  }}
                  className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
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
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-100">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      </div>
                    ) : (
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: activeItem === p.id ? '#203f78' : '#f0f5ff' }}
                      >
                        <FileText className="w-5 h-5" style={{ color: activeItem === p.id ? '#ffffff' : '#203f78' }} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm font-semibold block truncate ${
                      activeItem === p.id ? 'text-gray-900' : p.completed ? 'text-emerald-700' : 'text-gray-700'
                    }`}>
                      {p.title || ` ${index + 1}`}
                    </span>
                    <span className="text-xs text-gray-500">
                       {index + 1}
                    </span>
                  </div>
                </div>
              ))}

              {/* Knowledge Check */}
              {quiz && quiz.questions.length > 0 && (
                <div
                  onClick={() => {
                    setShowQuiz(true);
                    setActiveItem('quiz');
                  }}
                  className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                    showQuiz
                      ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400 shadow-md'
                      : 'bg-yellow-50 hover:bg-yellow-100 border-yellow-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-yellow-100">
                    <Award className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-yellow-900 block">
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
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-5xl mx-auto">
            {!showQuiz ? (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                {/* Page Header */}
                <div className="p-8 border-b border-gray-200" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f0f5ff 100%)' }}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-sm font-semibold px-3 py-1 rounded-lg" style={{ backgroundColor: '#203f78', color: 'white' }}>
                         {currentIndex + 1}
                      </span>
                    </div>
                    {page.completed && (
                      <div className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-300">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-semibold">Completed</span>
                      </div>
                    )}
                  </div>
                  <h1 className="text-4xl font-bold text-gray-900 mt-4">{page.title}</h1>
                </div>

                {/* Content */}
                <div className="p-8">
                  <div className="w-full border-2 border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                    <iframe
                      ref={iframeRef}
                      srcDoc={page.content}
                      className="w-full border-0"
                      sandbox="allow-same-origin allow-scripts"
                      title="Page Content"
                      onLoad={handleIframeLoad}
                    />
                  </div>
                </div>

                {/* Navigation Footer */}
                <div className="p-6 bg-gray-50 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <button
                      onClick={handlePrevious}
                      disabled={currentIndex === 0}
                      className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-100 transition-all font-semibold border-2 border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Previous
                    </button>

                    {isLastPage ? (
  quiz && quiz.questions.length > 0 ? (
    // ✅ Case 1: Last page AND quiz exists → Go to Quiz
    <button
      onClick={handleComplete}
      className="flex items-center gap-2 px-6 py-3 text-white rounded-xl transition-all font-semibold hover:shadow-lg"
      style={{ background: 'linear-gradient(135deg, #203f78 0%, #2d5aa0 100%)' }}
    >
      Continue to Quiz
      <ArrowRight className="w-5 h-5" />
    </button>
  ) : (
    // ✅ Case 2: Last page AND NO quiz → Finish main content
    <button
      onClick={completeMainContent}
      className="flex items-center gap-2 px-6 py-3 text-white rounded-xl transition-all font-semibold hover:shadow-lg"
      style={{ background: 'linear-gradient(135deg, #203f78 0%, #2d5aa0 100%)' }}
    >
      Finish
      <CheckCircle className="w-5 h-5" />
    </button>
  )
) : (
  // ✅ Case 3: Normal pages → Just go next
  <button
    onClick={handleNext}
    className="flex items-center gap-2 px-6 py-3 text-white rounded-xl transition-all font-semibold hover:shadow-lg"
    style={{ background: 'linear-gradient(135deg, #203f78 0%, #2d5aa0 100%)' }}
  >
    Next
    <ArrowRight className="w-5 h-5" />
  </button>
)}

                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                {/* Quiz Header */}
                <div className="p-8 border-b border-gray-200" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)' }}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-yellow-100 border-2 border-yellow-400 shadow-md">
                      <Award className="w-8 h-8 text-yellow-600" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold text-gray-900">Knowledge Check</h1>
                      <p className="text-gray-700 mt-1">Test your understanding of this lesson</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-white bg-opacity-60 backdrop-blur-sm rounded-lg px-4 py-2 inline-flex border border-yellow-300">
                    <Target className="w-4 h-4 text-yellow-700" />
                    <span className="text-sm font-semibold text-yellow-900">
                      {quiz.questions.length} Questions
                    </span>
                  </div>
                </div>

                {/* Quiz Content */}
                <div className="p-8">
                  <div className="space-y-6">
                    {quiz?.questions.map((question, index) => (
                      <div key={question.id} className="border-2 border-gray-200 rounded-xl p-6 bg-gray-50 hover:border-gray-300 transition-all">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#203f78' }}>
                            <span className="text-white font-bold">{index + 1}</span>
                          </div>
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {question.text}
                          </h3>
                        </div>

                        <div className="space-y-3 ml-11">
                          {question.choices.map((choice) => (
                            <label 
                              key={choice.id}
                              className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                answers[question.id] === String(choice.id)
                                  ? 'border-2 shadow-md'
                                  : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'
                              }`}
                              style={answers[question.id] === String(choice.id) ? {
                                borderColor: '#203f78',
                                backgroundColor: '#f0f5ff'
                              } : {}}
                            >
                              <input
                                type="radio"
                                name={`question-${question.id}`}
                                value={choice.id}
                                checked={answers[question.id] === String(choice.id)}
                                onChange={() =>
                                  setAnswers({ ...answers, [question.id]: String(choice.id) })
                                }
                                className="w-5 h-5"
                                style={{ accentColor: '#203f78' }}
                              />
                              <span className={`font-medium ${
                                answers[question.id] === String(choice.id) ? 'text-gray-900' : 'text-gray-700'
                              }`}>
                                {choice.text}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleSubmitQuiz}
                    disabled={submitting || Object.keys(answers).length < quiz.questions.length}
                    className="mt-8 w-full py-4 rounded-xl font-bold text-lg text-white transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: 'linear-gradient(135deg, #203f78 0%, #2d5aa0 100%)' }}
                  >
                    {submitting ? 'Submitting...' : 'Submit Quiz'}
                  </button>
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