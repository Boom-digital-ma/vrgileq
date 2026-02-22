-- Track if the registration deposit has been captured
ALTER TABLE public.event_registrations 
ADD COLUMN IF NOT EXISTS deposit_captured BOOLEAN DEFAULT FALSE;
