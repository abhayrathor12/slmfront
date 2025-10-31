import { useEffect, useState } from 'react';
import { Search, Plus, Trash2, Edit, ChevronDown, ChevronRight } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import api from '../utils/api';
import { toast } from 'react-toastify';

interface MainContent {
  id: number;
  title: string;
  description: string;
  module: number; // Changed to number (primary key)
  module_detail: { id: number; title: string }; // Added for module details
  order: number;
}

interface Module {
  id: number;
  title: string;
  topic: number;
}

interface Topic {
  id: number;
  name: string;
}

const MainContentManagement = () => {
  const [mainContents, setMainContents] = useState<MainContent[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [expandedTopics, setExpandedTopics] = useState<Set<number>>(new Set());
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    module: '',
    order: 1,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filteredMainContents = mainContents.filter((content) =>
        content.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      const moduleIdsWithMatches = new Set(filteredMainContents.map((content) => content.module_detail.id)); // Use module_detail.id
      const topicIdsWithMatches = new Set(
        modules.filter((module) => moduleIdsWithMatches.has(module.id)).map((module) => module.topic)
      );
      setFilteredTopics(topics.filter((topic) => topicIdsWithMatches.has(topic.id)));
      setExpandedTopics(new Set(topicIdsWithMatches));
      setExpandedModules(new Set(moduleIdsWithMatches));
    } else {
      setFilteredTopics(topics);
      setExpandedTopics(new Set());
      setExpandedModules(new Set());
    }
  }, [searchQuery, mainContents, modules, topics]);

  const fetchData = async () => {
    try {
      const [mainContentsRes, modulesRes, topicsRes] = await Promise.all([
        api.get('/api/maincontents/'),
        api.get('/api/modules/'),
        api.get('/api/topics/'),
      ]);
      setMainContents(mainContentsRes.data);
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
    if (!formData.title || !formData.module) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/api/maincontents/${editingId}/`, formData);
        toast.success('Main content updated successfully');
      } else {
        await api.post('/api/maincontents/', formData);
        toast.success('Main content added successfully');
      }
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(editingId ? 'Failed to update main content' : 'Failed to add main content');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (content: MainContent) => {
    setFormData({
      title: content.title,
      description: content.description,
      module: content.module.toString(), // Use module (primary key)
      order: content.order,
    });
    setEditingId(content.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this main content?')) return;
    try {
      await api.delete(`/api/maincontents/${id}/`);
      toast.success('Main content deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete main content');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      module: '',
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

  const toggleModule = (moduleId: number) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const getModulesByTopic = (topicId: number) => {
    return modules
      .filter((module) => module.topic === topicId)
      .filter((module) =>
        searchQuery
          ? mainContents
              .filter((content) => content.module === module.id)
              .some((content) => content.title.toLowerCase().includes(searchQuery.toLowerCase()))
          : true
      )
      .sort((a, b) => a.order - b.order);
  };

  const getMainContentsByModule = (moduleId: number) => {
    return mainContents
      .filter((content) => content.module_detail.id === moduleId) // Use module_detail.id
      .filter((content) => content.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => a.order - b.order);
  };

  if (loading) return <Loader />;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 lg:ml-64 pt-16 lg:pt-0 p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 md:mb-8 mt-4">MainContent Management</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            Add MainContent
          </button>
        </div>
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {editingId ? 'Edit MainContent' : 'Add New MainContent'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Module</label>
                <select
                  value={formData.module}
                  onChange={(e) => setFormData({ ...formData, module: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Select a module</option>
                  {topics.map((topic) => (
                    <optgroup key={topic.id} label={topic.name}>
                      {modules
                        .filter((module) => module.topic === topic.id)
                        .map((module) => (
                          <option key={module.id} value={module.id}>
                            {module.title}
                          </option>
                        ))}
                    </optgroup>
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
                  placeholder="Enter main content title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  rows={3}
                  placeholder="Enter main content description"
                />
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
                  {submitting ? 'Saving...' : editingId ? 'Update MainContent' : 'Add MainContent'}
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
                placeholder="Search main contents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
          {filteredTopics.length > 0 ? (
            <div className="space-y-4">
              {filteredTopics.map((topic) => {
                const topicModules = getModulesByTopic(topic.id);
                const isTopicExpanded = expandedTopics.has(topic.id);
                return (
                  <div key={topic.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div
                      onClick={() => toggleTopic(topic.id)}
                      className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 cursor-pointer p-4 transition"
                    >
                      <div className="flex items-center gap-3">
                        {isTopicExpanded ? (
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
                    {isTopicExpanded && topicModules.length > 0 && (
                      <div className="pl-6 space-y-2 py-2">
                        {topicModules.map((module) => {
                          const moduleMainContents = getMainContentsByModule(module.id);
                          const isModuleExpanded = expandedModules.has(module.id);
                          return (
                            <div key={module.id} className="border border-gray-200 rounded-lg overflow-hidden">
                              <div
                                onClick={() => toggleModule(module.id)}
                                className="flex items-center justify-between bg-gray-100 hover:bg-gray-200 cursor-pointer p-3 transition"
                              >
                                <div className="flex items-center gap-3">
                                  {isModuleExpanded ? (
                                    <ChevronDown className="w-5 h-5 text-gray-600" />
                                  ) : (
                                    <ChevronRight className="w-5 h-5 text-gray-600" />
                                  )}
                                  <h4 className="text-md font-medium text-gray-700">{module.title}</h4>
                                  <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded">
                                    {moduleMainContents.length} content{moduleMainContents.length !== 1 ? 's' : ''}
                                  </span>
                                </div>
                              </div>
                              {isModuleExpanded && moduleMainContents.length > 0 && (
                                <div className="overflow-x-auto">
                                  <table className="w-full">
                                    <thead>
                                      <tr className="border-b border-gray-200 bg-gray-50">
                                        <th className="text-left py-3 px-4 text-gray-700 font-semibold text-sm">ID</th>
                                        <th className="text-left py-3 px-4 text-gray-700 font-semibold text-sm">Title</th>
                                        <th className="text-left py-3 px-4 text-gray-700 font-semibold text-sm">Description</th>
                                        <th className="text-left py-3 px-4 text-gray-700 font-semibold text-sm">Order</th>
                                        <th className="text-left py-3 px-4 text-gray-700 font-semibold text-sm">Actions</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {moduleMainContents.map((content) => (
                                        <tr key={content.id} className="border-b border-gray-100 hover:bg-gray-50">
                                          <td className="py-3 px-4 text-sm">{content.id}</td>
                                          <td className="py-3 px-4 font-medium text-sm">{content.title}</td>
                                          <td className="py-3 px-4 text-sm text-gray-600">
                                            {content.description.length > 50
                                              ? content.description.substring(0, 50) + '...'
                                              : content.description}
                                          </td>
                                          <td className="py-3 px-4 text-sm">{content.order}</td>
                                          <td className="py-3 px-4">
                                            <div className="flex gap-2">
                                              <button
                                                onClick={() => handleEdit(content)}
                                                className="text-blue-600 hover:text-blue-800 transition"
                                                title="Edit"
                                              >
                                                <Edit className="w-4 h-4" />
                                              </button>
                                              <button
                                                onClick={() => handleDelete(content.id)}
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
                              {isModuleExpanded && moduleMainContents.length === 0 && (
                                <div className="p-8 text-center text-gray-500">
                                  No main contents found for this module
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {isTopicExpanded && topicModules.length === 0 && (
                      <div className="p-8 text-center text-gray-500">
                        No modules found for this topic
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState message="No topics found" />
          )}
        </div>
      </div>
    </div>
  );
};

export default MainContentManagement;