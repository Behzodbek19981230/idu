import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { api, getToken, setToken } from '../api/client';

interface AuthState {
  isAdmin: boolean;
  login: (login: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(() => Boolean(getToken()));

  const login = useCallback(async (loginName: string, password: string) => {
    const { token } = await api.login(loginName, password);
    setToken(token);
    setIsAdmin(true);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setIsAdmin(false);
  }, []);

  const value = useMemo(() => ({ isAdmin, login, logout }), [isAdmin, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth faqat AuthProvider ichida ishlaydi');
  return ctx;
}
