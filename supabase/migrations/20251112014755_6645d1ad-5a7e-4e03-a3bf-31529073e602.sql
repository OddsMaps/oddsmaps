-- Create wallet_profiles table to track wallet information
CREATE TABLE public.wallet_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL UNIQUE,
  total_volume NUMERIC DEFAULT 0,
  total_trades INTEGER DEFAULT 0,
  total_markets INTEGER DEFAULT 0,
  total_pnl NUMERIC DEFAULT 0,
  win_rate NUMERIC DEFAULT 0,
  first_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create wallet_positions table to track positions in markets
CREATE TABLE public.wallet_positions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  market_id UUID REFERENCES public.markets(id),
  side TEXT NOT NULL CHECK (side IN ('yes', 'no')),
  position_size NUMERIC NOT NULL,
  avg_entry_price NUMERIC NOT NULL,
  current_price NUMERIC,
  pnl NUMERIC DEFAULT 0,
  trades_count INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  opened_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  closed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create wallet_transactions table for transaction history
CREATE TABLE public.wallet_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  market_id UUID REFERENCES public.markets(id),
  transaction_hash TEXT,
  side TEXT NOT NULL CHECK (side IN ('buy', 'sell', 'yes', 'no')),
  amount NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  transaction_type TEXT DEFAULT 'market' CHECK (transaction_type IN ('market', 'limit')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  block_number BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wallet_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (public read access)
CREATE POLICY "Wallet profiles are viewable by everyone"
  ON public.wallet_profiles FOR SELECT
  USING (true);

CREATE POLICY "Wallet positions are viewable by everyone"
  ON public.wallet_positions FOR SELECT
  USING (true);

CREATE POLICY "Wallet transactions are viewable by everyone"
  ON public.wallet_transactions FOR SELECT
  USING (true);

-- Create indexes for performance
CREATE INDEX idx_wallet_profiles_address ON public.wallet_profiles(wallet_address);
CREATE INDEX idx_wallet_positions_address ON public.wallet_positions(wallet_address);
CREATE INDEX idx_wallet_positions_market ON public.wallet_positions(market_id);
CREATE INDEX idx_wallet_transactions_address ON public.wallet_transactions(wallet_address);
CREATE INDEX idx_wallet_transactions_market ON public.wallet_transactions(market_id);
CREATE INDEX idx_wallet_transactions_timestamp ON public.wallet_transactions(timestamp DESC);

-- Create trigger for updated_at
CREATE TRIGGER update_wallet_profiles_updated_at
  BEFORE UPDATE ON public.wallet_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wallet_positions_updated_at
  BEFORE UPDATE ON public.wallet_positions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();