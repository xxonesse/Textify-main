import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://mbonnukuwkhlpbwivcln.supabase.co';
const supabaseKey = 'your-anon-keeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ib25udWt1d2tobHBid2l2Y2xuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0NDk2NjcsImV4cCI6MjA1NjAyNTY2N30.VzFcWrpZjzv_Cq_lsqLrz6oWZTcpehtbEgUpAIYdEQ0y';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
