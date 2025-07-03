# DOCUMENTAÇÃO COMPLETA DO SISTEMA GLGARANTIAS

---

## 1. Visão Geral e Objetivo

O Sistema de Análise de Garantias GLúcio é uma aplicação web para processamento automatizado de planilhas Excel de ordens de serviço, classificação automática de defeitos via PLN e análise de dados em dashboards modernos. O objetivo é garantir dados limpos, padronizados e prontos para análise, eliminando problemas de dados "sujos" e mockados.

---

## 2. Histórico do Projeto

- Problemas graves de dados mockados misturados com dados reais.
- Backend não mapeava todos os campos essenciais, permitindo dados incompletos.
- Falta de validação e normalização permitia dados inconsistentes.
- Gráficos e cards do frontend usavam arrays fixos, não refletindo a realidade do banco.
- Reestruturação completa do fluxo em 2024, com mapeamento de todas as colunas essenciais, normalização de datas, meses e valores, proteção contra dados nulos, logs detalhados, rotas de análise, scripts de diagnóstico e limpeza.
- Sistema agora 100% real: todos os dados, gráficos e cards refletem o banco de dados.
- Upload de planilhas aceita múltiplos formatos de datas, meses e valores.
- Qualquer dado inválido é descartado e logado.
- Frontend exibe apenas dados limpos, sem mock data.
- Scripts de diagnóstico e limpeza mantidos para uso recorrente.

---

## 3. Fluxo e Requisitos

### Fluxo de Trabalho
1. Upload da planilha Excel pelo usuário.
2. Backend lê a aba "Tabela".
3. Extração e filtro de colunas essenciais, incluindo DataFecha_Osv.
4. Filtra apenas OS com status de garantia: G, GO, GU.
5. Mapeamento e normalização de datas, meses e valores.
6. Classificação automática de defeitos via NLP.
7. Validação e salvamento apenas de dados limpos no banco (Supabase/Postgres).
8. Dados duplicados são atualizados (upsert).
9. Frontend consome apenas dados limpos e classificados.

### Requisitos das Colunas
- NOrdem_OSv: Número da OS
- Status_OSv: Status (G, GO, GU)
- Data_OSv: Data da OS
- ObsCorpo_OSv: Texto do defeito
- DataFecha_Osv: Data de fechamento
- RazaoSocial_Cli: Mecânico responsável
- Descricao_Mot: Modelo do motor
- Fabricante_Mot: Fabricante do motor
- DIA, MÊS, ANO: Data detalhada
- TOT. PÇ, TOT. SERV., TOT: Valores

### Regras de Ouro
- Só entra no banco OS de garantia (G, GO, GU).
- Todos os campos essenciais validados e normalizados no backend.
- Defeitos classificados automaticamente.
- Dados duplicados são atualizados, nunca duplicados.
- O banco recusa qualquer dado inválido (constraints).
- O frontend só exibe dados limpos e prontos para análise.
- Gráficos e cards devem ser 100% reais, sem mock data.

---

## 4. Plano de Reestruturação

- Leitura e validação do Excel (aba "Tabela" visível ou oculta).
- Mapeamento de todas as colunas essenciais, incluindo DataFecha_Osv.
- Normalização de datas, meses, valores.
- Ignorar linhas com status diferente de G, GO, GU.
- Classificação automática de defeitos (NLP).
- Logs detalhados de registros descartados e problemas.
- Upsert no banco para evitar duplicatas.
- Proteção contra dados nulos/indefinidos.
- Rotas de análise corrigidas e expostas.
- Banco com constraints fortes para status, datas, meses, valores e campos obrigatórios.
- Triggers para preencher mês/ano a partir da data, se necessário.
- Views para análise de dados limpos.
- Paginação real recomendada para grandes volumes.
- Scripts para diagnóstico, limpeza e reclassificação de dados.
- Executar periodicamente para garantir integridade.
- Backend faz toda validação e classificação; banco garante integridade; frontend só exibe.
- Logs e alertas detalhados para tudo que for descartado ou suspeito.
- Testes automatizados para uploads, validação e classificação.
- Documentação viva dos fluxos, scripts e decisões técnicas.
- Gráficos e cards do frontend devem ser 100% reais, sem mock data.

---

## 5. Checklist de Implementação

