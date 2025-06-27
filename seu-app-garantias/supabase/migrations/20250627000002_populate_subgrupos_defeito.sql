-- População inicial da tabela subgrupos_defeito
-- Subcategorias de defeitos por grupo principal

-- Subgrupos do Motor
INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Bloco do Motor', 'Defeitos no bloco, pistões, bielas'
FROM grupos_defeito g WHERE g.nome = 'Motor';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Cabeçote', 'Defeitos no cabeçote, válvulas, comando'
FROM grupos_defeito g WHERE g.nome = 'Motor';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Sistema de Injeção', 'Defeitos nos bicos injetores, bomba'
FROM grupos_defeito g WHERE g.nome = 'Motor';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Turbo/Compressor', 'Defeitos no turbocompressor'
FROM grupos_defeito g WHERE g.nome = 'Motor';

-- Subgrupos da Transmissão
INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Câmbio Manual', 'Defeitos no câmbio manual'
FROM grupos_defeito g WHERE g.nome = 'Transmissão';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Câmbio Automático', 'Defeitos no câmbio automático'
FROM grupos_defeito g WHERE g.nome = 'Transmissão';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Embreagem', 'Defeitos na embreagem e componentes'
FROM grupos_defeito g WHERE g.nome = 'Transmissão';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Diferencial', 'Defeitos no diferencial'
FROM grupos_defeito g WHERE g.nome = 'Transmissão';

-- Subgrupos dos Freios
INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Pastilhas/Lonas', 'Defeitos nas pastilhas e lonas de freio'
FROM grupos_defeito g WHERE g.nome = 'Freios';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Discos/Tambores', 'Defeitos nos discos e tambores'
FROM grupos_defeito g WHERE g.nome = 'Freios';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Sistema Hidráulico', 'Defeitos no sistema hidráulico dos freios'
FROM grupos_defeito g WHERE g.nome = 'Freios';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'ABS', 'Defeitos no sistema ABS'
FROM grupos_defeito g WHERE g.nome = 'Freios';

-- Subgrupos da Suspensão
INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Amortecedores', 'Defeitos nos amortecedores'
FROM grupos_defeito g WHERE g.nome = 'Suspensão';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Molas', 'Defeitos nas molas da suspensão'
FROM grupos_defeito g WHERE g.nome = 'Suspensão';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Buchas', 'Defeitos nas buchas da suspensão'
FROM grupos_defeito g WHERE g.nome = 'Suspensão';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Braços/Bandejas', 'Defeitos nos braços e bandejas'
FROM grupos_defeito g WHERE g.nome = 'Suspensão';

-- Subgrupos da Direção
INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Caixa de Direção', 'Defeitos na caixa de direção'
FROM grupos_defeito g WHERE g.nome = 'Direção';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Bomba Hidráulica', 'Defeitos na bomba da direção hidráulica'
FROM grupos_defeito g WHERE g.nome = 'Direção';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Terminais', 'Defeitos nos terminais de direção'
FROM grupos_defeito g WHERE g.nome = 'Direção';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Coluna de Direção', 'Defeitos na coluna de direção'
FROM grupos_defeito g WHERE g.nome = 'Direção';

-- Subgrupos do Sistema Elétrico
INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Bateria', 'Defeitos na bateria'
FROM grupos_defeito g WHERE g.nome = 'Elétrico';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Alternador', 'Defeitos no alternador'
FROM grupos_defeito g WHERE g.nome = 'Elétrico';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Motor de Partida', 'Defeitos no motor de partida'
FROM grupos_defeito g WHERE g.nome = 'Elétrico';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Chicotes', 'Defeitos nos chicotes elétricos'
FROM grupos_defeito g WHERE g.nome = 'Elétrico';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Sensores', 'Defeitos nos sensores eletrônicos'
FROM grupos_defeito g WHERE g.nome = 'Elétrico';

-- Subgrupos do Ar Condicionado
INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Compressor', 'Defeitos no compressor do ar condicionado'
FROM grupos_defeito g WHERE g.nome = 'Ar Condicionado';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Condensador', 'Defeitos no condensador'
FROM grupos_defeito g WHERE g.nome = 'Ar Condicionado';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Evaporador', 'Defeitos no evaporador'
FROM grupos_defeito g WHERE g.nome = 'Ar Condicionado';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Sistema de Gás', 'Defeitos no sistema de gás refrigerante'
FROM grupos_defeito g WHERE g.nome = 'Ar Condicionado';

