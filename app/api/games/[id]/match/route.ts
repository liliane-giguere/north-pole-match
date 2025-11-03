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

    // Validate matches data
    for (const match of matches) {
      if (!match.giver_id || !match.receiver_id) {
        console.error('Invalid match data:', match)
        return NextResponse.json({ error: 'Invalid match data: missing giver_id or receiver_id' }, { status: 400 })
      }
      
      // Check for self-matches
      if (match.giver_id === match.receiver_id) {
        console.error('Invalid match data: self-match', match)
        return NextResponse.json({ error: 'Invalid match data: cannot match someone with themselves' }, { status: 400 })
      }
    }

    // Check for duplicate givers or receivers
    const giverIds = matches.map(m => m.giver_id)
    const receiverIds = matches.map(m => m.receiver_id)
    
    if (new Set(giverIds).size !== giverIds.length) {
      return NextResponse.json({ error: 'Invalid match data: duplicate givers found' }, { status: 400 })
    }
    
    if (new Set(receiverIds).size !== receiverIds.length) {
      return NextResponse.json({ error: 'Invalid match data: duplicate receivers found' }, { status: 400 })
    }

    // Delete any existing matches for this game (in case of retry or stale data)
    const { error: deleteError } = await supabase
      .from('matches')
      .delete()
      .eq('game_id', params.id)

    if (deleteError) {
      console.error('Error deleting existing matches:', deleteError)
      // Continue anyway, as this might be fine if there are no matches
    }

    // Insert matches into matches table
    const matchesToInsert = matches.map(match => ({
      game_id: params.id,
      giver_id: match.giver_id,
      receiver_id: match.receiver_id
    }))

    console.log('Inserting matches:', JSON.stringify(matchesToInsert, null, 2))

    const { error: matchesError, data: insertedMatches } = await supabase
      .from('matches')
      .insert(matchesToInsert)
      .select()

    if (matchesError) {
      console.error('Error inserting matches:', matchesError)
      console.error('Error details:', JSON.stringify(matchesError, null, 2))
      return NextResponse.json({ 
        error: 'Failed to create matches', 
        details: matchesError.message,
        code: matchesError.code
      }, { status: 500 })
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