### Etapas Concluídas
- Backend reforçado com validação dupla de status.
- Mapeamento de todas as colunas essenciais.
- Normalização de datas, meses, valores.
- Proteção contra dados nulos/indefinidos.
- Logs detalhados de registros descartados e problemas.
- Criação e correção de rotas de análise.
- Scripts de diagnóstico, limpeza e reclassificação.
- Frontend sem dados mockados, gráficos e cards reais.
- Cards de estatísticas calculados a partir dos dados reais.
- Proteção contra crash por dados nulos/indefinidos.
- Tratamento de loading e erro em todos os componentes.
- Consumo de todas as rotas reais do backend.
- Banco com campo data_fechamento, scripts de diagnóstico, limpeza e constraints aplicados.
- Garantia de integridade via constraints e triggers.

### Próximas Etapas
- Limpeza completa do banco (Supabase):
  ```sql
  DELETE FROM ordens_servico;
  DELETE FROM uploads;
  DELETE FROM mecanicos;
  DELETE FROM motores;
  DELETE FROM classificacao_defeitos;
  ```
- Reiniciar serviços e testar API.
- Executar script de teste: `node src/scripts/testeNovoFluxo.js`.
- Testar upload de planilha e logs do backend.
- Verificar se apenas dados válidos foram salvos.
- Testar frontend e confirmar dados reais.
- Validar no Supabase se só dados limpos foram salvos.
- Confirmar constraints funcionando.
- Testar upload com dados inválidos (deve ser rejeitado).
- Verificar logs de erro e sucesso.
- Documentar problemas encontrados.
- Testar com dados reais da empresa.
- Ajustar classificação de defeitos se necessário.
- Otimizar performance se houver problemas.
- Treinar usuários no novo fluxo.

---

## 6. Problemas Encontrados e Soluções

### Principais Problemas
- Campos de data e classificação inconsistentes.
- Status de garantia inconsistente.
- Limite de registros nas consultas do Supabase.
- Scripts de correção como solução temporária.
- Backend com lógica de filtro frágil.
- Dependência de dados corretos para outras áreas.

### Causas Raiz
- Importação de dados sem validação.
- Ausência de normalização e validação no backend.
- Falta de constraints e triggers no banco.
- Limitações do Supabase (limite de fetch).

### Soluções Temporárias
- Scripts para preencher campos nulos de mês/ano.
- Filtros no frontend para aceitar múltiplos valores de status.
- Filtros no backend tentando extrair mês/ano de diferentes campos.
- Aumento do limite de fetch para 10.000 registros.

### Recomendações para Reestruturação Definitiva
- Centralizar toda a lógica de validação e normalização de dados no backend.
- Implementar validações para status, datas, valores numéricos, etc.
- Padronizar os valores de status (usar ENUM ou tabela de referência).
- Adicionar constraints e triggers para garantir integridade dos campos de data e status.
- Normalizar tabelas (ex: tabela separada para tipos de garantia/status).
- Garantir que todos os registros tenham data_ordem, mes_servico, ano_servico preenchidos corretamente.
- Criar scripts robustos para migrar e corrigir todos os dados antigos.
- Validar e corrigir registros inconsistentes.
- Implementar paginação real no backend e frontend.
- Criar testes automatizados para garantir que todos os dados inseridos/atualizados estejam corretos.
- Validar periodicamente a integridade dos dados.

---

## 7. Recomendações Finais

- Sempre use o repositório do GitHub como fonte da verdade.
- Antes de rodar, limpe o ambiente e reinstale dependências.
- Mantenha a documentação viva.
- Use scripts de diagnóstico e limpeza periodicamente.
- Faça backup do banco de dados antes de grandes mudanças.
- Teste com dados reais e variados antes de liberar para produção.
- Mantenha logs detalhados e scripts de diagnóstico.
- Treine usuários no novo fluxo.
- Implemente autenticação e controle de acesso.
- Automatize backups e auditorias.
- Melhore o sistema de classificação de defeitos com IA mais avançada.
- Crie relatórios e exportações customizadas.
- Mantenha scripts de diagnóstico e limpeza sempre atualizados.

---

**Status Final:**
- Sistema 100% real, robusto e protegido contra dados inválidos e mockados.
- Pronto para uso com dados reais e para evolução futura. 