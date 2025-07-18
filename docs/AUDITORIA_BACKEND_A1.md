# AUDITORIA BACKEND - FASE A1

## RESUMO EXECUTIVO

Concluída a auditoria completa do backend para identificar todos os arquivos que precisam ser atualizados para incluir a nova coluna `modelo_veiculo_motor`. A análise revelou que **5 arquivos de rotas** precisam de atualizações, sendo que **2 já foram parcialmente atualizados** e **3 ainda precisam de modificações**.

## ARQUIVOS ANALISADOS

### ✅ ARQUIVOS JÁ ATUALIZADOS

#### 1. `/src/services/excelService.js`
- **Status:** ✅ COMPLETO
- **Alteração:** Adicionado mapeamento `modelo_veiculo_motor: row["ModeloVei_Osv"] || null`
- **Impacto:** Dados do Excel agora incluem a nova coluna na inserção

#### 2. `/src/routes/ordens.js` 
- **Status:** ⚠️ PARCIALMENTE ATUALIZADO
- **Alterações Feitas:**
  - Busca textual inclui `modelo_veiculo_motor`
  - Colunas válidas de ordenação incluem `modelo_veiculo_motor`
- **Pendente:** Commit das alterações

### ❌ ARQUIVOS QUE PRECISAM DE ATUALIZAÇÃO

#### 3. `/src/routes/ordens-enhanced.js`
- **Status:** ❌ PRECISA ATUALIZAÇÃO
- **Problemas Identificados:**
  - Busca textual NÃO inclui `modelo_veiculo_motor`
  - Colunas válidas de ordenação NÃO incluem `modelo_veiculo_motor`
  - Endpoint `/filters/options` NÃO retorna opções de `modelo_veiculo_motor`
- **Ações Necessárias:**
  - Adicionar `modelo_veiculo_motor` à busca textual (linha ~36)
  - Adicionar `modelo_veiculo_motor` às colunas válidas de ordenação (linha ~42)
  - Adicionar `modelo_veiculo_motor` ao SELECT do endpoint `/filters/options` (linha ~81)
  - Processar e retornar valores únicos de `modelo_veiculo_motor` (linha ~95)

#### 4. `/src/routes/analises.js`
- **Status:** ❌ PRECISA ATUALIZAÇÃO
- **Problemas Identificados:**
  - Endpoint `/strategic-data` não inclui `modelo_veiculo_motor` nas consultas
  - Endpoint `/filtros` não retorna opções de `modelo_veiculo_motor`
- **Ações Necessárias:**
  - Adicionar `modelo_veiculo_motor` ao SELECT do endpoint `/strategic-data` (linha ~15)
  - Adicionar consulta para buscar valores únicos de `modelo_veiculo_motor` no endpoint `/filtros` (após linha ~150)
  - Incluir `modelo_veiculo_motor` no objeto de resposta do endpoint `/filtros`

#### 5. `/src/routes/defeitos.js`
- **Status:** ❌ PRECISA ATUALIZAÇÃO
- **Problemas Identificados:**
  - Endpoint `/filtros` não retorna opções de `modelo_veiculo_motor`
  - Análises não consideram `modelo_veiculo_motor` como dimensão
- **Ações Necessárias:**
  - Adicionar consulta para buscar valores únicos de `modelo_veiculo_motor` no endpoint `/filtros` (após linha ~250)
  - Incluir `modelo_veiculo_motor` no objeto de resposta do endpoint `/filtros`
  - Considerar adicionar análises por `modelo_veiculo_motor` se relevante

#### 6. `/src/routes/mecanicos.js`
- **Status:** ❌ PRECISA ATUALIZAÇÃO
- **Problemas Identificados:**
  - Endpoint `/filtros` não retorna opções de `modelo_veiculo_motor`
- **Ações Necessárias:**
  - Adicionar consulta para buscar valores únicos de `modelo_veiculo_motor` no endpoint `/filtros` (após linha ~250)
  - Incluir `modelo_veiculo_motor` no objeto de resposta do endpoint `/filtros`

### ✅ ARQUIVOS QUE NÃO PRECISAM ATUALIZAÇÃO

#### 7. `/src/routes/dashboard.js`
- **Status:** ✅ OK
- **Justificativa:** Usa `SELECT *` e não faz referências específicas a colunas individuais. A nova coluna será automaticamente incluída.

#### 8. `/src/config/supabase.js`
- **Status:** ✅ OK
- **Justificativa:** Configuração de conexão, não afetada pela nova coluna.

#### 9. `/src/services/nlpService.js`
- **Status:** ✅ OK
- **Justificativa:** Focado na classificação de defeitos, não manipula colunas de modelo.

## PRIORIZAÇÃO DAS ATUALIZAÇÕES

### PRIORIDADE ALTA
1. **`ordens-enhanced.js`** - Rota principal de listagem com filtros avançados
2. **`analises.js`** - Dados estratégicos e filtros para análises

### PRIORIDADE MÉDIA  
3. **`defeitos.js`** - Filtros para análise de defeitos
4. **`mecanicos.js`** - Filtros para análise de mecânicos

### PRIORIDADE BAIXA
5. **Commit de `ordens.js`** - Já atualizado, apenas precisa ser commitado

## ESTIMATIVA DE TEMPO

- **ordens-enhanced.js:** 15 minutos
- **analises.js:** 10 minutos  
- **defeitos.js:** 8 minutos
- **mecanicos.js:** 8 minutos
- **Commit e teste:** 10 minutos

**TOTAL ESTIMADO:** 51 minutos

## RISCOS IDENTIFICADOS

### RISCO BAIXO
- Todas as alterações são aditivas (não removem funcionalidades)
- Uso de `SELECT *` em muitas consultas minimiza impacto
- Nova coluna é opcional (permite NULL)

### PONTOS DE ATENÇÃO
- Testar endpoints de filtros após atualizações
- Verificar se frontend espera a nova coluna nos filtros
- Confirmar que ordenação por `modelo_veiculo_motor` funciona

## PRÓXIMOS PASSOS

1. **Executar Fase A2:** Atualização sistemática dos arquivos identificados
2. **Seguir ordem de prioridade:** ordens-enhanced.js → analises.js → defeitos.js → mecanicos.js
3. **Testar cada arquivo** após atualização
4. **Commit incremental** após cada arquivo atualizado

## CONCLUSÃO

A auditoria revelou um escopo bem definido e gerenciável. A maioria dos arquivos usa `SELECT *`, o que facilita a adoção da nova coluna. As atualizações necessárias são principalmente em endpoints de filtros e buscas textuais, representando baixo risco de quebra de funcionalidades existentes.

**RECOMENDAÇÃO:** Prosseguir com Fase A2 conforme planejado.

