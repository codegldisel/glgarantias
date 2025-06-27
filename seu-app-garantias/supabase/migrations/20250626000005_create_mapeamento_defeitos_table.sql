-- Criação da tabela mapeamento_defeitos
CREATE TABLE public.mapeamento_defeitos (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  descricao_original text NOT NULL,
  grupo_id uuid REFERENCES public.grupos_defeito(id),
  subgrupo_id uuid REFERENCES public.subgrupos_defeito(id),
  subsubgrupo_id uuid REFERENCES public.subsubgrupos_defeito(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT mapeamento_defeitos_pkey PRIMARY KEY (id)
);

-- Habilitar RLS
ALTER TABLE public.mapeamento_defeitos ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Enable read access for all users" ON public.mapeamento_defeitos FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.mapeamento_defeitos FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON public.mapeamento_defeitos FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON public.mapeamento_defeitos FOR DELETE USING (auth.role() = 'authenticated');

-- Índices para performance
CREATE INDEX idx_mapeamento_defeitos_descricao_original ON public.mapeamento_defeitos(descricao_original);
CREATE INDEX idx_mapeamento_defeitos_grupo_id ON public.mapeamento_defeitos(grupo_id);
CREATE INDEX idx_mapeamento_defeitos_subgrupo_id ON public.mapeamento_defeitos(subgrupo_id);
CREATE INDEX idx_mapeamento_defeitos_subsubgrupo_id ON public.mapeamento_defeitos(subsubgrupo_id);

-- Trigger para updated_at
CREATE TRIGGER update_mapeamento_defeitos_updated_at BEFORE UPDATE ON public.mapeamento_defeitos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 