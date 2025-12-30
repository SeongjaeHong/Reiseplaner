import { createContext, use } from 'react';
import type { User } from '@supabase/supabase-js';

export type AuthState = {
  user: User | null;
  loading: boolean;
};

export const AuthContext = createContext<AuthState | null>(null);

export const useAuth = () => {
  const context = use(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
