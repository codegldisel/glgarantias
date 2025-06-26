# Documentação da API do Backend - Aplicativo de Análise de Garantias

Este documento detalha os endpoints da API do backend do aplicativo de análise de garantias, desenvolvido com Node.js e Express, utilizando Supabase como banco de dados.

## Endpoints

### 1. Upload de Arquivo Excel

**`POST /upload-excel`**

Recebe um arquivo Excel (`.xlsx`), filtra as Ordens de Serviço (OS) de garantia e insere os dados na tabela temporária `temp_import_access` no Supabase.

*   **Requisição:**
    *   **Método:** `POST`
    *   **URL:** `/upload-excel`
    *   **Content-Type:** `multipart/form-data`
    *   **Corpo da Requisição:**
        *   `file`: O arquivo `.xlsx` a ser enviado.
    *   **Exemplo de Requisição (via `curl`):**
        ```bash
        curl -X POST -F "file=@/caminho/para/seu/arquivo.xlsx" http://localhost:3000/upload-excel
        ```

*   **Resposta (Sucesso - `200 OK`):**
    ```json
    {
      "message": "Arquivo processado e dados inseridos com sucesso!",
      "count": 150
    }
    ```

*   **Resposta (Erro - `400 Bad Request` ou `500 Internal Server Error`):**
    ```json
    {
      "error": "Nenhum arquivo enviado ou tipo inválido."
    }
    ```
    ou
    ```json
    {
      "error": "Apenas arquivos .xlsx são permitidos."
    }
    ```

### 2. Processamento de Dados Temporários

**`POST /process-data`**

Lê os dados da tabela `temp_import_access`, aplica a lógica de mapeamento de defeitos, insere/atualiza os dados na tabela `ordens_servico` e limpa a tabela temporária. Sinaliza defeitos não mapeados.

*   **Requisição:**
    *   **Método:** `POST`
    *   **URL:** `/process-data`
    *   **Content-Type:** `application/json` (corpo vazio ou `{}`)
    *   **Exemplo de Requisição (via `curl`):**
        ```bash
        curl -X POST -H "Content-Type: application/json" -d "{}" http://localhost:3000/process-data
        ```

*   **Resposta (Sucesso - `200 OK`):**
    ```json
    {
      "message": "Dados processados e movidos para ordens_servico com sucesso!",
      "count": 100,
      "unmappedDefects": [
        "defeito nao catalogado 1",
        "defeito novo"
      ]
    }
    ```

*   **Resposta (Erro - `500 Internal Server Error`):**
    ```json
    {
      "error": "Erro interno do servidor."
    }
    ```

### 3. Buscar Ordens de Serviço

**`GET /api/ordens-servico`**

Retorna uma lista paginada de Ordens de Serviço, com opções de filtro.

*   **Requisição:**
    *   **Método:** `GET`
    *   **URL:** `/api/ordens-servico`
    *   **Parâmetros de Query (Opcionais):**
        *   `tipo_os`: Filtra por tipo de OS (e.g., `G`, `GO`, `GU`).
        *   `mecanico`: Filtra por nome do mecânico (busca parcial, case-insensitive).
        *   `cliente`: Filtra por nome do cliente (busca parcial, case-insensitive).
        *   `data_inicio`: Filtra por data de início (formato `YYYY-MM-DD`).
        *   `data_fim`: Filtra por data de fim (formato `YYYY-MM-DD`).
        *   `limit`: Número máximo de resultados por página (padrão: `20`).
        *   `offset`: Deslocamento para a paginação (padrão: `0`).
    *   **Exemplo de Requisição:**
        ```
        http://localhost:3000/api/ordens-servico?tipo_os=G&limit=10&offset=0
        ```

*   **Resposta (Sucesso - `200 OK`):**
    ```json
    {
      "data": [
        { "id": "uuid-1", "numero_os": "OS001", "tipo_os": "G", ... },
        { "id": "uuid-2", "numero_os": "OS002", "tipo_os": "G", ... }
      ],
      "count": 150
    }
    ```

### 4. Buscar Grupos de Defeito

**`GET /api/grupos-defeito`**

Retorna todos os grupos de defeito cadastrados.

