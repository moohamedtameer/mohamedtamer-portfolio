import { useAuth } from '@clerk/clerk-react';
import { useMemo } from 'react';
import { getSupabaseClient } from '../lib/supabase'; // عدل المسار حسب مكان ملف الـ supabase عندك

export const useSupabase = () => {
  const { getToken } = useAuth();

  // بنستخدم useMemo عشان العميل يتنشأ مرة واحدة وما يحصلش إعادة تهيئة مع كل رندر
  const supabase = useMemo(() => {
    return getSupabaseClient(getToken);
  }, [getToken]);

  return supabase;
};