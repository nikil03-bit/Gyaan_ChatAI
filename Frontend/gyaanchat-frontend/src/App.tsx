import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";

import LoginPage from "./pages/public/LoginPage";
import RegisterPage from "./pages/public/RegisterPage";

import DocumentsPage from "./pages/app/DocumentsPage";
import TestChatPage from "./pages/app/TestChatPage";
import AnalyticsPage from "./pages/app/AnalyticsPage";
import SettingsPage from "./pages/app/SettingsPage";
import InstallPage from "./pages/app/InstallPage";
import ProfilePage from "./pages/app/ProfilePage";

export default function App() {
  const loggedIn = !!localStorage.getItem("gc_token");

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={loggedIn ? "/app" : "/login"} replace />}
      />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AnalyticsPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="test-chat" element={<TestChatPage />} />
        <Route path="analytics" element={<Navigate to="/app" replace />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="install" element={<InstallPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<div style={{ padding: 24 }}>Route not found</div>} />
    </Routes>
  );
}
