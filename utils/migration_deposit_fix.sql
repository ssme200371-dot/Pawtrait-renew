-- Migration: Fix payment_requests table and policies

-- 1. Create table if not exists (ensure all columns exist)
CREATE TABLE IF NOT EXISTS public.payment_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    user_email TEXT, -- Added user_email
    user_name TEXT,
    user_nickname TEXT,
    amount NUMERIC,
    credits INTEGER,
    package_name TEXT,
    status TEXT DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 1.1 Explicitly add user_email if table already existed but column didn't
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payment_requests' AND column_name = 'user_email') THEN
        ALTER TABLE public.payment_requests ADD COLUMN user_email TEXT;
    END IF;
END $$;

-- 2. Enable RLS
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable read access for users" ON public.payment_requests;
DROP POLICY IF EXISTS "Enable insert access for users" ON public.payment_requests;
DROP POLICY IF EXISTS "Enable all access for admins" ON public.payment_requests;

-- 4. Create Policies

-- Users can see their own requests
CREATE POLICY "Enable read access for users" ON public.payment_requests
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create requests
CREATE POLICY "Enable insert access for users" ON public.payment_requests
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Admins can do everything (assuming admin check via email or claim)
-- Ideally, use a safer admin check. For now, trusting client-side admin logic requires server-side validation or a specific admin role in auth.users.
-- Since we don't have a robust admin role system setup in the provided context, we will allow all authenticated users to READ for now (so admin panel works if RLS allows), but strictly speaking, we need a way to distinguish admins.
-- Given the current simplified setup where admin is just a frontend flag, we might need a more permissive policy or a specific user ID check.
-- Let's stick to a simple policy: Admins (identified by specific email in the application code, but here we might just allow all authenticated for simplicity in this MVP, or check against a profiles table if possible).
-- A better approach for this customized app:
CREATE POLICY "Enable all access for admins" ON public.payment_requests
    FOR ALL
    USING (
        auth.jwt() ->> 'email' = 'pkmshopify@gmail.com' -- Hardcoded admin email from supabaseClient.ts
    );
