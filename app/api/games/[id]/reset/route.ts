import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check if user is logged in
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the game
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('*')
      .eq('id', params.id)
      .single()

    if (gameError || !game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    // Check if user is the host
    if (game.host_id !== session.user.id) {
      return NextResponse.json({ error: 'Only the host can reset matches' }, { status: 403 })
    }

    // Check if game has matches to reset
    if (!game.is_matched) {
      return NextResponse.json({ error: 'Game has no matches to reset' }, { status: 400 })
    }

    // Delete all matches for this game
    const { error: deleteMatchesError } = await supabase
      .from('matches')
      .delete()
      .eq('game_id', params.id)

    if (deleteMatchesError) {
      console.error('Error deleting matches:', deleteMatchesError)
      return NextResponse.json({ error: 'Failed to delete matches' }, { status: 500 })
    }

    // Update the game to mark as not matched
    const { error: updateError } = await supabase
      .from('games')
      .update({
        is_matched: false,
        match_date: null
      })
      .eq('id', params.id)

    if (updateError) {
      console.error('Error updating game:', updateError)
      return NextResponse.json({ error: 'Failed to update game' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in reset matches endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
