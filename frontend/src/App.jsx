import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Home from './pages/Home';
import Clubs from './pages/Clubs';
import ClubDetail from './pages/ClubDetail';
import MyEvents from './pages/MyEvents';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import ApprovalPanel from './pages/ApprovalPanel';
import CreateEvent from './pages/CreateEvent';
import ClubManagement from './pages/ClubManagement';
import EventDetail from './pages/EventDetail';
import AdminPanel from './pages/AdminPanel';
import AdminClubManagement from './pages/AdminClubManagement';

function App() {
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
            <Navbar />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/clubs"
                element={
                  <ProtectedRoute>
                    <Clubs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/club/:id"
                element={
                  <ProtectedRoute>
                    <ClubDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-events"
                element={
                  <ProtectedRoute>
                    <MyEvents />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/approval-panel"
                element={
                  <ProtectedRoute roles={['advisor', 'admin']}>
                    <ApprovalPanel />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-event"
                element={
                  <ProtectedRoute roles={['club_manager', 'admin']}>
                    <CreateEvent />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/club-management"
                element={
                  <ProtectedRoute roles={['club_manager', 'advisor']}>
                    <ClubManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/event/:id"
                element={
                  <ProtectedRoute>
                    <EventDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <AdminPanel />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/clubs"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <AdminClubManagement />
                  </ProtectedRoute>
                }
              />

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;
