ALTER TABLE servicos ADD COLUMN precos_por_dia JSONB DEFAULT NULL;

-- Exemplo de estrutura:
-- {
--   "segunda": 100,
--   "terca": 100,
--   "quarta": 100,
--   "quinta": 100,
--   "sexta": 120,
--   "sabado": 120,
--   "domingo": 120
-- }
