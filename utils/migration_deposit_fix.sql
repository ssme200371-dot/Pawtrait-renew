-- Migration: Fix payment_requests table columns
-- Add user_email and user_name columns if they don't exist
ALTER TABLE public.payment_requests ADD COLUMN IF NOT EXISTS user_email TEXT;
ALTER TABLE public.payment_requests ADD COLUMN IF NOT EXISTS user_name TEXT;

-- Update RLS policies to ensure users can insert their own requests
DROP POLICY IF EXISTS "Users can insert own requests" ON public.payment_requests;
DROP POLICY IF EXISTS "Users can view own requests" ON public.payment_requests;

CREATE POLICY "Users can insert own requests" ON public.payment_requests
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own requests" ON public.payment_requests
    FOR SELECT
    USING (auth.uid() = user_id);

-- Admins can view/update all
-- Assuming Admin Email is hardcoded or has is_admin flag in profiles which we can join... 
-- But for simplicity in policies, we often use specific email check or open reading for Authenticated (if not strict).
-- Let's stick to the email check used in other policies.
DROP POLICY IF EXISTS "Admins can view all requests" ON public.payment_requests;
DROP POLICY IF EXISTS "Admins can update all requests" ON public.payment_requests;

CREATE POLICY "Admins can view all requests" ON public.payment_requests
    FOR SELECT
    USING (
        auth.jwt() ->> 'email' = 'pkmshopify@gmail.com'
    );

CREATE POLICY "Admins can update all requests" ON public.payment_requests
    FOR UPDATE
    USING (
        auth.jwt() ->> 'email' = 'pkmshopify@gmail.com'
    );
