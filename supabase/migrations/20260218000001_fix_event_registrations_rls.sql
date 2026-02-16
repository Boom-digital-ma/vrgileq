-- Fix RLS for event_registrations
-- Users must be able to insert their own registrations

DROP POLICY IF EXISTS "Users can insert own registrations" ON public.event_registrations;
CREATE POLICY "Users can insert own registrations" ON public.event_registrations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
