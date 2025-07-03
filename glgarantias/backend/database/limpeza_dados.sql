-- Script de Limpeza e Correção dos Dados no Supabase
-- Execute este script no SQL Editor do Supabase para corrigir os dados

-- ATENÇÃO: Faça backup antes de executar!

-- 1. Criar tabela temporária para backup
CREATE TABLE IF NOT EXISTS backup_ordens_servico AS 
SELECT * FROM ordens_servico;

-- 2. Corrigir status (normalizar valores)
UPDATE ordens_servico 
SET status = CASE 
    WHEN UPPER(TRIM(status)) = 'G' THEN 'Garantia'
    WHEN UPPER(TRIM(status)) = 'GO' THEN 'Garantia de Oficina'
    WHEN UPPER(TRIM(status)) = 'GU' THEN 'Garantia de Usinagem'
    ELSE status
END
WHERE status IN ('G', 'GO', 'GU');

-- 3. Corrigir mes_servico e ano_servico a partir de data_ordem
UPDATE ordens_servico 
SET 
    mes_servico = EXTRACT(MONTH FROM data_ordem),
    ano_servico = EXTRACT(YEAR FROM data_ordem)
WHERE 
    data_ordem IS NOT NULL 
    AND (mes_servico IS NULL OR ano_servico IS NULL);

-- 4. Limpar valores vazios ou inválidos
UPDATE ordens_servico 
SET 
    defeito_texto_bruto = NULL 
WHERE defeito_texto_bruto = '' OR defeito_texto_bruto = 'null';

UPDATE ordens_servico 
SET 
    mecanico_responsavel = NULL 
WHERE mecanico_responsavel = '' OR mecanico_responsavel = 'null';

UPDATE ordens_servico 
SET 
    modelo_motor = NULL 
WHERE modelo_motor = '' OR modelo_motor = 'null';

UPDATE ordens_servico 
SET 
    fabricante_motor = NULL 
WHERE fabricante_motor = '' OR fabricante_motor = 'null';

-- 5. Corrigir valores numéricos inválidos
UPDATE ordens_servico 
SET 
    total_pecas = NULL 
WHERE total_pecas < 0 OR total_pecas IS NULL;

UPDATE ordens_servico 
SET 
    total_servico = NULL 
WHERE total_servico < 0 OR total_servico IS NULL;

UPDATE ordens_servico 
SET 
    total_geral = NULL 
WHERE total_geral < 0 OR total_geral IS NULL;

-- 6. Corrigir dia_servico (deve estar entre 1 e 31)
UPDATE ordens_servico 
SET 
    dia_servico = NULL 
WHERE dia_servico < 1 OR dia_servico > 31;

-- 7. Corrigir mes_servico (deve estar entre 1 e 12)
UPDATE ordens_servico 
SET 
    mes_servico = NULL 
WHERE mes_servico < 1 OR mes_servico > 12;

-- 8. Corrigir ano_servico (deve ser razoável)
UPDATE ordens_servico 
SET 
    ano_servico = NULL 
WHERE ano_servico < 2000 OR ano_servico > 2030;

-- 9. Marcar registros sem classificação
UPDATE ordens_servico 
SET 
    defeito_grupo = 'Não Classificado',
    defeito_subgrupo = 'Não Classificado',
    defeito_subsubgrupo = 'Não Classificado',
    classificacao_confianca = 0.0
WHERE defeito_grupo IS NULL OR defeito_grupo = '';

-- 10. Remover duplicatas (manter apenas o mais recente)
DELETE FROM ordens_servico 
WHERE id NOT IN (
    SELECT MAX(id) 
    FROM ordens_servico 
    GROUP BY numero_ordem
);

-- 11. Verificar se há registros órfãos (sem data_ordem)
SELECT 
    COUNT(*) as registros_sem_data
FROM ordens_servico 
WHERE data_ordem IS NULL;

-- 12. Estatísticas após limpeza
SELECT 
    'Estatísticas após limpeza' as info,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN data_ordem IS NOT NULL THEN 1 END) as com_data_ordem,
    COUNT(CASE WHEN mes_servico IS NOT NULL THEN 1 END) as com_mes_servico,
    COUNT(CASE WHEN ano_servico IS NOT NULL THEN 1 END) as com_ano_servico,
    COUNT(CASE WHEN defeito_grupo IS NOT NULL THEN 1 END) as com_defeito_grupo
FROM ordens_servico; 