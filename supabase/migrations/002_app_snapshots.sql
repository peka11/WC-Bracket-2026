-- Demo-friendly JSON storage (no UUID team mapping required)

CREATE TABLE IF NOT EXISTS app_match_snapshots (
  tournament_key TEXT PRIMARY KEY DEFAULT 'wc-2026',
  matches JSONB NOT NULL DEFAULT '[]',
  slots JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_picks_snapshot (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  tournament_key TEXT NOT NULL DEFAULT 'wc-2026',
  picks JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE app_match_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_picks_snapshot ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read match snapshots" ON app_match_snapshots FOR SELECT USING (true);
CREATE POLICY "Service write match snapshots" ON app_match_snapshots FOR ALL USING (true);

CREATE POLICY "Users read own picks snapshot" ON user_picks_snapshot FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users write own picks snapshot" ON user_picks_snapshot FOR ALL USING (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE app_match_snapshots;

CREATE POLICY "Public read league members" ON league_members FOR SELECT USING (true);
CREATE POLICY "Users join leagues" ON league_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Public read leagues" ON leagues FOR SELECT USING (true);
CREATE POLICY "Owners create leagues" ON leagues FOR INSERT WITH CHECK (auth.uid() = owner_id);
