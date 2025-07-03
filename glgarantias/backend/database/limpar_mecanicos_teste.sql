-- Script para Limpar Mecânicos de Teste e Dados Inválidos no Supabase
-- Execute este script no SQL Editor do Supabase

-- 1. Identificar mecânicos de teste (com prefixo X ou TESTE)
SELECT 
    mecanico_responsavel,
    COUNT(*) as quantidade
FROM ordens_servico
WHERE mecanico_responsavel LIKE 'X%' 
   OR mecanico_responsavel LIKE 'TESTE%'
   OR mecanico_responsavel LIKE '%TESTE%'
GROUP BY mecanico_responsavel
ORDER BY quantidade DESC;

-- 2. Verificar outros possíveis dados de teste
SELECT 
    mecanico_responsavel,
    COUNT(*) as quantidade
FROM ordens_servico
WHERE mecanico_responsavel IS NOT NULL
  AND (
    LENGTH(mecanico_responsavel) < 3
    OR mecanico_responsavel ~ '^[A-Z0-9\s]+$'  -- Apenas maiúsculas, números e espaços
    OR mecanico_responsavel LIKE '%TEST%'
    OR mecanico_responsavel LIKE '%EXEMPLO%'
    OR mecanico_responsavel LIKE '%SAMPLE%'
  )
GROUP BY mecanico_responsavel
ORDER BY quantidade DESC;

-- 3. Remover registros com mecânicos de teste
-- ATENÇÃO: Faça backup antes de executar!
DELETE FROM ordens_servico
WHERE mecanico_responsavel LIKE 'X%' 
   OR mecanico_responsavel LIKE 'TESTE%'
   OR mecanico_responsavel LIKE '%TESTE%'
   OR mecanico_responsavel LIKE '%TEST%'
   OR mecanico_responsavel LIKE '%EXEMPLO%'
   OR mecanico_responsavel LIKE '%SAMPLE%';

-- 4. Limpar nomes de mecânicos com formatação estranha
UPDATE ordens_servico
SET mecanico_responsavel = TRIM(mecanico_responsavel)
WHERE mecanico_responsavel IS NOT NULL;

-- 5. Remover registros com nomes muito curtos (provavelmente inválidos)
DELETE FROM ordens_servico
WHERE mecanico_responsavel IS NOT NULL
  AND LENGTH(TRIM(mecanico_responsavel)) < 3;

-- 6. Estatísticas após limpeza
SELECT 
    'Estatísticas após limpeza de mecânicos' as info,
    COUNT(*) as total_registros,
    COUNT(DISTINCT mecanico_responsavel) as total_mecanicos_unicos,
    COUNT(CASE WHEN mecanico_responsavel IS NOT NULL THEN 1 END) as registros_com_mecanico
FROM ordens_servico;

-- 7. Top 10 mecânicos mais ativos (após limpeza)
SELECT 
    mecanico_responsavel,
    COUNT(*) as total_ordens,
    SUM(total_geral) as valor_total_servicos,
    AVG(total_geral) as valor_medio_servico
FROM ordens_servico
WHERE mecanico_responsavel IS NOT NULL
GROUP BY mecanico_responsavel
ORDER BY total_ordens DESC
LIMIT 10; 