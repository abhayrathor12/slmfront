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
    const allModules = topics.flatMap((t) => t.modules);

    let filtered = allModules.filter(
      (m) =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topics.find((t) => t.modules.some((tm) => tm.id === m.id))
          ?.name.toLowerCase()
          .includes(searchQuery.toLowerCase())
    );

    if (activeFilter === 'completed') {
      filtered = filtered.filter((m) => m.completion_percentage === 100);
    } else if (activeFilter === 'in-progress') {
      filtered = filtered.filter((m) => m.completion_percentage! > 0 && m.completion_percentage! < 100);
    } else if (activeFilter === 'not-started') {
      filtered = filtered.filter((m) => !m.completion_percentage);
    }

    setFilteredModules(filtered);
  }, [searchQuery, topics, activeFilter]);

  const fetchData = async () => {
    try {
      const res = await api.get('/api/topics/');
      const topicsWithModules = res.data.map((t: Topic) => ({
        ...t,
        modules: t.modules
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
    toast.success('Logged out');
    navigate('/login');
  };

  const handleModuleClick = (id: number) => navigate(`/module/${id}`);

  const getProgressIcon = (p?: number) =>
    p === 100 ? '🟢' : p && p > 0 ? '🟡' : '🔵';

  const getDifficultyColor = (level: string) => {
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
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#203f78' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={user} handleLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-4 py-5">

        {/* HERO */}
        <div className="mb-5">
          <div className="rounded-xl px-4 py-3 border bg-[#203f78] text-white">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h2 className="text-base font-semibold">Welcome back 👋</h2>
                <p className="text-xs text-blue-100">Continue learning</p>
              </div>
              <div className="flex items-center gap-2 bg-white/15 px-3 py-1.5 rounded-lg">
                <Trophy className="w-4 h-4" />
                <span className="text-sm font-bold">
                  {Math.round((progressSummary.completed_modules / (progressSummary.total_modules || 1)) * 100)}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { label: 'Modules', value: progressSummary.total_modules, icon: BookOpen },
                { label: 'Completed', value: progressSummary.completed_modules, icon: CheckCircle },
                { label: 'In Progress', value: progressSummary.in_progress_modules, icon: Zap },
                { label: 'Not Started', value: progressSummary.not_started_modules, icon: PauseCircle },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg">
                  <Icon className="w-4 h-4" />
                  <div>
                    <p className="text-sm font-semibold">{value}</p>
                    <p className="text-[11px] text-blue-100">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SEARCH */}
        <div className="bg-white rounded-xl border p-4 mb-5">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg bg-gray-50"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {[
                { key: 'all', label: 'All', icon: Target },
                { key: 'in-progress', label: 'Progress', icon: Zap },
                { key: 'completed', label: 'Done', icon: CheckCircle },
                { key: 'not-started', label: 'New', icon: PauseCircle },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveFilter(key as any)}
                  className={`px-3 py-2 text-xs rounded-lg flex items-center gap-1.5 ${
                    activeFilter === key ? 'bg-[#203f78] text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* MODULES */}
        <div className="space-y-5">
          {topics.map((topic) => {
            const topicModules = filteredModules.filter((m) =>
              topic.modules.some((tm) => tm.id === m.id)
            );
            if (!topicModules.length) return null;

            return (
              <div key={topic.id}>
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-[#203f78]" />
                  <h3 className="text-base font-semibold text-[#203f78]">{topic.name}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {topicModules.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => handleModuleClick(m.id)}
                      className="bg-white rounded-xl border p-4 cursor-pointer hover:shadow-sm"
                    >
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">{getProgressIcon(m.completion_percentage)}</span>
                        <span className={`text-[11px] px-2 py-0.5 rounded border ${getDifficultyColor(m.difficulty_level)}`}>
                          {m.difficulty_level || 'Standard'}
                        </span>
                      </div>

                      <h4 className="text-sm font-semibold mb-1 text-[#203f78] line-clamp-2">
                        {m.title}
                      </h4>
                      <p className="text-xs text-gray-600 line-clamp-2 mb-2">{m.description}</p>

                      <div className="flex justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {m.formatted_duration}
                        </span>
                        <span className="flex items-center gap-1 text-[#203f78]">
                          View <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>

                      <div className="mt-2 h-1 bg-gray-100 rounded">
                        <div
                          className="h-full rounded"
                          style={{
                            width: `${m.completion_percentage}%`,
                            background: m.completion_percentage === 100 ? '#10b981' : '#203f78',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default StudentHome;
