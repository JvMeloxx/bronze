-- Alterar a coluna horarios_funcionamento para JSONB
-- Isso permite armazenar objetos como {"segunda": ["08:00"], "terca": []}
-- O comando USING converte os dados existentes (array) para um JSONB válido
ALTER TABLE studios
ALTER COLUMN horarios_funcionamento TYPE JSONB
USING to_jsonb(horarios_funcionamento);

-- Comentário para documentação
COMMENT ON COLUMN studios.horarios_funcionamento IS 'Objeto com horários por dia da semana. Ex: {"segunda": ["08:00", ...], "domingo": []}';
