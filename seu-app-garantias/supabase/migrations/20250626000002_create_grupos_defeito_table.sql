-- Criação da tabela grupos_defeito
CREATE TABLE public.grupos_defeito (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  nome varchar(100) NOT NULL,
  descricao text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT grupos_defeito_pkey PRIMARY KEY (id)
);

-- Habilitar RLS
ALTER TABLE public.grupos_defeito ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Enable read access for all users" ON public.grupos_defeito FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.grupos_defeito FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON public.grupos_defeito FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON public.grupos_defeito FOR DELETE USING (auth.role() = 'authenticated');

-- Índices para performance
CREATE INDEX idx_grupos_defeito_nome ON public.grupos_defeito(nome);

-- Trigger para updated_at
CREATE TRIGGER update_grupos_defeito_updated_at BEFORE UPDATE ON public.grupos_defeito FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 