-- Schema para o banco de dados Supabase
-- Projeto: Análise de Garantias de Motores

-- Tabela principal de ordens de serviço
CREATE TABLE ordens_servico (
    id BIGSERIAL PRIMARY KEY,
    numero_ordem VARCHAR(50) UNIQUE,
    data_ordem DATE,
    status VARCHAR(50), -- 'Garantia', 'Garantia de Oficina', 'Garantia de Usinagem'
    defeito_texto_bruto TEXT,
    mecanico_responsavel VARCHAR(255),
    modelo_motor VARCHAR(255),
    fabricante_motor VARCHAR(255),
    dia_servico INTEGER,
    mes_servico INTEGER,
    ano_servico INTEGER,
    total_pecas DECIMAL(10,2),
    total_servico DECIMAL(10,2),
    total_geral DECIMAL(10,2),
    
    -- Campos de classificação de defeitos (PLN)
    defeito_grupo VARCHAR(100),
    defeito_subgrupo VARCHAR(100),
    defeito_subsubgrupo VARCHAR(100),
    classificacao_confianca DECIMAL(3,2), -- 0.00 a 1.00
    
    -- Campos de auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices para otimização
    CONSTRAINT valid_confianca CHECK (classificacao_confianca >= 0 AND classificacao_confianca <= 1)
);

-- Tabela de mecânicos (para normalização e controle)
CREATE TABLE mecanicos (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) UNIQUE NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de motores (para normalização)
CREATE TABLE motores (
    id BIGSERIAL PRIMARY KEY,
    fabricante VARCHAR(255) NOT NULL,
    modelo VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(fabricante, modelo)
);

-- Tabela de classificação de defeitos (para manter histórico e permitir ajustes)
CREATE TABLE classificacao_defeitos (
    id BIGSERIAL PRIMARY KEY,
    grupo VARCHAR(100) NOT NULL,
    subgrupo VARCHAR(100) NOT NULL,
    subsubgrupo VARCHAR(100) NOT NULL,
    palavras_chave TEXT[], -- Array de palavras-chave
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(grupo, subgrupo, subsubgrupo)
);

