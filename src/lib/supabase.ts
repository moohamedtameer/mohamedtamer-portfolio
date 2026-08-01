import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// دالة تنشئ العميل وترسل توكن Clerk تلقائياً
export const getSupabaseClient = (getToken: (options?: { template?: string }) => Promise<string | null>) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      fetch: async (url, options = {}) => {
        // جلب التوكن من قالب supabase الذي أنشأناه في Clerk
        const clerkToken = await getToken({ template: 'supabase' });
        
        const headers = new Headers(options?.headers);
        if (clerkToken) {
          headers.set('Authorization', `Bearer ${clerkToken}`);
        }
        return fetch(url, { ...options, headers });
      },
    },
  });
};