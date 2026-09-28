import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import { useAuth } from './context/AuthContext';
import AdminJournalPage from './pages/AdminJournalPage';
import AdminSharesPage from './pages/AdminSharesPage';
import AdminStudentsPage from './pages/AdminStudentsPage';
import AdminSubmissionPage from './pages/AdminSubmissionPage';
import AdminSubmissionsPage from './pages/AdminSubmissionsPage';
import AdminSubjectsPage from './pages/AdminSubjectsPage';
import AdminTopicEditorPage from './pages/AdminTopicEditorPage';
import AdminTopicsPage from './pages/AdminTopicsPage';
import HomePage from './pages/HomePage';
import LessonPage from './pages/LessonPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SharePage from './pages/SharePage';
import StudentTopicPage from './pages/StudentTopicPage';
import SubjectPage from './pages/SubjectPage';

/** Login sahifasiga yo'naltirish; kirgach shu sahifaga qaytiladi */
function ToLogin() {
  const location = useLocation();
  return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, isAdmin } = useAuth();
  if (!user) return <ToLogin />;
  return isAdmin ? <>{children}</> : <Navigate to="/" replace />;
}

/** Fanlar va mavzular faqat tizimga kirgan admin/talaba uchun */
function RequireUser({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? <>{children}</> : <ToLogin />;
}

/** Mavzu: admin — to'liq dars qo'llanmasi, talaba — faqat topshiriq yuborish */
function TopicRoute() {
  const { isAdmin } = useAuth();
  return isAdmin ? <LessonPage /> : <StudentTopicPage />;
}

/** Kirgan foydalanuvchi login/register sahifasini ochsa — o'z bosh sahifasiga */
function GuestOnly({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const from = (useLocation().state as { from?: string } | null)?.from;
  if (!user) return <>{children}</>;
  return <Navigate to={from ?? (user.role === 'admin' ? '/admin' : '/')} replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Ommaviy ulashilgan material — asosiy Layout'dan tashqarida:
          yon panelda boshqa fanlar/mavzular ko'rinmaydi */}
      <Route path="/s/:token" element={<SharePage />} />
      <Route path="/s/:token/mavzu/:topicId" element={<SharePage />} />

      <Route
        path="/login"
        element={
          <GuestOnly>
            <LoginPage />
          </GuestOnly>
        }
      />
      <Route
        path="/register"
        element={
          <GuestOnly>
            <RegisterPage />
          </GuestOnly>
        }
      />
      <Route path="/admin/login" element={<Navigate to="/login" replace />} />

      <Route
        element={
          <RequireUser>
            <Layout />
          </RequireUser>
        }
      >
        <Route path="/" element={<HomePage />} />
        <Route path="/fan/:subjectId" element={<SubjectPage />} />
        <Route path="/fan/:subjectId/mavzu/:topicId" element={<TopicRoute />} />

        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminSubjectsPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/talabalar"
          element={
            <RequireAdmin>
              <AdminStudentsPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/topshiriqlar"
          element={
            <RequireAdmin>
              <AdminSubmissionsPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/topshiriqlar/:submissionId"
          element={
            <RequireAdmin>
              <AdminSubmissionPage />
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
          path="/admin/fan/:subjectId/jurnal"
          element={
            <RequireAdmin>
              <AdminJournalPage />
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
