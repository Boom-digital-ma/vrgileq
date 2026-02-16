-- 1. Categories Table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Auctions Table
CREATE TYPE auction_status AS ENUM ('draft', 'live', 'ended', 'sold');

CREATE TABLE auctions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id),
    start_price DECIMAL(12, 2) NOT NULL,
    current_price DECIMAL(12, 2) NOT NULL,
    min_increment DECIMAL(12, 2) NOT NULL DEFAULT 1.00,
    status auction_status DEFAULT 'draft',
    ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
    winner_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES auth.users(id)
);

-- 3. Auction Images
CREATE TABLE auction_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auction_id UUID REFERENCES auctions(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    is_main BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Bids Table
CREATE TYPE bid_status AS ENUM ('active', 'outbid', 'cancelled', 'won');

CREATE TABLE bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auction_id UUID REFERENCES auctions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    amount DECIMAL(12, 2) NOT NULL,
    stripe_payment_intent_id TEXT,
    status bid_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Profiles Table (Extending auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    stripe_customer_id TEXT,
    risk_score INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Watchlist Table
CREATE TABLE watchlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    auction_id UUID REFERENCES auctions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, auction_id)
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE auction_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Categories: Read for everyone
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);

-- Auctions: Read for everyone if live or ended
CREATE POLICY "Auctions are viewable by everyone" ON auctions FOR SELECT USING (true);

-- Bids: Read for everyone, but only RPC can insert
CREATE POLICY "Bids are viewable by everyone" ON bids FOR SELECT USING (true);

-- Profiles: Users can view and update their own profile
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Watchlist: Users can manage their own watchlist
CREATE POLICY "Users can view their own watchlist" ON watchlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own watchlist" ON watchlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own watchlist" ON watchlist FOR DELETE USING (auth.uid() = user_id);

-- RPC for secure bid placement
CREATE OR REPLACE FUNCTION place_bid_secure(
    p_auction_id UUID,
    p_user_id UUID,
    p_amount DECIMAL,
    p_stripe_pi_id TEXT
) RETURNS VOID AS $$
DECLARE
    v_current_price DECIMAL;
    v_ends_at TIMESTAMP WITH TIME ZONE;
    v_status auction_status;
    v_min_increment DECIMAL;
BEGIN
    -- Lock the auction row for update to prevent race conditions
    SELECT current_price, ends_at, status, min_increment 
    INTO v_current_price, v_ends_at, v_status, v_min_increment
    FROM auctions
    WHERE id = p_auction_id
    FOR UPDATE;

    -- Validations
    IF v_status != 'live' THEN
        RAISE EXCEPTION 'Auction is not live';
    END IF;

    IF v_ends_at < now() THEN
        RAISE EXCEPTION 'Auction has ended';
    END IF;

    IF p_amount < (v_current_price + v_min_increment) THEN
        RAISE EXCEPTION 'Bid amount too low';
    END IF;

    -- Update auction current price
    UPDATE auctions 
    SET current_price = p_amount,
        winner_id = p_user_id
    WHERE id = p_auction_id;

    -- Mark previous active bids for this auction as 'outbid'
    UPDATE bids
    SET status = 'outbid'
    WHERE auction_id = p_auction_id AND status = 'active';

    -- Insert new bid
    INSERT INTO bids (auction_id, user_id, amount, stripe_payment_intent_id, status)
    VALUES (p_auction_id, p_user_id, p_amount, p_stripe_pi_id, 'active');

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
