-- Add user_id column to reviews table for secure ownership
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Optional: Create an index for performance
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);

-- SECURITY: Enable Row Level Security
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 1. DROP existing policies to allow re-running this script
DROP POLICY IF EXISTS "Public Read" ON reviews;
DROP POLICY IF EXISTS "User Insert" ON reviews;
DROP POLICY IF EXISTS "User Delete" ON reviews;

-- 2. Create Policies

-- Allow anyone to READ reviews
CREATE POLICY "Public Read" ON reviews
    FOR SELECT
    USING (true);

-- Allow authenticated users to INSERT their own reviews
CREATE POLICY "User Insert" ON reviews
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow users to DELETE their own reviews
CREATE POLICY "User Delete" ON reviews
    FOR DELETE
    USING (auth.uid() = user_id);
