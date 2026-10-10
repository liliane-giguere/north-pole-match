import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export interface Game {
  id: string
  created_at: string
  name: string
  date: string
  host_id: string
  invite_code: string
  participants: string[]
  is_matched?: boolean
  match_date?: string
}

export interface Match {
  id: string
  game_id: string
  giver_id: string
  receiver_id: string
  created_at: string
  // Joined fields (not in database)
  giver_name?: string
  receiver_name?: string
}

export interface Profile {
  id: string
  name: string
  created_at: string
}

export interface MatchingRule {
  id: string
  game_id: string
  giver_id: string
  receiver_id: string
  rule_type: 'cannot' | 'must'
  created_at: string
  // Joined fields (not in database)
  giver_name?: string
  receiver_name?: string
}

export interface WishlistItem {
  id: string
  game_id: string
  owner_id: string
  content: string
  created_at: string
}

export type Database = {
  public: {
    Tables: {
      games: {
        Row: Game
        Insert: Omit<Game, 'id' | 'created_at'>
        Update: Partial<Omit<Game, 'id' | 'created_at'>>
        Relationships: []
      }
      matches: {
        Row: Match
        Insert: Omit<Match, 'id' | 'created_at' | 'giver_name' | 'receiver_name'>
        Update: Partial<Omit<Match, 'id' | 'created_at' | 'giver_name' | 'receiver_name'>>
        Relationships: []
      }
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'id' | 'created_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
        Relationships: []
      }
      matching_rules: {
        Row: MatchingRule
        Insert: Omit<MatchingRule, 'id' | 'created_at' | 'giver_name' | 'receiver_name'> & { rule_type?: 'cannot' | 'must' }
        Update: Partial<Omit<MatchingRule, 'id' | 'created_at' | 'giver_name' | 'receiver_name'>>
        Relationships: []
      }
      wishlists: {
        Row: WishlistItem
        Insert: Omit<WishlistItem, 'id' | 'created_at'>
        Update: Partial<Omit<WishlistItem, 'id' | 'created_at'>>
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!)

export const createClientSideSupabaseClient = () =>
  createBrowserClient(supabaseUrl!, supabaseAnonKey!)