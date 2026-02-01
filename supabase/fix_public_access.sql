-- ================================================
-- CORREÇÃO DE PERMISSÕES PÚBLICAS
-- Execute este script no SQL Editor do Supabase
-- ================================================

-- Permitir que qualquer pessoa (pública) crie um cliente (ao agendar)
CREATE POLICY "Public can create clients" ON clientes
    FOR INSERT WITH CHECK (true);

-- Permitir que qualquer pessoa leia serviços ativos (para mostrar na página)
-- (Esta política já deve existir, mas reforçando caso tenha falhado)
DROP POLICY IF EXISTS "Public can view active services" ON servicos;
CREATE POLICY "Public can view active services" ON servicos
    FOR SELECT USING (ativo = true);

-- Permitir que o público busque o ID do studio pelo email/slug (futuro)
CREATE POLICY "Public can view studios basic info" ON studios
    FOR SELECT USING (true);
