import { useEffect, useState } from 'react';
import { Search, Plus, Trash2, CreditCard as Edit } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import api from '../utils/api';
import { toast } from 'react-toastify';

interface MainContent {
  id: number;
  title: string;
  description: string;
  module: number;
  order: number;
}

interface Module {
  id: number;
  title: string;
}

const MainContentManagement = () => {
  const [mainContents, setMainContents] = useState<MainContent[]>([]);
  const [filteredMainContents, setFilteredMainContents] = useState<MainContent[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
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
    const filtered = mainContents.filter((content) =>
      content.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredMainContents(filtered);
  }, [searchQuery, mainContents]);

  const fetchData = async () => {
    try {
      const [mainContentsRes, modulesRes] = await Promise.all([
        api.get('/api/maincontents/'),
        api.get('/api/modules/'),
      ]);
      setMainContents(mainContentsRes.data);
      setFilteredMainContents(mainContentsRes.data);
      setModules(modulesRes.data);
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
      module: content.module.toString(),
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

  if (loading) return <Loader />;

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">MainContent Management</h1>
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
                  {modules.map((module) => (
                    <option key={module.id} value={module.id}>
                      {module.title}
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

          {filteredMainContents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">ID</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Title</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Description</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Order</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMainContents.map((content) => (
                    <tr key={content.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">{content.id}</td>
                      <td className="py-3 px-4 font-medium">{content.title}</td>
                      <td className="py-3 px-4">{content.description.substring(0, 50)}...</td>
                      <td className="py-3 px-4">{content.order}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(content)}
                            className="text-blue-600 hover:text-blue-800 transition"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(content.id)}
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
            <EmptyState message="No main contents found" />
          )}
        </div>
      </div>
    </div>
  );
};

export default MainContentManagement;