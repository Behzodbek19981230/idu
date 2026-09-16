import type {
  Share,
  SharePayload,
  Subject,
  SubjectInput,
  SubjectWithTopics,
  Topic,
  TopicInput,
  TopicListItem,
} from '../types';

const TOKEN_KEY = 'idu_admin_token';

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
  const res = await fetch(apiUrl(path), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    setToken(null);
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: `Xato ${res.status}` }));
    throw new Error(body.error ?? `Xato ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  login: (login: string, password: string) =>
    request<{ token: string; login: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ login, password }),
    }),

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
