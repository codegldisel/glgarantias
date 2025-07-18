# Plano Estratégico Completo - Projeto GLGarantias

## 1. LINHA DO TEMPO - ONDE ESTAMOS

### Estado Inicial do Projeto
- **Repositório GitHub:** `https://github.com/codegldisel/glgarantias.git`
- **Estrutura:** Backend Node.js + Frontend + Banco Supabase
- **Problema Identificado:** Perda de dados e necessidade de reconstrução do esquema do banco

### O Que Foi Realizado

#### Fase 1: Análise e Compreensão do Fluxo de Dados
- ✅ **Simulação do Processamento Excel:** Compreendemos que o programa deve:
  - Ler apenas colunas específicas do Excel (NOrdem_OSv, Data_OSv, etc.)
  - Filtrar por ano >= 2019
  - Filtrar por status G, GO, GU
  - Dividir TotalProd_OSv por 2
  - Validar consistência dos totais
  - Classificar defeitos usando NLP

#### Fase 2: Coleta de Dados de Referência
- ✅ **Dados Refinados Coletados:** 2520 linhas de dados "corretos" em 11 colunas
- ✅ **Processamento e Filtragem:** Aplicamos as regras e obtivemos 1121 registros válidos
- ✅ **Arquivo CSV Gerado:** `glgarantias/data/refined_data.csv` como base de comparação

#### Fase 3: Reconstrução do Esquema Supabase
- ✅ **Identificação de Necessidade:** Nova coluna `modelo_veiculo_motor` para `ModeloVei_Osv`
- ✅ **Correção de Sintaxe SQL:** Funções RPC corrigidas para compatibilidade com Supabase
- ✅ **Verificação do Esquema:** Confirmado que todas as tabelas e funções foram criadas
- ✅ **Dados de Classificação:** Tabela `classificacao_defeitos` populada corretamente

#### Fase 4: Documentação
- ✅ **Documentação Técnica:** `PROCESS_DOCUMENTATION.md` criado
- ✅ **README dos Dados:** `data/README.md` explicando os dados refinados
- ✅ **Commit Inicial:** Documentação enviada para GitHub

#### Fase 5: Início das Atualizações Backend (PARCIAL)
- ✅ **ExcelService Atualizado:** Adicionado mapeamento para `modelo_veiculo_motor`
- ⚠️ **Rotas Parcialmente Atualizadas:** Modificações em `ordens.js` não commitadas
- ❌ **Outras Rotas:** Não verificadas/atualizadas
- ❌ **Testes:** Não realizados

### Estado Atual - ONDE ESTAMOS AGORA
- **Supabase:** ✅ Esquema atualizado e funcional
- **Dados de Referência:** ✅ Processados e documentados
- **Backend:** ⚠️ Parcialmente atualizado, não testado, não commitado
- **Frontend:** ❌ Não analisado nem atualizado
- **Integração:** ❌ Não testada
- **Deploy:** ❌ Não realizado

---

## 2. PLANO ESTRATÉGICO DETALHADO

### OBJETIVO FINAL
Ter um sistema GLGarantias completamente funcional onde:
1. O usuário pode fazer upload de Excel
2. Os dados são processados corretamente conforme as regras estabelecidas
3. A interface exibe todas as informações incluindo a nova coluna `modelo_veiculo_motor`
4. A classificação de defeitos funciona via NLP
5. Todas as funcionalidades de filtro, busca e análise estão operacionais

### ESTRATÉGIA DE EXECUÇÃO

#### Princípios Orientadores:
1. **Incremental:** Fazer uma mudança por vez, testar, commitar
2. **Verificação Contínua:** Cada alteração deve ser testada antes de prosseguir
3. **Documentação:** Todas as mudanças devem ser documentadas
4. **Rollback Ready:** Manter capacidade de reverter mudanças se necessário

---

## 3. PLANO TÁTICO - PASSO A PASSO

### FASE A: FINALIZAÇÃO E TESTE DO BACKEND

