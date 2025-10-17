'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface CreateGameFormProps {
  userId: string;
  onGameCreated: () => void;
}

export default function CreateGameForm({ userId, onGameCreated }: CreateGameFormProps) {
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Generate a unique invite code
    const inviteCode = Math.random().toString(36).substring(2, 10)

    const { data: game, error } = await supabase
      .from('games')
      .insert({
        name,
        date,
        host_id: userId,
        invite_code: inviteCode,
        participants: [],
      })
      .select()
      .single()

    setIsLoading(false)

    if (error) {
      console.error('Error creating game:', error)
    } else {
      setName('')
      setDate('')
      onGameCreated()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Game</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Game Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Game Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Game'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}