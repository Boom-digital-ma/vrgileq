-- 1. Création du type pour le statut des événements
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_status') THEN
        CREATE TYPE event_status AS ENUM ('draft', 'scheduled', 'live', 'closed');
    END IF;
END
$$;

-- 2. Création de la table des ÉVÉNEMENTS (Auction Events)
CREATE TABLE IF NOT EXISTS public.auction_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    start_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ends_at TIMESTAMPTZ NOT NULL,
    deposit_amount NUMERIC(10,2) DEFAULT 0.00,
    status event_status DEFAULT 'draft',
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Mise à jour de la table des LOTS (anciennement auctions)
ALTER TABLE public.auctions 
ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES public.auction_events(id) ON DELETE CASCADE;

-- 4. Création de la table des INSCRIPTIONS (Event Registrations)
-- C'est ici qu'on gère le Hold Stripe par événement
CREATE TABLE IF NOT EXISTS public.event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.auction_events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    stripe_payment_intent_id TEXT,
    status TEXT DEFAULT 'authorized', -- authorized, captured, released
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(event_id, user_id)
);

-- 5. Activation des RLS pour les nouvelles tables
ALTER TABLE public.auction_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Politiques pour les événements
CREATE POLICY "Public Read Events" ON public.auction_events FOR SELECT USING (true);
CREATE POLICY "Admins manage events" ON public.auction_events FOR ALL 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'moderator')));

-- Politiques pour les inscriptions
CREATE POLICY "Users can view own registrations" ON public.event_registrations FOR SELECT 
USING (auth.uid() = user_id);
CREATE POLICY "Admins view all registrations" ON public.event_registrations FOR SELECT 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'moderator')));

-- 6. Création d'un événement de test pour migrer les lots actuels
INSERT INTO public.auction_events (title, description, ends_at, status, deposit_amount)
VALUES ('Initial Industrial Liquidation', 'Global sale including all current equipment.', now() + interval '7 days', 'live', 500.00)
RETURNING id;

-- Note : Tu devras récupérer l'ID généré et mettre à jour tes lots :
-- UPDATE auctions SET event_id = 'L_ID_GENERE';
