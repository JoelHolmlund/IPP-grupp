import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://libaadfotqepucjuubbe.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpYmFhZGZvdHFlcHVjanV1YmJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NTc2MzIsImV4cCI6MjA4NzUzMzYzMn0.faNpaXwRrq6ffA7Gyy9KtYEV3Kk4Skyxy8cvRa3EiUQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
