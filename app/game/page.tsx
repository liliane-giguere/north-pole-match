import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import GameContent from '@/app/game/GameContent'

// Force the page to be rendered dynamically because it depends on being logged in
export const dynamic = 'force-dynamic'

export default async function GamePage() {
  // Create the Supabase client using the new `cookies` API
  const supabase = createServerComponentClient({ cookies })

  // Fetch the user's session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Redirect to the homepage if no session exists
  if (!session) {
    redirect('/')
  }

  // Fetch games for the logged-in user
  const { data: games, error } = await supabase
    .from('games')
    .select('*')
    .or(`host_id.eq.${session.user.id},participants.cs.{"${session.user.id}"}`)

  if (error) {
    console.error('Error fetching games:', error)
  }

  // Pass data to the component
  return <GameContent initialGames={games || []} userId={session.user.id} />
}
