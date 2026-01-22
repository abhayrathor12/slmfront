import { useEffect, useState } from 'react';
import { Search, Plus, Trash2, Edit, ChevronDown, ChevronRight } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import api from '../utils/api';
import { toast } from 'react-toastify';

interface Module {
  id: number;
  title: string;
  description: string;
  difficulty_level: string;
  time_duration: string | null;
  topic: number;
  order: number;
}

interface Topic {
  id: number;
  name: string;
  order?: number;
}

const ModuleManagement = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [expandedTopics, setExpandedTopics] = useState<Set<number>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty_level: 'beginner',
    topic: '',
    order: 1,
  });

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-set order when topic changes (only in Add mode)
  useEffect(() => {
    if (formData.topic && !editingId) {
      const topicId = parseInt(formData.topic);
      const topicModules = modules
        .filter(m => m.topic === topicId)
        .sort((a, b) => a.order - b.order);
      const maxOrder = topicModules.length > 0
        ? Math.max(...topicModules.map(m => m.order))
        : 0;
      setFormData(prev => ({ ...prev, order: maxOrder + 1 }));
    }
  }, [formData.topic, editingId, modules]);

  // Search filter
  useEffect(() => {
    if (searchQuery) {
      const filteredModules = modules.filter((module) =>
        module.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      const topicIdsWithMatches = new Set(filteredModules.map((module) => module.topic));
      setFilteredTopics(topics.filter((topic) => topicIdsWithMatches.has(topic.id)));
      setExpandedTopics(new Set(topicIdsWithMatches));
    } else {
      setFilteredTopics(topics);
      setExpandedTopics(new Set());
    }
  }, [searchQuery, modules, topics]);

  const fetchData = async () => {
    try {
      const [modulesRes, topicsRes] = await Promise.all([
        api.get('/api/modules/'),
        api.get('/api/topics/'),
      ]);
      setModules(modulesRes.data);
      setTopics(topicsRes.data);
      setFilteredTopics(topicsRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.topic) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const submitData = {
        title: formData.title,
        description: formData.description,
        difficulty_level: formData.difficulty_level,
        topic: parseInt(formData.topic),
        order: formData.order,
      };

      if (editingId) {
        await api.put(`/api/modules/${editingId}/`, submitData);
        toast.success('Module updated successfully');
      } else {
        await api.post('/api/modules/', submitData);
        toast.success('Module added successfully');
      }
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (module: Module) => {
    setFormData({
      title: module.title,
      description: module.description,
      difficulty_level: module.difficulty_level,
      topic: module.topic.toString(),
      order: module.order,
    });
    setEditingId(module.id);
    setShowForm(true);

    setTimeout(() => {
      document.getElementById('module-form')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }, 100);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this module?')) return;
    try {
      await api.delete(`/api/modules/${id}/`);
      toast.success('Module deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete module');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      difficulty_level: 'beginner',
      topic: '',
      order: 1,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const toggleTopic = (topicId: number) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(topicId)) {
      newExpanded.delete(topicId);
    } else {
      newExpanded.add(topicId);
    }
    setExpandedTopics(newExpanded);
  };

  const getModulesByTopic = (topicId: number) => {
    return modules
      .filter((m) => m.topic === topicId)
      .filter((m) => m.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => a.order - b.order);
  };

  // Smart Order Options
  const getOrderOptions = () => {
    const topicId = parseInt(formData.topic);
    if (!topicId) return [];

    const topicModules = modules
      .filter(m => m.topic === topicId)
      .sort((a, b) => a.order - b.order);

    const maxOrder = topicModules.length > 0
      ? Math.max(...topicModules.map(m => m.order))
      : 0;

    const options: { value: number; label: string }[] = [];

    // First position
    options.push({ value: 1, label: '1 (First position)' });

    // After each existing module
    topicModules.forEach((mod, idx) => {
      const nextOrder = mod.order + 1;
      if (nextOrder <= maxOrder + 1) {
        options.push({
          value: nextOrder,
          label: `${nextOrder} (After "${mod.title}")`
        });
      }
    });

    // Last position
    options.push({ value: maxOrder + 1, label: `${maxOrder + 1} (Last position)` });

    // Dedupe
    return options.filter((opt, idx) =>
      options.findIndex(o => o.value === opt.value) === idx
    );
  };

  if (loading) return <Loader />;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 lg:ml-64 pt-16 lg:pt-0 p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 md:mb-8 mt-4">Module Management</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            Add Module
          </button>
        </div>

        {/* FORM */}
        {showForm && (
          <div id="module-form" className="bg-white rounded-xl shadow-sm p-6 mb-6 border-2 border-blue-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {editingId ? 'Edit Module' : 'Add New Module'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Topic <span className="text-red-500">*</span></label>
                <select
                  required
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select a topic</option>
                  {topics.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Enter module title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  rows={3}
                  placeholder="Enter module description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
                <select
                  value={formData.difficulty_level}
                  onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Position
                  <span className="text-xs text-gray-500 ml-2">
                    (Others will shift automatically)
                  </span>
                </label>
                <select
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                >
                  {formData.topic ? (
                    getOrderOptions().length > 0 ? (
                      getOrderOptions().map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))
                    ) : (
                      <option value={1}>1 (First position)</option>
                    )
                  ) : (
                    <option value="">Select topic first</option>
                  )}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingId ? 'Update Module' : 'Add Module'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* SEARCH + LIST */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {filteredTopics.length > 0 ? (
            <div className="space-y-3">
              {filteredTopics.map((topic) => {
                const topicModules = getModulesByTopic(topic.id);
                const isExpanded = expandedTopics.has(topic.id);
                return (
                  <div key={topic.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div
                      onClick={() => toggleTopic(topic.id)}
                      className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 cursor-pointer p-4 transition"
                    >
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-blue-600" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-blue-600" />
                        )}
                        <h3 className="text-lg font-bold text-gray-800">{topic.name}</h3>
                        <span className="text-sm font-medium text-blue-700 bg-white px-3 py-1 rounded-full">
                          {topicModules.length} module{topicModules.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="overflow-x-auto">
                        {topicModules.length > 0 ? (
                          <table className="w-full">
                            <thead>
                              <tr className="border-b-2 border-gray-200 bg-gray-50">
                                <th className="text-left py-3 px-4 text-gray-700 font-bold text-sm">Order</th>
                                <th className="text-left py-3 px-4 text-gray-700 font-bold text-sm">Title</th>
                                <th className="text-left py-3 px-4 text-gray-700 font-bold text-sm">Description</th>
                                <th className="text-left py-3 px-4 text-gray-700 font-bold text-sm">Difficulty</th>
                                <th className="text-left py-3 px-4 text-gray-700 font-bold text-sm">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {topicModules.map((module) => (
                                <tr key={module.id} className="border-b hover:bg-blue-50 transition">
                                  <td className="py-4 px-4">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                                      #{module.order}
                                    </span>
                                  </td>
                                  <td className="py-4 px-4 font-semibold text-gray-800">{module.title}</td>
                                  <td className="py-4 px-4 text-sm text-gray-600 max-w-xs">
                                    {module.description.substring(0, 80)}{module.description.length > 80 ? '...' : ''}
                                  </td>
                                  <td className="py-4 px-4">
                                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                                      module.difficulty_level === 'beginner' ? 'bg-green-100 text-green-800' :
                                      module.difficulty_level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {module.difficulty_level}
                                    </span>
                                  </td>
                                  <td className="py-4 px-4">
                                    <div className="flex gap-3">
                                      <button
                                        onClick={() => handleEdit(module)}
                                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 p-2 rounded-lg transition"
                                        title="Edit"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDelete(module.id)}
                                        className="text-red-600 hover:text-red-800 hover:bg-red-100 p-2 rounded-lg transition"
                                        title="Delete"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <div className="p-12 text-center text-gray-500">
                            No modules found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500 text-lg">
              {searchQuery ? 'No modules match your search' : 'No topics available'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModuleManagement;