'use client'

import { useEffect, useState } from 'react'
import { createClientSideSupabaseClient } from '@/lib/supabase'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface Player {
  id: string
  name: string
}

interface PlayerListProps {
  gameId: string
  hostId: string
}

export function PlayerList({ gameId, hostId }: PlayerListProps) {
  const [players, setPlayers] = useState<Player[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPlayers = async () => {
      const supabase = createClientSideSupabaseClient()

      // First get the game to get all participant IDs
      const { data: game, error: gameError } = await supabase
        .from('games')
        .select('participants, host_id')
        .eq('id', gameId)
        .single()

      if (gameError) {
        console.error('Error fetching game:', gameError)
        return
      }

      if (!game) {
        console.log('No game found with ID:', gameId)
        return
      }

      console.log('Game data:', game)

      // Get all player IDs including host
      const playerIds = [...game.participants, game.host_id]
      console.log('Player IDs to fetch:', playerIds)

      // Fetch user names from profiles
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', playerIds)

      if (error) {
        console.error('Error fetching profiles:', error)
        return
      }

      console.log('Profiles returned:', profiles)

      setPlayers(profiles || [])
      setIsLoading(false)
    }

    fetchPlayers()
  }, [gameId])

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading players...</div>
  }

  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Players:</h3>
      <div className="space-y-2">
        {players.map((player) => (
          <div key={player.id} className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback>
                {getInitials(player.name)}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <span className="font-medium">
                {player.name}
              </span>
              {player.id === hostId && (
                <span className="ml-2 text-xs text-muted-foreground">(Host)</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
