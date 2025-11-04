import { useEffect, useState } from 'react';
import { Search, BookOpen, Clock, Target, Zap, PauseCircle, ChevronRight, PlayCircle, CheckCircle, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { logout, getUser } from '../utils/auth';
import Navbar from '../components/navbar';

interface Module {
  id: number;
  title: string;
  description: string;
  difficulty_level: string;
  topic: number;
  order: number;
  formatted_duration: string;
  completion_percentage?: number;
  main_contents?: {
    pages?: {
      completed: boolean;
    }[];
  }[];
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

const StudentHome = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [filteredModules, setFilteredModules] = useState<Module[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'in-progress' | 'completed' | 'not-started'>('all');
  const [progressSummary, setProgressSummary] = useState<ProgressSummary>({
    total_modules: 0,
    completed_modules: 0,
    in_progress_modules: 0,
    not_started_modules: 0,
  });

  const navigate = useNavigate();
  const user = getUser();

  useEffect(() => {
    fetchData();
    fetchProgressSummary();
  }, []);

  useEffect(() => {
    const allModules = topics.flatMap((topic) => topic.modules);
    let filtered = allModules.filter(
      (module) =>
        module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topics
          .find((t) => t.modules.some((m) => m.id === module.id))
          ?.name.toLowerCase()
          .includes(searchQuery.toLowerCase())
    );

    // Apply status filter
    if (activeFilter === 'completed') {
      filtered = filtered.filter((m) => m.completion_percentage === 100);
    } else if (activeFilter === 'in-progress') {
      filtered = filtered.filter(
        (m) => m.completion_percentage && m.completion_percentage > 0 && m.completion_percentage < 100
      );
    } else if (activeFilter === 'not-started') {
      filtered = filtered.filter((m) => !m.completion_percentage || m.completion_percentage === 0);
    }

    setFilteredModules(filtered);

    // Set recently viewed (modules with progress)
    const recent = allModules
      .filter((m) => m.completion_percentage && m.completion_percentage > 0)
      .sort((a, b) => (b.completion_percentage || 0) - (a.completion_percentage || 0))
      .slice(0, 3);
    setRecentlyViewed(recent);
  }, [searchQuery, topics, activeFilter]);

  const fetchData = async () => {
    try {
      // Fetch topics with nested modules
      const topicsRes = await api.get('/api/topics/');

      const cleanedModules = topicsRes.data.flatMap((topic: Topic) =>
        topic.modules.map((m: Module) => ({
          ...m,
          difficulty_level: m.difficulty_level || '',
          completion_percentage: m.completion_percentage || 0,
          time_duration: m.formatted_duration || '',
        }))
      );

      const topicsWithModules = topicsRes.data.map((topic: Topic) => ({
        ...topic,
        modules: topic.modules
          .map((m: Module) => ({
            ...m,
            difficulty_level: m.difficulty_level || '',
            completion_percentage: m.completion_percentage || 0,
            time_duration: m.formatted_duration || '',
          }))
          .sort((a: Module, b: Module) => a.order - b.order),
      }));

      setTopics(topicsWithModules);
      setFilteredModules(cleanedModules);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to fetch your courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchProgressSummary = async () => {
    try {
      const res = await api.get('/progress/summary/');
      setProgressSummary(res.data);
    } catch (error) {
      console.error('Failed to fetch progress summary:', error);
      toast.error('Failed to fetch progress summary');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleModuleClick = (moduleId: number) => {
    navigate(`/module/${moduleId}`);
  };

  const formatDuration = (duration?: string) => {
    if (!duration) return 'N/A';
    const [hours, minutes] = duration.split(':').map(Number);
    if (hours === 0) return `${minutes}m`;
    return `${hours}h ${minutes}m`;
  };

  const getDifficultyColor = (level: string | undefined | null) => {
    if (!level) return 'bg-gray-100 text-gray-700 border-gray-200';
    switch (level.toLowerCase()) {
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

  const getProgressIcon = (completion_percentage?: number | null) => {
    if (completion_percentage === 100) return '🟢'; // Completed
    if (completion_percentage && completion_percentage > 0) return '🟡'; // In Progress
    return '🔵'; // Not Started
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div
            className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: '#203f78', borderTopColor: 'transparent' }}
          ></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar user={user} handleLogout={handleLogout} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section with Stats */}
        <div className="mb-8">
          <div
            className="rounded-3xl p-8 shadow-lg border border-opacity-20 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #203f78 0%, #2d5aa0 100%)', borderColor: '#ffffff' }}
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -mr-48 -mt-48"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -ml-32 -mb-32"></div>
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-white mb-2">Welcome back! 👋</h2>
                  <p className="text-blue-100 text-lg">Continue your learning journey</p>
                </div>
                <div className="flex items-center gap-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl px-6 py-4 border border-white border-opacity-30">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-white">
                    {Math.round((progressSummary.completed_modules / (progressSummary.total_modules || 1)) * 100)}%
                  </span>
                  <p className="text-sm font-medium text-blue-100">Success Rate</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-20">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-white">{progressSummary.total_modules}</span>
                  </div>
                  <p className="text-sm font-medium text-blue-100">Total Modules</p>
                </div>
                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-20">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-white">{progressSummary.completed_modules}</span>
                  </div>
                  <p className="text-sm font-medium text-blue-100">Completed</p>
                </div>
                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-20">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-white">{progressSummary.in_progress_modules}</span>
                  </div>
                  <p className="text-sm font-medium text-blue-100">In Progress</p>
                </div>
                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-20">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <PauseCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-white">{progressSummary.not_started_modules}</span>
                  </div>
                  <p className="text-sm font-medium text-blue-100">Not Started</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recently Viewed Section */}
        {recentlyViewed.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold" style={{ color: '#203f78' }}>
                Recently Viewed
              </h3>
              <button className="text-sm font-medium flex items-center gap-1 hover:underline" style={{ color: '#203f78' }}>
                View all <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentlyViewed.map((module) => {
                const topic = topics.find((t) => t.modules.some((m) => m.id === module.id));
                return (
                  <div
                    key={module.id}
                    onClick={() => handleModuleClick(module.id)}
                    className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all cursor-pointer border border-gray-100 overflow-hidden group"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-opacity-10 border">
                          {getProgressIcon(module.completion_percentage)} {module.difficulty_level || 'Standard'}
                        </span>
                        <div
                          className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg"
                          style={{ backgroundColor: '#f0f5ff', color: '#203f78' }}
                        >
                          <PlayCircle className="w-3 h-3" />
                          Continue
                        </div>
                      </div>
                      <h4 className="font-bold text-gray-900 mb-2 line-clamp-2">{module.title}</h4>
                      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{module.description}</p>
                      <div className="flex items-center gap-2 text-xs mb-3" style={{ color: '#203f78' }}>
                        <BookOpen className="w-3 h-3" />
                        <span className="font-medium">{topic?.name}</span>
                      </div>
                      <div className="pt-3 border-t border-gray-100">
                        <div className="flex justify-between items-center text-xs text-gray-600 mb-2">
                          <span>Progress</span>
                          <span className="font-semibold">{module.completion_percentage}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${module.completion_percentage}%`,
                              background: 'linear-gradient(90deg, #203f78 0%, #2d5aa0 100%)',
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for courses, topics, or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-all"
                style={{ '--tw-ring-color': '#203f78' } as any}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                { key: 'all', label: 'All Courses', icon: Target },
                { key: 'in-progress', label: 'In Progress', icon: Zap },
                { key: 'completed', label: 'Completed', icon: CheckCircle },
                { key: 'not-started', label: 'Not Started', icon: PauseCircle },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveFilter(key as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    activeFilter === key ? 'text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  style={activeFilter === key ? { background: 'linear-gradient(135deg, #203f78 0%, #2d5aa0 100%)' } : {}}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Learning Paths Title */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold mb-2" style={{ color: '#203f78' }}>
            Learning Paths
          </h3>
          <p className="text-gray-600">Choose content that aligns with your goals and skill level</p>
        </div>

        {/* Modules Grouped by Topic */}
        {filteredModules.length > 0 ? (
          <div className="space-y-8">
            {topics
              .filter((topic) => filteredModules.some((m) => topic.modules.some((tm) => tm.id === m.id)))
              .map((topic) => {
                const topicModules = filteredModules.filter((m) => topic.modules.some((tm) => tm.id === m.id));
                if (topicModules.length === 0) return null;

                return (
                  <div key={topic.id}>
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="flex items-center gap-2 px-4 py-2 rounded-xl"
                        style={{ backgroundColor: '#f0f5ff', borderLeft: '4px solid #203f78' }}
                      >
                        <BookOpen className="w-5 h-5" style={{ color: '#203f78' }} />
                        <h4 className="text-lg font-bold" style={{ color: '#203f78' }}>
                          {topic.name}
                        </h4>
                      </div>
                      <div className="flex-1 h-px bg-gray-200"></div>
                      <span className="text-sm text-gray-500 font-medium">
                        {topicModules.length} {topicModules.length === 1 ? 'Module' : 'Modules'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {topicModules.map((module) => {
                        const isCompleted = module.completion_percentage === 100;
                        const isInProgress =
                          module.main_contents?.some((mc) => mc.pages?.some((page) => page.completed)) && !isCompleted;
                        const isNotStarted = !isCompleted && !isInProgress;

                        return (
                          <div
                          key={module.id}
                          onClick={() => handleModuleClick(module.id)}
                          className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all cursor-pointer overflow-hidden group border border-gray-100 hover:border-opacity-50 flex flex-col"
                        >
                          <div className="p-6 flex flex-col flex-1">
                        
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{getProgressIcon(module.completion_percentage)}</span>
                                  <span
                                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${getDifficultyColor(
                                      module.difficulty_level
                                    )}`}
                                  >
                                    {module.difficulty_level || 'Standard'}
                                  </span>
                                </div>
                                {isCompleted && (
                                  <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg border border-emerald-200">
                                    <CheckCircle className="w-4 h-4" />
                                    <span className="text-xs font-semibold">Completed</span>
                                  </div>
                                )}
                                {isInProgress && (
                                  <div
                                    className="flex items-center gap-1 px-2 py-1 rounded-lg border"
                                    style={{ backgroundColor: '#f0f5ff', color: '#203f78', borderColor: '#203f78' }}
                                  >
                                    <Zap className="w-4 h-4" />
                                    <span className="text-xs font-semibold">{module.completion_percentage}%</span>
                                  </div>
                                )}
                                {isNotStarted && (
                                  <div className="flex items-center gap-1 bg-blue-100 text-blue-600 px-2 py-1 rounded-lg border border-blue-300">
                                    <PauseCircle className="w-4 h-4" />
                                    <span className="text-xs font-semibold">Not Started</span>
                                  </div>
                                )}
                              </div>
                              <h3
                                className="text-lg font-bold mb-2 group-hover:text-opacity-80 transition-colors line-clamp-2"
                                style={{ color: '#203f78' }}
                              >
                                {module.title}
                              </h3>
                              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{module.description}</p>
                              <div className='mt-auto'>
                                <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span>{module.time_duration}</span>
                                  </div>
                                  <div
                                    className="flex items-center gap-1 font-medium group-hover:translate-x-1 transition-transform"
                                    style={{ color: '#203f78' }}
                                  >
                                    <span>View Details</span>
                                    <ChevronRight className="w-4 h-4" />
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="h-1.5 bg-gray-100">
                              <div
                                className="h-full transition-all"
                                style={{
                                  width: `${module.completion_percentage || 0}%`,
                                  background: isCompleted ? '#10b981' : 'linear-gradient(90deg, #203f78 0%, #2d5aa0 100%)',
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f0f5ff' }}>
              <Search className="w-8 h-8" style={{ color: '#203f78' }} />
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#203f78' }}>
              No courses found
            </h3>
            <p className="text-gray-600">
              You are not registered for any topics. Contact an admin to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentHome;