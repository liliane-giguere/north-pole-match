import { redirect } from 'next/navigation'
import { GamePageContent } from '@/app/game/[id]/components/GamePageContent'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export default async function GamePage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const { data: game, error } = await supabase
    .from('games')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !game) {
    console.error('Error fetching game:', error)
    redirect('/game?error=not-found')
  }

  const isParticipant = game.participants.includes(user.id)
  const isHost = game.host_id === user.id

  if (!isParticipant && !isHost) {
    redirect('/game?error=access-denied')
  }

  return <GamePageContent game={game} isHost={isHost} />
}
