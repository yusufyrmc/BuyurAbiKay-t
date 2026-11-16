import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://zueqsrjubkykqpiimlhx.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1ZXFzcmp1Ymt5a3FwaWltbGh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM3MzI5MzIsImV4cCI6MjEwOTMwODkzMn0.7jcIurFbi-70_2KPlLalT3jqlAlGMBwV6LlD0bX5lis';

export const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL).trim().replace(/^["']|["']$/g, '');
export const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY).trim().replace(/^["']|["']$/g, '');

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

