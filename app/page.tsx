import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LoginModal } from '@/app/components/LoginModal'
import { GoToYourGames } from '@/app/components/GoToYourGames'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-36 bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-12">
            <div className="space-y-4 text-center lg:text-left lg:w-1/2">
              <Badge className="mb-2 animate-pulse" variant="outline">Holiday 2023</Badge>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-green-600">
                North Pole Match
              </h1>
              <p className="mx-auto lg:mx-0 max-w-[700px] text-gray-500 md:text-xl lg:text-2xl dark:text-gray-400">
                The ultimate Secret Santa game coordinator. Spread joy and surprise this holiday season!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mt-8">
                <GoToYourGames />
                <LoginModal />
              </div>
            </div>
            <div className="lg:w-1/2 mt-8 lg:mt-0">
              <div className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden rounded-xl shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-green-600 opacity-20"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="w-40 h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 border-8 border-red-500 dark:border-red-600 border-dashed rounded-full animate-spin-slow"></div>
                  <div className="absolute w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 bg-green-500 dark:bg-green-600 rounded-lg transform rotate-45"></div>
                  <div className="absolute w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 bg-red-500 dark:bg-red-600 rounded-lg transform -rotate-12"></div>
                  <div className="absolute w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 bg-white dark:bg-gray-200 rounded-xl flex items-center justify-center transform rotate-12 shadow-xl">
                    <span className="text-4xl md:text-5xl lg:text-6xl">🎁</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="w-full py-12 md:py-24 bg-white dark:bg-gray-950">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold md:text-4xl">How It Works</h2>
            <p className="mt-4 text-gray-500 dark:text-gray-400 md:text-xl">Simple steps to organize your Secret Santa exchange</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto bg-red-100 dark:bg-red-900/30 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600 dark:text-red-400"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>
                </div>
                <CardTitle>Create a Game</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-500 dark:text-gray-400">Start by creating a new Secret Santa game and setting your preferences.</p>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto bg-green-100 dark:bg-green-900/30 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-green-400"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <CardTitle>Invite Friends</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-500 dark:text-gray-400">Send invitations to friends and family to join your Secret Santa exchange.</p>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto bg-blue-100 dark:bg-blue-900/30 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                </div>
                <CardTitle>Match & Play</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-500 dark:text-gray-400">Automatically match participants and enjoy the surprise of Secret Santa!</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Testimonial/CTA Section */}
      <section className="w-full py-12 md:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center text-center">
            <div className="max-w-[800px] space-y-4">
              <h2 className="text-3xl font-bold md:text-4xl">Ready to Spread Holiday Cheer?</h2>
              <p className="text-gray-500 dark:text-gray-400 md:text-xl">
                Create memorable gift exchanges without the hassle. North Pole Match handles the logistics so you can focus on the joy of giving.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <LoginModal buttonStyle="large" />
                <Link href="#features">
                  <Button variant="outline" size="lg">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Snow effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute bg-white dark:bg-gray-300 rounded-full opacity-80 animate-snowfall"
            style={{
              width: `${Math.random() * 8 + 2}px`,
              height: `${Math.random() * 8 + 2}px`,
              top: `-${Math.random() * 10 + 10}px`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 10 + 5}s`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}