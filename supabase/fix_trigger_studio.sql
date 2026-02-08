-- ========================================
-- CORREÇÃO: Trigger de Criação Automática de Studio
-- Execute este script no Supabase SQL Editor
-- ========================================

-- 1. Verificar se a função existe
-- (Descomente a linha abaixo para verificar)
-- SELECT routine_name FROM information_schema.routines WHERE routine_name = 'handle_new_user';

-- 2. Verificar se o trigger existe
-- (Descomente para verificar)
-- SELECT trigger_name FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created';

-- ========================================
-- PASSO 1: Recriar a função (SECURITY DEFINER é crucial!)
-- ========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Inserir studio automaticamente quando novo usuário é criado
    INSERT INTO public.studios (user_id, email, nome_estudio, ativo)
    VALUES (
        NEW.id, 
        NEW.email,
        '', -- Nome vazio, usuário preencherá depois
        true
    );
    RETURN NEW;
EXCEPTION 
    WHEN unique_violation THEN
        -- Se já existe um studio para este email, apenas retorna
        RETURN NEW;
    WHEN OTHERS THEN
        -- Log do erro (visível nos logs do Supabase)
        RAISE WARNING 'Erro ao criar studio para usuário %: %', NEW.email, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- PASSO 2: Dropar trigger existente (se houver)
-- ========================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- ========================================
-- PASSO 3: Recriar trigger
-- ========================================

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- PASSO 4: Criar studios para usuários que já existem sem studio
-- ========================================

INSERT INTO public.studios (user_id, email, nome_estudio, ativo)
SELECT 
    au.id,
    au.email,
    '',
    true
FROM auth.users au
LEFT JOIN public.studios s ON s.user_id = au.id
WHERE s.id IS NULL;

-- ========================================
-- VERIFICAÇÃO: Ver usuários vs studios
-- ========================================

-- Descomente para verificar:
-- SELECT au.email as user_email, s.id as studio_id 
-- FROM auth.users au 
-- LEFT JOIN public.studios s ON s.user_id = au.id;

SELECT 'Script executado com sucesso! Verifique se os studios foram criados.' as resultado;
