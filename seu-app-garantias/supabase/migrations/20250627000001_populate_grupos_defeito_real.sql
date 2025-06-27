-- População inicial da tabela grupos_defeito
-- Baseado na análise dos defeitos reais do Excel (6.012 OSs de garantia)

INSERT INTO public.grupos_defeito (nome, descricao) VALUES
('Vazamentos', 'Vazamentos de fluidos em geral (1.849 ocorrências - 30% dos casos)'),
('Problemas de Óleo', 'Defeitos relacionados ao sistema de lubrificação (1.135 ocorrências)'),
('Problemas de Água/Refrigeração', 'Defeitos no sistema de arrefecimento (520 ocorrências)'),
('Quebras/Rupturas', 'Componentes quebrados ou rompidos (272 ocorrências)'),
('Consumo Excessivo', 'Consumo anormal de fluidos (229 ocorrências)'),
('Superaquecimento', 'Motor esquentando ou temperatura alta (161 ocorrências)'),
('Ruídos/Barulhos', 'Ruídos anormais no motor (135+ ocorrências)'),
('Falhas de Funcionamento', 'Motor não pega, sem força, falhando'),
('Problemas de Pressão', 'Pressão de óleo, ar ou outros fluidos'),
('Problemas Elétricos', 'Defeitos no sistema elétrico'),
('Outros', 'Defeitos que não se enquadram nas categorias principais')
ON CONFLICT (nome) DO NOTHING;

