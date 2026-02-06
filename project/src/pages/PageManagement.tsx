import { useEffect, useState } from 'react';
import { Search, Plus, Trash2, Eye, Edit2, ChevronDown, ChevronRight } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import api from '../utils/api';
import { toast } from 'react-toastify';

interface Page {
  id: number;
  title: string;
  content: string;
  main_content: number | { id: number; title: string; module: number };
  order: number;
  time_duration: number;
}
interface MainContent {
  id: number;
  title: string;
  module: number; // Changed to number (primary key)
  module_detail: { id: number; title: string }; // Added for module details
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

const PageManagement = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [mainContents, setMainContents] = useState<MainContent[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [expandedTopics, setExpandedTopics] = useState<Set<number>>(new Set());
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());
  const [expandedMainContents, setExpandedMainContents] = useState<Set<number>>(new Set());
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    main_content: '',
    order: 1,
    time_duration: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filteredPages = pages.filter((page) =>
        page.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      const mainContentIdsWithMatches = new Set(
        filteredPages.map((page) =>
          typeof page.main_content === 'number' ? page.main_content : page.main_content.id
        )
      );
      const moduleIdsWithMatches = new Set(
        mainContents.filter((content) => mainContentIdsWithMatches.has(content.id)).map((content) => content.module_detail.id) // Use module_detail.id
      );
      const topicIdsWithMatches = new Set(
        modules.filter((module) => moduleIdsWithMatches.has(module.id)).map((module) => module.topic)
      );
      setFilteredTopics(topics.filter((topic) => topicIdsWithMatches.has(topic.id)));
      setExpandedTopics(new Set(topicIdsWithMatches));
      setExpandedModules(new Set(moduleIdsWithMatches));
      setExpandedMainContents(new Set(mainContentIdsWithMatches));
    } else {
      setFilteredTopics(topics);
      setExpandedTopics(new Set());
      setExpandedModules(new Set());
      setExpandedMainContents(new Set());
    }
  }, [searchQuery, pages, mainContents, modules, topics]);

  const fetchData = async () => {
    try {
      const [pagesRes, mainContentsRes, modulesRes, topicsRes] = await Promise.all([
        api.get('/api/admin/pages/'),
        api.get('/api/maincontents/'),
        api.get('/api/modules/'),
        api.get('/api/topics/'),
      ]);
  
      // ✅ Normalize pages
      const cleanedPages: Page[] = pagesRes.data.map((p: any) => ({
        ...p,
        title: p.title || '',
        content: p.content || '',
        main_content: p.main_content?.id ?? p.main_content,
        time_duration: p.time_duration || 0,
      }));
  
      // ✅ Normalize mainContents (IMPORTANT FIX)
      const normalizedMainContents: MainContent[] = mainContentsRes.data.map((mc: any) => ({
        ...mc,
        module_detail: mc.module_detail
          ? mc.module_detail
          : {
              id: mc.module,
              title: modulesRes.data.find((m: any) => m.id === mc.module)?.title || '',
            },
      }));
  
      setPages(cleanedPages);
      setMainContents(normalizedMainContents);
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
    if (!formData.title || !formData.content || !formData.main_content) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    const payload = {
      ...formData,
      main_content: parseInt(formData.main_content),
      time_duration: parseInt(formData.time_duration.toString()),
    };
    try {
      if (editingPage) {
        await api.put(`/api/pages/${editingPage.id}/`, payload);
        toast.success('Page updated successfully');
      } else {
        await api.post('/api/pages/', payload);
        toast.success('Page added successfully');
      }
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(`Failed to ${editingPage ? 'update' : 'add'} page`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (page: Page) => {
    setEditingPage(page);
    setFormData({
      title: page.title,
      content: page.content,
      main_content: (typeof page.main_content === 'number' ? page.main_content : page.main_content.id).toString(),
      order: page.order,
      time_duration: page.time_duration,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this page?')) return;
    try {
      await api.delete(`/api/pages/${id}/`);
      toast.success('Page deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete page');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      main_content: '',
      order: 1,
      time_duration: 0,
    });
    setShowForm(false);
    setEditingPage(null);
  };

  const escapeHtml = (html: string) => {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
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

  const toggleMainContent = (mainContentId: number) => {
    const newExpanded = new Set(expandedMainContents);
    if (newExpanded.has(mainContentId)) {
      newExpanded.delete(mainContentId);
    } else {
      newExpanded.add(mainContentId);
    }
    setExpandedMainContents(newExpanded);
  };

  const getModulesByTopic = (topicId: number) => {
    return modules
      .filter((module) => module.topic === topicId)
      .filter((module) =>
        searchQuery
          ? pages
              .filter((page) =>
                mainContents
                  .filter((content) => content.module_detail.id === module.id) // Use module_detail.id
                  .map((content) => content.id)
                  .includes(typeof page.main_content === 'number' ? page.main_content : page.main_content.id)
              )
              .some((page) => page.title.toLowerCase().includes(searchQuery.toLowerCase()))
          : true
      )
      .sort((a, b) => a.order - b.order);
  };

  const getMainContentsByModule = (moduleId: number) => {
    return mainContents
      .filter((content) => content.module_detail.id === moduleId) // Use module_detail.id
      .filter((content) =>
        searchQuery
          ? pages
              .filter((page) => (typeof page.main_content === 'number' ? page.main_content : page.main_content.id) === content.id)
              .some((page) => page.title.toLowerCase().includes(searchQuery.toLowerCase()))
          : true
      )
      .sort((a, b) => a.order - b.order);
  };

  const getPagesByMainContent = (mainContentId: number) => {
    return pages
      .filter((page) => (typeof page.main_content === 'number' ? page.main_content : page.main_content.id) === mainContentId)
      .filter((page) => page.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => a.order - b.order);
  };

  if (loading) return <Loader />;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 lg:ml-64 pt-16 lg:pt-0 p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 md:mb-8 mt-4">Page Management</h1>
          <button
            onClick={() => {
              setEditingPage(null);
              setShowForm(!showForm);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            Add Page
          </button>
        </div>
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {editingPage ? 'Edit Page' : 'Add New Page'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Main Content
                </label>
                <select
                  value={formData.main_content}
                  onChange={(e) => setFormData({ ...formData, main_content: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Select a main content</option>
                  {topics.map((topic) => (
                    <optgroup key={topic.id} label={topic.name}>
                      {modules
                        .filter((module) => module.topic === topic.id)
                        .map((module) =>
                          mainContents
                            .filter((content) => content.module_detail.id === module.id)
                            .map((content) => (
                              <option key={content.id} value={content.id}>
                                {module.title} → {content.title}
                              </option>
                            ))
                        )}
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
                  placeholder="Enter page title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  rows={6}
                  placeholder="Enter page content (HTML supported)"
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Duration (minutes)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.time_duration}
                  onChange={(e) => setFormData({ ...formData, time_duration: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Enter duration in minutes"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {submitting ? (editingPage ? 'Updating...' : 'Adding...') : (editingPage ? 'Update Page' : 'Add Page')}
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
                placeholder="Search pages..."
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
                                <div className="pl-6 space-y-2 py-2">
                                  {moduleMainContents.map((mainContent) => {
                                    const mainContentPages = getPagesByMainContent(mainContent.id);
                                    const isMainContentExpanded = expandedMainContents.has(mainContent.id);
                                    return (
                                      <div key={mainContent.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                        <div
                                          onClick={() => toggleMainContent(mainContent.id)}
                                          className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 cursor-pointer p-3 transition"
                                        >
                                          <div className="flex items-center gap-3">
                                            {isMainContentExpanded ? (
                                              <ChevronDown className="w-5 h-5 text-gray-600" />
                                            ) : (
                                              <ChevronRight className="w-5 h-5 text-gray-600" />
                                            )}
                                            <h5 className="text-md font-medium text-gray-700">{mainContent.title}</h5>
                                            <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded">
                                              {mainContentPages.length} page{mainContentPages.length !== 1 ? 's' : ''}
                                            </span>
                                          </div>
                                        </div>
                                        {isMainContentExpanded && mainContentPages.length > 0 && (
                                          <div className="overflow-x-auto">
                                            <table className="w-full">
                                              <thead>
                                                <tr className="border-b border-gray-200 bg-gray-50">
                                                  <th className="text-left py-3 px-4 text-gray-700 font-semibold text-sm">ID</th>
                                                  <th className="text-left py-3 px-4 text-gray-700 font-semibold text-sm">Title</th>
                                                  <th className="text-left py-3 px-4 text-gray-700 font-semibold text-sm">Content Preview</th>
                                                  <th className="text-left py-3 px-4 text-gray-700 font-semibold text-sm">Order</th>
                                                  <th className="text-left py-3 px-4 text-gray-700 font-semibold text-sm">Duration (min)</th>
                                                  <th className="text-left py-3 px-4 text-gray-700 font-semibold text-sm">Actions</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {mainContentPages.map((page) => (
                                                  <tr key={page.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="py-3 px-4 text-sm">{page.id}</td>
                                                    <td className="py-3 px-4 font-medium text-sm">{page.title}</td>
                                                    <td className="py-3 px-4 text-sm text-gray-600">
                                                      {escapeHtml(page.content.substring(0, 50))}...
                                                    </td>
                                                    <td className="py-3 px-4 text-sm">{page.order}</td>
                                                    <td className="py-3 px-4 text-sm">{page.time_duration}</td>
                                                    <td className="py-3 px-4">
                                                      <div className="flex gap-2">
                                                        <button
                                                          onClick={() => setPreviewContent(page.content)}
                                                          className="text-blue-600 hover:text-blue-800 transition"
                                                          title="Preview"
                                                        >
                                                          <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                          onClick={() => handleEdit(page)}
                                                          className="text-green-600 hover:text-green-800 transition"
                                                          title="Edit"
                                                        >
                                                          <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                          onClick={() => handleDelete(page.id)}
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
                                        {isMainContentExpanded && mainContentPages.length === 0 && (
                                          <div className="p-8 text-center text-gray-500">
                                            No pages found for this main content
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
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
        {previewContent && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setPreviewContent(null)}
          >
            <div
              className="bg-white rounded-xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold mb-4">Content Preview</h3>
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg text-sm">
                  {escapeHtml(previewContent)}
                </pre>
              </div>
              <button
                onClick={() => setPreviewContent(null)}
                className="mt-4 bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PageManagement;