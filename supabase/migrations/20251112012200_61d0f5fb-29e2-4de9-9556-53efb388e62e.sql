-- Fix the function search path security issue by dropping trigger first
DROP TRIGGER IF EXISTS update_markets_updated_at ON public.markets;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Recreate function with proper search_path
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER update_markets_updated_at
  BEFORE UPDATE ON public.markets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();