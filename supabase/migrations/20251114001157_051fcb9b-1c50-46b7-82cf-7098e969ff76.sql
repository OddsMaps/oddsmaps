-- Add total_volume column to market_data table to track lifetime volume
ALTER TABLE market_data ADD COLUMN total_volume numeric DEFAULT 0;