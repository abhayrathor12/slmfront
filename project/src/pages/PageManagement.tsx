import { useEffect, useState } from 'react';
import { Search, Plus, Trash2, Eye } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import api from '../utils/api';
import { toast } from 'react-toastify';

interface Page {
  id: number;
  title: string;
  content: string;
  main_content: number;
  order: number;
}

interface MainContent {
  id: number;
  title: string;
}

const PageManagement = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [filteredPages, setFilteredPages] = useState<Page[]>([]);
  const [mainContents, setMainContents] = useState<MainContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    main_content: '',
    order: 1,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = pages.filter((page) =>
      page.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredPages(filtered);
  }, [searchQuery, pages]);

  const fetchData = async () => {
    try {
      const [pagesRes, mainContentsRes] = await Promise.all([
        api.get('/api/pages/'),
        api.get('/api/maincontents/'),
      ]);
  
      // Clean pages: make sure title/content are always strings
      const cleanedPages: Page[] = pagesRes.data.map((p: any) => ({
        ...p,
        title: p.title || '',
        content: p.content || '',
      }));
  
      setPages(cleanedPages);
      setFilteredPages(cleanedPages);
      setMainContents(mainContentsRes.data);
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

    try {
      await api.post('/api/pages/', formData);
      toast.success('Page added successfully');
      resetForm();
      fetchData();
    } catch (error) {
      toast.error('Failed to add page');
    } finally {
      setSubmitting(false);
    }
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
    });
    setShowForm(false);
  };

  const escapeHtml = (html: string) => {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  };

  if (loading) return <Loader />;

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Page Management</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            Add Page
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Page</h2>
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
                  {mainContents.map((content) => (
                    <option key={content.id} value={content.id}>
                      {content.title}
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
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Add Page'}
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

          {filteredPages.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">ID</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Title</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Content Preview</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Order</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPages.map((page) => (
                    <tr key={page.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">{page.id}</td>
                      <td className="py-3 px-4 font-medium">{page.title}</td>
                      <td className="py-3 px-4">
                        <span className="text-gray-600">
                          {escapeHtml(page.content.substring(0, 50))}...
                        </span>
                      </td>
                      <td className="py-3 px-4">{page.order}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setPreviewContent(page.content)}
                            className="text-blue-600 hover:text-blue-800 transition"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(page.id)}
                            className="text-red-600 hover:text-red-800 transition"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState message="No pages found" />
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