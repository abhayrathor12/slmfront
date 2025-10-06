import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, CheckCircle, FileText, ClipboardList, Award, Trophy, Target } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import Navbar from '../components/navbar';

// Define interfaces for type safety
interface Page {
  id: number;
  title: string;
  order: number;
  completed: boolean;
}

interface MainContent {
  id: number;
  title: string;
  description: string;
  order: number;
  pages: Page[];
  has_quiz: boolean;
  completed: boolean;
  quizId?: number;
}

interface Module {
  id: number;
  title: string;
  description: string;
  difficulty_level: string;
  main_contents: MainContent[];
}

interface User {
  username?: string;
}

const ModuleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [module, setModule] = useState<Module | null>(null);
  const [expandedContents, setExpandedContents] = useState<number[]>([1]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | undefined>(undefined);

  useEffect(() => {
    fetchModule();
    fetchUserData();
  }, [id]);

  const fetchUserData = async () => {
    try {
      const response = await api.get('/accounts/users/');
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user data');
    }
  };

  const fetchModule = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/modules/${id}/`);
      const moduleData = response.data;

      // For each main_content, check if it has a quiz
      const updatedContents = await Promise.all(
        moduleData.main_contents.map(async (content: MainContent) => {
          try {
            const quizRes = await api.get(`/api/quizzes/?main_content=${content.id}`);
            if (quizRes.data && quizRes.data.length > 0) {
              // If quiz exists, attach quizId
              return { ...content, quizId: quizRes.data[0].id, has_quiz: true };
            }
          } catch (err) {
            console.error(`No quiz for main_content ${content.id}`);
          }
          return content;
        })
      );

      setModule({ ...moduleData, main_contents: updatedContents });
    } catch (error) {
      toast.error('Failed to fetch module');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const toggleContent = (contentId: number) => {
    if (expandedContents.includes(contentId)) {
      setExpandedContents(expandedContents.filter(id => id !== contentId));
    } else {
      setExpandedContents([...expandedContents, contentId]);
    }
  };

  const handlePageClick = (pageId: number) => {
    navigate(`/page/${pageId}`, { state: { moduleId: module?.id } });
  };

  const handleQuizClick = (content: MainContent) => {
    // Navigate to the last page of the main content with a flag to show the quiz
    const lastPage = content.pages.sort((a, b) => a.order - b.order)[content.pages.length - 1];
    if (lastPage && content.quizId) {
      navigate(`/page/${lastPage.id}`, { 
        state: { 
          moduleId: module?.id, 
          showQuiz: true, 
          mainContentId: content.id 
        } 
      });
    } else {
      toast.error('No quiz or pages available for this content');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: '#203f78', borderTopColor: 'transparent' }}></div>
          <p className="text-gray-600">Loading module...</p>
        </div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Navbar user={user} handleLogout={handleLogout} />
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#203f78' }}>Module not found</h2>
          </div>
        </div>
      </div>
    );
  }

  const completedContents = module.main_contents.filter((c) => c.completed).length;
  const totalContents = module.main_contents.length;
  const progress = module.completion_percentage ?? 0;
  const totalPages = module.main_contents.reduce((sum, content) => sum + content.pages.length, 0);
  const completedPages = module.main_contents.reduce(
    (sum, content) => sum + content.pages.filter(p => p.completed).length,
    0
  );

  const getDifficultyColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'intermediate':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'advanced':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navbar */}
      <Navbar 
  user={user} 
  handleLogout={handleLogout} 
  showBackButton={true}
  onBackClick={() => navigate('/user_home')}
/>

      

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl mt-6 p-8 shadow-lg border border-opacity-20 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #203f78 0%, #2d5aa0 100%)', borderColor: '#ffffff' }}>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -ml-32 -mb-32"></div>
         
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${getDifficultyColor(module.difficulty_level)}`}>
                    {module.difficulty_level}
                  </span>
                  <div className="flex items-center gap-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white border-opacity-30">
                    <Target className="w-4 h-4 text-white" />
                    <span className="text-xs font-semibold text-white">{totalContents} Sections</span>
                  </div>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">{module.title}</h1>
                <p className="text-blue-100 text-lg">{module.description}</p>
              </div>
              <div className="flex items-center gap-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl px-6 py-4 border border-white border-opacity-30">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-white block">{Math.round(progress)}%</span>
                  <p className="text-xs font-medium text-blue-100">Complete</p>
                </div>
              </div>
            </div>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-white">{completedContents}/{totalContents}</span>
                </div>
                <p className="text-sm font-medium text-blue-100">Sections Done</p>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-white">{completedPages}/{totalPages}</span>
                </div>
                <p className="text-sm font-medium text-blue-100">Pages Read</p>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <ClipboardList className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-white">{module.main_contents.filter(c => c.has_quiz).length}</span>
                </div>
                <p className="text-sm font-medium text-blue-100">Knowledge Checks</p>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between items-center text-sm text-white mb-2">
                <span className="font-medium">Overall Progress</span>
                <span className="font-semibold">{Math.round(progress)}%</span>
              </div>
              <div className="h-3 bg-white bg-opacity-20 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#203f78' }}>Course Content</h2>
          <p className="text-gray-600">Click on any section to expand and view lessons</p>
        </div>
        <div className="space-y-4 pb-8">
          {module.main_contents.map((content, index) => {
            const isExpanded = expandedContents.includes(content.id);
            const completedPagesInContent = content.pages.filter(p => p.completed).length;
            const totalPagesInContent = content.pages.length;
            const contentProgress = totalPagesInContent > 0
              ? (completedPagesInContent / totalPagesInContent) * 100
              : 0;
            return (
              <div
                key={content.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all overflow-hidden border border-gray-100"
              >
                {/* Section Header */}
                <div
                  onClick={() => toggleContent(content.id)}
                  className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-shrink-0">
                      {content.completed ? (
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-100 border-2 border-emerald-500">
                          <CheckCircle className="w-6 h-6 text-emerald-600" />
                        </div>
                      ) : (
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center border-2"
                          style={{ backgroundColor: '#f0f5ff', borderColor: '#203f78' }}
                        >
                          <span className="text-lg font-bold" style={{ color: '#203f78' }}>{index + 1}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-lg font-bold text-gray-900">{content.title}</h3>
                        {content.has_quiz && (
                          <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-lg border border-yellow-300">
                            <ClipboardList className="w-3 h-3" />
                            <span className="text-xs font-semibold">Quiz</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{content.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {totalPagesInContent} lessons
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          {completedPagesInContent} completed
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:block">
                      <div className="w-16 h-16 relative">
                        <svg className="transform -rotate-90 w-16 h-16">
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="#e5e7eb"
                            strokeWidth="4"
                            fill="transparent"
                          />
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke={content.completed ? '#10b981' : '#203f78'}
                            strokeWidth="4"
                            fill="transparent"
                            strokeDasharray={`${2 * Math.PI * 28}`}
                            strokeDashoffset={`${2 * Math.PI * 28 * (1 - contentProgress / 100)}`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-bold" style={{ color: content.completed ? '#10b981' : '#203f78' }}>
                            {Math.round(contentProgress)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-6 h-6 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                </div>
                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50 p-6 space-y-2">
                    {content.pages.map((page, pageIndex) => (
                      <div
                        key={page.id}
                        onClick={() => handlePageClick(page.id)}
                        className="flex items-center gap-3 p-4 rounded-xl bg-white hover:shadow-md cursor-pointer transition-all group border border-gray-100"
                      >
                        <div className="flex-shrink-0">
                          {page.completed ? (
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-100">
                              <CheckCircle className="w-5 h-5 text-emerald-600" />
                            </div>
                          ) : (
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: '#f0f5ff' }}
                            >
                              <FileText className="w-5 h-5" style={{ color: '#203f78' }} />
                            </div>
                          )}
                        </div>
                        <span className="font-medium text-gray-800 flex-1 group-hover:text-opacity-80 transition-colors" style={{ color: page.completed ? '#10b981' : '#203f78' }}>
                          {page.title || `Lesson ${pageIndex + 1}`}
                        </span>
                        {page.completed && (
                          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                            Completed
                          </span>
                        )}
                      </div>
                    ))}
                    {content.quizId && (
                      <div
                        className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 hover:shadow-md cursor-pointer transition-all group border border-yellow-200"
                        onClick={() => handleQuizClick(content)}
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-yellow-100">
                          <ClipboardList className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div className="flex-1">
                          <span className="font-semibold text-gray-800 block">Knowledge Check</span>
                          <span className="text-xs text-gray-600">Test your understanding</span>
                        </div>
                        <Award className="w-5 h-5 text-yellow-600 group-hover:scale-110 transition-transform" />
                      </div>
                    )}
                  </div>
                )}
                {/* Progress Bar at Bottom */}
                <div className="h-1.5 bg-gray-100">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${contentProgress}%`,
                      background: content.completed
                        ? '#10b981'
                        : 'linear-gradient(90deg, #203f78 0%, #2d5aa0 100%)'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ModuleDetail;