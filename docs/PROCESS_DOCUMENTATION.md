# Documentação do Processo de Configuração e Análise do GLGarantias

Este documento detalha o processo de configuração do banco de dados Supabase, a análise do esquema, a coleta e o processamento dos dados, e as decisões tomadas durante o desenvolvimento do projeto GLGarantias.

## 1. Conexão e Configuração do Supabase

Inicialmente, tentou-se estabelecer uma conexão direta com o Supabase utilizando a string de conexão fornecida. No entanto, foram encontrados problemas de resolução de DNS no ambiente sandbox, impedindo a conexão direta via hostname.

**Decisão:** Para contornar a limitação de acesso direto, foi acordado com o usuário que a IA Manus forneceria os comandos e instruções, e o usuário os executaria no ambiente Supabase, reportando os resultados.

## 2. Análise e Modificação do Esquema do Banco de Dados

O esquema inicial do banco de dados foi obtido a partir do arquivo `schema.sql` presente no repositório GitHub `glgarantias/backend/database/schema.sql`.

### Identificação de Necessidades de Modificação:

Durante a simulação do processamento de dados do Excel, foi identificado que a coluna `ModeloVei_Osv` do Excel (`Modelo do Motor (VALMET 785)`) representava uma informação distinta de `Descricao_Mot` (`Tipo do Motor (MWM 4.07TCA)`). O `schema.sql` original possuía apenas uma coluna `modelo_motor` na tabela `ordens_servico`.

**Decisão:** Foi acordado adicionar uma nova coluna à tabela `ordens_servico` para acomodar `ModeloVei_Osv`. O nome proposto e aceito para esta nova coluna foi `modelo_veiculo_motor`.

### Correção de Sintaxe SQL:

Após a primeira tentativa de aplicação do `schema.sql` no Editor SQL do Supabase, foi reportado um erro de sintaxe (`42601: erro de sintaxe em ou próximo a "$"`). Este erro estava relacionado à sintaxe de definição de funções RPC (Remote Procedure Call) no PostgreSQL.

**Correção:** O `schema.sql` foi modificado para usar a sintaxe `AS $$ ... $$` para os blocos de código das funções RPC, que é mais compatível e robusta para execução em ambientes como o Editor SQL do Supabase.

### Verificação do Esquema no Supabase:

Para confirmar a correta aplicação do esquema, foram solicitados ao usuário os resultados das seguintes consultas SQL (adaptadas para o Editor SQL do Supabase):

- Listagem de tabelas: `SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public';`
- Descrição da tabela `ordens_servico`: `SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'ordens_servico';`
- Listagem de funções: `SELECT proname FROM pg_proc WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');`
- Conteúdo da tabela `classificacao_defeitos`: `SELECT * FROM classificacao_defeitos;`

Os resultados confirmaram que o esquema foi criado com sucesso, incluindo a nova coluna `modelo_veiculo_motor` e as funções corrigidas, e que a tabela `classificacao_defeitos` foi populada com os dados iniciais.

## 3. Coleta e Processamento de Dados Refinados

Para simular o fluxo de dados e preparar uma base para comparação futura, o usuário forneceu dados de 11 colunas de um arquivo Excel, coluna por coluna, em arquivos `.txt`. Estes dados representam a versão "refinada" e "correta" que o Supabase deveria conter após o processamento.

### Colunas Coletadas:

1.  `NOrdem_OSv`
2.  `Data_OSv`
3.  `Fabricante_Mot`
4.  `Descricao_Mot`
5.  `ModeloVei_Osv`
6.  `ObsCorpo_OSv`
7.  `RazaoSocial_Cli`
8.  `TotalProd_OSv`
9.  `TotalServ_OSv`
10. `Total_OSv`
11. `Status_OSv`

### Lógica de Processamento Aplicada (Simulação):

Um script Python (`process_refined_data.py`) foi desenvolvido para simular o processamento que o programa real deveria fazer. Este script realiza as seguintes operações:

1.  **Leitura de Dados:** Lê os dados de cada arquivo `.txt`.
2.  **Filtragem por Ano:** Descarta registros com `Data_OSv` anterior a 2019.
3.  **Filtragem por Status:** Descarta registros onde `Status_OSv` não é 'G', 'GO' ou 'GU'.
4.  **Transformação de `TotalProd_OSv`:** Divide o valor por 2.
5.  **Validação de `Total_OSv`:** Verifica a consistência de `Total_OSv` com a soma de `TotalProd_OSv` (dividido por 2) e `TotalServ_OSv`.
6.  **Consolidação:** Os dados processados são consolidados em um arquivo CSV (`refined_data.csv`) para fácil acesso e leitura por outras IAs ou ferramentas.

### Classificação de Defeitos (`ObsCorpo_OSv`):

Foi confirmado que a classificação de defeitos a partir da coluna `ObsCorpo_OSv` segue a lógica implementada no arquivo `glgarantias/backend/src/services/nlpService.js`. Este serviço utiliza uma abordagem baseada em regras e palavras-chave para classificar o texto bruto do defeito em grupos, subgrupos e subsubgrupos, atribuindo um nível de confiança à classificação.

## 4. Próximos Passos

Com o esquema do Supabase configurado e os dados refinados processados e documentados, os próximos passos incluem:

- **Teste de Upload de Excel:** Utilizar a tabela oficial do usuário para processamento e inserção no Supabase.
- **Comparação de Dados:** Comparar os dados inseridos da tabela oficial com os dados refinados (`refined_data.csv`) para verificar a correção do processamento.

Este documento será atualizado conforme o progresso do projeto.

