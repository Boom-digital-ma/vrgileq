-- SQL Fix: Allow Admins to see all profiles
-- Run this in your Supabase SQL Editor

DROP POLICY IF EXISTS "Admins can see all profiles" ON public.profiles;

CREATE POLICY "Admins can see all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Ensure the 'admin' user can also manage roles
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can update profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
