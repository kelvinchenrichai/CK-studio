import { createClient } from '@supabase/supabase-js';

const supabaseEnabled = import.meta.env.VITE_ENABLE_SUPABASE === 'true';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (supabaseEnabled && (!supabaseUrl || !supabaseKey)) {
  console.warn('[CK Studio] Supabase was enabled but its environment variables are incomplete. Falling back to LocalStorage.');
}

export const supabase = supabaseEnabled && supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export const isSupabaseEnabled = !!supabase;