-- Subgrupos da Carroceria
INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Pintura', 'Defeitos na pintura'
FROM grupos_defeito g WHERE g.nome = 'Carroceria';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Chaparia', 'Defeitos na chaparia'
FROM grupos_defeito g WHERE g.nome = 'Carroceria';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Vidros', 'Defeitos nos vidros'
FROM grupos_defeito g WHERE g.nome = 'Carroceria';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Fechaduras', 'Defeitos nas fechaduras e travas'
FROM grupos_defeito g WHERE g.nome = 'Carroceria';

-- Subgrupos de Pneus e Rodas
INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Pneus', 'Defeitos nos pneus'
FROM grupos_defeito g WHERE g.nome = 'Pneus e Rodas';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Rodas', 'Defeitos nas rodas'
FROM grupos_defeito g WHERE g.nome = 'Pneus e Rodas';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Balanceamento', 'Problemas de balanceamento'
FROM grupos_defeito g WHERE g.nome = 'Pneus e Rodas';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Alinhamento', 'Problemas de alinhamento'
FROM grupos_defeito g WHERE g.nome = 'Pneus e Rodas';

-- Subgrupos do Sistema de Combustível
INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Bomba de Combustível', 'Defeitos na bomba de combustível'
FROM grupos_defeito g WHERE g.nome = 'Combustível';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Filtro de Combustível', 'Defeitos no filtro de combustível'
FROM grupos_defeito g WHERE g.nome = 'Combustível';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Tanque', 'Defeitos no tanque de combustível'
FROM grupos_defeito g WHERE g.nome = 'Combustível';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Tubulações', 'Defeitos nas tubulações de combustível'
FROM grupos_defeito g WHERE g.nome = 'Combustível';

-- Subgrupos do Sistema de Escape
INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Catalisador', 'Defeitos no catalisador'
FROM grupos_defeito g WHERE g.nome = 'Escape';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Silencioso', 'Defeitos no silencioso'
FROM grupos_defeito g WHERE g.nome = 'Escape';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Tubulação de Escape', 'Defeitos na tubulação de escape'
FROM grupos_defeito g WHERE g.nome = 'Escape';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Sonda Lambda', 'Defeitos na sonda lambda'
FROM grupos_defeito g WHERE g.nome = 'Escape';

-- Subgrupos do Sistema de Refrigeração
INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Radiador', 'Defeitos no radiador'
FROM grupos_defeito g WHERE g.nome = 'Refrigeração';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Bomba d''Água', 'Defeitos na bomba d''água'
FROM grupos_defeito g WHERE g.nome = 'Refrigeração';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Termostato', 'Defeitos no termostato'
FROM grupos_defeito g WHERE g.nome = 'Refrigeração';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Ventoinha', 'Defeitos na ventoinha do radiador'
FROM grupos_defeito g WHERE g.nome = 'Refrigeração';

-- Subgrupos do Sistema de Lubrificação
INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Bomba de Óleo', 'Defeitos na bomba de óleo'
FROM grupos_defeito g WHERE g.nome = 'Lubrificação';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Filtro de Óleo', 'Defeitos no filtro de óleo'
FROM grupos_defeito g WHERE g.nome = 'Lubrificação';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Carter', 'Defeitos no carter'
FROM grupos_defeito g WHERE g.nome = 'Lubrificação';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Válvulas de Óleo', 'Defeitos nas válvulas do sistema de óleo'
FROM grupos_defeito g WHERE g.nome = 'Lubrificação';

-- Subgrupos do Sistema de Ignição
INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Velas', 'Defeitos nas velas de ignição'
FROM grupos_defeito g WHERE g.nome = 'Ignição';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Bobinas', 'Defeitos nas bobinas de ignição'
FROM grupos_defeito g WHERE g.nome = 'Ignição';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Cabos de Vela', 'Defeitos nos cabos de vela'
FROM grupos_defeito g WHERE g.nome = 'Ignição';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Distribuidor', 'Defeitos no distribuidor'
FROM grupos_defeito g WHERE g.nome = 'Ignição';

-- Subgrupos de Outros
INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Acessórios', 'Defeitos em acessórios diversos'
FROM grupos_defeito g WHERE g.nome = 'Outros';

INSERT INTO public.subgrupos_defeito (grupo_id, nome, descricao) 
SELECT g.id, 'Não Identificado', 'Defeitos não identificados ou categorizados'
FROM grupos_defeito g WHERE g.nome = 'Outros';

