'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Button } from '../../components/ui/button'
import Link from 'next/link'

export function GoToYourGames() {
  const { isLoggedIn, isLoading } = useAuth()
  if (!isLoggedIn || isLoading) return null

  return (
    <Button asChild>
      <Link href="/game">Go to Your Games</Link>
    </Button>
  )
}