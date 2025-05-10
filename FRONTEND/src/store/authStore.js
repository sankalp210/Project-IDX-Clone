// src/store/authStore.js
import { create } from 'zustand'
import { supabase } from '../config/supabase'

export const useAuthStore = create((set) => ({
  user: null,
  session: null,
  loading: true,
  
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),

  initializeAuth: async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    set({ user: session?.user ?? null, session, loading: false })
    
    supabase.auth.onAuthStateChange((event, session) => {
      set({ user: session?.user ?? null, session })
    })
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null })
  }
}))