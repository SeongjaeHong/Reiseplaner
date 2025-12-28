import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY as string;

// You can use only local storage in the CSR app.
// https://github.com/SeongjaeHong/Reiseplaner/wiki/PKCE-flow-in-OAuth-needs-local-storage-in-the-CSR-app.
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export default supabase;
