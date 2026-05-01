import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are not set. Using local storage mode.');
} else {
  console.log('[Supabase] Client initialized with URL:', supabaseUrl);
  console.log('[Supabase] Anon key length:', supabaseAnonKey.length, 'characters');
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = !!supabase;

// Log configuration status on module load
if (typeof window !== 'undefined') {
  console.log('[Supabase] isSupabaseConfigured:', isSupabaseConfigured);
}
