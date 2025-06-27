-- População inicial da tabela subgrupos_defeito
-- Baseado nos padrões reais identificados nos dados

-- Subgrupos de Vazamentos (Grupo mais frequente - 1.849 ocorrências)
INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Vazamento no Carter', 'Vazamentos no cárter do motor (36 ocorrências diretas)'
FROM grupos_defeito g WHERE g.nome = 'Vazamentos';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Vazamento na Tampa de Válvula', 'Vazamentos na tampa de válvulas (26 ocorrências)'
FROM grupos_defeito g WHERE g.nome = 'Vazamentos';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Vazamento na Distribuição', 'Vazamentos no sistema de distribuição (24 ocorrências)'
FROM grupos_defeito g WHERE g.nome = 'Vazamentos';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Vazamento na Polia', 'Vazamentos na região da polia (22 ocorrências)'
FROM grupos_defeito g WHERE g.nome = 'Vazamentos';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Vazamento de Retentor', 'Vazamentos em retentores (traseiro/dianteiro)'
FROM grupos_defeito g WHERE g.nome = 'Vazamentos';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Vazamento na Bomba d''Água', 'Vazamentos na bomba d''água (10 ocorrências)'
FROM grupos_defeito g WHERE g.nome = 'Vazamentos';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Vazamento no Radiador de Óleo', 'Vazamentos no radiador de óleo (10 ocorrências)'
FROM grupos_defeito g WHERE g.nome = 'Vazamentos';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Vazamento no Cabeçote', 'Vazamentos no cabeçote (9 ocorrências)'
FROM grupos_defeito g WHERE g.nome = 'Vazamentos';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Outros Vazamentos', 'Vazamentos gerais não especificados'
FROM grupos_defeito g WHERE g.nome = 'Vazamentos';

-- Subgrupos de Problemas de Óleo
INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Consumo de Óleo', 'Consumo excessivo de óleo (83 ocorrências diretas)'
FROM grupos_defeito g WHERE g.nome = 'Problemas de Óleo';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Baixa Pressão de Óleo', 'Problemas de pressão de óleo (22 ocorrências)'
FROM grupos_defeito g WHERE g.nome = 'Problemas de Óleo';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Óleo no Respiro', 'Óleo saindo pelo respiro (9 ocorrências)'
FROM grupos_defeito g WHERE g.nome = 'Problemas de Óleo';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Mistura Água no Óleo', 'Água misturada no óleo (17 ocorrências)'
FROM grupos_defeito g WHERE g.nome = 'Problemas de Óleo';

-- Subgrupos de Problemas de Água/Refrigeração
INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Vazamento de Água', 'Vazamentos de água do sistema (29 ocorrências)'
FROM grupos_defeito g WHERE g.nome = 'Problemas de Água/Refrigeração';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Sumindo Água', 'Perda de água sem vazamento aparente (14 ocorrências)'
FROM grupos_defeito g WHERE g.nome = 'Problemas de Água/Refrigeração';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Junta do Cabeçote', 'Problemas na junta do cabeçote (19 ocorrências)'
FROM grupos_defeito g WHERE g.nome = 'Problemas de Água/Refrigeração';

-- Subgrupos de Quebras/Rupturas
INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Motor Travou', 'Motor travado/gripado (11 ocorrências)'
FROM grupos_defeito g WHERE g.nome = 'Quebras/Rupturas';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Componentes Quebrados', 'Peças quebradas em geral'
FROM grupos_defeito g WHERE g.nome = 'Quebras/Rupturas';

-- Subgrupos de Superaquecimento
INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Motor Esquentando', 'Motor com temperatura alta (47 ocorrências diretas)'
FROM grupos_defeito g WHERE g.nome = 'Superaquecimento';

-- Subgrupos de Ruídos/Barulhos
INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Barulho no Motor', 'Ruídos anormais no motor (135 ocorrências)'
FROM grupos_defeito g WHERE g.nome = 'Ruídos/Barulhos';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Motor Batendo', 'Motor fazendo ruído de batida'
FROM grupos_defeito g WHERE g.nome = 'Ruídos/Barulhos';

-- Subgrupos de Falhas de Funcionamento
INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Não Pega', 'Motor não liga/pega (28 ocorrências)'
FROM grupos_defeito g WHERE g.nome = 'Falhas de Funcionamento';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Sem Força', 'Motor sem potência (13 ocorrências)'
FROM grupos_defeito g WHERE g.nome = 'Falhas de Funcionamento';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Falhando', 'Motor falhando (13 ocorrências)'
FROM grupos_defeito g WHERE g.nome = 'Falhas de Funcionamento';

-- Subgrupos de Problemas de Pressão
INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Pressão de Óleo', 'Problemas de pressão de óleo (11 ocorrências)'
FROM grupos_defeito g WHERE g.nome = 'Problemas de Pressão';

-- Subgrupos de Outros
INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Revisão', 'Serviços de revisão (8 ocorrências)'
FROM grupos_defeito g WHERE g.nome = 'Outros';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Não Especificado', 'Defeitos não categorizados'
FROM grupos_defeito g WHERE g.nome = 'Outros';

