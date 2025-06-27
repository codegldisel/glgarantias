-- Criação da tabela subsubgrupos_defeito
CREATE TABLE public.subsubgrupos_defeito (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  nome varchar(100) NOT NULL,
  descricao text,
  subgrupo_id uuid REFERENCES public.subgrupos_defeito(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT subsubgrupos_defeito_pkey PRIMARY KEY (id)
);

-- Habilitar RLS
ALTER TABLE public.subsubgrupos_defeito ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Enable read access for all users" ON public.subsubgrupos_defeito FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.subsubgrupos_defeito FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON public.subsubgrupos_defeito FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON public.subsubgrupos_defeito FOR DELETE USING (auth.role() = 'authenticated');

-- Índices para performance
CREATE INDEX idx_subsubgrupos_defeito_nome ON public.subsubgrupos_defeito(nome);
CREATE INDEX idx_subsubgrupos_defeito_subgrupo_id ON public.subsubgrupos_defeito(subgrupo_id);

-- Trigger para updated_at
CREATE TRIGGER update_subsubgrupos_defeito_updated_at BEFORE UPDATE ON public.subsubgrupos_defeito FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 