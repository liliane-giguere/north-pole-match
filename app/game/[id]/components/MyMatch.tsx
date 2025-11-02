'use client'

import { useState, useEffect } from 'react'
import { createClientSideSupabaseClient } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Gift, User } from 'lucide-react'
import { Match } from '@/lib/supabase'
import { Wishlist } from '@/app/game/[id]/components/Wishlist'

interface MyMatchProps {
  gameId: string
  userId: string
  matches: Match[]
}

export function MyMatch({ gameId, userId, matches }: MyMatchProps) {
  const [myMatch, setMyMatch] = useState<Match | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Find the match where this user is the giver
    const match = matches.find(m => m.giver_id === userId)
    setMyMatch(match || null)
    setIsLoading(false)
  }, [matches, userId])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Loading your match...
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!myMatch) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            No match found. Make sure the game has been matched!
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Gift className="h-5 w-5" />
            Your Secret Santa Assignment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                You are giving a gift to:
              </p>
              <div className="flex items-center justify-center gap-2">
                <User className="h-4 w-4" />
                <span className="text-lg font-semibold text-green-800">
                  {myMatch.receiver_name}
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-700 text-center">
                🎁 Keep this secret! Don't tell anyone who you're giving a gift to.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recipient's wishlist - visible to you (giver), read-only */}
      <Wishlist
        gameId={gameId}
        ownerId={myMatch.receiver_id}
        isOwner={false}
        title={`${myMatch.receiver_name}'s Wishlist`}
      />

      {/* Your wishlist - editable by you */}
      <Wishlist
        gameId={gameId}
        ownerId={userId}
        isOwner={true}
        title="Your Wishlist"
      />
    </div>
  )
}
