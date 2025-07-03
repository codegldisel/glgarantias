-- Script de Constraints e Validações no Supabase
-- Execute este script para adicionar validações no nível do banco

-- 1. Adicionar constraints para validar dados
ALTER TABLE ordens_servico 
ADD CONSTRAINT check_status_valido 
CHECK (status IN ('Garantia', 'Garantia de Oficina', 'Garantia de Usinagem'));

ALTER TABLE ordens_servico 
ADD CONSTRAINT check_mes_valido 
CHECK (mes_servico IS NULL OR (mes_servico >= 1 AND mes_servico <= 12));

ALTER TABLE ordens_servico 
ADD CONSTRAINT check_ano_valido 
CHECK (ano_servico IS NULL OR (ano_servico >= 2000 AND ano_servico <= 2030));

ALTER TABLE ordens_servico 
ADD CONSTRAINT check_dia_valido 
CHECK (dia_servico IS NULL OR (dia_servico >= 1 AND dia_servico <= 31));

ALTER TABLE ordens_servico 
ADD CONSTRAINT check_confianca_valida 
CHECK (classificacao_confianca IS NULL OR (classificacao_confianca >= 0 AND classificacao_confianca <= 1));

ALTER TABLE ordens_servico 
ADD CONSTRAINT check_valores_positivos 
CHECK (
    (total_pecas IS NULL OR total_pecas >= 0) AND
    (total_servico IS NULL OR total_servico >= 0) AND
    (total_geral IS NULL OR total_geral >= 0)
);

-- 2. Criar função para validar data_ordem
CREATE OR REPLACE FUNCTION validate_data_ordem()
RETURNS TRIGGER AS $$
BEGIN
    -- Se data_ordem for fornecida, extrair mês e ano automaticamente
    IF NEW.data_ordem IS NOT NULL THEN
        NEW.mes_servico := EXTRACT(MONTH FROM NEW.data_ordem);
        NEW.ano_servico := EXTRACT(YEAR FROM NEW.data_ordem);
    END IF;
    
    -- Validar se a data é razoável
    IF NEW.data_ordem IS NOT NULL AND (NEW.data_ordem < '2000-01-01' OR NEW.data_ordem > '2030-12-31') THEN
        RAISE EXCEPTION 'Data da ordem deve estar entre 2000 e 2030';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Criar trigger para validar data_ordem
DROP TRIGGER IF EXISTS trigger_validate_data_ordem ON ordens_servico;
CREATE TRIGGER trigger_validate_data_ordem
    BEFORE INSERT OR UPDATE ON ordens_servico
    FOR EACH ROW
    EXECUTE FUNCTION validate_data_ordem();

-- 4. Criar função para classificar defeitos automaticamente
CREATE OR REPLACE FUNCTION classify_defect_auto()
RETURNS TRIGGER AS $$
BEGIN
    -- Se não há classificação e há texto de defeito, marcar como não classificado
    IF (NEW.defeito_grupo IS NULL OR NEW.defeito_grupo = '') AND NEW.defeito_texto_bruto IS NOT NULL THEN
        NEW.defeito_grupo := 'Não Classificado';
        NEW.defeito_subgrupo := 'Não Classificado';
        NEW.defeito_subsubgrupo := 'Não Classificado';
        NEW.classificacao_confianca := 0.0;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Criar trigger para classificação automática
DROP TRIGGER IF EXISTS trigger_classify_defect_auto ON ordens_servico;
CREATE TRIGGER trigger_classify_defect_auto
    BEFORE INSERT OR UPDATE ON ordens_servico
    FOR EACH ROW
    EXECUTE FUNCTION classify_defect_auto();

-- 6. Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_ordens_servico_data_completa 
ON ordens_servico(data_ordem, mes_servico, ano_servico);

CREATE INDEX IF NOT EXISTS idx_ordens_servico_status_data 
ON ordens_servico(status, data_ordem);

CREATE INDEX IF NOT EXISTS idx_ordens_servico_defeito_status 
ON ordens_servico(defeito_grupo, status);

-- 7. Criar view para dados limpos
CREATE OR REPLACE VIEW view_ordens_limpas AS
SELECT 
    id,
    numero_ordem,
    data_ordem,
    status,
    defeito_texto_bruto,
    defeito_grupo,
    defeito_subgrupo,
    defeito_subsubgrupo,
    classificacao_confianca,
    mecanico_responsavel,
    modelo_motor,
    fabricante_motor,
    dia_servico,
    mes_servico,
    ano_servico,
    total_pecas,
    total_servico,
    total_geral,
    created_at,
    updated_at
FROM ordens_servico
WHERE 
    data_ordem IS NOT NULL 
    AND mes_servico IS NOT NULL 
    AND ano_servico IS NOT NULL
    AND status IS NOT NULL;

-- 8. Criar função para estatísticas rápidas
CREATE OR REPLACE FUNCTION get_stats_rapidas()
RETURNS TABLE (
    total_registros BIGINT,
    registros_com_data BIGINT,
    registros_com_defeito BIGINT,
    registros_sem_defeito BIGINT,
    ultima_atualizacao TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_registros,
        COUNT(CASE WHEN data_ordem IS NOT NULL THEN 1 END)::BIGINT as registros_com_data,
        COUNT(CASE WHEN defeito_grupo IS NOT NULL AND defeito_grupo != 'Não Classificado' THEN 1 END)::BIGINT as registros_com_defeito,
        COUNT(CASE WHEN defeito_grupo IS NULL OR defeito_grupo = 'Não Classificado' THEN 1 END)::BIGINT as registros_sem_defeito,
        MAX(updated_at) as ultima_atualizacao
    FROM ordens_servico;
END;
$$ LANGUAGE plpgsql;

-- 9. Verificar se as constraints foram aplicadas
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'ordens_servico'::regclass
ORDER BY conname; 