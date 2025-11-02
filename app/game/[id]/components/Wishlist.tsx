'use client'

import { useEffect, useState } from 'react'
import { createClientSideSupabaseClient, WishlistItem } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, Plus } from 'lucide-react'

interface WishlistProps {
  gameId: string
  ownerId: string
  isOwner: boolean
  title: string
}

export function Wishlist({ gameId, ownerId, isOwner, title }: WishlistProps) {
  const supabase = createClientSideSupabaseClient()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [newItem, setNewItem] = useState('')
  const [error, setError] = useState<string | null>(null)

  const loadItems = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('wishlists')
        .select('*')
        .eq('game_id', gameId)
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: true })

      if (error) {
        setError('Failed to load wishlist')
        return
      }

      setItems((data as WishlistItem[]) || [])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [gameId, ownerId])

  const addItem = async () => {
    if (!newItem.trim()) return
    try {
      setIsSaving(true)
      const { data, error } = await supabase
        .from('wishlists')
        .insert({ game_id: gameId, owner_id: ownerId, content: newItem.trim() })
        .select('*')
        .single()

      if (!error && data) {
        setItems(prev => [...prev, data as WishlistItem])
        setNewItem('')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const updateItem = async (id: string, content: string) => {
    try {
      setIsSaving(true)
      const { error } = await supabase
        .from('wishlists')
        .update({ content })
        .eq('id', id)
      if (!error) {
        setItems(prev => prev.map(i => (i.id === id ? { ...i, content } : i)))
      }
    } finally {
      setIsSaving(false)
    }
  }

  const deleteItem = async (id: string) => {
    try {
      setIsSaving(true)
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('id', id)
      if (!error) {
        setItems(prev => prev.filter(i => i.id !== id))
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isOwner && (
          <div className="flex gap-2">
            <Input
              placeholder="Add a wishlist item"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addItem() }}
              disabled={isSaving}
            />
            <Button onClick={addItem} disabled={isSaving || !newItem.trim()}>
              <Plus className="h-4 w-4 mr-2" /> Add
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading wishlist...</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            {isOwner ? 'No items yet. Add your wishes!' : 'No wishlist items provided.'}
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map(item => (
              <li key={item.id} className="flex items-center gap-2">
                {isOwner ? (
                  <input
                    className="flex-1 px-3 py-2 border rounded-md text-sm"
                    value={item.content}
                    onChange={(e) => updateItem(item.id, e.target.value)}
                    disabled={isSaving}
                  />
                ) : (
                  <span className="flex-1 text-sm">• {item.content}</span>
                )}
                {isOwner && (
                  <Button
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => deleteItem(item.id)}
                    disabled={isSaving}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
