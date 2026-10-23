-- ==============================================================================
-- TRADING JOURNAL - SUPABASE DATABASE SCHEMA
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    initial_capital NUMERIC DEFAULT 100000,
    currency TEXT DEFAULT '₹',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 2. TRADES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    trade_date DATE NOT NULL,
    entry_time TIMESTAMPTZ NOT NULL,
    exit_time TIMESTAMPTZ,
    instrument TEXT NOT NULL,
    instrument_type TEXT,
    strike_price NUMERIC,
    option_type TEXT CHECK (option_type IN ('CE', 'PE')),
    expiry_date DATE,
    direction TEXT NOT NULL CHECK (direction IN ('Long', 'Short')),
    quantity NUMERIC NOT NULL,
    entry_price NUMERIC NOT NULL,
    exit_price NUMERIC,
    stop_loss NUMERIC,
    target NUMERIC,
    account_capital NUMERIC,
    risk_percent NUMERIC,
    risk_amount NUMERIC,
    planned_rr NUMERIC,
    actual_rr NUMERIC,
    position_size_method TEXT DEFAULT 'manual' CHECK (position_size_method IN ('manual', 'auto')),
    gross_pnl NUMERIC,
    gross_pnl_percent NUMERIC,
    brokerage NUMERIC DEFAULT 0,
    charges NUMERIC DEFAULT 0,
    net_pnl NUMERIC,
    net_pnl_percent NUMERIC,
    r_multiple NUMERIC,
    mae NUMERIC,
    mfe NUMERIC,
    strategy TEXT,
    custom_strategy TEXT,
    entry_reason TEXT,
    market_condition TEXT,
    timeframe TEXT,
    entry_screenshot_url TEXT,
    exit_screenshot_url TEXT,
    before_emotion TEXT,
    during_emotion TEXT,
    after_emotion TEXT,
    plan_followed BOOLEAN DEFAULT true,
    fomo BOOLEAN DEFAULT false,
    revenge_trading BOOLEAN DEFAULT false,
    overtrading BOOLEAN DEFAULT false,
    early_exit BOOLEAN DEFAULT false,
    psychology_notes TEXT,
    what_went_well TEXT,
    what_went_wrong TEXT,
    learning TEXT,
    next_time TEXT,
    mistake_tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 3. INDEXES FOR HIGH-PERFORMANCE QUERYING & ANALYTICS
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON public.trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_user_date ON public.trades(user_id, trade_date DESC);
CREATE INDEX IF NOT EXISTS idx_trades_user_instrument ON public.trades(user_id, instrument);
CREATE INDEX IF NOT EXISTS idx_trades_user_strategy ON public.trades(user_id, strategy);
CREATE INDEX IF NOT EXISTS idx_trades_user_direction ON public.trades(user_id, direction);
CREATE INDEX IF NOT EXISTS idx_trades_user_created ON public.trades(user_id, created_at DESC);

-- ------------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Trades Policies
DROP POLICY IF EXISTS "Users can view own trades" ON public.trades;
CREATE POLICY "Users can view own trades"
    ON public.trades FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own trades" ON public.trades;
CREATE POLICY "Users can insert own trades"
    ON public.trades FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own trades" ON public.trades;
CREATE POLICY "Users can update own trades"
    ON public.trades FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own trades" ON public.trades;
CREATE POLICY "Users can delete own trades"
    ON public.trades FOR DELETE
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 5. STORAGE BUCKET CONFIGURATION & POLICIES
-- ------------------------------------------------------------------------------
-- Insert bucket for trade screenshots if it does not exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('trade-screenshots', 'trade-screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Users can upload screenshots into their own folder ({user_id}/*)
DROP POLICY IF EXISTS "Users can upload own screenshots" ON storage.objects;
CREATE POLICY "Users can upload own screenshots"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'trade-screenshots' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- Policy: Users can view own screenshots (and public read if public bucket)
DROP POLICY IF EXISTS "Users can view own screenshots" ON storage.objects;
CREATE POLICY "Users can view own screenshots"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'trade-screenshots' AND
        ((storage.foldername(name))[1] = auth.uid()::text OR auth.role() = 'authenticated')
    );

-- Policy: Users can delete own screenshots
DROP POLICY IF EXISTS "Users can delete own screenshots" ON storage.objects;
CREATE POLICY "Users can delete own screenshots"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'trade-screenshots' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- ------------------------------------------------------------------------------
-- 6. AUTOMATIC UPDATED_AT TRIGGER
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_trades_updated_at ON public.trades;
CREATE TRIGGER set_trades_updated_at
    BEFORE UPDATE ON public.trades
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 7. MIGRATIONS FOR EXISTING INSTALLS
-- ------------------------------------------------------------------------------
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS strike_price NUMERIC;
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS option_type TEXT CHECK (option_type IN ('CE', 'PE'));
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS expiry_date DATE;

