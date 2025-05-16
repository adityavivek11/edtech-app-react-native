import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    return SecureStore.deleteItemAsync(key);
  },
};

const supabaseUrl = 'https://wxljopeehqtesjrxolza.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4bGpvcGVlaHF0ZXNqcnhvbHphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0OTIxMzMsImV4cCI6MjA2MDA2ODEzM30.6VJxsgdXlic39vOlJ76wAXTBTMv6bIt5IDGE2l9GpMA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: ExpoSecureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        flowType: 'pkce',
        redirectTo: 'com.aditya1111.auth://auth-callback'
    },
}); 