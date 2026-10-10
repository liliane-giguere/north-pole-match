import { redirect } from 'next/navigation'
import GameContent from '@/app/game/GameContent'
import { createServerSupabaseClient } from '@/lib/supabase-server'

// Force the page to be rendered dynamically because it depends on being logged in
export const dynamic = 'force-dynamic'

export default async function GamePage() {
  const supabase = createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const { data: games, error } = await supabase
    .from('games')
    .select('*')
    .or(`host_id.eq.${user.id},participants.cs.{"${user.id}"}`)

  if (error) {
    console.error('Error fetching games:', error)
  }

  return <GameContent initialGames={games || []} userId={user.id} />
}
