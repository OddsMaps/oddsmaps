-- ============================================
-- ÍNDICES DE OTIMIZAÇÃO PARA GET-MARKETS
-- ============================================
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- Ou no Lovable se tiver acesso ao SQL Editor
-- ============================================

-- Índice composto para buscar último market_data por market_id
CREATE INDEX IF NOT EXISTS idx_market_data_market_timestamp 
ON public.market_data(market_id, timestamp DESC);

-- Índice composto para contar trades_24h por market_id
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_market_timestamp 
ON public.wallet_transactions(market_id, timestamp DESC);

-- Índice para filtrar markets por source + status (filtro comum)
CREATE INDEX IF NOT EXISTS idx_markets_source_status 
ON public.markets(source, status) 
WHERE status = 'active';

-- Índice para filtrar markets por category + status
CREATE INDEX IF NOT EXISTS idx_markets_category_status 
ON public.markets(category, status) 
WHERE status = 'active';

-- ============================================
-- Verificação (opcional - execute após criar os índices)
-- ============================================
-- SELECT 
--     indexname, 
--     indexdef 
-- FROM pg_indexes 
-- WHERE schemaname = 'public' 
-- AND indexname LIKE 'idx_%'
-- ORDER BY indexname;

