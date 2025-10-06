// components/Navbar.tsx
import React from 'react';
import { BookOpen, Award, LogOut, ArrowLeft, Target } from 'lucide-react';
import techlogo from '../public/logo1.png';

interface NavbarProps {
  user?: { username?: string };
  handleLogout: () => void;
  showBackButton?: boolean;
  onBackClick?: () => void;
  currentPage?: number;
  totalPages?: number;
}

const Navbar: React.FC<NavbarProps> = ({ user, handleLogout, showBackButton = false, onBackClick, currentPage, totalPages }) => {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Section - Logo and Brand */}
          <div className="flex items-center gap-3">
            <img 
              src={techlogo}
              alt="Learning Hub Logo" 
              className="w-22 h-10 object-contain" 
            />
            <div className="hidden sm:block border-l border-gray-300 h-8 mx-2"></div>
            <div className="hidden sm:flex items-center gap-2">
              <div 
                className="w-9 h-9 rounded-lg flex items-center justify-center shadow-sm" 
                style={{ background: 'linear-gradient(135deg, #203f78 0%, #2d5aa0 100%)' }} 
              >
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold leading-tight" style={{ color: '#203f78' }}>
                  Learning Hub
                </h1>
                <p className="text-xs text-gray-500">Smart Learning Platform</p>
              </div>
            </div>
          </div>

          {/* Right Section - Conditional rendering based on showBackButton */}
          <div className="flex items-center gap-3">
            {showBackButton ? (
              <>
              <button
                  onClick={onBackClick}
                  className="flex items-center gap-2 text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #203f78 0%, #2d5aa0 100%)',
                  }}
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="hidden sm:inline">Back to Module</span>
                  <span className="sm:hidden">Back</span>
                </button>
                {currentPage !== undefined && totalPages !== undefined && (
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
                    <Target className="w-4 h-4" style={{ color: '#203f78' }} />
                    <span className="text-sm font-semibold text-gray-700">
                      {currentPage} of {totalPages}
                    </span>
                  </div>
                )}
                
                
              </>
            ) : (
              <div 
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border shadow-sm" 
                style={{ backgroundColor: '#f0f5ff', borderColor: '#d0dff7' }} 
              >
                <Award className="w-4 h-4" style={{ color: '#203f78' }} />
                <span className="text-sm font-medium" style={{ color: '#203f78' }}>
                  Welcome {user?.username || 'Student'}
                </span>
              </div>
            )}
            <button 
              onClick={handleLogout} 
              className="flex items-center gap-2 px-3 py-1.5 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all border border-gray-200 hover:border-red-200" 
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;