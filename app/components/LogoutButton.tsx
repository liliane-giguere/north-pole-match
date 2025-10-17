'use client'

import { useAuth } from "@/contexts/AuthContext"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function LogoutButton() {
    const router = useRouter()
    const supabase = createClientComponentClient()
    const { isLoggedIn, isLoading } = useAuth()

    const handleLogout = async () => {
      try {
        const { error } = await supabase.auth.signOut()
        if (error) {
            throw error
        }
        // Clear any local storage or cookies
        localStorage.clear()
        router.push('/')
        router.refresh()
        
        console.log('Logging out...')
      } catch (error) {
        console.error('Error logging out:', error)
      }
    }

    // Don't render anything if logged in or loading
    if (isLoading || !isLoggedIn) {
      return null
    }


    return (
      <button 
        onClick={handleLogout}
        className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
      >
        Logout
      </button>
    )
  }