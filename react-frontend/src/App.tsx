import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { MemberAppPage } from './pages/MemberAppPage';

export const App: React.FC = () => {
  return (
    <HashRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Staff Admin Portal Routes */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRole="admin">
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Member App PWA Route */}
            <Route path="/app" element={<MemberAppPage />} />

            {/* Redirect root to /app */}
            <Route path="/" element={<Navigate to="/app" replace />} />
            <Route path="*" element={<Navigate to="/app" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </HashRouter>
  );
};

export default App;
