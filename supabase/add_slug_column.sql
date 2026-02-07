-- 1. Garante que a extensão unaccent esteja habilitada (para remover acentos)
CREATE EXTENSION IF NOT EXISTS unaccent;

-- 2. Adiciona a coluna slug na tabela studios (inicialmente NULL para não travar)
ALTER TABLE studios ADD COLUMN IF NOT EXISTS slug text;

-- 3. Atualiza os studios existentes gerando slugs únicos
-- Usa CTE para lidar com nomes duplicados ou vazios
WITH source_data AS (
    SELECT
        id,
        -- Limpa o nome: remove acentos, remove caracteres especiais, poe em lowercase.
        -- Se nome for nulo ou vazio, usa 'studio' como base.
        lower(unaccent(regexp_replace(trim(COALESCE(NULLIF(nome_estudio, ''), 'studio')), '[^a-zA-Z0-9\s]', '', 'g'))) as clean_name
    FROM studios
),
slug_candidates AS (
    SELECT
        id,
        -- Substitui espaços por hifens
        regexp_replace(clean_name, '\s+', '-', 'g') as base_slug
    FROM source_data
),
unique_slugs AS (
    SELECT
        id,
        base_slug,
        -- Numera ocorrências do mesmo slug para resolver conflitos
        row_number() OVER (PARTITION BY base_slug ORDER BY id) as rn
    FROM slug_candidates
)
UPDATE studios
SET slug = 
    CASE 
        WHEN us.rn = 1 THEN us.base_slug
        ELSE us.base_slug || '-' || us.rn
    END
FROM unique_slugs us
WHERE studios.id = us.id;

-- 4. Verificação de segurança: Se algum slug ficou vazio (ex: nome era só caracteres especiais), gera um fallback com ID
UPDATE studios 
SET slug = 'studio-' || substr(id::text, 1, 8)
WHERE slug IS NULL OR trim(slug) = '';

-- 5. Agora seguro para adicionar as restrições
-- Remove a constraint se já tentou criar antes e falhou parcialmente
ALTER TABLE studios DROP CONSTRAINT IF EXISTS studios_slug_key;

-- Adiciona UNIQUE
ALTER TABLE studios ADD CONSTRAINT studios_slug_key UNIQUE (slug);

-- Adiciona NOT NULL
ALTER TABLE studios ALTER COLUMN slug SET NOT NULL;
