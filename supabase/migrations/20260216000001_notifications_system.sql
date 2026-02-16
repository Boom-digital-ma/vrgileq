-- 1. Table des notifications
CREATE TYPE notification_type AS ENUM ('outbid', 'won', 'lost', 'outbid_warning');

CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    auction_id UUID REFERENCES public.auctions(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Activation RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
FOR UPDATE USING (auth.uid() = user_id);

-- 2. Trigger pour OUTBID
CREATE OR REPLACE FUNCTION public.handle_outbid_notification()
RETURNS TRIGGER AS $$
DECLARE
    v_previous_bid RECORD;
    v_auction_title TEXT;
BEGIN
    -- Chercher l'enchère précédente qui vient de passer en 'outbid'
    -- Note: NEW est la nouvelle enchère 'active'
    -- On cherche l'enchère qui était active juste avant pour ce même auction_id
    
    SELECT title INTO v_auction_title FROM auctions WHERE id = NEW.auction_id;

    -- Trouver le dernier enchérisseur différent du nouveau
    SELECT user_id, amount INTO v_previous_bid
    FROM bids
    WHERE auction_id = NEW.auction_id 
    AND id != NEW.id
    AND status = 'outbid'
    ORDER BY created_at DESC
    LIMIT 1;

    IF v_previous_bid.user_id IS NOT NULL AND v_previous_bid.user_id != NEW.user_id THEN
        INSERT INTO notifications (user_id, type, auction_id, title, message)
        VALUES (
            v_previous_bid.user_id,
            'outbid',
            NEW.auction_id,
            'You have been outbid!',
            'Someone just placed a higher bid of $' || NEW.amount || ' on "' || v_auction_title || '".'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_bid_outbid
    AFTER INSERT ON public.bids
    FOR EACH ROW
    WHEN (NEW.status = 'active')
    EXECUTE FUNCTION public.handle_outbid_notification();