#### A1. Auditoria Completa do Backend
**Objetivo:** Identificar todos os arquivos que precisam ser atualizados
**Ações:**
- Analisar todas as rotas em `/src/routes/`
- Verificar todos os serviços em `/src/services/`
- Identificar queries que referenciam colunas da tabela `ordens_servico`
- Mapear dependências entre arquivos

#### A2. Atualização Sistemática do Backend
**Objetivo:** Garantir que todo o backend reconheça a nova coluna
**Ações:**
- Completar atualizações em `ordens.js`
- Atualizar `ordens-enhanced.js` se existir
- Verificar `analises.js`, `dashboard.js`, `defeitos.js`, `mecanicos.js`
- Atualizar queries SQL que fazem SELECT * ou listam colunas específicas
- Adicionar `modelo_veiculo_motor` aos filtros de busca onde apropriado

#### A3. Teste Local do Backend
**Objetivo:** Garantir que o backend funciona antes de prosseguir
**Ações:**
- Instalar dependências (`npm install`)
- Configurar variáveis de ambiente para Supabase
- Executar servidor local
- Testar endpoints principais via Postman/curl
- Verificar logs de erro

#### A4. Commit das Alterações Backend
**Objetivo:** Salvar progresso no GitHub
**Ações:**
- Commit das alterações do backend
- Push para GitHub
- Tag da versão como "backend-updated"

### FASE B: ANÁLISE E ATUALIZAÇÃO DO FRONTEND

#### B1. Auditoria do Frontend
**Objetivo:** Entender a estrutura atual e identificar pontos de atualização
**Ações:**
- Mapear estrutura de pastas do frontend
- Identificar componentes que exibem dados de ordens de serviço
- Localizar formulários de upload de Excel
- Verificar tabelas/grids que mostram dados
- Identificar filtros e campos de busca

#### B2. Atualização do Frontend
**Objetivo:** Incluir `modelo_veiculo_motor` na interface
**Ações:**
- Adicionar coluna `modelo_veiculo_motor` em tabelas/grids
- Atualizar formulários se necessário
- Adicionar campo aos filtros de busca
- Verificar responsividade mobile
- Atualizar labels/traduções se existirem

#### B3. Teste do Frontend
**Objetivo:** Garantir que a interface funciona corretamente
**Ações:**
- Executar build do frontend
- Testar em navegador local
- Verificar todas as páginas/abas
- Testar responsividade
- Verificar integração com backend

### FASE C: TESTE DE INTEGRAÇÃO COMPLETA

#### C1. Teste de Upload Excel
**Objetivo:** Verificar se o fluxo completo funciona
**Ações:**
- Preparar arquivo Excel de teste
- Realizar upload via interface
- Verificar processamento no backend
- Confirmar inserção no Supabase
- Validar dados inseridos

#### C2. Teste de Funcionalidades
**Objetivo:** Garantir que todas as features funcionam
**Ações:**
- Testar filtros e busca
- Verificar classificação de defeitos
- Testar paginação e ordenação
- Verificar dashboards e análises
- Testar exportação de dados se existir

#### C3. Comparação com Dados de Referência
**Objetivo:** Validar precisão do processamento
**Ações:**
- Processar dados de teste
- Comparar com `refined_data.csv`
- Identificar discrepâncias
- Corrigir problemas encontrados

### FASE D: DEPLOY E FINALIZAÇÃO

#### D1. Preparação para Deploy
**Objetivo:** Preparar sistema para produção
**Ações:**
- Verificar variáveis de ambiente
- Otimizar build do frontend
- Verificar configurações de CORS
- Testar em ambiente de staging se disponível

#### D2. Deploy
**Objetivo:** Colocar sistema em produção
**Ações:**
- Deploy do backend
- Deploy do frontend
- Verificar conectividade com Supabase
- Teste smoke em produção

#### D3. Documentação Final
**Objetivo:** Documentar sistema finalizado
**Ações:**
- Atualizar documentação técnica
- Criar guia de usuário se necessário
- Documentar processo de deploy
- Criar changelog das alterações

---

## 4. PLANO TÉCNICO DETALHADO

