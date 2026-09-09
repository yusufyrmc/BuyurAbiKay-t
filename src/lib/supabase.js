import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim().replace(/^["']|["']$/g, '');
export const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim().replace(/^["']|["']$/g, '');

export const isSupabaseConfigured = () => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    !supabaseUrl.includes('YOUR_SUPABASE') &&
    !supabaseAnonKey.includes('YOUR_SUPABASE') &&
    supabaseUrl.startsWith('https://')
  );
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false
      }
    })
  : null;

