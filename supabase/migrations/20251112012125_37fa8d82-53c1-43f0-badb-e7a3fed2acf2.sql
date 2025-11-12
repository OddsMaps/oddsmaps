-- Create markets table to store prediction market data
CREATE TABLE IF NOT EXISTS public.markets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id TEXT UNIQUE NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('kalshi', 'polymarket')),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  end_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create market_data table to store real-time market metrics
CREATE TABLE IF NOT EXISTS public.market_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id UUID REFERENCES public.markets(id) ON DELETE CASCADE,
  yes_price DECIMAL(10, 4),
  no_price DECIMAL(10, 4),
  volume_24h DECIMAL(20, 2),
  liquidity DECIMAL(20, 2),
  trades_24h INTEGER,
  volatility DECIMAL(10, 4),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_markets_source ON public.markets(source);
CREATE INDEX IF NOT EXISTS idx_markets_status ON public.markets(status);
CREATE INDEX IF NOT EXISTS idx_markets_category ON public.markets(category);
CREATE INDEX IF NOT EXISTS idx_market_data_market_id ON public.market_data(market_id);
CREATE INDEX IF NOT EXISTS idx_market_data_timestamp ON public.market_data(timestamp DESC);

-- Enable RLS
ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_data ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (markets are public data)
CREATE POLICY "Markets are viewable by everyone"
ON public.markets FOR SELECT
USING (true);

CREATE POLICY "Market data is viewable by everyone"
ON public.market_data FOR SELECT
USING (true);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for markets table
CREATE TRIGGER update_markets_updated_at
  BEFORE UPDATE ON public.markets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.markets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.market_data;