### ARQUITETURA ATUAL
```
Frontend (React/Vue/Angular?) 
    ↓ HTTP Requests
Backend (Node.js/Express)
    ↓ SQL Queries  
Supabase (PostgreSQL)
```

### PONTOS CRÍTICOS TÉCNICOS

#### 4.1. Backend - Arquivos Prioritários
1. **`/src/services/excelService.js`** - ✅ Já atualizado
2. **`/src/routes/ordens.js`** - ⚠️ Parcialmente atualizado
3. **`/src/routes/ordens-enhanced.js`** - ❓ Não verificado
4. **`/src/routes/analises.js`** - ❓ Pode precisar de atualização para dashboards
5. **`/src/routes/dashboard.js`** - ❓ Pode precisar de atualização para métricas

#### 4.2. Queries SQL Críticas
- Todas as queries que fazem `SELECT *` automaticamente incluirão a nova coluna
- Queries com colunas específicas precisam ser atualizadas manualmente
- Filtros de busca textual devem incluir `modelo_veiculo_motor`
- Ordenação deve permitir ordenar por `modelo_veiculo_motor`

#### 4.3. Frontend - Pontos de Atenção
- **Tabelas/Grids:** Adicionar coluna `modelo_veiculo_motor`
- **Formulários:** Verificar se há formulários de edição manual
- **Filtros:** Adicionar aos filtros de busca
- **Exportação:** Incluir na exportação de dados
- **Responsividade:** Verificar se nova coluna não quebra layout mobile

#### 4.4. Testes Essenciais
1. **Teste de Upload:** Arquivo Excel → Processamento → Supabase
2. **Teste de Exibição:** Supabase → Backend → Frontend
3. **Teste de Filtros:** Busca por `modelo_veiculo_motor`
4. **Teste de Performance:** Verificar se nova coluna não impacta performance
5. **Teste de Validação:** Comparar com `refined_data.csv`

### RISCOS TÉCNICOS E MITIGAÇÕES

#### Risco 1: Quebra de Funcionalidades Existentes
**Mitigação:** Testes incrementais após cada alteração

#### Risco 2: Performance Degradada
**Mitigação:** Monitorar queries e adicionar índices se necessário

#### Risco 3: Inconsistência de Dados
**Mitigação:** Validação rigorosa com dados de referência

#### Risco 4: Problemas de Deploy
**Mitigação:** Teste em ambiente de staging primeiro

---

## 5. CRONOGRAMA ESTIMADO

### Fase A (Backend): 2-3 horas
- A1: 30 min
- A2: 1-1.5h  
- A3: 30-45 min
- A4: 15 min

### Fase B (Frontend): 1-2 horas
- B1: 30 min
- B2: 30-60 min
- B3: 30 min

### Fase C (Integração): 1-2 horas
- C1: 45 min
- C2: 30-45 min
- C3: 30 min

### Fase D (Deploy): 30-60 min
- D1: 15-30 min
- D2: 15-30 min
- D3: 15 min

**TOTAL ESTIMADO: 4.5-7.5 horas**

---

## 6. CRITÉRIOS DE SUCESSO

### Critérios Técnicos
- [ ] Backend responde a todas as rotas sem erro
- [ ] Frontend exibe `modelo_veiculo_motor` corretamente
- [ ] Upload de Excel processa dados conforme regras estabelecidas
- [ ] Dados inseridos no Supabase batem com `refined_data.csv`
- [ ] Todas as funcionalidades de filtro/busca funcionam
- [ ] Sistema deployado e acessível

### Critérios de Qualidade
- [ ] Código commitado e documentado no GitHub
- [ ] Testes realizados e documentados
- [ ] Performance aceitável (< 3s para operações principais)
- [ ] Interface responsiva e usável
- [ ] Logs de erro limpos

---

## PRÓXIMO PASSO IMEDIATO

**INICIAR FASE A1:** Auditoria completa do backend para mapear todos os arquivos que precisam ser atualizados para incluir `modelo_veiculo_motor`.

Este plano nos dará uma base sólida para finalizar o projeto de forma organizada e sem deixar pontas soltas.

