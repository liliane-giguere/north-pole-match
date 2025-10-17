'use client'

import { useState } from 'react'
import { Game } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface GameListProps {
  games: Game[]
  userId: string
}

export function GameList({ games, userId }: GameListProps) {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [copiedGame, setCopiedGame] = useState<string | null>(null)


  const getInviteLink = (game: Game) => {
    return `${window.location.origin}/invite/${game.invite_code}`
  }

  const copyInviteLink = async (game: Game) => {
    const inviteLink = getInviteLink(game)
    await navigator.clipboard.writeText(inviteLink)
    setCopiedGame(game.id)
    setTimeout(() => setCopiedGame(null), 2000)
  }

  if (!games.length) {
    return (
      <div className="text-center text-muted-foreground">
        No games found. Create one to get started!
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {games.map((game) => (
          <Link key={game.id} href={`/game/${game.id}`}>
            <Card 
              className="cursor-pointer hover:bg-accent/50 transition-colors h-full"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">{game.name}</h3>
                  {game.host_id === userId && (
                    <Badge variant="secondary">Host</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Date: {new Date(game.date).toLocaleDateString()}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Players: {(game.participants?.length || 0) + 1}
                </p>
                {game.host_id === userId && (
                  <div className="mt-4 space-y-2">
                    <div className="text-sm font-medium">Invite Link:</div>
                    <div className="flex gap-2 items-center">
                      <code className="flex-1 p-2 text-sm bg-muted rounded break-all">
                        {getInviteLink(game)}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          copyInviteLink(game)
                        }}
                      >
                        {copiedGame === game.id ? 'Copied!' : 'Copy'}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}