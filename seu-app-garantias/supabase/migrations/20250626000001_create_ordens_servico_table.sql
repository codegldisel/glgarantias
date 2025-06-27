-- Criação da tabela ordens_servico
CREATE TABLE public.ordens_servico (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  data_os date,
  numero_os varchar(50) UNIQUE NOT NULL,
  fabricante varchar(100),
  motor varchar(100),
  modelo varchar(100),
  observacoes text,
  defeito text,
  mecanico_montador varchar(100),
  cliente varchar(100),
  total_pecas decimal(10,2) DEFAULT 0,
  total_servicos decimal(10,2) DEFAULT 0,
  total_geral decimal(10,2) DEFAULT 0,
  tipo_os varchar(10),
  grupo_defeito_id uuid REFERENCES public.grupos_defeito(id),
  subgrupo_defeito_id uuid REFERENCES public.subgrupos_defeito(id),
  subsubgrupo_defeito_id uuid REFERENCES public.subsubgrupos_defeito(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT ordens_servico_pkey PRIMARY KEY (id)
);

-- Habilitar RLS
ALTER TABLE public.ordens_servico ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Enable read access for all users" ON public.ordens_servico FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.ordens_servico FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON public.ordens_servico FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON public.ordens_servico FOR DELETE USING (auth.role() = 'authenticated');

-- Índices para performance
CREATE INDEX idx_ordens_servico_data_os ON public.ordens_servico(data_os);
CREATE INDEX idx_ordens_servico_numero_os ON public.ordens_servico(numero_os);
CREATE INDEX idx_ordens_servico_cliente ON public.ordens_servico(cliente);
CREATE INDEX idx_ordens_servico_mecanico_montador ON public.ordens_servico(mecanico_montador);
CREATE INDEX idx_ordens_servico_grupo_defeito_id ON public.ordens_servico(grupo_defeito_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ordens_servico_updated_at BEFORE UPDATE ON public.ordens_servico FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 