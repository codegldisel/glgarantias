CREATE TABLE public.defeitos_nao_mapeados (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  descricao text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT defeitos_nao_mapeados_pkey PRIMARY KEY (id)
);

ALTER TABLE public.defeitos_nao_mapeados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.defeitos_nao_mapeados FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.defeitos_nao_mapeados FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON public.defeitos_nao_mapeados FOR UPDATE USING (auth.role() = 'authenticated');


