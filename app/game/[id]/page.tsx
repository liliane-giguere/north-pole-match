import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { GamePageContent } from '@/app/game/[id]/components/GamePageContent'

export const dynamic = 'force-dynamic'

export default async function GamePage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createRouteHandlerClient({ cookies })

  // Check if user is logged in
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/')
  }

  // Fetch the specific game
  const { data: game, error } = await supabase
    .from('games')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !game) {
    console.error('Error fetching game:', error)
    redirect('/game?error=not-found')
  }

  // Check if user has access to this game
  const isParticipant = game.participants.includes(session.user.id)
  const isHost = game.host_id === session.user.id

  if (!isParticipant && !isHost) {
    redirect('/game?error=access-denied')
  }

  return <GamePageContent game={game} isHost={isHost} />
}