-- Tabela de uploads (para rastrear processamentos)
CREATE TABLE uploads (
    id BIGSERIAL PRIMARY KEY,
    nome_arquivo VARCHAR(255) NOT NULL,
    tamanho_arquivo BIGINT,
    status VARCHAR(50) DEFAULT 'processando', -- 'processando', 'concluido', 'erro'
    total_registros INTEGER,
    registros_processados INTEGER,
    registros_com_erro INTEGER,
    mensagem_erro TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Índices para otimização de consultas
CREATE INDEX idx_ordens_servico_data_ordem ON ordens_servico(data_ordem);
CREATE INDEX idx_ordens_servico_status ON ordens_servico(status);
CREATE INDEX idx_ordens_servico_mecanico ON ordens_servico(mecanico_responsavel);
CREATE INDEX idx_ordens_servico_fabricante ON ordens_servico(fabricante_motor);
CREATE INDEX idx_ordens_servico_defeito_grupo ON ordens_servico(defeito_grupo);
CREATE INDEX idx_ordens_servico_ano_mes ON ordens_servico(ano_servico, mes_servico);
CREATE INDEX idx_ordens_servico_numero_ordem ON ordens_servico(numero_ordem);

-- Índice para busca de texto no defeito
CREATE INDEX idx_ordens_servico_defeito_texto ON ordens_servico USING gin(to_tsvector('portuguese', defeito_texto_bruto));

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_ordens_servico_updated_at BEFORE UPDATE ON ordens_servico FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mecanicos_updated_at BEFORE UPDATE ON mecanicos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Views para análises comuns
CREATE VIEW view_analise_mensal AS
SELECT 
    ano_servico,
    mes_servico,
    COUNT(*) as total_ordens,
    COUNT(DISTINCT mecanico_responsavel) as total_mecanicos,
    COUNT(DISTINCT fabricante_motor) as total_fabricantes,
    SUM(total_pecas) as soma_total_pecas,
    SUM(total_servico) as soma_total_servico,
    SUM(total_geral) as soma_total_geral,
    AVG(total_geral) as media_total_geral
FROM ordens_servico
WHERE ano_servico IS NOT NULL AND mes_servico IS NOT NULL
GROUP BY ano_servico, mes_servico
ORDER BY ano_servico DESC, mes_servico DESC;

CREATE VIEW view_defeitos_por_grupo AS
SELECT 
    defeito_grupo,
    defeito_subgrupo,
    defeito_subsubgrupo,
    COUNT(*) as quantidade,
    AVG(classificacao_confianca) as confianca_media,
    SUM(total_geral) as valor_total
FROM ordens_servico
WHERE defeito_grupo IS NOT NULL
GROUP BY defeito_grupo, defeito_subgrupo, defeito_subsubgrupo
ORDER BY quantidade DESC;

CREATE VIEW view_performance_mecanicos AS
SELECT 
    mecanico_responsavel,
    COUNT(*) as total_ordens,
    COUNT(CASE WHEN defeito_grupo != 'Não Classificado' THEN 1 END) as ordens_com_defeito,
    SUM(total_geral) as valor_total_servicos,
    AVG(total_geral) as valor_medio_servico
FROM ordens_servico
WHERE mecanico_responsavel IS NOT NULL
GROUP BY mecanico_responsavel
ORDER BY total_ordens DESC;

-- Inserir dados iniciais de classificação de defeitos
INSERT INTO classificacao_defeitos (grupo, subgrupo, subsubgrupo, palavras_chave) VALUES
('Vazamentos', 'Vazamento de Fluido', 'Óleo', ARRAY['vazamento', 'vazando', 'vaza', 'oleo', 'óleo', 'lubrificante']),
('Vazamentos', 'Vazamento de Fluido', 'Água', ARRAY['vazamento', 'vazando', 'vaza', 'agua', 'água', 'radiador', 'arrefecimento']),
('Vazamentos', 'Vazamento de Fluido', 'Combustível', ARRAY['vazamento', 'vazando', 'vaza', 'combustivel', 'combustível', 'diesel', 'gasolina']),
('Problemas de Funcionamento/Desempenho', 'Superaquecimento', 'Geral', ARRAY['aqueceu', 'aquecendo', 'superaquecimento', 'esquentou', 'temperatura']),
('Problemas de Funcionamento/Desempenho', 'Perda de Potência/Falha', 'Geral', ARRAY['perdeu', 'perda', 'potencia', 'potência', 'força', 'forca', 'falha']),
('Problemas de Funcionamento/Desempenho', 'Alto Consumo', 'Consumo de Óleo', ARRAY['consumo', 'consumindo', 'gastando', 'gasta', 'oleo', 'óleo']),
('Ruídos e Vibrações', 'Ruído Interno', 'Mancal', ARRAY['ruido', 'ruído', 'barulho', 'batendo', 'mancal', 'casquilho']),
('Ruídos e Vibrações', 'Ruído Interno', 'Biela', ARRAY['ruido', 'ruído', 'barulho', 'batendo', 'biela']),
('Quebra/Dano Estrutural', 'Quebra/Fratura', 'Geral', ARRAY['quebrou', 'quebrada', 'quebrado', 'trincou', 'trinca', 'rachado', 'danificado', 'estourou']),
('Problemas de Combustão/Exaustão', 'Fumaça Excessiva', 'No Respiro', ARRAY['fumaca', 'fumaça', 'sopra', 'soprando', 'respiro', 'suspiro']),
('Desgaste e Folga', 'Desgaste de Componentes', 'Geral', ARRAY['desgaste', 'desgastou', 'gastou', 'folga', 'folgas']),
('Problemas de Lubrificação', 'Baixa Pressão de Óleo', 'Geral', ARRAY['baixa pressao', 'baixa pressão', 'pressao baixa', 'pressão baixa']),
('Erros de Montagem/Instalação', 'Montagem Incorreta', 'Geral', ARRAY['montagem', 'instalacao', 'instalação', 'erro', 'errado', 'incorreto']),
('Erros de Montagem/Instalação', 'Componente Incompatível/Errado', 'Filtro', ARRAY['filtro', 'errado', 'incorreto']),
('Erros de Montagem/Instalação', 'Componente Incompatível/Errado', 'Pistão', ARRAY['pistao', 'pistão', 'errado', 'incorreto']);

-- Política de segurança (RLS) - pode ser ajustada conforme necessário
ALTER TABLE ordens_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE mecanicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE motores ENABLE ROW LEVEL SECURITY;
ALTER TABLE classificacao_defeitos ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (permitir tudo por enquanto - ajustar conforme autenticação)
CREATE POLICY "Permitir tudo para ordens_servico" ON ordens_servico FOR ALL USING (true);
CREATE POLICY "Permitir tudo para mecanicos" ON mecanicos FOR ALL USING (true);
CREATE POLICY "Permitir tudo para motores" ON motores FOR ALL USING (true);
CREATE POLICY "Permitir tudo para classificacao_defeitos" ON classificacao_defeitos FOR ALL USING (true);
CREATE POLICY "Permitir tudo para uploads" ON uploads FOR ALL USING (true);

