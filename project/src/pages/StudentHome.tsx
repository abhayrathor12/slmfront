import { useEffect, useState } from 'react';
import {
  Search,
  BookOpen,
  Clock,
  Target,
  Zap,
  PauseCircle,
  ChevronRight,
  CheckCircle,
  Trophy,
} from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] =
    useState<'all' | 'in-progress' | 'completed' | 'not-started'>('all');
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
    const allModules = topics.flatMap((t) => t.modules);

    let filtered = allModules.filter(
      (m) =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topics
          .find((t) => t.modules.some((tm) => tm.id === m.id))
          ?.name.toLowerCase()
          .includes(searchQuery.toLowerCase())
    );

    if (activeFilter === 'completed') {
      filtered = filtered.filter((m) => m.completion_percentage === 100);
    } else if (activeFilter === 'in-progress') {
      filtered = filtered.filter(
        (m) => m.completion_percentage! > 0 && m.completion_percentage! < 100
      );
    } else if (activeFilter === 'not-started') {
      filtered = filtered.filter((m) => !m.completion_percentage);
    }

    setFilteredModules(filtered);
  }, [searchQuery, topics, activeFilter]);

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
      setFilteredModules(topicsWithModules.flatMap((t) => t.modules));
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

  const handleModuleClick = async (moduleId: number) => {
    try {
      const res = await api.get(`/api/modules/${moduleId}/`);
      const firstContent = res.data.main_contents?.[0];
      const firstPage = firstContent?.pages?.sort(
        (a: any, b: any) => a.order - b.order
      )[0];
  
      if (!firstPage) {
        toast.error('No pages found in this module');
        return;
      }
  
      navigate(`/page/${firstPage.id}`, {
        state: { moduleId }
      });
    } catch {
      toast.error('Failed to open module');
    }
  };

  const getProgressIcon = (p?: number) =>
    p === 100 ? '🟢' : p && p > 0 ? '🟡' : '🔵';

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

      {/* PAGE WRAPPER – compact */}
      <div className="max-w-7xl mx-auto px-4 py-5">

        {/* HERO – compact */}
        <div className="mb-4">
          <div
            className="rounded-xl px-4 py-3 border shadow-sm"
            style={{ background: '#203f78', borderColor: 'rgba(255,255,255,0.2)' }}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
              <div>
                <h2 className="text-base font-semibold text-white">
                  Welcome back 👋
                </h2>
                <p className="text-xs text-blue-100">
                  Continue where you left off
                </p>
              </div>

              <div className="flex items-center gap-2 bg-white/15 px-3 py-1.5 rounded-lg">
                <Trophy className="w-4 h-4 text-white" />
                <span className="text-sm font-bold text-white">
                  {Math.round(
                    (progressSummary.completed_modules /
                      (progressSummary.total_modules || 1)) *
                      100
                  )}%
                </span>
                <span className="text-[11px] text-blue-100">Completed</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { label: 'Modules', value: progressSummary.total_modules, icon: BookOpen },
                { label: 'Completed', value: progressSummary.completed_modules, icon: CheckCircle },
                { label: 'In Progress', value: progressSummary.in_progress_modules, icon: Zap },
                { label: 'Not Started', value: progressSummary.not_started_modules, icon: PauseCircle },
              ].map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg"
                >
                  <Icon className="w-4 h-4 text-white" />
                  <div>
                    <p className="text-sm font-semibold text-white">{value}</p>
                    <p className="text-[11px] text-blue-100">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SEARCH & FILTER – compact */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-5">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search courses, topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white outline-none"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {[
                { key: 'all', label: 'All', icon: Target },
                { key: 'in-progress', label: 'In Progress', icon: Zap },
                { key: 'completed', label: 'Completed', icon: CheckCircle },
                { key: 'not-started', label: 'Not Started', icon: PauseCircle },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveFilter(key as any)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    activeFilter === key
                      ? 'text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  style={
                    activeFilter === key
                      ? { background: 'linear-gradient(135deg, #203f78 0%, #2d5aa0 100%)' }
                      : {}
                  }
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* LEARNING PATHS */}
        {/* <div className="mb-4">
          <h3 className="text-xl font-semibold mb-1" style={{ color: '#203f78' }}>
            Learning Paths
          </h3>
          <p className="text-sm text-gray-600">
            Choose content that aligns with your goals
          </p>
        </div> */}

        {/* MODULES – CARD DESIGN UNCHANGED */}
        {filteredModules.length > 0 ? (
          <div className="space-y-5">
            {topics
              .filter((topic) =>
                filteredModules.some((m) =>
                  topic.modules.some((tm) => tm.id === m.id)
                )
              )
              .map((topic) => {
                const topicModules = filteredModules.filter((m) =>
                  topic.modules.some((tm) => tm.id === m.id)
                );
                if (!topicModules.length) return null;

                return (
                  <div key={topic.id}>
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                        style={{
                          backgroundColor: '#f0f5ff',
                          borderLeft: '4px solid #203f78',
                        }}
                      >
                        <BookOpen className="w-4 h-4" style={{ color: '#203f78' }} />
                        <h4 className="text-base font-semibold" style={{ color: '#203f78' }}>
                          {topic.name}
                        </h4>
                      </div>
                      <div className="flex-1 h-px bg-gray-200" />
                      <span className="text-xs text-gray-500 font-medium">
                        {topicModules.length} Modules
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {topicModules.map((module) => {
                        const isCompleted = module.completion_percentage === 100;
                        const isInProgress =
                          module.main_contents?.some((mc) =>
                            mc.pages?.some((p) => p.completed)
                          ) && !isCompleted;
                        const isNotStarted = !isCompleted && !isInProgress;

                        return (
                          /* 🔒 MODULE CARD – UNCHANGED */
                          <div
                            key={module.id}
                            onClick={() => handleModuleClick(module.id)}
                            className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all cursor-pointer overflow-hidden group border border-gray-100 hover:border-opacity-50 flex flex-col"
                          >
                            <div className="p-6 flex flex-col flex-1">
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">
                                    {getProgressIcon(module.completion_percentage)}
                                  </span>
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
                                    <span className="text-xs font-semibold">
                                      Completed
                                    </span>
                                  </div>
                                )}

                                {isInProgress && (
                                  <div
                                    className="flex items-center gap-1 px-2 py-1 rounded-lg border"
                                    style={{
                                      backgroundColor: '#f0f5ff',
                                      color: '#203f78',
                                      borderColor: '#203f78',
                                    }}
                                  >
                                    <Zap className="w-4 h-4" />
                                    <span className="text-xs font-semibold">
                                      {module.completion_percentage}%
                                    </span>
                                  </div>
                                )}

                                {isNotStarted && (
                                  <div className="flex items-center gap-1 bg-blue-100 text-blue-600 px-2 py-1 rounded-lg border border-blue-300">
                                    <PauseCircle className="w-4 h-4" />
                                    <span className="text-xs font-semibold">
                                      Not Started
                                    </span>
                                  </div>
                                )}
                              </div>

                              <h3
                                className="text-lg font-bold mb-2 line-clamp-2"
                                style={{ color: '#203f78' }}
                              >
                                {module.title}
                              </h3>

                              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                {module.description}
                              </p>

                              <div className="mt-auto">
                                <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span>{module.formatted_duration}</span>
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
                                  background: isCompleted
                                    ? '#10b981'
                                    : 'linear-gradient(90deg, #203f78 0%, #2d5aa0 100%)',
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <Search className="w-8 h-8 mx-auto mb-3 text-gray-400" />
            <h3 className="text-base font-semibold mb-1" style={{ color: '#203f78' }}>
              No courses found
            </h3>
            <p className="text-sm text-gray-600">
              You are not registered for any topics.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentHome;
