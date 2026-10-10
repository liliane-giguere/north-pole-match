'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClientSideSupabaseClient } from '@/lib/supabase'

const AuthContext = createContext<{
  isLoggedIn: boolean;
  isLoading: boolean;
}>({
  isLoggedIn: false,
  isLoading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClientSideSupabaseClient()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsLoggedIn(!!session)
      setIsLoading(false)
    }
    
    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)