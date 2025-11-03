'use client'

import { useState } from 'react'
import { createClientSideSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Shuffle, Users, Gift, RotateCcw } from 'lucide-react'
import { Match, MatchingRule } from '@/lib/supabase'

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
  rules?: MatchingRule[]
  onMatchComplete: () => void
  onResetComplete?: () => void
}

export function MatchingSystem({ 
  gameId, 
  players, 
  isHost, 
  isMatched, 
  matches = [], 
  rules = [],
  onMatchComplete,
  onResetComplete
}: MatchingSystemProps) {
  const [isMatching, setIsMatching] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateMatches = (playerList: Player[]): Omit<Match, 'id' | 'created_at'>[] => {
    if (playerList.length < 2) {
      throw new Error('Need at least 2 players to create matches')
    }

    // Separate rules by type
    const mustRules = rules.filter(r => r.rule_type === 'must')
    const cannotRules = rules.filter(r => r.rule_type === 'cannot')

    // Create sets for quick lookup
    const forbiddenMatches = new Set<string>()
    cannotRules.forEach(rule => {
      forbiddenMatches.add(`${rule.giver_id}-${rule.receiver_id}`)
    })

    const requiredMatches = new Map<string, string>() // giver_id -> receiver_id
    mustRules.forEach(rule => {
      requiredMatches.set(rule.giver_id, rule.receiver_id)
    })

    // Helper function to check if a match is forbidden
    const isForbidden = (giverId: string, receiverId: string): boolean => {
      return forbiddenMatches.has(`${giverId}-${receiverId}`)
    }

    // Helper function to check if all required matches are present
    const hasAllRequiredMatches = (matches: { giver_id: string; receiver_id: string }[]): boolean => {
      for (const [giverId, requiredReceiverId] of Array.from(requiredMatches.entries())) {
        const found = matches.find(m => m.giver_id === giverId && m.receiver_id === requiredReceiverId)
        if (!found) {
          return false
        }
      }
      return true
    }

    // Helper function to check if a complete matching is valid
    const isValidMatching = (matches: { giver_id: string; receiver_id: string }[]): boolean => {
      // Check that every player is giver exactly once
      const giverIds = matches.map(m => m.giver_id)
      if (new Set(giverIds).size !== playerList.length || giverIds.length !== playerList.length) {
        return false
      }

      // Check that every player is receiver exactly once
      const receiverIds = matches.map(m => m.receiver_id)
      if (new Set(receiverIds).size !== playerList.length || receiverIds.length !== playerList.length) {
        return false
      }

      // Check for forbidden matches
      for (const match of matches) {
        if (isForbidden(match.giver_id, match.receiver_id)) {
          return false
        }
      }

      // Check that all required matches are present
      if (!hasAllRequiredMatches(matches)) {
        return false
      }

      return true
    }

    // Try to generate a valid matching using backtracking
    const generateValidMatching = (): Omit<Match, 'id' | 'created_at'>[] | null => {
      const maxAttempts = 5000 // Increased for more complex matching
      let attempts = 0

      while (attempts < maxAttempts) {
        attempts++
        
        // Start with required matches
        const matches: Omit<Match, 'id' | 'created_at'>[] = []
        const usedGivers = new Set<string>()
        const usedReceivers = new Set<string>()

        // First, add all required matches
        for (const [giverId, receiverId] of Array.from(requiredMatches.entries())) {
          const giver = playerList.find(p => p.id === giverId)
          const receiver = playerList.find(p => p.id === receiverId)
          
          if (!giver || !receiver) {
            continue // Skip if player not found
          }

          usedGivers.add(giverId)
          usedReceivers.add(receiverId)
          
          matches.push({
            game_id: gameId,
            giver_id: giverId,
            receiver_id: receiverId,
            giver_name: giver.name,
            receiver_name: receiver.name
          })
        }

        // Then, fill in remaining players randomly
        const remainingGivers = playerList.filter(p => !usedGivers.has(p.id))
        const remainingReceivers = playerList.filter(p => !usedReceivers.has(p.id))

        // Shuffle remaining receivers
        const shuffledReceivers = [...remainingReceivers].sort(() => Math.random() - 0.5)

        // Try to match remaining players
        let valid = true
        for (let i = 0; i < remainingGivers.length; i++) {
          const giver = remainingGivers[i]
          
          // Find a valid receiver for this giver
          let foundReceiver = false
          for (const receiver of shuffledReceivers) {
            // Check if this receiver is already used
            if (usedReceivers.has(receiver.id)) {
              continue
            }

            // Check if this match is forbidden
            if (isForbidden(giver.id, receiver.id)) {
              continue
            }

            // Found a valid match!
            usedReceivers.add(receiver.id)
            matches.push({
              game_id: gameId,
              giver_id: giver.id,
              receiver_id: receiver.id,
              giver_name: giver.name,
              receiver_name: receiver.name
            })
            foundReceiver = true
            break
          }

          if (!foundReceiver) {
            valid = false
            break
          }
        }

        if (valid && isValidMatching(matches)) {
          return matches
        }
      }

      return null
    }

    // Try to generate a valid matching
    const validMatches = generateValidMatching()
    
    if (!validMatches) {
      throw new Error('Unable to create valid matches with the current rules. Consider removing some restrictions or required matches.')
    }

    return validMatches
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
      
      console.log('Generated matches:', newMatches)
      
      // Validate matches before sending
      if (!newMatches || newMatches.length === 0) {
        throw new Error('No matches were generated')
      }

      // Call the API endpoint to update matches
      const response = await fetch(`/api/games/${gameId}/match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ matches: newMatches }),
      })

      if (!response.ok) {
        let errorMessage = 'Failed to create matches'
        try {
          const data = await response.json()
          errorMessage = data.error || errorMessage
          if (data.details) {
            errorMessage += `: ${data.details}`
          }
        } catch (e) {
          errorMessage = `Server error: ${response.status} ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      onMatchComplete()
    } catch (err) {
      console.error('Error creating matches:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to create matches'
      setError(errorMessage)
    } finally {
      setIsMatching(false)
    }
  }

  const handleResetMatches = async () => {
    setIsResetting(true)
    setError(null)

    try {
      const response = await fetch(`/api/games/${gameId}/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to reset matches')
      }

      onResetComplete?.() || onMatchComplete()
    } catch (err) {
      console.error('Error resetting matches:', err)
      setError(err instanceof Error ? err.message : 'Failed to reset matches')
    } finally {
      setIsResetting(false)
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
              <div className="space-y-4">
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
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      disabled={isResetting}
                      variant="outline"
                      className="w-full"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset Matches
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reset Secret Santa Matches?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will delete all current matches and allow you to create new ones. 
                        All players will lose their current assignments.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleResetMatches}
                        disabled={isResetting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isResetting ? (
                          <>
                            <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                            Resetting...
                          </>
                        ) : (
                          'Reset Matches'
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
              {rules.length > 0 && (
                <Badge variant="destructive">{rules.length} rule{rules.length !== 1 ? 's' : ''}</Badge>
              )}
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
