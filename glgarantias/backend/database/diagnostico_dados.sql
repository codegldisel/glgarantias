-- Script de Diagnóstico dos Dados no Supabase
-- Execute este script no SQL Editor do Supabase para ver o estado atual

-- 1. Contagem geral de registros
SELECT 
    COUNT(*) as total_registros,
    COUNT(CASE WHEN data_ordem IS NOT NULL THEN 1 END) as com_data_ordem,
    COUNT(CASE WHEN mes_servico IS NOT NULL THEN 1 END) as com_mes_servico,
    COUNT(CASE WHEN ano_servico IS NOT NULL THEN 1 END) as com_ano_servico,
    COUNT(CASE WHEN defeito_grupo IS NOT NULL THEN 1 END) as com_defeito_grupo
FROM ordens_servico;

-- 2. Análise de status
SELECT 
    status,
    COUNT(*) as quantidade,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM ordens_servico), 2) as percentual
FROM ordens_servico
GROUP BY status
ORDER BY quantidade DESC;

-- 3. Análise de meses/anos
SELECT 
    ano_servico,
    mes_servico,
    COUNT(*) as quantidade
FROM ordens_servico
WHERE ano_servico IS NOT NULL AND mes_servico IS NOT NULL
GROUP BY ano_servico, mes_servico
ORDER BY ano_servico DESC, mes_servico DESC
LIMIT 20;

-- 4. Registros com problemas de data
SELECT 
    id,
    numero_ordem,
    data_ordem,
    mes_servico,
    ano_servico,
    status
FROM ordens_servico
WHERE mes_servico IS NULL OR ano_servico IS NULL
ORDER BY created_at DESC
LIMIT 10;

-- 5. Análise de classificação de defeitos
SELECT 
    defeito_grupo,
    defeito_subgrupo,
    defeito_subsubgrupo,
    COUNT(*) as quantidade,
    AVG(classificacao_confianca) as confianca_media
FROM ordens_servico
WHERE defeito_grupo IS NOT NULL
GROUP BY defeito_grupo, defeito_subgrupo, defeito_subsubgrupo
ORDER BY quantidade DESC
LIMIT 15;

-- 6. Registros sem classificação
SELECT 
    COUNT(*) as registros_sem_classificacao
FROM ordens_servico
WHERE defeito_grupo IS NULL OR defeito_grupo = '';

-- 7. Análise de mecânicos
SELECT 
    mecanico_responsavel,
    COUNT(*) as total_ordens,
    COUNT(CASE WHEN defeito_grupo IS NOT NULL THEN 1 END) as ordens_com_defeito
FROM ordens_servico
WHERE mecanico_responsavel IS NOT NULL
GROUP BY mecanico_responsavel
ORDER BY total_ordens DESC
LIMIT 10;

-- 8. Verificar se há duplicatas por número de ordem
SELECT 
    numero_ordem,
    COUNT(*) as quantidade
FROM ordens_servico
WHERE numero_ordem IS NOT NULL
GROUP BY numero_ordem
HAVING COUNT(*) > 1
ORDER BY quantidade DESC
LIMIT 10; 