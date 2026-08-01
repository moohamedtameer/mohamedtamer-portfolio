import { createClient } from '@supabase/supabase-js';

// إضافة قيم احتياطية لضمان عمل التطبيق على GitHub Pages حتى لو لم يقرأ متغيرات البيئة
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vhrqbrmxhbgfpszwagur.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_U042KIO8tAg9-M3qjbNDHQ_XQaLhmHq';

// دالة تنشئ العميل وترسل توكن Clerk تلقائياً مع حماية ضد الأخطاء
export const getSupabaseClient = (getToken: (options?: { template?: string }) => Promise<string | null>) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      fetch: async (url, options = {}) => {
        let clerkToken: string | null = null;
        
        try {
          // جلب التوكن من قالب supabase الذي أنشأناه في Clerk
          clerkToken = await getToken({ template: 'supabase' });
        } catch (error) {
          console.error("Error fetching Clerk token for Supabase:", error);
        }
        
        const headers = new Headers(options?.headers);
        if (clerkToken) {
          headers.set('Authorization', `Bearer ${clerkToken}`);
        }
        
        return fetch(url, { ...options, headers });
      },
    },
  });
};
