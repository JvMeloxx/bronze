-- Adicionar colunas para categorização e horários específicos
ALTER TABLE servicos
ADD COLUMN horarios JSONB DEFAULT NULL,
ADD COLUMN categoria TEXT DEFAULT 'natural'; -- 'natural' ou 'artificial'

COMMENT ON COLUMN servicos.horarios IS 'Horários específicos do serviço. Se NULL, usa os do estúdio.';
COMMENT ON COLUMN servicos.categoria IS 'Categoria do serviço: natural (sol) ou artificial (cabine)';
