# Sistema de Análise de Garantias de Motores

Este projeto automatiza o processo de análise de garantias de motores, processando planilhas Excel e classificando defeitos usando Processamento de Linguagem Natural (PLN).

## 🚀 Tecnologias

- **Backend**: Node.js + Express
- **Frontend**: React + Vite
- **Banco de Dados**: Supabase (PostgreSQL)
- **Processamento**: XLSX para leitura de Excel
- **PLN**: Classificação customizada de defeitos

## 📋 Funcionalidades

- Upload e processamento de planilhas Excel grandes (>10MB)
- Classificação automática de defeitos em hierarquia (Grupo > Subgrupo > Subsubgrupo)
- Dashboard com análises mensais
- Visualização de dados brutos com filtros
- Exportação de relatórios
- Gestão de mecânicos e motores

## 🛠️ Configuração

### 1. Configuração do Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute o script `database/schema.sql` no SQL Editor do Supabase
3. Copie a URL e a chave anônima do projeto

### 2. Configuração do Backend

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas credenciais do Supabase

# Iniciar servidor de desenvolvimento
npm run dev
```

### 3. Estrutura do Projeto

```
glgarantias/
├── src/
│   ├── app.js              # Servidor Express principal
│   ├── config/
│   │   └── supabase.js     # Configuração do Supabase
│   ├── controllers/        # Controladores das rotas
│   ├── services/
│   │   ├── excelService.js # Serviço de leitura de Excel
│   │   └── nlpService.js   # Serviço de classificação PLN
│   └── utils/              # Utilitários
├── database/
│   └── schema.sql          # Schema do banco de dados
├── uploads/                # Diretório para arquivos enviados
└── frontend/               # Aplicação React (a ser criada)
```

## 📊 Schema do Banco de Dados

### Tabelas Principais

- **ordens_servico**: Dados principais das ordens de serviço
- **mecanicos**: Cadastro de mecânicos
- **motores**: Cadastro de motores (fabricante + modelo)
- **classificacao_defeitos**: Regras de classificação de defeitos
- **uploads**: Histórico de uploads de planilhas

### Mapeamento Excel → Banco

| Coluna Excel | Campo Banco | Descrição |
|--------------|-------------|-----------|
| NOrdem_OSv | numero_ordem | Número da ordem de serviço |
| Status_OSv | status | Tipo de garantia (G→Garantia, GO→Garantia de Oficina, GU→Garantia de Usinagem) |
| ObsCorpo_OSv | defeito_texto_bruto | Descrição do defeito (processada por PLN) |
| RazaoSocial_Cli | mecanico_responsavel | Nome do mecânico |
| Descricao_Mot | modelo_motor | Modelo do motor |
| Fabricante_Mot | fabricante_motor | Fabricante do motor |
| DIA, MÊS, ANO | dia_servico, mes_servico, ano_servico | Data do serviço |
| TOT. PÇ, TOT. SERV., TOT | total_pecas, total_servico, total_geral | Valores financeiros |

## 🤖 Classificação de Defeitos (PLN)

O sistema classifica automaticamente os defeitos em uma hierarquia de 3 níveis:

### Grupos Principais
- Vazamentos
- Problemas de Funcionamento/Desempenho
- Ruídos e Vibrações
- Quebra/Dano Estrutural
- Problemas de Combustão/Exaustão
- Desgaste e Folga
- Problemas de Lubrificação
- Problemas de Arrefecimento
- Problemas de Injeção e Alimentação
- Problemas Elétricos/Eletrônicos
- Erros de Montagem/Instalação

### Processo de Classificação
1. **Pré-processamento**: Normalização do texto, remoção de acentos e pontuação
2. **Correspondência de palavras-chave**: Busca por termos específicos em cada nível
3. **Hierarquia**: Classificação em ordem (Grupo → Subgrupo → Subsubgrupo)
4. **Confiança**: Atribuição de score de confiança (0-1)

## 📈 APIs Disponíveis

### Upload de Planilha
```
POST /api/upload
Content-Type: multipart/form-data
Body: arquivo Excel (.xlsx)
```

### Consulta de Dados
```
GET /api/ordens-servico
Query params: ano, mes, mecanico, fabricante, etc.
```

## 🔧 Desenvolvimento

### Scripts Disponíveis
```bash
npm run dev      # Servidor de desenvolvimento
npm run start    # Servidor de produção
npm test         # Executar testes
```

### Próximos Passos
1. ✅ Configuração inicial do backend
2. ✅ Schema do banco de dados
3. ⏳ Implementação completa do processamento Excel
4. ⏳ Desenvolvimento do frontend React
5. ⏳ Testes e otimização
6. ⏳ Deploy

## 📝 Licença

Este projeto é privado e destinado ao uso interno da empresa.

