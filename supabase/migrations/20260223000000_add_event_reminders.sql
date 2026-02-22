-- Create table for event start reminders
CREATE TABLE IF NOT EXISTS public.event_reminders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    event_id UUID REFERENCES public.auction_events(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    notified BOOLEAN DEFAULT FALSE,
    UNIQUE(user_id, event_id)
);

-- Enable RLS
ALTER TABLE public.event_reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own reminders" 
    ON public.event_reminders FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reminders" 
    ON public.event_reminders FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminders" 
    ON public.event_reminders FOR DELETE 
    USING (auth.uid() = user_id);
