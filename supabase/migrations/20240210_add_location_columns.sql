-- Adicionar colunas de latitude e longitude na tabela studios
ALTER TABLE public.studios
ADD COLUMN latitude DOUBLE PRECISION DEFAULT -15.7975, -- Padrão: Brasília
ADD COLUMN longitude DOUBLE PRECISION DEFAULT -47.8919; -- Padrão: Brasília

-- Comentário nas colunas
COMMENT ON COLUMN public.studios.latitude IS 'Latitude do estúdio para previsão do tempo';
COMMENT ON COLUMN public.studios.longitude IS 'Longitude do estúdio para previsão do tempo';
