# Dados Refinados do Projeto GLGarantias

Este diretório contém os dados processados e refinados do projeto GLGarantias, conforme as especificações e transformações discutidas durante o desenvolvimento.

## Conteúdo:

- `refined_data.csv`: Arquivo CSV contendo as ordens de serviço filtradas e transformadas. Este arquivo serve como uma base de dados de referência para validação e futuras análises.

## Processamento dos Dados:

Os dados originais foram submetidos aos seguintes processos de filtragem e transformação:

1.  **Seleção de Colunas:** Apenas as colunas relevantes para a análise de garantias foram mantidas:
    - `NOrdem_OSv` (Número da OS)
    - `Data_OSv` (Data da OS)
    - `Fabricante_Mot` (Fabricante do Motor)
    - `Descricao_Mot` (Tipo do Motor)
    - `ModeloVei_Osv` (Modelo do Veículo/Motor)
    - `ObsCorpo_OSv` (Defeitos do Motor - texto bruto)
    - `RazaoSocial_Cli` (Mecânico Responsável)
    - `TotalProd_OSv` (Total de Peças)
    - `TotalServ_OSv` (Total Serviços)
    - `Total_OSv` (Total Geral)
    - `Status_OSv` (Status da OS)

2.  **Filtragem por Ano:** Apenas os registros com `Data_OSv` a partir de 2019 (inclusive) foram mantidos.

3.  **Filtragem por Status:** Apenas os registros com `Status_OSv` igual a 'G', 'GO' ou 'GU' foram mantidos.

4.  **Transformações Específicas:**
    - `TotalProd_OSv`: O valor original foi dividido por 2.
    - `Total_OSv`: Foi realizada uma validação para garantir que `(TotalProd_OSv / 2) + TotalServ_OSv` seja consistente com `Total_OSv`.
    - `Data_OSv`: O ano foi extraído para a filtragem.

## Utilização por Outras IAs:

Este arquivo `refined_data.csv` é formatado para ser facilmente consumido por outras IAs ou ferramentas de análise de dados. Ele representa o conjunto de dados 

