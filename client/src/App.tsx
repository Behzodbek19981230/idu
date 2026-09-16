import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { useAuth } from './context/AuthContext';
import AdminSharesPage from './pages/AdminSharesPage';
import AdminSubjectsPage from './pages/AdminSubjectsPage';
import AdminTopicEditorPage from './pages/AdminTopicEditorPage';
import AdminTopicsPage from './pages/AdminTopicsPage';
import HomePage from './pages/HomePage';
import LessonPage from './pages/LessonPage';
import LoginPage from './pages/LoginPage';
import SharePage from './pages/SharePage';
import SubjectPage from './pages/SubjectPage';

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuth();
  return isAdmin ? <>{children}</> : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Ommaviy ulashilgan material — asosiy Layout'dan tashqarida:
          yon panelda boshqa fanlar/mavzular ko'rinmaydi */}
      <Route path="/s/:token" element={<SharePage />} />
      <Route path="/s/:token/mavzu/:topicId" element={<SharePage />} />

      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/fan/:subjectId" element={<SubjectPage />} />
        <Route path="/fan/:subjectId/mavzu/:topicId" element={<LessonPage />} />

        <Route path="/admin/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminSubjectsPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/havolalar"
          element={
            <RequireAdmin>
              <AdminSharesPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/fan/:subjectId"
          element={
            <RequireAdmin>
              <AdminTopicsPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/fan/:subjectId/mavzu/yangi"
          element={
            <RequireAdmin>
              <AdminTopicEditorPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/mavzu/:topicId"
          element={
            <RequireAdmin>
              <AdminTopicEditorPage />
            </RequireAdmin>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
