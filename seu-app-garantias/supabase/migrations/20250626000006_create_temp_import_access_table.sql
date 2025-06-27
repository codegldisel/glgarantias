-- Criação da tabela temp_import_access (tabela temporária para importação)
CREATE TABLE public.temp_import_access (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  data_os date,
  numero_os varchar(50),
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
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT temp_import_access_pkey PRIMARY KEY (id)
);

-- Habilitar RLS
ALTER TABLE public.temp_import_access ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Enable read access for all users" ON public.temp_import_access FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.temp_import_access FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON public.temp_import_access FOR DELETE USING (auth.role() = 'authenticated');

-- Índices para performance
CREATE INDEX idx_temp_import_access_data_os ON public.temp_import_access(data_os);
CREATE INDEX idx_temp_import_access_numero_os ON public.temp_import_access(numero_os);
CREATE INDEX idx_temp_import_access_created_at ON public.temp_import_access(created_at);

-- Comentário sobre a tabela
COMMENT ON TABLE public.temp_import_access IS 'Tabela temporária para armazenar dados importados do Excel antes do processamento'; 