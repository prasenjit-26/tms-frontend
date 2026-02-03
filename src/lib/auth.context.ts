import { createContext } from 'react';

export type Role = 'admin' | 'employee';

export type AuthUser = {
  id: string;
  email: string;
  role: Role;
};

export type AuthState = {
  accessToken: string;
  user: AuthUser;
};

export type AuthContextValue = {
  accessToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (payload: AuthState) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
