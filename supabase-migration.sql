-- Add is_matched and match_date columns to games table
ALTER TABLE games 
ADD COLUMN IF NOT EXISTS is_matched BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS match_date TIMESTAMP WITH TIME ZONE;

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  giver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure no one gives to themselves
  CONSTRAINT no_self_match CHECK (giver_id != receiver_id),
  
  -- Ensure unique giver per game
  UNIQUE(game_id, giver_id),
  
  -- Ensure unique receiver per game  
  UNIQUE(game_id, receiver_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_matches_game_id ON matches(game_id);
CREATE INDEX IF NOT EXISTS idx_matches_giver_id ON matches(giver_id);
CREATE INDEX IF NOT EXISTS idx_matches_receiver_id ON matches(receiver_id);

-- Enable Row Level Security
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for matches table
-- Users can only see matches for games they're part of
CREATE POLICY "Users can view matches for their games" ON matches
  FOR SELECT USING (
    game_id IN (
      SELECT id FROM games 
      WHERE host_id = auth.uid() 
      OR auth.uid() = ANY(participants)
    )
  );

-- Only the game host can create matches
CREATE POLICY "Only host can create matches" ON matches
  FOR INSERT WITH CHECK (
    game_id IN (
      SELECT id FROM games WHERE host_id = auth.uid()
    )
  );

-- Only the game host can delete matches
CREATE POLICY "Only host can delete matches" ON matches
  FOR DELETE USING (
    game_id IN (
      SELECT id FROM games WHERE host_id = auth.uid()
    )
  );

-- Create matching_rules table
CREATE TABLE IF NOT EXISTS matching_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  giver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure no one is restricted from giving to themselves
  CONSTRAINT no_self_rule CHECK (giver_id != receiver_id),
  
  -- Ensure unique rule per giver-receiver pair per game
  UNIQUE(game_id, giver_id, receiver_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_matching_rules_game_id ON matching_rules(game_id);
CREATE INDEX IF NOT EXISTS idx_matching_rules_giver_id ON matching_rules(giver_id);
CREATE INDEX IF NOT EXISTS idx_matching_rules_receiver_id ON matching_rules(receiver_id);

-- Enable Row Level Security
ALTER TABLE matching_rules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for matching_rules table
-- Users can only see rules for games they're part of
CREATE POLICY "Users can view rules for their games" ON matching_rules
  FOR SELECT USING (
    game_id IN (
      SELECT id FROM games 
      WHERE host_id = auth.uid() 
      OR auth.uid() = ANY(participants)
    )
  );

-- Only the game host can create rules
CREATE POLICY "Only host can create rules" ON matching_rules
  FOR INSERT WITH CHECK (
    game_id IN (
      SELECT id FROM games WHERE host_id = auth.uid()
    )
  );

-- Only the game host can delete rules
CREATE POLICY "Only host can delete rules" ON matching_rules
  FOR DELETE USING (
    game_id IN (
      SELECT id FROM games WHERE host_id = auth.uid()
    )
  );
