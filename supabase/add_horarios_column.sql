-- ========================================
-- Adicionar coluna de horários de funcionamento
-- Execute este SQL no Supabase SQL Editor
-- ========================================

-- Adicionar coluna horarios_funcionamento como array de TEXT
-- Valor padrão: horários comerciais das 8h às 18h
ALTER TABLE studios 
ADD COLUMN IF NOT EXISTS horarios_funcionamento TEXT[] 
DEFAULT ARRAY['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00'];

-- Comentário explicativo
COMMENT ON COLUMN studios.horarios_funcionamento IS 'Array de horários disponíveis para agendamento. Ex: ["08:00", "09:00", "10:00"]';
