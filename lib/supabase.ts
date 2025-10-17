import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

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

export type Database = {
  public: {
    Tables: {
      games: {
        Row: Game
        Insert: Omit<Game, 'id' | 'created_at'>
        Update: Partial<Omit<Game, 'id' | 'created_at'>>
      }
      matches: {
        Row: Match
        Insert: Omit<Match, 'id' | 'created_at' | 'giver_name' | 'receiver_name'>
        Update: Partial<Omit<Match, 'id' | 'created_at' | 'giver_name' | 'receiver_name'>>
      }
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'id' | 'created_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
    }
  }
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export const createClientSideSupabaseClient = () => createClientComponentClient<Database>()