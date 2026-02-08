-- ========================================
-- OTIMIZAÇÃO DE PERFORMANCE - SUPABASE
-- Execute este script no SQL Editor do Supabase
-- Autor: Antigravity | Data: 2026-02-08
-- ========================================

-- ⚠️ IMPORTANTE: Faça backup antes de executar!
-- Este script remove políticas antigas e cria novas otimizadas.

-- ========================================
-- PASSO 1: ÍNDICES CRÍTICOS
-- ========================================

-- Índice para RLS (CRÍTICO - evita full scan em cada verificação)
CREATE INDEX IF NOT EXISTS idx_studios_user_id ON studios(user_id);

-- Índice para slug (página pública)
CREATE UNIQUE INDEX IF NOT EXISTS idx_studios_slug ON studios(slug);

-- Índices compostos para queries frequentes
CREATE INDEX IF NOT EXISTS idx_agendamentos_studio_data ON agendamentos(studio_id, data);
CREATE INDEX IF NOT EXISTS idx_agendamentos_studio_status ON agendamentos(studio_id, status);
CREATE INDEX IF NOT EXISTS idx_clientes_studio_created ON clientes(studio_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_servicos_studio_ativo ON servicos(studio_id, ativo);

-- ========================================
-- PASSO 2: REMOVER POLÍTICAS DUPLICADAS
-- ========================================

-- Studios
DROP POLICY IF EXISTS "Users can view own studio" ON studios;
DROP POLICY IF EXISTS "Users can update own studio" ON studios;
DROP POLICY IF EXISTS "Public Read Studios" ON studios;
DROP POLICY IF EXISTS "Owner Manage Studio" ON studios;
DROP POLICY IF EXISTS "Public can view studios basic info" ON studios;

-- Clientes
DROP POLICY IF EXISTS "Users can manage own clients" ON clientes;
DROP POLICY IF EXISTS "Owner Manage Clientes" ON clientes;
DROP POLICY IF EXISTS "Public Insert Clientes" ON clientes;
DROP POLICY IF EXISTS "Public can create clients" ON clientes;

-- Serviços
DROP POLICY IF EXISTS "Users can manage own services" ON servicos;
DROP POLICY IF EXISTS "Owner Manage Servicos" ON servicos;
DROP POLICY IF EXISTS "Public Read Servicos" ON servicos;
DROP POLICY IF EXISTS "Public can view active services" ON servicos;

-- Agendamentos
DROP POLICY IF EXISTS "Users can manage own appointments" ON agendamentos;
DROP POLICY IF EXISTS "Owner Manage Agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Public Manage Agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Public can create appointments" ON agendamentos;
DROP POLICY IF EXISTS "Public can create bookings" ON agendamentos;
DROP POLICY IF EXISTS "Public can view bookings for availability" ON agendamentos;

-- ========================================
-- PASSO 3: CRIAR POLÍTICAS OTIMIZADAS
-- ========================================

-- === STUDIOS ===

-- Dona pode gerenciar seu próprio studio (usa = direto, sem subquery)
DROP POLICY IF EXISTS "studio_owner_all" ON studios;
CREATE POLICY "studio_owner_all" ON studios
FOR ALL USING (auth.uid() = user_id);

-- Público pode ler studios ativos (para página de agendamento)
DROP POLICY IF EXISTS "studio_public_read" ON studios;
CREATE POLICY "studio_public_read" ON studios
FOR SELECT USING (ativo = true);

-- === SERVIÇOS ===

-- Dona pode gerenciar seus serviços (usa EXISTS ao invés de IN)
DROP POLICY IF EXISTS "servicos_owner_all" ON servicos;
CREATE POLICY "servicos_owner_all" ON servicos
FOR ALL USING (
    EXISTS (SELECT 1 FROM studios WHERE studios.id = servicos.studio_id AND studios.user_id = auth.uid())
);

-- Público pode ver serviços ativos
DROP POLICY IF EXISTS "servicos_public_read" ON servicos;
CREATE POLICY "servicos_public_read" ON servicos
FOR SELECT USING (ativo = true);

-- === CLIENTES ===

-- Dona pode gerenciar seus clientes (usa EXISTS)
DROP POLICY IF EXISTS "clientes_owner_all" ON clientes;
CREATE POLICY "clientes_owner_all" ON clientes
FOR ALL USING (
    EXISTS (SELECT 1 FROM studios WHERE studios.id = clientes.studio_id AND studios.user_id = auth.uid())
);

-- Público pode criar cliente (para página de agendamento)
DROP POLICY IF EXISTS "clientes_public_insert" ON clientes;
CREATE POLICY "clientes_public_insert" ON clientes
FOR INSERT WITH CHECK (true);

-- === AGENDAMENTOS ===

-- Dona pode gerenciar seus agendamentos (usa EXISTS)
DROP POLICY IF EXISTS "agendamentos_owner_all" ON agendamentos;
CREATE POLICY "agendamentos_owner_all" ON agendamentos
FOR ALL USING (
    EXISTS (SELECT 1 FROM studios WHERE studios.id = agendamentos.studio_id AND studios.user_id = auth.uid())
);

-- Público pode criar agendamentos
DROP POLICY IF EXISTS "agendamentos_public_insert" ON agendamentos;
CREATE POLICY "agendamentos_public_insert" ON agendamentos
FOR INSERT WITH CHECK (true);

-- Público pode ler agendamentos (verificar disponibilidade)
DROP POLICY IF EXISTS "agendamentos_public_read" ON agendamentos;
CREATE POLICY "agendamentos_public_read" ON agendamentos
FOR SELECT USING (true);

-- ========================================
-- PASSO 4: ATUALIZAR ESTATÍSTICAS
-- ========================================

ANALYZE studios;
ANALYZE clientes;
ANALYZE servicos;
ANALYZE agendamentos;

-- ========================================
-- VERIFICAÇÃO (execute separadamente)
-- ========================================

-- Para verificar se as políticas foram criadas corretamente:
-- SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';

-- Para verificar os índices:
-- SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public';
