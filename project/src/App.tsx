import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import TopicManagement from './pages/TopicManagement';
import ModuleManagement from './pages/ModuleManagement';
import MainContentManagement from './pages/MainContentManagement';
import PageManagement from './pages/PageManagement';
import QuizManagement from './pages/QuizManagement';
import StudentHome from './pages/StudentHome';
import ModuleDetail from './pages/ModuleDetail';
import PageDetail from './pages/PageDetail';
import Unauthorized from './pages/Unauthorized';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route
          path="/admin_home"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/topics"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <TopicManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/modules"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ModuleManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/maincontents"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <MainContentManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/pages"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <PageManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/quizzes"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <QuizManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user_home"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/module/:id"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <ModuleDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/page/:id"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <PageDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/instructor_home"
          element={
            <ProtectedRoute allowedRoles={['instructor']}>
              <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <h1 className="text-2xl font-bold">Instructor Dashboard Coming Soon</h1>
              </div>
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;