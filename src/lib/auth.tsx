import React, { useCallback, useMemo, useState } from 'react';
import type { AuthContextValue, AuthState } from './auth.context';
import { AuthContext } from './auth.context';
import { readAuthState, writeAuthState } from './auth.storage';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState | null>(() => readAuthState());
  const login = useCallback((payload: AuthState) => {
    setState(payload);
    writeAuthState(payload);
  }, []);

  const logout = useCallback(() => {
    setState(null);
    writeAuthState(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    return {
      accessToken: state?.accessToken ?? null,
      user: state?.user ?? null,
      isAuthenticated: Boolean(state?.accessToken),
      login,
      logout,
    };
  }, [login, logout, state?.accessToken, state?.user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

