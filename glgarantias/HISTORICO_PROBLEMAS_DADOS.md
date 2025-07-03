# Histórico e Diagnóstico dos Problemas de Dados, Backend e Banco de Dados

## Contexto Geral

Durante o desenvolvimento do dashboard e das análises do sistema, foram identificados diversos problemas relacionados à **qualidade, consistência e estrutura dos dados** no banco Supabase, bem como limitações e gambiarras temporárias no backend para contornar essas questões. Este documento serve como histórico, diagnóstico e guia para a futura reestruturação do backend e do banco de dados, visando garantir dados confiáveis para todas as áreas do app.

---

## Principais Problemas Identificados

### 1. **Campos de Data e Classificação Inconsistentes**
- Muitos registros na tabela `ordens_servico` estavam com os campos `mes_servico` e `ano_servico` **nulos** ou **incorretos**.
- O campo `data_ordem` estava presente, mas nem sempre era utilizado para preencher corretamente os campos de mês/ano.
- Isso impedia filtros corretos por mês/ano em consultas e dashboards.

### 2. **Status de Garantia Inconsistente**
- O campo `status` apresenta valores variados: abreviações ("G", "GO", "GU"), nomes completos ("Garantia", "Garantia de Oficina", "Garantia de Usinagem"), e até valores nulos ou irrelevantes.
- Isso dificulta filtros e análises por tipo de garantia.

### 3. **Limite de Registros nas Consultas**
- O Supabase, por padrão, limita a busca a 1.000 registros, o que faz com que filtros no backend sejam aplicados apenas sobre um subconjunto dos dados.
- Isso mascara problemas e pode gerar resultados errados em dashboards e relatórios.

### 4. **Scripts de Correção: Solução Temporária**
- Foram criados scripts para preencher `mes_servico` e `ano_servico` a partir de `data_ordem` para registros antigos.
- Esses scripts são "quebra-galhos" e não garantem que novos dados sejam inseridos corretamente.

### 5. **Backend com Lógica de Filtro Frágil**
- O backend tenta filtrar por `mes_servico`/`ano_servico` e, se não existir, extrai de `data_ordem`.
- Isso é frágil e pode gerar inconsistências, além de ser ineficiente para grandes volumes de dados.

### 6. **Dependência de Dados Corretos para Outras Áreas**
- Outras áreas do app (relatórios, análises, gráficos, exportações) dependem de dados limpos e bem classificados.
- O "quebra-galho" atual só resolve parcialmente para o dashboard, mas não para o sistema como um todo.

---

## Causas Raiz
- **Importação de dados sem validação**: uploads de planilhas não garantem preenchimento correto dos campos essenciais.
- **Ausência de normalização e validação no backend**: dados são salvos "como vieram" do Excel, sem padronização.
- **Falta de constraints e triggers no banco**: não há garantias de integridade para datas, status, etc.
- **Limitações do Supabase (limite de fetch)**: consultas grandes não retornam todos os dados.

---

## Soluções Temporárias Adotadas
- Scripts para preencher campos nulos de mês/ano a partir de data_ordem.
- Filtros no frontend para aceitar múltiplos valores de status.
- Filtros no backend tentando extrair mês/ano de diferentes campos.
- Aumento do limite de fetch para 10.000 registros (ainda insuficiente para bases muito grandes).

---

## Recomendações para Reestruturação Definitiva

### 1. **Reestruturar o Backend**
- Centralizar toda a lógica de validação e normalização de dados no backend.
- Ao importar dados do Excel, garantir que todos os campos essenciais estejam preenchidos e padronizados.
- Implementar validações para status, datas, valores numéricos, etc.
- Padronizar os valores de status (usar ENUM ou tabela de referência).

### 2. **Reestruturar o Banco de Dados**
- Adicionar constraints e triggers para garantir integridade dos campos de data e status.
- Normalizar tabelas (ex: tabela separada para tipos de garantia/status).
- Garantir que todos os registros tenham `data_ordem`, `mes_servico`, `ano_servico` preenchidos corretamente.

### 3. **Scripts de Migração e Limpeza**
- Criar scripts robustos para migrar e corrigir todos os dados antigos.
- Validar e corrigir registros inconsistentes.

### 4. **Ajustar Limites de Consulta**
- Implementar paginação real no backend e frontend.
- Se possível, configurar o Supabase para permitir fetchs maiores ou usar jobs de processamento em lote.

### 5. **Testes e Validação**
- Criar testes automatizados para garantir que todos os dados inseridos/atualizados estejam corretos.
- Validar periodicamente a integridade dos dados.

---

## Resumo do Que Foi Feito ("Quebra-Galho")
- Scripts para preencher mês/ano.
- Filtros flexíveis no frontend para status.
- Filtros duplos no backend (mes_servico/ano_servico e data_ordem).
- Logs de diagnóstico para contagem por mês/ano.

---

## Próximos Passos
- Refatorar o backend e banco conforme recomendações acima.
- Garantir dados limpos e padronizados para todas as áreas do app.
- Remover gambiarras e soluções temporárias assim que a base estiver consistente.

---

*Este documento deve ser versionado no repositório para consulta e histórico de decisões técnicas.* 