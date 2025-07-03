-- Script para Aplicar Constraints de Validação no Supabase
-- Execute este script no SQL Editor do Supabase

-- 1. Aplicar constraint de status válido
ALTER TABLE ordens_servico 
ADD CONSTRAINT check_status_valido 
CHECK (status IN ('Garantia', 'Garantia de Oficina', 'Garantia de Usinagem'));

-- 2. Aplicar constraint de mês válido
ALTER TABLE ordens_servico 
ADD CONSTRAINT check_mes_valido 
CHECK (mes_servico IS NULL OR (mes_servico >= 1 AND mes_servico <= 12));

-- 3. Aplicar constraint de ano válido
ALTER TABLE ordens_servico 
ADD CONSTRAINT check_ano_valido 
CHECK (ano_servico IS NULL OR (ano_servico >= 2000 AND ano_servico <= 2030));

-- 4. Aplicar constraint de dia válido
ALTER TABLE ordens_servico 
ADD CONSTRAINT check_dia_valido 
CHECK (dia_servico IS NULL OR (dia_servico >= 1 AND dia_servico <= 31));

-- 5. Aplicar constraint de confiança válida
ALTER TABLE ordens_servico 
ADD CONSTRAINT check_confianca_valida 
CHECK (classificacao_confianca IS NULL OR (classificacao_confianca >= 0 AND classificacao_confianca <= 1));

-- 6. Aplicar constraint de valores positivos
ALTER TABLE ordens_servico 
ADD CONSTRAINT check_valores_positivos 
CHECK (
    (total_pecas IS NULL OR total_pecas >= 0) AND
    (total_servico IS NULL OR total_servico >= 0) AND
    (total_geral IS NULL OR total_geral >= 0)
);

-- 7. Verificar se as constraints foram aplicadas
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'ordens_servico'::regclass
ORDER BY conname;

-- 8. Testar se as constraints estão funcionando
-- (Execute estas queries para testar - devem falhar se as constraints estão ativas)

-- Teste 1: Tentar inserir status inválido (deve falhar)
-- INSERT INTO ordens_servico (numero_ordem, status) VALUES ('TESTE123', 'Status Inválido');

-- Teste 2: Tentar inserir mês inválido (deve falhar)
-- INSERT INTO ordens_servico (numero_ordem, mes_servico) VALUES ('TESTE456', 13);

-- Teste 3: Tentar inserir ano inválido (deve falhar)
-- INSERT INTO ordens_servico (numero_ordem, ano_servico) VALUES ('TESTE789', 1999);

-- Teste 4: Tentar inserir valor negativo (deve falhar)
-- INSERT INTO ordens_servico (numero_ordem, total_geral) VALUES ('TESTE101', -100);

-- 9. Estatísticas finais
SELECT 
    'Constraints aplicadas com sucesso!' as status,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN status IN ('Garantia', 'Garantia de Oficina', 'Garantia de Usinagem') THEN 1 END) as registros_status_valido,
    COUNT(CASE WHEN mes_servico BETWEEN 1 AND 12 THEN 1 END) as registros_mes_valido,
    COUNT(CASE WHEN ano_servico BETWEEN 2000 AND 2030 THEN 1 END) as registros_ano_valido
FROM ordens_servico; 