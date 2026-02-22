-- Add notification tracking to sales table
ALTER TABLE public.sales 
ADD COLUMN IF NOT EXISTS winning_notified BOOLEAN DEFAULT FALSE;

-- Update existing sales to true so we don't spam old winners
UPDATE public.sales SET winning_notified = true;
