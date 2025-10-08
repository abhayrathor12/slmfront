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
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty_level: 'beginner',
    topic: '',
    order: 1,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

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
      if (editingId) {
        await api.put(`/api/modules/${editingId}/`, formData);
        toast.success('Module updated successfully');
      } else {
        await api.post('/api/modules/', formData);
        toast.success('Module added successfully');
      }
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(editingId ? 'Failed to update module' : 'Failed to add module');
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

  if (loading) return <Loader />;

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Module Management</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            Add Module
          </button>
        </div>
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {editingId ? 'Edit Module' : 'Add New Module'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                <select
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Enter module title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  rows={3}
                  placeholder="Enter module description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
                <select
                  value={formData.difficulty_level}
                  onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                <input
                  type="number"
                  min="1"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div className="flex gap-3">
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
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
          {filteredTopics.length > 0 ? (
            <div className="space-y-2">
              {filteredTopics.map((topic) => {
                const topicModules = getModulesByTopic(topic.id);
                const isExpanded = expandedTopics.has(topic.id);

                return (
                  <div key={topic.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div
                      onClick={() => toggleTopic(topic.id)}
                      className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 cursor-pointer p-4 transition"
                    >
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-gray-600" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-600" />
                        )}
                        <h3 className="text-lg font-semibold text-gray-800">{topic.name}</h3>
                        <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded">
                          {topicModules.length} module{topicModules.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    {isExpanded && topicModules.length > 0 && (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                              <th className="text-left py-3 px-4 text-gray-700 font-semibold text-sm">ID</th>
                              <th className="text-left py-3 px-4 text-gray-700 font-semibold text-sm">Title</th>
                              <th className="text-left py-3 px-4 text-gray-700 font-semibold text-sm">Description</th>
                              <th className="text-left py-3 px-4 text-gray-700 font-semibold text-sm">Difficulty</th>
                              <th className="text-left py-3 px-4 text-gray-700 font-semibold text-sm">Order</th>
                              <th className="text-left py-3 px-4 text-gray-700 font-semibold text-sm">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {topicModules.map((module) => (
                              <tr key={module.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4 text-sm">{module.id}</td>
                                <td className="py-3 px-4 font-medium text-sm">{module.title}</td>
                                <td className="py-3 px-4 text-sm text-gray-600">
                                  {module.description.length > 50
                                    ? module.description.substring(0, 50) + '...'
                                    : module.description}
                                </td>
                                <td className="py-3 px-4">
                                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                    {module.difficulty_level}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-sm">{module.order}</td>
                                <td className="py-3 px-4">
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleEdit(module)}
                                      className="text-blue-600 hover:text-blue-800 transition"
                                      title="Edit"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(module.id)}
                                      className="text-red-600 hover:text-red-800 transition"
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
                      </div>
                    )}
                    {isExpanded && topicModules.length === 0 && (
                      <div className="p-8 text-center text-gray-500">
                        No modules found for this topic
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              No topics found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModuleManagement;