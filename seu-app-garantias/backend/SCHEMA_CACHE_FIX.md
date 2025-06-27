# Resolução do Erro de Schema Cache do Supabase

## Problema Identificado
O erro "Could not find the 'data_os' column of 'temp_import_access' in the schema cache" indica que o cache do PostgREST não está sincronizado com a estrutura atual do banco de dados.

## Soluções Imediatas

### 1. Recarregar o Schema Cache via Dashboard
1. Acesse seu projeto no [Dashboard do Supabase](https://supabase.com/dashboard)
2. Vá para **Settings** → **API**
3. Role até a seção **PostgREST**
4. Clique em **Restart PostgREST** ou **Reload Schema Cache**

### 2. Executar Script SQL de Correção
Execute o script `20250627000001_fix_temp_import_access_schema.sql` no SQL Editor do Supabase:

```sql
-- Verificar estrutura atual
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'temp_import_access' 
AND table_schema = 'public';

-- Adicionar coluna se não existir
ALTER TABLE temp_import_access 
ADD COLUMN IF NOT EXISTS data_os DATE;

-- Recarregar cache
NOTIFY pgrst, 'reload schema';
```

### 3. Verificar via SQL
Execute estas queries para diagnosticar:

```sql
-- Verificar se a tabela existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'temp_import_access'
);

-- Ver estrutura completa
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
```

## Código Atualizado

O backend foi atualizado com:
- Função `executeWithCacheRetry()` para tentar novamente em caso de erro de cache
- Tratamento específico para erros de schema cache
- Retry automático com delay de 1 segundo

## Estrutura Esperada da Tabela

A tabela `temp_import_access` deve ter estas colunas:

```sql
CREATE TABLE temp_import_access (
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
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
```

## Passos para Resolver

1. **Execute o script SQL** no Supabase Dashboard
2. **Recarregue o schema cache** via dashboard
3. **Reinicie o backend** para aplicar as mudanças de código
4. **Teste o upload** novamente

## Se o Problema Persistir

Se após executar os passos acima o erro continuar:

1. **Recrie a tabela**:
```sql
-- Backup (se necessário)
CREATE TABLE temp_import_access_backup AS 
SELECT * FROM temp_import_access;

-- Recriar tabela
DROP TABLE IF EXISTS temp_import_access;
-- Execute a migração original: 20250626000006_create_temp_import_access_table.sql
```

2. **Verifique as políticas RLS**:
```sql
-- Verificar políticas
SELECT * FROM pg_policies WHERE tablename = 'temp_import_access';
```

3. **Contate o suporte** se necessário.

## Logs de Debug

O backend agora inclui logs detalhados para identificar problemas:
- Tentativas de retry
- Erros específicos de cache
- Status de cada operação

Verifique os logs do backend para mais detalhes sobre o erro. 