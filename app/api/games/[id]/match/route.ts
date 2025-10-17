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
      return NextResponse.json({ error: 'Only the host can create matches' }, { status: 403 })
    }

    // Check if already matched
    if (game.is_matched) {
      return NextResponse.json({ error: 'Game already matched' }, { status: 400 })
    }

    // Get request body
    const { matches } = await request.json()

    if (!matches || !Array.isArray(matches)) {
      return NextResponse.json({ error: 'Invalid matches data' }, { status: 400 })
    }

    // Insert matches into matches table
    const matchesToInsert = matches.map(match => ({
      game_id: params.id,
      giver_id: match.giver_id,
      receiver_id: match.receiver_id
    }))

    const { error: matchesError } = await supabase
      .from('matches')
      .insert(matchesToInsert)

    if (matchesError) {
      console.error('Error inserting matches:', matchesError)
      return NextResponse.json({ error: 'Failed to create matches' }, { status: 500 })
    }

    // Update the game to mark as matched
    const { error: updateError } = await supabase
      .from('games')
      .update({
        is_matched: true,
        match_date: new Date().toISOString()
      })
      .eq('id', params.id)

    if (updateError) {
      console.error('Error updating game:', updateError)
      return NextResponse.json({ error: 'Failed to update game' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in match endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
