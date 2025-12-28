import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const isSecure = window.location.protocol === 'https:';

const cookieStorage = {
  getItem: (key: string) => {
    const value = document.cookie.split('; ').find((row) => row.startsWith(`${key}=`));
    return value ? decodeURIComponent(value.split('=')[1]) : null;
  },
  setItem: (key: string, value: string) => {
    // Set a session cookie. This should be expired after the browser closed.
    const secureFlag = isSecure ? '; Secure' : '';
    document.cookie = `${key}=${encodeURIComponent(value)}; path=/; SameSite=Lax${secureFlag}`;
  },
  removeItem: (key: string) => {
    document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  },
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY as string;
const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    storage: cookieStorage,
    persistSession: true,
  },
});

export default supabase;
