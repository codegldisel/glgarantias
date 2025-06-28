-- Migração para corrigir problemas de schema cache na tabela temp_import_access
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a tabela existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'temp_import_access'
) as table_exists;

-- 2. Verificar estrutura atual da tabela
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'temp_import_access'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Adicionar coluna data_os se não existir
ALTER TABLE temp_import_access 
ADD COLUMN IF NOT EXISTS data_os DATE;

-- 4. Verificar se todas as colunas necessárias existem
DO $$
BEGIN
  -- Verificar se a coluna data_os existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'temp_import_access' 
    AND column_name = 'data_os'
    AND table_schema = 'public'
  ) THEN
    RAISE EXCEPTION 'Coluna data_os não encontrada na tabela temp_import_access';
  END IF;
  
  -- Verificar outras colunas essenciais
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'temp_import_access' 
    AND column_name = 'numero_os'
    AND table_schema = 'public'
  ) THEN
    RAISE EXCEPTION 'Coluna numero_os não encontrada na tabela temp_import_access';
  END IF;
  
  RAISE NOTICE 'Todas as colunas necessárias estão presentes na tabela temp_import_access';
END $$;

-- 5. Recarregar o schema cache do PostgREST
NOTIFY pgrst, 'reload schema';

-- 6. Verificar estrutura final
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'temp_import_access'
AND table_schema = 'public'
ORDER BY ordinal_position; 