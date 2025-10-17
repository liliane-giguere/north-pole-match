'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClientSideSupabaseClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface LoginModalProps {
  buttonStyle?: 'default' | 'large' | 'outline'
  buttonText?: string
}

export function LoginModal({ 
  buttonStyle = 'default', 
  buttonText = 'Get Started' 
}: LoginModalProps = {}) {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showOtpInput, setShowOtpInput] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isLoggedIn, isLoading: isLoadingAuth } = useAuth()

  // Open modal automatically if returnUrl is present
  useEffect(() => {
    if (searchParams?.get('returnUrl')) {
      setIsOpen(true)
    }
  }, [searchParams])

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    const supabase = createClientSideSupabaseClient()

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
      })
      if (error) throw error
      setShowOtpInput(true)
      setMessage('Check your email for the OTP code!')
    } catch (error) {
      setMessage('Error sending OTP code. Please try again.')
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    const supabase = createClientSideSupabaseClient()
    const returnUrl = searchParams?.get('returnUrl')
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const defaultRedirectUrl = `${origin}/game`
    
    const redirectUrl = returnUrl
      ? returnUrl.startsWith('/')
        ? `${origin}${returnUrl}`
        : returnUrl
      : defaultRedirectUrl

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: 'email'
      })
      if (error) throw error
      setIsOpen(false)
      router.push(redirectUrl)
    } catch (error) {
      setMessage('Invalid OTP code. Please try again.')
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoggedIn || isLoadingAuth) return null

  // Determine button styling based on buttonStyle prop
  const getButtonProps = () => {
    switch (buttonStyle) {
      case 'large':
        return { 
          size: "lg" as const,
          className: "bg-red-600 hover:bg-red-700 text-white"
        }
      case 'outline':
        return { 
          variant: "outline" as const
        }
      default:
        return {}
    }
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} {...getButtonProps()}>{buttonText}</Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log in to North Pole Match</DialogTitle>
            <DialogDescription>
              {!showOtpInput 
                ? "Enter your email to receive a one-time password."
                : "Enter the OTP code sent to your email."
              }
              {searchParams?.get('returnUrl') && (
                <p className="mt-2 text-sm text-muted-foreground">
                  You'll be redirected to join the game after logging in.
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={showOtpInput ? handleVerifyOtp : handleSendOtp} className="space-y-4">
            <div className="space-y-2">
              {!showOtpInput ? (
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              ) : (
                <Input
                  type="text"
                  placeholder="Enter OTP code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  required
                />
              )}
            </div>
            {message && (
              <p className="text-sm text-muted-foreground">{message}</p>
            )}
            <Button type="submit" className="w-full" disabled={isLoading || isLoadingAuth}>
              {isLoading 
                ? 'Processing...' 
                : showOtpInput 
                  ? 'Verify OTP'
                  : 'Send OTP Code'
              }
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}