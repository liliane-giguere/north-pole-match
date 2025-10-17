import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies })

  // Check if user is logged in
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Verify the user is the host of the game
  const { data: game } = await supabase
    .from('games')
    .select('host_id')
    .eq('id', params.id)
    .single()

  if (!game || game.host_id !== session.user.id) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    )
  }

  // Delete the game
  const { error } = await supabase
    .from('games')
    .delete()
    .eq('id', params.id)

  if (error) {
    return NextResponse.json(
      { error: 'Failed to delete game' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
