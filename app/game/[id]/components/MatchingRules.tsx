'use client'

import { useState, useEffect } from 'react'
import { createClientSideSupabaseClient, MatchingRule } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Settings, Plus, X, AlertTriangle, CheckCircle } from 'lucide-react'

interface Player {
  id: string
  name: string
}

interface MatchingRulesProps {
  gameId: string
  players: Player[]
  isHost: boolean
  onRulesChange?: () => void
}

export function MatchingRules({ 
  gameId, 
  players, 
  isHost, 
  onRulesChange 
}: MatchingRulesProps) {
  const [rules, setRules] = useState<MatchingRule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newRule, setNewRule] = useState({ giver_id: '', receiver_id: '', rule_type: 'cannot' as 'cannot' | 'must' })

  const supabase = createClientSideSupabaseClient()

  // Load existing rules
  useEffect(() => {
    loadRules()
  }, [gameId])

  const loadRules = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('matching_rules')
        .select(`
          *,
          giver:profiles!matching_rules_giver_id_fkey(name),
          receiver:profiles!matching_rules_receiver_id_fkey(name)
        `)
        .eq('game_id', gameId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading rules:', error)
        setError('Failed to load rules')
        return
      }

      const rulesWithNames = (data?.map(rule => ({
        ...rule,
        giver_name: rule.giver?.name,
        receiver_name: rule.receiver?.name,
        rule_type: (rule.rule_type || 'cannot') as 'cannot' | 'must'
      })) || []) as MatchingRule[]

      setRules(rulesWithNames)
    } catch (err) {
      console.error('Error loading rules:', err)
      setError('Failed to load rules')
    } finally {
      setIsLoading(false)
    }
  }

  const addRule = async () => {
    if (!newRule.giver_id || !newRule.receiver_id) {
      setError('Please select both giver and receiver')
      return
    }

    if (newRule.giver_id === newRule.receiver_id) {
      setError('A person cannot be matched with themselves')
      return
    }

    // Check if rule already exists
    const existingRule = rules.find(rule => 
      rule.giver_id === newRule.giver_id && rule.receiver_id === newRule.receiver_id
    )

    if (existingRule) {
      setError('This rule already exists')
      return
    }

    try {
      setIsSaving(true)
      setError(null)

      const { data, error } = await supabase
        .from('matching_rules')
        .insert({
          game_id: gameId,
          giver_id: newRule.giver_id,
          receiver_id: newRule.receiver_id,
          rule_type: newRule.rule_type
        })
        .select(`
          *,
          giver:profiles!matching_rules_giver_id_fkey(name),
          receiver:profiles!matching_rules_receiver_id_fkey(name)
        `)
        .single()

      if (error) {
        console.error('Error adding rule:', error)
        setError('Failed to add rule')
        return
      }

      const ruleWithNames = {
        ...data,
        giver_name: data.giver?.name,
        receiver_name: data.receiver?.name
      }

      setRules(prev => [ruleWithNames, ...prev])
      setNewRule({ giver_id: '', receiver_id: '', rule_type: 'cannot' })
      onRulesChange?.()
    } catch (err) {
      console.error('Error adding rule:', err)
      setError('Failed to add rule')
    } finally {
      setIsSaving(false)
    }
  }

  const removeRule = async (ruleId: string) => {
    try {
      setIsSaving(true)
      setError(null)

      const { error } = await supabase
        .from('matching_rules')
        .delete()
        .eq('id', ruleId)

      if (error) {
        console.error('Error removing rule:', error)
        setError('Failed to remove rule')
        return
      }

      setRules(prev => prev.filter(rule => rule.id !== ruleId))
      onRulesChange?.()
    } catch (err) {
      console.error('Error removing rule:', err)
      setError('Failed to remove rule')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isHost) {
    return null
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-muted-foreground">Loading rules...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Matching Rules
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Set up rules for the Secret Santa matching. Choose "Cannot" to prevent certain matches, or "Must" to require specific matches.
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-800 text-sm">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </div>
          </div>
        )}

        {/* Add new rule form */}
        <div className="space-y-3 p-4 bg-muted rounded-lg">
          <h4 className="font-medium text-sm">Add New Rule</h4>
          
          {/* Rule type selector */}
          <div>
            <Label className="text-xs mb-2 block">Rule Type</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="cannot"
                  checked={newRule.rule_type === 'cannot'}
                  onChange={(e) => setNewRule(prev => ({ ...prev, rule_type: e.target.value as 'cannot' | 'must' }))}
                  className="w-4 h-4"
                />
                <span className="text-sm">Cannot (prevent this match)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="must"
                  checked={newRule.rule_type === 'must'}
                  onChange={(e) => setNewRule(prev => ({ ...prev, rule_type: e.target.value as 'cannot' | 'must' }))}
                  className="w-4 h-4"
                />
                <span className="text-sm">Must (require this match)</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="giver-select" className="text-xs">Giver</Label>
              <select
                id="giver-select"
                value={newRule.giver_id}
                onChange={(e) => setNewRule(prev => ({ ...prev, giver_id: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm"
              >
                <option value="">Select giver...</option>
                {players.map(player => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="receiver-select" className="text-xs">
                {newRule.rule_type === 'cannot' ? 'Cannot give to' : 'Must give to'}
              </Label>
              <select
                id="receiver-select"
                value={newRule.receiver_id}
                onChange={(e) => setNewRule(prev => ({ ...prev, receiver_id: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm"
              >
                <option value="">Select receiver...</option>
                {players.map(player => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Button 
            onClick={addRule} 
            disabled={isSaving || !newRule.giver_id || !newRule.receiver_id}
            size="sm"
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            {isSaving ? 'Adding...' : 'Add Rule'}
          </Button>
        </div>

        {/* Existing rules */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Current Rules</h4>
          {rules.length === 0 ? (
            <div className="text-sm text-muted-foreground p-4 text-center bg-muted rounded-lg">
              No rules set. All players can be matched with anyone.
            </div>
          ) : (
            <div className="space-y-2">
              {rules.map((rule) => (
                <div key={rule.id} className={`flex items-center justify-between p-3 border rounded-lg ${
                  rule.rule_type === 'must' 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-background'
                }`}>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant={rule.rule_type === 'must' ? 'default' : 'destructive'} className="text-xs">
                      {rule.rule_type === 'must' ? 'MUST' : 'CANNOT'}
                    </Badge>
                    <span className="font-medium">{rule.giver_name}</span>
                    <span className="text-muted-foreground">
                      {rule.rule_type === 'must' ? 'must give to' : 'cannot give to'}
                    </span>
                    <span className="font-medium">{rule.receiver_name}</span>
                  </div>
                  <Button
                    onClick={() => removeRule(rule.id)}
                    disabled={isSaving}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rules summary */}
        {rules.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-800 text-sm">
              <CheckCircle className="h-4 w-4" />
              <span>
                {rules.length} rule{rules.length !== 1 ? 's' : ''} set. 
                The matching algorithm will respect these restrictions.
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
