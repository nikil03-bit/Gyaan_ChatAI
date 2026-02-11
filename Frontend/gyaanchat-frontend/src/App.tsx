import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import LoginPage from "./pages/LoginPage";
import BotsPage from "./pages/BotsPage";
import KnowledgePage from "./pages/KnowledgePage";
import TestChatPage from "./pages/TestChatPage";
import LogsPage from "./pages/LogsPage";

function isAuthed() {
  return Boolean(localStorage.getItem("gyaanchat_token"));
}

function ProtectedRoute({ children }: { children: JSX.Element }) {
  return isAuthed() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/app/bots" replace />} />
        <Route path="bots" element={<BotsPage />} />
        <Route path="knowledge" element={<KnowledgePage />} />
        <Route path="test-chat" element={<TestChatPage />} />
        <Route path="logs" element={<LogsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  );
}
