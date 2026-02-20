import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  FileText,
  File,
  ClipboardList,
  LogOut,
  Menu,
  X,
  User,
} from 'lucide-react';
import { logout } from '../utils/auth';
import { toast } from 'react-toastify';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { path: '/admin_home', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/users', icon: User, label: 'Users' },
    { path: '/admin/topics', icon: BookOpen, label: 'Topics' },
    { path: '/admin/modules', icon: Layers, label: 'Modules' },
    { path: '/admin/maincontents', icon: FileText, label: 'Main Contents' },
    { path: '/admin/pages', icon: File, label: 'Pages' },
    { path: '/admin/certificate', icon: File, label: 'Certificate' },
    { path: '/admin/chats', icon: File, label: 'Chats' },
    { path: '/admin/quizzes', icon: ClipboardList, label: 'Quizzes' },
  ];

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-gray-900 text-white p-4 flex items-center justify-between z-50">
        <h1 className="text-xl font-bold">SLM Admin</h1>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-screen bg-gray-900 text-white z-40 flex flex-col
          transition-transform duration-300 ease-in-out
          w-64
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Header - Desktop Only */}
        <div className="hidden lg:block p-6 border-b border-gray-800 flex-shrink-0">
          <h1 className="text-xl font-bold">SLM Admin</h1>
        </div>

        {/* Add padding top for mobile to account for fixed header */}
        <div className="lg:hidden h-16 flex-shrink-0" />

        {/* Navigation - Scrollable */}
        <nav className="flex-1 p-4 overflow-y-auto scrollbar-hide">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button - Fixed at Bottom */}
        <div className="p-4 border-t border-gray-800 flex-shrink-0">
          <button
            onClick={() => {
              handleLogout();
              closeMobileMenu();
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-gray-300 hover:bg-gray-800 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;