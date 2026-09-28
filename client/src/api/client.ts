import type {
  AttendanceMark,
  AuthUser,
  ClassSession,
  ClassSessionInput,
  Journal,
  RegisterInput,
  Share,
  SharePayload,
  Subject,
  SubjectInput,
  SubjectWithTopics,
  Student,
  StudentTopic,
  StudentUpdate,
  Submission,
  SubmissionNotification,
  SubmissionWithContext,
  Topic,
  TopicInput,
  TopicListItem,
} from '../types';

const TOKEN_KEY = 'idu_admin_token';

/** 401 kelganda AuthContext foydalanuvchini chiqarib yuborishi uchun */
export const UNAUTHORIZED_EVENT = 'idu:unauthorized';

/**
 * API manzili .env dagi VITE_API_URL dan olinadi (server origini, `/api` siz).
 * Ko'rsatilmasa — nisbiy `/api`: dev rejimida Vite proxy localhost:4000 ga uzatadi,
 * front va backend bitta domenda tursa ham shu variant ishlaydi.
 */
const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');

export function apiUrl(path: string): string {
  return `${API_BASE}/api${path}`;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const isForm = options.body instanceof FormData;
  const res = await fetch(apiUrl(path), {
    ...options,
    headers: {
      // FormData uchun Content-Type ni brauzer o'zi (boundary bilan) qo'yadi
      ...(isForm ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401 && token) {
    setToken(null);
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: `Xato ${res.status}` }));
    throw new Error(body.error ?? `Xato ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

/** Himoyalangan faylni token bilan yuklab olib, brauzerda saqlashni boshlaydi */
async function downloadFile(path: string, fileName: string) {
  const token = getToken();
  const res = await fetch(apiUrl(path), {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: `Xato ${res.status}` }));
    throw new Error(body.error ?? `Xato ${res.status}`);
  }
  const url = URL.createObjectURL(await res.blob());
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const api = {
  login: (login: string, password: string) =>
    request<{ token: string; user: AuthUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ login, password }),
    }),
  register: (data: RegisterInput) =>
    request<{ token: string; user: AuthUser }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  me: () => request<AuthUser>('/auth/me'),

  // ── Talabalar (admin) ──
  listStudents: () => request<Student[]>('/students'),
  updateStudent: (id: number, data: StudentUpdate) =>
    request<Student>(`/students/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteStudent: (id: number) => request<void>(`/students/${id}`, { method: 'DELETE' }),

  listSubjects: () => request<Subject[]>('/subjects'),
  getSubject: (id: number) => request<SubjectWithTopics>(`/subjects/${id}`),
  createSubject: (data: SubjectInput) =>
    request<Subject>('/subjects', { method: 'POST', body: JSON.stringify(data) }),
  updateSubject: (id: number, data: SubjectInput) =>
    request<Subject>(`/subjects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSubject: (id: number) => request<void>(`/subjects/${id}`, { method: 'DELETE' }),

  listTopics: (subjectId: number) => request<TopicListItem[]>(`/topics?subject_id=${subjectId}`),
  getTopic: (id: number) => request<Topic>(`/topics/${id}`),
  createTopic: (data: TopicInput) =>
    request<Topic>('/topics', { method: 'POST', body: JSON.stringify(data) }),
  updateTopic: (id: number, data: TopicInput) =>
    request<Topic>(`/topics/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTopic: (id: number) => request<void>(`/topics/${id}`, { method: 'DELETE' }),
  // ── Jurnal: davomat va baholar (o'qituvchi) ──
  getJournal: (subjectId: number, course?: number | null) =>
    request<Journal>(`/journal/${subjectId}${course ? `?course=${course}` : ''}`),
  createSession: (subjectId: number, data: ClassSessionInput & { course: number }) =>
    request<ClassSession>(`/journal/${subjectId}/sessions`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateSession: (id: number, data: ClassSessionInput) =>
    request<ClassSession>(`/journal/sessions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSession: (id: number) => request<void>(`/journal/sessions/${id}`, { method: 'DELETE' }),
  saveMarks: (sessionId: number, marks: Omit<AttendanceMark, 'session_id'>[]) =>
    request<AttendanceMark[]>(`/journal/sessions/${sessionId}/marks`, {
      method: 'PUT',
      body: JSON.stringify({ marks }),
    }),

  // ── Topshiriqlar ──
  getStudentTopic: (topicId: number) =>
    request<{ topic: StudentTopic; submissions: Submission[] }>(`/submissions/topic/${topicId}`),
  submitAssignment: (topicId: number, data: FormData) =>
    request<Submission>(`/submissions/topic/${topicId}`, { method: 'POST', body: data }),
  downloadSubmissionFile: (id: number, fileName: string) =>
    downloadFile(`/submissions/${id}/file`, fileName),
  listSubmissions: (params: { status?: 'submitted' | 'graded'; subject_id?: number } = {}) => {
    const q = new URLSearchParams();
    if (params.status) q.set('status', params.status);
    if (params.subject_id) q.set('subject_id', String(params.subject_id));
    return request<SubmissionWithContext[]>(`/submissions${q.size ? `?${q}` : ''}`);
  },
  getSubmission: (id: number) => request<SubmissionWithContext>(`/submissions/${id}`),
  gradeSubmission: (id: number, data: { score: number; feedback: string }) =>
    request<SubmissionWithContext>(`/submissions/${id}/grade`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  getNotifications: () =>
    request<{ unread: number; items: SubmissionNotification[] }>('/submissions/notifications'),
  readAllNotifications: () =>
    request<{ ok: true }>('/submissions/notifications/read-all', { method: 'POST' }),

  // ── Ulashish havolalari (admin) ──
  listShares: () => request<Share[]>('/shares'),
  createShare: (payload: { scope: 'subject'; subject_id: number } | { scope: 'topic'; topic_id: number }) =>
    request<Share>('/shares', { method: 'POST', body: JSON.stringify(payload) }),
  updateShare: (id: number, data: { is_active?: boolean; note?: string }) =>
    request<Share>(`/shares/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteShare: (id: number) => request<void>(`/shares/${id}`, { method: 'DELETE' }),

  // ── Ommaviy havola (student, tokensiz) ──
  getShared: (token: string) => request<SharePayload>(`/share/${token}`),
  getSharedTopic: (token: string, topicId: number) =>
    request<Topic>(`/share/${token}/topic/${topicId}`),

  reorderTopics: (subjectId: number, ids: number[]) =>
    request<{ ok: true }>(`/topics/reorder/${subjectId}`, {
      method: 'PUT',
      body: JSON.stringify({ ids }),
    }),
};
