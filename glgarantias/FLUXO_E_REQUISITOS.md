# Fluxo, Requisitos e Aprendizados do Sistema de Garantias GLúcio

## 1. Visão Geral
O sistema processa planilhas Excel de Ordens de Serviço (OS), filtra apenas OS de garantia, classifica defeitos automaticamente e fornece dados limpos e padronizados para análise no frontend. Todo o fluxo foi revisado para garantir dados 100% reais, sem mock data, e robustez contra formatos variados.

## 2. Fluxo de Trabalho Real e Atualizado

1. **Upload da Planilha**: O usuário faz upload de uma planilha Excel no modelo correto.
2. **Leitura da Aba "Tabela"**: O backend lê a aba "Tabela" (pode estar oculta ou visível).
3. **Extração e Filtro**:
   - Extrai todas as colunas essenciais, incluindo DataFecha_Osv (data de fechamento).
   - Filtra apenas OS com status de garantia: G, GO, GU (convertidos para nomes completos).
4. **Mapeamento e Normalização**:
   - Aceita datas em múltiplos formatos (ISO, DD/MM/YYYY, serial Excel).
   - Aceita mês como número ou texto (ex: "março").
   - Aceita valores com vírgula ou ponto.
   - Garante que todos os campos essenciais estejam preenchidos e padronizados.
5. **Classificação de Defeitos (NLP)**:
   - Usa processamento de linguagem natural para classificar o texto de defeito em grupo, subgrupo e subsubgrupo.
   - Salva também o índice de confiança da classificação.
6. **Validação e Salvamento**:
   - Só dados válidos e limpos são salvos no banco (Supabase/Postgres), com constraints para garantir integridade.
   - Dados duplicados (mesmo número de OS) são atualizados (upsert).
   - Data de fechamento agora é salva corretamente.
7. **Exibição no Frontend**:
   - O frontend consome apenas dados limpos, filtrados e classificados, prontos para análise e visualização.
   - Todos os gráficos e cards usam apenas dados reais, sem mock data.

## 3. Requisitos Essenciais das Colunas
- NOrdem_OSv: Número da OS
- Status_OSv: Status (G, GO, GU)
- Data_OSv: Data da OS (vários formatos)
- ObsCorpo_OSv: Texto do defeito (para classificação)
- DataFecha_Osv: Data de fechamento
- RazaoSocial_Cli: Mecânico responsável
- Descricao_Mot: Modelo do motor
- Fabricante_Mot: Fabricante do motor
- DIA, MÊS, ANO: Data detalhada
- TOT. PÇ, TOT. SERV., TOT: Valores

## 4. Problemas e Aprendizados
- Dados mockados e reais estavam misturados em várias abas e gráficos.
- Muitos registros com status inválido, datas faltando, valores inconsistentes.
- Falta de validação e normalização no backend permitia "sujeira" no banco.
- Campos essenciais como DataFecha_Osv não eram mapeados nem salvos.
- Supabase tem limites de consulta e precisa de paginação real.
- Scripts de limpeza e constraints no banco são essenciais para garantir integridade.
- O backend deve ser a principal barreira de validação, nunca o frontend.
- Gráficos e cards do frontend agora usam apenas dados reais.

## 5. Regras de Ouro para o Novo Sistema
- Só entra no banco OS de garantia (G, GO, GU).
- Todos os campos essenciais devem ser validados e normalizados no backend.
- Defeitos devem ser classificados automaticamente.
- Dados duplicados são atualizados, nunca duplicados.
- O banco deve recusar qualquer dado inválido (constraints).
- O frontend só exibe dados limpos e prontos para análise.
- Gráficos e cards devem ser 100% reais, sem mock data.

## 6. Observações Finais
- O sistema é robusto a erros de planilha, formatos e dados inesperados.
- Logs detalhados ajudam a identificar problemas rapidamente.
- Scripts de diagnóstico e limpeza devem ser mantidos para uso recorrente.
- Sempre testar com dados reais e variados antes de liberar para produção. 