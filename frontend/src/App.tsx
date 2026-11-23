import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ThemeProvider } from './hooks/useTheme';
import { MainLayout } from './layouts/MainLayout';

import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Messages } from './pages/Messages';
import { AIGenerator } from './pages/AIGenerator';
import { AIConversationAssistant } from './pages/AIConversationAssistant';
import { Automation } from './pages/Automation';
import { Schedules } from './pages/Schedules';
import { Contacts } from './pages/Contacts';
import { Templates } from './pages/Templates';
import { ActivityHistory } from './pages/ActivityHistory';
import { Settings } from './pages/Settings';
import { Profile } from './pages/Profile';

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected App Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="messages" element={<Messages />} />
              <Route path="ai-generator" element={<AIGenerator />} />
              <Route path="ai-conversation" element={<AIConversationAssistant />} />
              <Route path="automation" element={<Automation />} />
              <Route path="schedules" element={<Schedules />} />
              <Route path="contacts" element={<Contacts />} />
              <Route path="templates" element={<Templates />} />
              <Route path="history" element={<ActivityHistory />} />
              <Route path="settings" element={<Settings />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
