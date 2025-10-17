import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function InvitePage({
  params,
}: {
  params: { code: string }
}) {
  const supabase = createServerComponentClient({ cookies })

  // Check if user is logged in
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    // If not logged in, redirect to login page with return URL
    const returnUrl = `/invite/${params.code}`
    redirect(`/?returnUrl=${encodeURIComponent(returnUrl)}`)
  }
  console.log("finding game by code", params.code)

  // Find the game with this invite code
  const { data: game, error: gameError } = await supabase
    .from('games')
    .select('*')
    .eq('invite_code', params.code)
    .single()

  if (gameError || !game) {
    console.log("gameError", gameError)
    redirect('/game?error=invalid-invite')
  }

  // Add user to participants if not already present
  if (!game.participants.includes(session.user.id)) {
    const { error: updateError } = await supabase
      .from('games')
      .update({
        participants: [...game.participants, session.user.id]
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
