'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { PlayerList } from '@/app/game/[id]/components/PlayerList'
import { MatchingSystem } from '@/app/game/[id]/components/MatchingSystem'
import { MyMatch } from '@/app/game/[id]/components/MyMatch'
import { Badge } from '@/components/ui/badge'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { Button } from '@/components/ui/button'
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
import { Trash2 } from 'lucide-react'
import { Game, Match } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { createClientSideSupabaseClient } from '@/lib/supabase'

interface GamePageContentProps {
  game: Game
  isHost: boolean
}

export function GamePageContent({ game, isHost }: GamePageContentProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [players, setPlayers] = useState<{id: string, name: string}[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  // Fetch players for matching system
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const supabase = createClientSideSupabaseClient()
        
        // Get current user
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          setCurrentUserId(session.user.id)
        }
        
        // Get all player IDs including host
        const playerIds = [...game.participants, game.host_id]
        
        // Fetch user names from profiles
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', playerIds)

        if (error) {
          console.error('Error fetching profiles:', error)
        } else {
          setPlayers(profiles || [])
        }

        // Fetch matches if game is matched
        if (game.is_matched) {
          const { data: matchesData, error: matchesError } = await supabase
            .from('matches')
            .select(`
              *,
              giver:profiles!matches_giver_id_fkey(name),
              receiver:profiles!matches_receiver_id_fkey(name)
            `)
            .eq('game_id', game.id)

          if (matchesError) {
            console.error('Error fetching matches:', matchesError)
          } else {
            // Transform the data to include names
            const transformedMatches = matchesData?.map(match => ({
              ...match,
              giver_name: match.giver?.name,
              receiver_name: match.receiver?.name
            })) || []
            setMatches(transformedMatches)
          }
        }
      } catch (error) {
        console.error('Error fetching players:', error)
      } finally {
        setIsLoadingPlayers(false)
      }
    }

    fetchPlayers()
  }, [game])

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const response = await fetch(`/api/games/${game.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete game')
      }

      toast.success('Game deleted successfully')
      router.push('/game')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete game')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleMatchComplete = () => {
    // Refresh the page to show updated game data
    window.location.reload()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs
        items={[
          { label: 'Games', href: '/game' },
          { label: game.name },
        ]}
      />
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{game.name}</CardTitle>
            <div className="flex items-center gap-2">
              {isHost && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Game
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the game
                        and remove all participants.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              {isHost && (
                <Badge variant="secondary">Host</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-1">Date</h3>
              <p className="text-sm text-muted-foreground">
                {new Date(game.date).toLocaleDateString()}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Players</h3>
              <PlayerList 
                gameId={game.id}
                hostId={game.host_id}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Matching System */}
      {!isLoadingPlayers && (
        <div className="mt-6">
          <MatchingSystem
            gameId={game.id}
            players={players}
            isHost={isHost}
            isMatched={game.is_matched || false}
            matches={matches}
            onMatchComplete={handleMatchComplete}
          />
        </div>
      )}

      {/* Show individual match to each player */}
      {!isLoadingPlayers && game.is_matched && currentUserId && (
        <div className="mt-6">
          <MyMatch
            gameId={game.id}
            userId={currentUserId}
            matches={matches}
          />
        </div>
      )}
    </div>
  )
}
