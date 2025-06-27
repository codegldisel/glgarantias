-- População inicial da tabela grupos_defeito
-- Categorias principais de defeitos automotivos/industriais

INSERT INTO public.grupos_defeito (nome, descricao) VALUES
('Motor', 'Defeitos relacionados ao motor e sistema de combustão'),
('Transmissão', 'Defeitos no sistema de transmissão e câmbio'),
('Freios', 'Defeitos no sistema de freios e componentes relacionados'),
('Suspensão', 'Defeitos na suspensão, amortecedores e componentes'),
('Direção', 'Defeitos no sistema de direção e componentes'),
('Elétrico', 'Defeitos no sistema elétrico e eletrônico'),
('Ar Condicionado', 'Defeitos no sistema de climatização'),
('Carroceria', 'Defeitos na carroceria, pintura e estrutura'),
('Pneus e Rodas', 'Defeitos em pneus, rodas e componentes relacionados'),
('Combustível', 'Defeitos no sistema de combustível e injeção'),
('Escape', 'Defeitos no sistema de escape e emissões'),
('Refrigeração', 'Defeitos no sistema de arrefecimento do motor'),
('Lubrificação', 'Defeitos no sistema de lubrificação'),
('Ignição', 'Defeitos no sistema de ignição'),
('Outros', 'Defeitos que não se enquadram nas categorias principais')
ON CONFLICT (nome) DO NOTHING;

