import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, CheckCircle, FileText, ClipboardList, Award, Trophy, Target, Clock } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import Navbar from '../components/navbar';

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
  description: string;
  order: number;
  pages: Page[];
  has_quiz: boolean;
  completed: boolean;
  quizId?: number;
  formatted_duration: string;
}

interface Module {
  id: number;
  title: string;
  description: string;
  difficulty_level: string;
  main_contents: MainContent[];
  formatted_duration: string;
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
      const updatedContents = await Promise.all(
        moduleData.main_contents.map(async (content: MainContent) => {
          try {
            const quizRes = await api.get(`/api/quizzes/?main_content=${content.id}`);
            if (quizRes.data && quizRes.data.length > 0) {
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
      <Navbar
        user={user}
        handleLogout={handleLogout}
        showBackButton={true}
        onBackClick={() => navigate('/user_home')}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Compact Header */}
        <div className="rounded-2xl mt-6 p-5 shadow-md border border-opacity-20 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #203f78 0%, #2d5aa0 100%)', borderColor: '#ffffff' }}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
          
          <div className="relative z-10">
            {/* Title and Meta Info Row */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${getDifficultyColor(module.difficulty_level)}`}>
                    {module.difficulty_level}
                  </span>
                  <div className="flex items-center gap-1.5 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-2.5 py-1 border border-white border-opacity-30">
                    <Target className="w-3.5 h-3.5 text-white" />
                    <span className="text-xs font-semibold text-white">{totalContents} Sections</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-2.5 py-1 border border-white border-opacity-30">
                    <Clock className="w-3.5 h-3.5 text-white" />
                    <span className="text-xs font-semibold text-white">{module.formatted_duration}</span>
                  </div>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{module.title}</h1>
                <p className="text-blue-100 text-sm sm:text-base line-clamp-2">{module.description}</p>
              </div>

              {/* Compact Progress Circle */}
              <div className="flex items-center gap-4 bg-white bg-opacity-15 backdrop-blur-sm rounded-xl px-4 py-3 border border-white border-opacity-30">
                <div className="relative w-16 h-16">
                  <svg className="transform -rotate-90 w-16 h-16">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="4"
                      fill="transparent"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="#10b981"
                      strokeWidth="4"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 28}`}
                      strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-white">{Math.round(progress)}%</span>
                  </div>
                </div>
                
                {/* Compact Stats */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-white">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">{completedContents}/{totalContents} sections</span>
                  </div>
                  <div className="flex items-center gap-2 text-white">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm font-medium">{completedPages}/{totalPages} pages</span>
                  </div>
                  <div className="flex items-center gap-2 text-white">
                    <ClipboardList className="w-4 h-4" />
                    <span className="text-sm font-medium">{module.main_contents.filter(c => c.has_quiz).length} quizzes</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Slim Progress Bar */}
            <div className="mt-4">
              <div className="h-2 bg-white bg-opacity-20 rounded-full overflow-hidden">
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

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4">
        <div className="mb-3">
          <h2 className="text-lg sm:text-xl font-bold mb-1" style={{ color: '#203f78' }}>Course Content</h2>
          <p className="text-xs sm:text-sm text-gray-600">Click on any section to expand and view lessons</p>
        </div>
        <div className="space-y-3 pb-6">
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
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all overflow-hidden border border-gray-100"
              >
                <div
                  onClick={() => toggleContent(content.id)}
                  className="flex items-start sm:items-center justify-between p-3 sm:p-4 cursor-pointer hover:bg-gray-50 transition gap-2"
                >
                  <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      {content.completed ? (
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center bg-emerald-100 border-2 border-emerald-500">
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                        </div>
                      ) : (
                        <div
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center border-2"
                          style={{ backgroundColor: '#f0f5ff', borderColor: '#203f78' }}
                        >
                          <span className="text-sm sm:text-base font-bold" style={{ color: '#203f78' }}>{index + 1}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                        <h3 className="text-sm sm:text-base font-bold text-gray-900 break-words">{content.title}</h3>
                        {content.has_quiz && (
                          <div className="flex items-center gap-0.5 bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded border border-yellow-300">
                            <ClipboardList className="w-3 h-3" />
                            <span className="text-xs font-semibold">Quiz</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mb-1 break-words line-clamp-1">{content.description}</p>
                      <div className="flex items-center gap-2 sm:gap-3 text-xs text-gray-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {totalPagesInContent} lessons
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          {completedPagesInContent} done
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {content.formatted_duration}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                    <span className="text-xs font-bold px-2 py-1 rounded" style={{
                      color: content.completed ? '#10b981' : '#203f78',
                      backgroundColor: content.completed ? '#d1fae5' : '#f0f5ff'
                    }}>
                      {Math.round(contentProgress)}%
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    )}
                  </div>
                </div>
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-4">
                    <div className="relative">
                      <div 
                        className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 to-blue-300"
                        style={{ height: '100%' }}
                      />
                      
                      <div className="space-y-2 relative">
                        {content.pages.map((page, pageIndex) => (
                          <div key={page.id} className="relative">
                            <div 
                              className="absolute left-4 top-1/2 w-6 h-0.5"
                              style={{ 
                                background: page.completed ? '#10b981' : '#203f78',
                                opacity: 0.3
                              }}
                            />
                            
                            <div
                              onClick={() => handlePageClick(page.id)}
                              className="ml-10 flex items-center gap-2 p-2 sm:p-3 rounded-lg bg-white hover:shadow-md cursor-pointer transition-all group border-2 relative"
                              style={{
                                borderColor: page.completed ? '#10b981' : '#e5e7eb',
                                transform: 'translateX(0)',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateX(4px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(32, 63, 120, 0.15)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateX(0)';
                              }}
                            >
                              <div className="flex-shrink-0">
                                {page.completed ? (
                                  <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-100 border-2 border-emerald-500">
                                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                                  </div>
                                ) : (
                                  <div
                                    className="w-7 h-7 rounded-lg flex items-center justify-center border-2"
                                    style={{ backgroundColor: '#f0f5ff', borderColor: '#203f78' }}
                                  >
                                    <span className="text-xs font-bold" style={{ color: '#203f78' }}>
                                      {pageIndex + 1}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="font-semibold text-xs sm:text-sm text-gray-800 group-hover:text-opacity-80 transition-colors break-words block" style={{ color: page.completed ? '#10b981' : '#203f78' }}>
                                  {page.title || `Lesson ${pageIndex + 1}`}
                                </span>
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {page.formatted_duration}
                                </div>
                              </div>
                              {page.completed && (
                                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded flex-shrink-0 border border-emerald-200">
                                  ✓
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        {content.quizId && (
                          <div className="relative">
                            <div 
                              className="absolute left-4 top-1/2 w-6 h-0.5 bg-yellow-400"
                              style={{ opacity: 0.4 }}
                            />
                            
                            <div
                              className="ml-10 flex items-center gap-2 p-2 sm:p-3 rounded-lg bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-50 hover:shadow-md cursor-pointer transition-all group border-2 border-yellow-300 relative"
                              onClick={() => handleQuizClick(content)}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateX(4px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(234, 179, 8, 0.2)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateX(0)';
                              }}
                            >
                              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-yellow-100 border-2 border-yellow-400 flex-shrink-0">
                                <ClipboardList className="w-4 h-4 text-yellow-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="font-bold text-xs sm:text-sm text-gray-800 block">Knowledge Check</span>
                                <span className="text-xs text-gray-600">Test your understanding</span>
                              </div>
                              <Award className="w-4 h-4 text-yellow-600 group-hover:scale-110 transition-transform flex-shrink-0" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                <div className="h-1 bg-gray-100">
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