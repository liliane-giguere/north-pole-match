'use client'

import { useState } from 'react'
import { createClientSideSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shuffle, Users, Gift } from 'lucide-react'
import { Match } from '@/lib/supabase'

interface Player {
  id: string
  name: string
}

interface MatchingSystemProps {
  gameId: string
  players: Player[]
  isHost: boolean
  isMatched: boolean
  matches?: Match[]
  onMatchComplete: () => void
}

export function MatchingSystem({ 
  gameId, 
  players, 
  isHost, 
  isMatched, 
  matches = [], 
  onMatchComplete 
}: MatchingSystemProps) {
  const [isMatching, setIsMatching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateMatches = (playerList: Player[]): Match[] => {
    if (playerList.length < 2) {
      throw new Error('Need at least 2 players to create matches')
    }

    // Create a shuffled copy of players
    const shuffled = [...playerList].sort(() => Math.random() - 0.5)
    const matches: Match[] = []

    // Create circular matching (A gives to B, B gives to C, C gives to A)
    for (let i = 0; i < shuffled.length; i++) {
      const giver = shuffled[i]
      const receiver = shuffled[(i + 1) % shuffled.length] // Wrap around to first player
      
      matches.push({
        giver_id: giver.id,
        receiver_id: receiver.id,
        giver_name: giver.name,
        receiver_name: receiver.name
      })
    }

    return matches
  }

  const handleMatchPlayers = async () => {
    if (players.length < 2) {
      setError('Need at least 2 players to create matches')
      return
    }

    setIsMatching(true)
    setError(null)

    try {
      // Generate matches
      const newMatches = generateMatches(players)
      
      // Call the API endpoint to update matches
      const response = await fetch(`/api/games/${gameId}/match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ matches: newMatches }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create matches')
      }

      onMatchComplete()
    } catch (err) {
      console.error('Error creating matches:', err)
      setError(err instanceof Error ? err.message : 'Failed to create matches')
    } finally {
      setIsMatching(false)
    }
  }

  const getMyMatch = (userId: string): Match | undefined => {
    return matches.find(match => match.giver_id === userId)
  }

  if (players.length < 2) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-yellow-800">
            <Users className="h-4 w-4" />
            <span className="text-sm">
              Need at least 2 players to create matches. Invite more people to join!
            </span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isMatched && matches.length > 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Matches Created!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              All players have been matched! Each person now knows who they're giving a gift to.
            </p>
            
            {isHost && (
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Host View - All Matches:</h4>
                <div className="space-y-2">
                  {matches.map((match, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="font-medium">{match.giver_name}</span>
                      <span className="text-muted-foreground">gives to</span>
                      <span className="font-medium">{match.receiver_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shuffle className="h-5 w-5" />
          Secret Santa Matching
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Ready to create matches? Each player will be randomly assigned someone to give a gift to.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">{players.length} players</Badge>
              <Badge variant="secondary">Random matching</Badge>
            </div>
          </div>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="text-red-800 text-sm">
                {error}
              </div>
            </CardContent>
          </Card>
        )}

        {isHost ? (
          <Button 
            onClick={handleMatchPlayers} 
            disabled={isMatching || players.length < 2}
            className="w-full"
          >
            {isMatching ? (
              <>
                <Shuffle className="h-4 w-4 mr-2 animate-spin" />
                Creating Matches...
              </>
            ) : (
              <>
                <Shuffle className="h-4 w-4 mr-2" />
                Create Secret Santa Matches
              </>
            )}
          </Button>
        ) : (
          <div className="text-center text-sm text-muted-foreground">
            Only the host can create matches. Ask the host to start the matching process!
          </div>
        )}
      </CardContent>
    </Card>
  )
}
