-- ========================================
-- SunSync Database Schema
-- Execute este SQL no Supabase SQL Editor
-- ========================================

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- TABELA: studios (clientes do SaaS)
-- ========================================
CREATE TABLE studios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    nome_estudio TEXT NOT NULL DEFAULT '',
    telefone TEXT DEFAULT '',
    plano TEXT NOT NULL DEFAULT 'basico' CHECK (plano IN ('basico', 'profissional')),
    ativo BOOLEAN NOT NULL DEFAULT true,
    drive_artes_link TEXT DEFAULT '',
    -- Configurações
    pix_enabled BOOLEAN DEFAULT true,
    pix_key TEXT DEFAULT '',
    pix_key_type TEXT DEFAULT 'telefone',
    establishment_name TEXT DEFAULT '',
    signal_percentage INTEGER DEFAULT 50,
    payment_policy TEXT DEFAULT '',
    -- Notificações
    notifications_enabled BOOLEAN DEFAULT true,
    owner_phone TEXT DEFAULT '',
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABELA: clientes (clientes de cada studio)
-- ========================================
CREATE TABLE clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    telefone TEXT NOT NULL,
    email TEXT DEFAULT '',
    observacoes TEXT DEFAULT '',
    tipo_pele TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABELA: servicos
-- ========================================
CREATE TABLE servicos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    descricao TEXT DEFAULT '',
    preco DECIMAL(10,2) NOT NULL DEFAULT 0,
    duracao INTEGER NOT NULL DEFAULT 30,
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABELA: agendamentos
-- ========================================
CREATE TABLE agendamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
    cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
    cliente_nome TEXT NOT NULL,
    telefone TEXT DEFAULT '',
    email TEXT DEFAULT '',
    data TEXT NOT NULL,
    horario TEXT NOT NULL,
    servico_id UUID REFERENCES servicos(id) ON DELETE SET NULL,
    servico_nome TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmado', 'realizado', 'cancelado')),
    duracao INTEGER DEFAULT 30,
    preco DECIMAL(10,2) DEFAULT 0,
    observacoes TEXT DEFAULT '',
    fonte TEXT DEFAULT 'dashboard',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- ÍNDICES para performance
-- ========================================
CREATE INDEX idx_clientes_studio ON clientes(studio_id);
CREATE INDEX idx_servicos_studio ON servicos(studio_id);
CREATE INDEX idx_agendamentos_studio ON agendamentos(studio_id);
CREATE INDEX idx_agendamentos_data ON agendamentos(data);

-- ========================================
-- RLS (Row Level Security) - IMPORTANTE!
-- ========================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE studios ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;

-- Políticas para studios (usuário só vê seu próprio studio)
CREATE POLICY "Users can view own studio" ON studios
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own studio" ON studios
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para clientes
CREATE POLICY "Users can manage own clients" ON clientes
    FOR ALL USING (
        studio_id IN (SELECT id FROM studios WHERE user_id = auth.uid())
    );

-- Políticas para servicos
CREATE POLICY "Users can manage own services" ON servicos
    FOR ALL USING (
        studio_id IN (SELECT id FROM studios WHERE user_id = auth.uid())
    );

-- Políticas para agendamentos
CREATE POLICY "Users can manage own appointments" ON agendamentos
    FOR ALL USING (
        studio_id IN (SELECT id FROM studios WHERE user_id = auth.uid())
    );

-- Política para página pública de agendamento (leitura de serviços ativos)
CREATE POLICY "Public can view active services" ON servicos
    FOR SELECT USING (ativo = true);

-- Política para criar agendamentos pela página pública
CREATE POLICY "Public can create appointments" ON agendamentos
    FOR INSERT WITH CHECK (true);

-- ========================================
-- FUNÇÃO: criar studio após signup
-- ========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.studios (user_id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar studio automaticamente
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
