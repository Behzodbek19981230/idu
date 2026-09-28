import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api, getToken, isTokenExpired, setToken, TOKEN_KEY, UNAUTHORIZED_EVENT } from '../api/client';
import type { AuthUser, RegisterInput } from '../types';

const USER_KEY = 'idu_user';

function readStoredUser(): AuthUser | null {
  const token = getToken();
  if (!token || isTokenExpired(token)) {
    // Muddati o'tgan sessiya — sahifa ochilishi bilan login sahifasiga
    setToken(null);
    localStorage.removeItem(USER_KEY);
    return null;
  }
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) ?? 'null') as AuthUser | null;
  } catch {
    return null;
  }
}

function storeUser(user: AuthUser | null) {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
}

interface AuthState {
  user: AuthUser | null;
  isAdmin: boolean;
  isStudent: boolean;
  login: (login: string, password: string) => Promise<AuthUser>;
  register: (data: RegisterInput) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(readStoredUser);

  const applySession = useCallback((token: string | null, next: AuthUser | null) => {
    setToken(token);
    storeUser(next);
    setUser(next);
  }, []);

  // Token bor bo'lsa — foydalanuvchi ma'lumotini serverdan yangilaymiz
  // (admin talabani boshqa kursga o'tkazgan bo'lishi mumkin)
  useEffect(() => {
    if (!getToken()) return;
    api
      .me()
      .then((fresh) => {
        storeUser(fresh);
        setUser(fresh);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const onUnauthorized = () => applySession(null, null);
    // Boshqa oynada chiqib ketilsa (token o'chirilsa) — bu oynada ham
    const onStorage = (e: StorageEvent) => {
      if (e.key === TOKEN_KEY && !e.newValue) applySession(null, null);
    };
    // Token muddati sahifa ochiq turganda tugasa — keyingi harakatda emas, darhol
    const onFocus = () => {
      const token = getToken();
      if (token && isTokenExpired(token)) applySession(null, null);
    };
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', onFocus);
    return () => {
      window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', onFocus);
    };
  }, [applySession]);

  const login = useCallback(
    async (loginName: string, password: string) => {
      const res = await api.login(loginName, password);
      applySession(res.token, res.user);
      return res.user;
    },
    [applySession],
  );

  const register = useCallback(
    async (data: RegisterInput) => {
      const res = await api.register(data);
      applySession(res.token, res.user);
      return res.user;
    },
    [applySession],
  );

  const logout = useCallback(() => applySession(null, null), [applySession]);

  const value = useMemo(
    () => ({
      user,
      isAdmin: user?.role === 'admin',
      isStudent: user?.role === 'student',
      login,
      register,
      logout,
    }),
    [user, login, register, logout],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth faqat AuthProvider ichida ishlaydi');
  return ctx;
}
