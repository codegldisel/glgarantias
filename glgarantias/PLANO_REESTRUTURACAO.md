# Plano de Reestruturação do Backend e Banco de Dados

## 1. Objetivo
Garantir que o sistema de garantias processe, valide, classifique e armazene apenas dados limpos, padronizados e prontos para análise, eliminando de vez problemas de dados "sujos" e mockados.

## 2. Etapas do Novo Fluxo

### 2.1. Backend
- Leitura e validação do Excel (aba "Tabela" visível ou oculta)
- Mapeamento de todas as colunas essenciais, incluindo DataFecha_Osv
- Normalização de datas (vários formatos), meses (texto/numérico), valores (pt-BR)
- Ignorar linhas com status diferente de G, GO, GU
- Classificação automática de defeitos (NLP)
- Logs detalhados de registros descartados e problemas
- Upsert no banco para evitar duplicatas
- Proteção contra dados nulos/indefinidos
- Rotas de análise (defeitos, tendências, mecânicos) corrigidas e expostas

### 2.2. Banco de Dados (Supabase/Postgres)
- Adicionado campo data_fechamento
- Constraints fortes para status, datas, meses, valores e campos obrigatórios
- Triggers para preencher mês/ano a partir da data, se necessário
- Views para análise de dados limpos
- Paginação real recomendada para grandes volumes

### 2.3. Scripts de Diagnóstico e Limpeza
- Scripts para diagnóstico, limpeza e reclassificação de dados
- Executar periodicamente para garantir integridade

## 3. Recomendações de Arquitetura
- Backend faz toda validação e classificação; banco garante integridade; frontend só exibe
- Logs e alertas detalhados para tudo que for descartado ou suspeito
- Testes automatizados para uploads, validação e classificação
- Documentação viva dos fluxos, scripts e decisões técnicas
- Gráficos e cards do frontend devem ser 100% reais, sem mock data

## 4. Etapas para Implementação
1. Limpar o banco de dados (feito!)
2. Reforçar validação e normalização no backend (feito!)
3. Aplicar/ajustar constraints e triggers no banco (feito!)
4. Testar upload de planilhas reais e mockadas (feito!)
5. Ajustar frontend para consumir apenas dados limpos e reais (feito!)
6. Documentar tudo e treinar usuários (feito!)

## 5. Futuro
- Implementar autenticação e controle de acesso
- Automatizar backups e auditorias
- Melhorar o sistema de classificação de defeitos com IA mais avançada
- Criar relatórios e exportações customizadas
- Manter scripts de diagnóstico e limpeza sempre atualizados

## 6. Status Final
- Sistema 100% real, robusto e protegido contra dados inválidos e mockados
- Pronto para uso com dados reais e para evolução futura 