*   **Requisição:**
    *   **Método:** `GET`
    *   **URL:** `/api/grupos-defeito`

*   **Resposta (Sucesso - `200 OK`):**
    ```json
    [
      { "id": "uuid-grupo1", "nome_grupo": "Motor" },
      { "id": "uuid-grupo2", "nome_grupo": "Transmissão" }
    ]
    ```

### 5. Buscar Subgrupos de Defeito

**`GET /api/subgrupos-defeito`**

Retorna todos os subgrupos de defeito, com filtro opcional por `grupo_id`.

*   **Requisição:**
    *   **Método:** `GET`
    *   **URL:** `/api/subgrupos-defeito`
    *   **Parâmetros de Query (Opcionais):**
        *   `grupo_id`: ID do grupo de defeito para filtrar os subgrupos.
    *   **Exemplo de Requisição:**
        ```
        http://localhost:3000/api/subgrupos-defeito?grupo_id=uuid-grupo1
        ```

*   **Resposta (Sucesso - `200 OK`):**
    ```json
    [
      { "id": "uuid-subgrupo1", "nome_subgrupo": "Cabeçote", "grupo_id": "uuid-grupo1" }
    ]
    ```

### 6. Buscar Subsubgrupos de Defeito

**`GET /api/subsubgrupos-defeito`**

Retorna todos os subsubgrupos de defeito, com filtro opcional por `subgrupo_id`.

*   **Requisição:**
    *   **Método:** `GET`
    *   **URL:** `/api/subsubgrupos-defeito`
    *   **Parâmetros de Query (Opcionais):**
        *   `subgrupo_id`: ID do subgrupo de defeito para filtrar os subsubgrupos.
    *   **Exemplo de Requisição:**
        ```
        http://localhost:3000/api/subsubgrupos-defeito?subgrupo_id=uuid-subgrupo1
        ```

*   **Resposta (Sucesso - `200 OK`):**
    ```json
    [
      { "id": "uuid-subsubgrupo1", "nome_subsubgrupo": "Válvulas", "subgrupo_id": "uuid-subgrupo1" }
    ]
    ```

### 7. Buscar Mapeamento de Defeitos

**`GET /api/mapeamento-defeitos`**

Retorna todos os mapeamentos de defeitos cadastrados.

*   **Requisição:**
    *   **Método:** `GET`
    *   **URL:** `/api/mapeamento-defeitos`

*   **Resposta (Sucesso - `200 OK`):**
    ```json
    [
      { "id": "uuid-map1", "descricao_original": "Barulho estranho no motor", "grupo_id": "uuid-grupo1", ... }
    ]
    ```

### 8. Salvar Defeitos Não Mapeados

**`POST /api/defeitos-nao-mapeados`**

Recebe um array de descrições de defeitos que não foram mapeados e os salva (ou atualiza) na tabela `defeitos_nao_mapeados`.

*   **Requisição:**
    *   **Método:** `POST`
    *   **URL:** `/api/defeitos-nao-mapeados`
    *   **Content-Type:** `application/json`
    *   **Corpo da Requisição:**
        ```json
        {
          "defeitos": [
            "defeito nao mapeado X",
            "outro defeito desconhecido"
          ]
        }
        ```

*   **Resposta (Sucesso - `200 OK`):**
    ```json
    {
      "message": "Defeitos não mapeados salvos com sucesso!",
      "count": 2
    }
    ```

*   **Resposta (Erro - `400 Bad Request` ou `500 Internal Server Error`):**
    ```json
    {
      "error": "Envie um array de defeitos não mapeados."
    }
    ```

## Próximos Passos e Considerações

*   **Tabela `defeitos_nao_mapeados`:** Certifique-se de que esta tabela foi criada no seu Supabase com o campo `descricao` como `UNIQUE`.
*   **Testes:** Recomenda-se testar todos os endpoints usando ferramentas como Postman ou Insomnia para garantir o funcionamento esperado.
*   **Autenticação/Autorização:** Para ambientes de produção, é crucial implementar mecanismos de autenticação e autorização para proteger os endpoints.
*   **Organização do Código:** Para projetos maiores, considere refatorar as rotas em arquivos separados para melhor organização e manutenção.

