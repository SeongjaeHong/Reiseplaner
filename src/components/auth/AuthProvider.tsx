import { useEffect, useState } from 'react';
import supabase from '@/supabaseClient';
import { AuthContext } from './AuthContext';
import type { User } from '@supabase/supabase-js';
import { signOut } from '@/apis/supabase/auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const wasAlive = sessionStorage.getItem('app-alive');

    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // Ignore when the app starts by the page refresh
      if (!wasAlive && session) {
        // Sign out a local session as the app starts.
        await signOut();
      }

      sessionStorage.setItem('app-alive', 'true');

      setUser(session?.user ?? null);
      setLoading(false);
    };

    void init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}
