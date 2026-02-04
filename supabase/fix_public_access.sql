-- ================================================
-- CORREÇÃO DE PERMISSÕES PÚBLICAS (BRONZEAMENTO)
-- Execute este script no SQL Editor do Supabase para corrigir o erro da página de agendamento
-- ================================================

-- 1. Habilitar leitura pública da tabela studios (Correção do erro atual)
DROP POLICY IF EXISTS "Public can view studios basic info" ON studios;
CREATE POLICY "Public can view studios basic info" ON studios
    FOR SELECT USING (true);

-- 2. Permitir que qualquer pessoa (pública) crie um cliente
DROP POLICY IF EXISTS "Public can create clients" ON clientes;
CREATE POLICY "Public can create clients" ON clientes
    FOR INSERT WITH CHECK (true);

-- 3. Permitir que qualquer pessoa crie agendamentos
DROP POLICY IF EXISTS "Public can create bookings" ON agendamentos;
CREATE POLICY "Public can create bookings" ON agendamentos
    FOR INSERT WITH CHECK (true);

-- 4. Permitir leitura de serviços ativos
DROP POLICY IF EXISTS "Public can view active services" ON servicos;
CREATE POLICY "Public can view active services" ON servicos
    FOR SELECT USING (ativo = true);

-- 5. (Opcional) Permitir leitura para verificar conflito de horário
-- Isso evita agendar no mesmo horário
DROP POLICY IF EXISTS "Public can view bookings for availability" ON agendamentos;
CREATE POLICY "Public can view bookings for availability" ON agendamentos
    FOR SELECT USING (true);
