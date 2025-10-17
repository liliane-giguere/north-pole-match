'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { GameList } from '@/app/game/GameList'
import CreateGameForm from '@/app/game/CreateGameForm'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { Button } from '@/components/ui/button'
import { Game } from '@/lib/supabase'

interface GameContentProps {
  initialGames: Game[];
  userId: string;
}

export default function GameContent({ initialGames, userId }: GameContentProps) {
  const [games, setGames] = useState<Game[]>(initialGames)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const channel = supabase
      .channel('games')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'games' }, payload => {
        console.log('Change received!', payload)
        updateGames()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const updateGames = async () => {
    const { data: updatedGames, error } = await supabase
      .from('games')
      .select('*')
      .or(`host_id.eq.${userId},participants.cs.{"${userId}"}`)

    if (error) {
      console.error('Error fetching games:', error)
    } else {
      setGames(updatedGames || [])
    }
  }

  const handleGameCreated = () => {
    updateGames()
    setShowCreateForm(false)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs
        items={[
          { label: 'Games' },
        ]}
      />
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold mb-4">Your Games</h1>
        {games.length > 0 && (
          <Button onClick={() => setShowCreateForm(true)}>
            Create New Game
          </Button>
        )}
      </div>
      {games.length > 0 ? (
        <>
          <GameList games={games} userId={userId} />
          {showCreateForm && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Create New Game</h2>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
              <CreateGameForm userId={userId} onGameCreated={handleGameCreated} />
            </div>
          )}
        </>
      ) : (
        <div>
          <p className="mb-4">You're not part of any games yet.</p>
          <CreateGameForm userId={userId} onGameCreated={updateGames} />
        </div>
      )}
    </div>
  )
}