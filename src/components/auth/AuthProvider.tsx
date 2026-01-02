import { useEffect, useMemo, useRef, useState } from 'react';
import supabase from '@/supabaseClient';
import { AuthContext } from './AuthContext';
import type { User } from '@supabase/supabase-js';
import { signOut } from '@/apis/supabase/auth';
import { _userId } from '@/apis/supabase/users';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const refSignOut = useRef(false);

  useEffect(() => {
    const isInitialLoad = !sessionStorage.getItem('app-alive');

    const init = async () => {
      // Ignore when the app starts by the page refresh
      if (isInitialLoad) {
        // Sign out a local session as the app starts.
        refSignOut.current = true;
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
      let currentUser = session?.user ?? null;

      /**
       * NOTE: Prevent a race condition on revisit.
       * If a user didn't sign out last session, an auto-sign-out triggers on revisit.
       * Before sign-out is done, the "getPlanGroups" function will be executed concurrently from routes/plangroup/index.tsx.
       * This race condition may lead a failure in searching the user account from Supabase because the user session will become NULL.
       * To resolve this, the user session should not be set before sign-out is complete.
       */
      if (refSignOut.current) {
        currentUser = null;
      } else {
        currentUser = session?.user ?? null;
      }
      refSignOut.current = false;
      setUser(currentUser);
      setLoading(false);
      _userId.userId = currentUser?.id ?? null;
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = useMemo(() => ({ user, loading }), [user, loading]);

  return <AuthContext value={value}>{children}</AuthContext>;
}
