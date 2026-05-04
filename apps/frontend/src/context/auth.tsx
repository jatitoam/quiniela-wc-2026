import { createContext, useCallback, useContext, useRef, useState } from 'react';
import type { UserDto } from '@quiniela/types';

interface AuthState {
  accessToken: string | null;
  user: UserDto | null;
}

interface AuthContextValue extends AuthState {
  setAuth: (token: string, user: UserDto) => void;
  clearAuth: () => void;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ accessToken: null, user: null });
  // keep a ref in sync so getToken() is always current without re-rendering
  const tokenRef = useRef<string | null>(null);

  const setAuth = useCallback((accessToken: string, user: UserDto) => {
    tokenRef.current = accessToken;
    setState({ accessToken, user });
  }, []);

  const clearAuth = useCallback(() => {
    tokenRef.current = null;
    setState({ accessToken: null, user: null });
  }, []);

  const getToken = useCallback(() => tokenRef.current, []);

  return (
    <AuthContext.Provider value={{ ...state, setAuth, clearAuth, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
