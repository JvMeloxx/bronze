-- Otimização de Performance - Índices Avançados
-- Autor: Antigravity
-- Data: 2026-02-07

-- 1. Índice CRÍTICO para RLS (Row Level Security)
-- As políticas de segurança fazem subqueries na tabela studios usando user_id.
-- Sem este índice, o banco faz "Full Scan" na tabela studios para CADA linha verificada em agendamentos/clientes.
CREATE INDEX IF NOT EXISTS idx_studios_user_id ON studios(user_id);

-- 2. Índice Composto para Agendamentos (Dashboard)
-- O dashboard filtra agendamentos por studio_id E data ao mesmo tempo.
-- O índice simples em 'data' ajuda, mas um composto é muito mais rápido (evita "Bitmap And").
CREATE INDEX IF NOT EXISTS idx_agendamentos_studio_data ON agendamentos(studio_id, data);

-- 3. Índice para Ordenação de Clientes
-- A lista de clientes filtra por studio_id e ordena por created_at.
-- Esse índice cobre os dois, evitando "Sort" em memória.
CREATE INDEX IF NOT EXISTS idx_clientes_studio_created ON clientes(studio_id, created_at DESC);

-- 4. Índice para Serviços Ativos
-- A página pública busca serviços por studio_id e ativo = true.
CREATE INDEX IF NOT EXISTS idx_servicos_studio_ativo ON servicos(studio_id, ativo);

-- 5. Análise de Tabelas (Atualiza estatísticas para o Query Planner)
ANALYZE studios;
ANALYZE agendamentos;
ANALYZE clientes;
ANALYZE servicos;
