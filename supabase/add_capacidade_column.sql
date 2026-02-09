-- ========================================
-- ADICIONAR CAMPO CAPACIDADE AOS SERVIÇOS
-- Execute este SQL no Supabase SQL Editor
-- ========================================

-- Capacidade = quantos clientes podem agendar no mesmo horário para este serviço
-- Default 1 = comportamento atual (1 cliente por horário)
-- 0 = sem limite de vagas
ALTER TABLE servicos ADD COLUMN IF NOT EXISTS capacidade INTEGER NOT NULL DEFAULT 1;
