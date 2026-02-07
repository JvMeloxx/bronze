-- ========================================
-- Otimização de Performance
-- Adiciona índices para as consultas mais frequentes
-- ========================================

-- 1. Agendamentos: Busca por Studio + Data (muito usado no dashboard e calendario)
CREATE INDEX IF NOT EXISTS idx_agendamentos_studio_data 
ON agendamentos(studio_id, data);

-- 2. Agendamentos: Busca por Studio + Cliente (histórico do cliente)
CREATE INDEX IF NOT EXISTS idx_agendamentos_studio_cliente 
ON agendamentos(studio_id, cliente_id);

-- 3. Clientes: Busca por Studio + Nome (para autocomplete/busca)
-- Usando gin_trgm_ops se a extensão pg_trgm estiver ativa seria melhor, mas btree resolve para prefixos
CREATE INDEX IF NOT EXISTS idx_clientes_studio_nome 
ON clientes(studio_id, nome);

-- 4. Studios: Busca por Slug (para página pública - CRÍTICO)
CREATE INDEX IF NOT EXISTS idx_studios_slug 
ON studios(slug);

-- 5. Serviços: Busca por Studio + Ativo (para listar no agendamento)
CREATE INDEX IF NOT EXISTS idx_servicos_studio_ativo 
ON servicos(studio_id, ativo);

-- Otimização extra: Garantir que chaves estrangeiras tenham índices (o Postgres não cria aut.)
CREATE INDEX IF NOT EXISTS idx_agendamentos_servico 
ON agendamentos(servico_id);
