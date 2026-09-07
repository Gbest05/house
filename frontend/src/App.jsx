import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import LandingPage from './pages/LandingPage';
import PropertiesPage from './pages/PropertiesPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AgentRegisterPage from './pages/AgentRegisterPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

// User / Student Pages
import UserDashboard from './pages/user/UserDashboard';
import SavedFavorites from './pages/user/SavedFavorites';
import MyInquiries from './pages/user/MyInquiries';
import UserProfile from './pages/user/UserProfile';

// Agent Pages
import AgentDashboard from './pages/agent/AgentDashboard';
import MyProperties from './pages/agent/MyProperties';
import AddEditProperty from './pages/agent/AddEditProperty';
import AgentInquiries from './pages/agent/AgentInquiries';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProperties from './pages/admin/AdminProperties';
import AdminAgents from './pages/admin/AdminAgents';
import AdminUsers from './pages/admin/AdminUsers';
import AdminReports from './pages/admin/AdminReports';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/properties" element={<PropertiesPage />} />
              <Route path="/properties/:id" element={<PropertyDetailPage />} />
              <Route path="/how-it-works" element={<AboutPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/agent-register" element={<AgentRegisterPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/forgot-password" element={<ResetPasswordPage />} />

              {/* User / Student Routes */}
              <Route
                path="/user/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['user', 'agent', 'admin']}>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user/favorites"
                element={
                  <ProtectedRoute allowedRoles={['user', 'agent', 'admin']}>
                    <SavedFavorites />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user/inquiries"
                element={
                  <ProtectedRoute allowedRoles={['user', 'agent', 'admin']}>
                    <MyInquiries />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user/profile"
                element={
                  <ProtectedRoute allowedRoles={['user', 'agent', 'admin']}>
                    <UserProfile />
                  </ProtectedRoute>
                }
              />

              {/* Agent Routes */}
              <Route
                path="/agent/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['agent', 'admin']}>
                    <AgentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/agent/properties"
                element={
                  <ProtectedRoute allowedRoles={['agent', 'admin']}>
                    <MyProperties />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/agent/properties/add"
                element={
                  <ProtectedRoute allowedRoles={['agent', 'admin']}>
                    <AddEditProperty />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/agent/properties/edit/:id"
                element={
                  <ProtectedRoute allowedRoles={['agent', 'admin']}>
                    <AddEditProperty />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/agent/inquiries"
                element={
                  <ProtectedRoute allowedRoles={['agent', 'admin']}>
                    <AgentInquiries />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/agent/profile"
                element={
                  <ProtectedRoute allowedRoles={['agent', 'admin']}>
                    <UserProfile />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/properties"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminProperties />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/agents"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminAgents />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminReports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/announcements"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminAnnouncements />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/profile"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <UserProfile />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <ConditionalFooter />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

function ConditionalFooter() {
  const location = useLocation();
  const hidePrefixes = [
    '/login',
    '/register',
    '/agent-register',
    '/reset-password',
    '/forgot-password',
    '/user',
    '/agent',
    '/admin',
  ];
  const shouldHide = hidePrefixes.some(
    (prefix) => location.pathname === prefix || location.pathname.startsWith(prefix + '/')
  );
  if (shouldHide) return null;
  return <Footer />;
}
