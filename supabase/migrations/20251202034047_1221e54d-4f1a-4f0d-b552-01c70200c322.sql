-- Add image_url column to markets table
ALTER TABLE public.markets 
ADD COLUMN IF NOT EXISTS image_url TEXT;