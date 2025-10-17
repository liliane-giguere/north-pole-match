'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Button } from '../../components/ui/button'
import Link from 'next/link'
import LogoutButton from './LogoutButton'
import { User } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'

export function Header() {
  const { isLoggedIn, isLoading } = useAuth()

  if (!isLoggedIn || isLoading) return null

  return (
    <header className="px-4 lg:px-6 h-14 flex items-center">
      <Link className="flex items-center justify-center" href="/">
        <span className="sr-only">North Pole Match</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
        >
          <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z" />
          <path d="m14 7 3 3" />
          <path d="M5 6v4" />
          <path d="M19 14v4" />
          <path d="M10 2v2" />
          <path d="M7 8H3" />
          <path d="M21 16h-4" />
          <path d="M11 3H9" />
        </svg>
      </Link>
      <nav className="ml-auto flex gap-4 sm:gap-6">
        {/* <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
          Features
        </Link>
        <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
          Pricing
        </Link>
        <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
          About
        </Link>
        <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
          Contact
        </Link> */}
        <Link
          href="/profile"
          className="inline-flex items-center justify-center rounded-md h-9 w-9 hover:bg-accent hover:text-accent-foreground"
          title="Profile"
        >
          <User className="h-5 w-5" />
        </Link>
        <LogoutButton />
        <ThemeToggle />
      </nav>
    </header>
  )
}

