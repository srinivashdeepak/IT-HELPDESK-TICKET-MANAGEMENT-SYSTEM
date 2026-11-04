import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../layouts/MainLayout';
import LoadingSpinner from '../components/LoadingSpinner';

// Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import EmployeeDashboard from '../pages/employee/EmployeeDashboard';
import CreateTicketPage from '../pages/employee/CreateTicketPage';
import TicketListPage from '../pages/tickets/TicketListPage';
import TicketDetailPage from '../pages/tickets/TicketDetailPage';
import AgentDashboard from '../pages/agent/AgentDashboard';
import AdminDashboard from '../pages/admin/AdminDashboard';
import UserManagementPage from '../pages/admin/UserManagementPage';
import CategoryManagementPage from '../pages/admin/CategoryManagementPage';
import ReportsPage from '../pages/admin/ReportsPage';
import UserProfilePage from '../pages/profile/UserProfilePage';

// Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Authenticating session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If not authorized for this specific page, send to their default dashboard
    if (user.role === 'ROLE_ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'ROLE_AGENT') return <Navigate to="/agent/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Root Redirector based on user role
const RootRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (user?.role === 'ROLE_ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user?.role === 'ROLE_AGENT') return <Navigate to="/agent/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Enterprise Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<RootRedirect />} />

        {/* Common Ticket Management */}
        <Route path="tickets" element={<TicketListPage />} />
        <Route path="tickets/new" element={<CreateTicketPage />} />
        <Route path="tickets/:id" element={<TicketDetailPage />} />
        <Route path="profile" element={<UserProfilePage />} />

        {/* Employee Dashboard */}
        <Route
          path="dashboard"
          element={
            <ProtectedRoute allowedRoles={['ROLE_EMPLOYEE', 'ROLE_AGENT', 'ROLE_ADMIN']}>
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />

        {/* Support Agent Workspace */}
        <Route
          path="agent/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ROLE_AGENT', 'ROLE_ADMIN']}>
              <AgentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="agent/assigned"
          element={
            <ProtectedRoute allowedRoles={['ROLE_AGENT', 'ROLE_ADMIN']}>
              <TicketListPage />
            </ProtectedRoute>
          }
        />

        {/* Administrator Console */}
        <Route
          path="admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/users"
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <UserManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/categories"
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <CategoryManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/reports"
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
