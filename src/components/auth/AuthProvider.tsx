import { useEffect, useState } from 'react';
import supabase from '@/supabaseClient';
import { AuthContext } from './AuthContext';
import type { User } from '@supabase/supabase-js';
import { signOut } from '@/apis/supabase/auth';
import { _userId } from '@/apis/supabase/users';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isInitialLoad = !sessionStorage.getItem('app-alive');

  useEffect(() => {
    const init = async () => {
      // Ignore when the app starts by the page refresh
      if (isInitialLoad) {
        // Sign out a local session as the app starts.
        await signOut().catch();
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

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
      _userId.userId = session?.user?.id ?? null;
    });

    return () => subscription.unsubscribe();
  }, []);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}
