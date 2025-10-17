import '@/styles/globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/contexts/ThemeProvider'
import { ThemeToggle } from '@/app/components/ThemeToggle'
import { Toaster } from 'sonner'
import Link from 'next/link'
import { User } from 'lucide-react'
import LogoutButton from '@/app/components/LogoutButton'
import { AuthProvider } from '@/contexts/AuthContext'
import { Header } from '@/app/components/Header'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'North Pole Match',
  description: 'Secret Santa game coordinator for spreading joy and surprise',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider
            defaultTheme="light"
          >
            <div className="flex flex-col min-h-screen">

              <Header />
              <main className="flex-1">
                {children}
                <Toaster />
              </main>

              <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
                <p className="text-xs text-gray-500 dark:text-gray-400">© 2023 North Pole Match. All rights reserved.</p>
                <nav className="sm:ml-auto flex gap-4 sm:gap-6">
                  <Link className="text-xs hover:underline underline-offset-4" href="#">
                    Terms of Service
                  </Link>
                  <Link className="text-xs hover:underline underline-offset-4" href="#">
                    Privacy
                  </Link>
                </nav>
              </footer>
            </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}