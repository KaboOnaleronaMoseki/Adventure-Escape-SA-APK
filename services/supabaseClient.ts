import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://vbuofcixspsunelpajhy.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZidW9mY2l4c3BzdW5lbHBhamh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM3NTMzMDcsImV4cCI6MjEwOTMyOTMwN30.GvN5Z-SA90uj6b_U1bSgAuYKKvPB8x_vD_oRO7ET8Yk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});