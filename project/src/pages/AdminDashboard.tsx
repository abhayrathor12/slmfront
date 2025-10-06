import { useEffect, useState } from 'react';
import { Users, BookOpen, Layers, FileText, File } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import api from '../utils/api';
import { toast } from 'react-toastify';

interface Stats {
  totalUsers: number;
  totalTopics: number;
  totalModules: number;
  totalMainContents: number;
  totalPages: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalTopics: 0,
    totalModules: 0,
    totalMainContents: 0,
    totalPages: 0,
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentTopics, setRecentTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [users, topics, modules, maincontents, pages] = await Promise.all([
        api.get('/accounts/users/'),
        api.get('/api/topics/'),
        api.get('/api/modules/'),
        api.get('/api/maincontents/'),
        api.get('/api/pages/'),
      ]);

      setStats({
        totalUsers: users.data.length,
        totalTopics: topics.data.length,
        totalModules: modules.data.length,
        totalMainContents: maincontents.data.length,
        totalPages: pages.data.length,
      });

      setRecentUsers(users.data.slice(-5).reverse());
      setRecentTopics(topics.data.slice(-5).reverse());
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { icon: Users, label: 'Total Users', value: stats.totalUsers, color: 'blue' },
    { icon: BookOpen, label: 'Total Topics', value: stats.totalTopics, color: 'green' },
    { icon: Layers, label: 'Total Modules', value: stats.totalModules, color: 'yellow' },
    { icon: FileText, label: 'Total MainContents', value: stats.totalMainContents, color: 'red' },
    { icon: File, label: 'Total Pages', value: stats.totalPages, color: 'purple' },
  ];

  if (loading) return <Loader />;

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition"
              >
                <div className={`bg-${stat.color}-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                <p className="text-gray-600 text-sm">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{stat.value}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Users</h2>
            <div className="space-y-3">
              {recentUsers.length > 0 ? (
                recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">{user.username}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {user.role || user.user_type || 'student'}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No users yet</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Topics</h2>
            <div className="space-y-3">
              {recentTopics.length > 0 ? (
                recentTopics.map((topic) => (
                  <div key={topic.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">{topic.name}</p>
                      <p className="text-sm text-gray-600">Order: {topic.order}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No topics yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;