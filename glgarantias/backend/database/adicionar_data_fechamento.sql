-- Script para adicionar o campo data_fechamento à tabela ordens_servico
-- Este campo é importante para rastrear quando a OS foi fechada

-- Adicionar o campo data_fechamento
ALTER TABLE ordens_servico 
ADD COLUMN data_fechamento DATE;

-- Adicionar índice para otimização de consultas por data de fechamento
CREATE INDEX idx_ordens_servico_data_fechamento ON ordens_servico(data_fechamento);

-- Adicionar comentário explicativo
COMMENT ON COLUMN ordens_servico.data_fechamento IS 'Data de fechamento da ordem de serviço (DataFecha_Osv do Excel)';

-- Verificar se o campo foi adicionado corretamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'ordens_servico' 
AND column_name = 'data_fechamento'; 