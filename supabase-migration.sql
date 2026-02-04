-- Unravel: Ravelry Clone Database Migration
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. Create profiles table
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  bio TEXT,
  location TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, display_name)
  VALUES (NEW.id, NEW.email, split_part(NEW.email, '@', 1));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 2. Alter projects table (add Ravelry fields)
-- ============================================
ALTER TABLE projects ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'in_progress';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS craft TEXT DEFAULT 'knitting';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS pattern_name TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS pattern_id UUID;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS needle_size TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS gauge TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS started_at DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS completed_at DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS made_for TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS happiness INTEGER DEFAULT 0;

-- Rename count to row_count if it exists as count
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'count') THEN
    ALTER TABLE projects RENAME COLUMN count TO row_count;
  END IF;
END $$;

-- ============================================
-- 3. Create patterns table
-- ============================================
CREATE TABLE IF NOT EXISTS patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  author TEXT,
  craft TEXT DEFAULT 'knitting',
  category TEXT,
  yarn_weight TEXT,
  needle_size TEXT,
  gauge TEXT,
  yardage INTEGER,
  description TEXT,
  photos TEXT[] DEFAULT '{}',
  is_free BOOLEAN DEFAULT true,
  price NUMERIC(10,2),
  url TEXT,
  difficulty INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view patterns" ON patterns
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own patterns" ON patterns
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own patterns" ON patterns
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own patterns" ON patterns
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================
-- 4. Create stash table
-- ============================================
CREATE TABLE IF NOT EXISTS stash (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  yarn_name TEXT NOT NULL,
  brand TEXT,
  color TEXT,
  colorway TEXT,
  weight TEXT DEFAULT 'worsted',
  fiber_content TEXT,
  yardage INTEGER,
  skeins NUMERIC(10,1) DEFAULT 1,
  notes TEXT,
  photos TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE stash ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stash" ON stash
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stash" ON stash
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stash" ON stash
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own stash" ON stash
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================
-- 5. Create queue table
-- ============================================
CREATE TABLE IF NOT EXISTS queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pattern_id UUID REFERENCES patterns(id) ON DELETE SET NULL,
  pattern_name TEXT NOT NULL,
  notes TEXT,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own queue" ON queue
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own queue" ON queue
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own queue" ON queue
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own queue" ON queue
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================
-- 6. Create favorites table
-- ============================================
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pattern_id UUID REFERENCES patterns(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, pattern_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites" ON favorites
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON favorites
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON favorites
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================
-- 7. Add FK from projects to stash
-- ============================================
ALTER TABLE projects ADD COLUMN IF NOT EXISTS yarn_id UUID REFERENCES stash(id) ON DELETE SET NULL;

-- ============================================
-- 8. Enable realtime on all tables
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE patterns;
ALTER PUBLICATION supabase_realtime ADD TABLE stash;
ALTER PUBLICATION supabase_realtime ADD TABLE queue;
ALTER PUBLICATION supabase_realtime ADD TABLE favorites;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
