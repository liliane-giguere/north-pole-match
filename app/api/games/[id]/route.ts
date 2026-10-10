import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const { data: game } = await supabase
    .from('games')
    .select('host_id')
    .eq('id', params.id)
    .single()

  if (!game || game.host_id !== user.id) {
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
