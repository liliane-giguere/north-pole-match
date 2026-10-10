import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function InvitePage({
  params,
}: {
  params: { code: string }
}) {
  const supabase = createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const returnUrl = `/invite/${params.code}`
    redirect(`/?returnUrl=${encodeURIComponent(returnUrl)}`)
  }
  console.log("finding game by code", params.code)

  const { data: game, error: gameError } = await supabase
    .from('games')
    .select('*')
    .eq('invite_code', params.code)
    .single()

  if (gameError || !game) {
    console.log("gameError", gameError)
    redirect('/game?error=invalid-invite')
  }

  if (!game.participants.includes(user.id)) {
    const { error: updateError } = await supabase
      .from('games')
      .update({
        participants: [...game.participants, user.id]
      })
      .eq('invite_code', params.code)  
      .select()
      .single()

    if (updateError) {
      console.error("Error joining game:", updateError)
      redirect('/game?error=join-failed')
    }
  }

  // Redirect to the game page
  redirect('/game')
}
