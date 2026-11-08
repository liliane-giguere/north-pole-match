'use client'

import { useEffect, useRef, useState } from 'react'
import { createClientSideSupabaseClient, WishlistItem } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, Plus, Pencil } from 'lucide-react'

interface WishlistProps {
  gameId: string
  ownerId: string
  isOwner: boolean
  title: string
}

// Turns any http(s) URLs in the text into clickable links
function Linkify({ text }: { text: string }) {
  // split with a capture group puts the URLs at odd indexes
  const parts = text.split(/(https?:\/\/[^\s]+)/g)
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline break-all"
          >
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}

export function Wishlist({ gameId, ownerId, isOwner, title }: WishlistProps) {
  const supabase = createClientSideSupabaseClient()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [newItem, setNewItem] = useState('')
  const [error, setError] = useState<string | null>(null)

  // inline editing state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const skipCommit = useRef(false)

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

  const startEdit = (item: WishlistItem) => {
    setEditingId(item.id)
    setDraft(item.content)
  }

  // Saves on blur / Enter. Escape cancels.
  const commitEdit = async () => {
    const id = editingId
    if (!id) return
    setEditingId(null)

    if (skipCommit.current) {
      skipCommit.current = false
      return
    }

    const content = draft.trim()
    const current = items.find(i => i.id === id)
    if (!content || content === current?.content) return
    await updateItem(id, content)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isOwner && (
          <div className="flex items-start gap-2">
            <textarea
              rows={1}
              placeholder="Add a wishlist item"
              className="flex-1 min-w-0 px-3 py-2 border rounded-md text-sm resize-none overflow-hidden break-words bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addItem()
                }
              }}
              ref={(el) => {
                if (el) {
                  el.style.height = 'auto'
                  el.style.height = el.scrollHeight + 'px'
                }
              }}
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
              <li key={item.id} className="flex items-start gap-2">
                {isOwner && editingId === item.id ? (
                  <textarea
                    autoFocus
                    rows={1}
                    className="flex-1 min-w-0 px-3 py-2 border rounded-md text-sm resize-none overflow-hidden break-words"
                    value={draft}
                    onChange={(e) => {
                      setDraft(e.target.value)
                      e.target.style.height = 'auto'
                      e.target.style.height = e.target.scrollHeight + 'px'
                    }}
                    ref={(el) => {
                      if (el) {
                        el.style.height = 'auto'
                        el.style.height = el.scrollHeight + 'px'
                      }
                    }}
                    onBlur={commitEdit}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        e.currentTarget.blur()
                      } else if (e.key === 'Escape') {
                        skipCommit.current = true
                        e.currentTarget.blur()
                      }
                    }}
                  />
                ) : (
                  <div
                    className={
                      isOwner
                        ? 'flex-1 min-w-0 px-3 py-2 border rounded-md text-sm break-words'
                        : 'flex-1 min-w-0 text-sm break-words'
                    }
                  >
                    • <Linkify text={item.content} />
                  </div>
                )}
                {isOwner && editingId !== item.id && (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => startEdit(item)}
                      disabled={isSaving}
                      aria-label="Edit item"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => deleteItem(item.id)}
                      disabled={isSaving}
                      aria-label="Delete item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
