-- Migration: Fix profiles table and policies

-- 1. Create table if not exists
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    name TEXT,
    nickname TEXT,
    credits INTEGER DEFAULT 0,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- 4. Create Policies

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id);

-- Admins can view ALL profiles (to check credits before approving)
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT
    USING (
        auth.jwt() ->> 'email' = 'pkmshopify@gmail.com'
    );

-- Admins can update ALL profiles (to give credits)
CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE
    USING (
        auth.jwt() ->> 'email' = 'pkmshopify@gmail.com'
    );

-- Grant access to authenticated users
GRANT ALL ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.profiles TO service_role;
