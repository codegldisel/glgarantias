# App de Análise de Garantias

Este é o projeto do aplicativo de análise de garantias desenvolvido para controle e interpretação de dados de Ordens de Serviço (OS) de garantia.

## Estrutura do Projeto

```
/
├── backend/                 # Servidor Node.js/Express
│   ├── src/
│   │   └── app.js          # Arquivo principal do servidor
│   ├── .env                # Credenciais do Supabase (NÃO ENVIAR PARA GITHUB)
│   └── package.json        # Dependências do backend
└── frontend/app/           # Aplicação React.js
    ├── src/                # Código fonte do React
    ├── public/             # Arquivos públicos
    └── package.json        # Dependências do frontend
```

## Tecnologias Utilizadas

### Backend
- **Node.js/Express** - Servidor e APIs
- **Supabase** - Banco de dados PostgreSQL
- **CORS** - Comunicação entre frontend e backend

### Frontend
- **React.js** - Interface do usuário
- **Tailwind CSS** - Estilização
- **Recharts** - Gráficos e visualizações
- **shadcn/ui** - Componentes de interface

### Banco de Dados (Supabase)
- **ordens_servico** - Tabela principal com as OS de garantia
- **grupos_defeito** - Categorias de defeitos
- **subgrupos_defeito** - Subcategorias de defeitos
- **subsubgrupos_defeito** - Sub-subcategorias de defeitos
- **mapeamento_defeitos** - Mapeamento de descrições para categorias
- **temp_import_access** - Tabela temporária para importação

## Como Executar Localmente

### Backend
```bash
cd backend
npm install
npm start
```
O servidor rodará na porta 3000.

### Frontend
```bash
cd frontend/app
npm install
npm run dev
```
O aplicativo rodará na porta 5173.

## Configuração do Supabase

1. Crie um projeto no Supabase
2. Execute o SQL das tabelas (fornecido separadamente)
3. Configure as variáveis de ambiente no arquivo `.env` do backend:
   ```
   SUPABASE_URL=sua_url_supabase
   SUPABASE_ANON_KEY=sua_chave_anon_supabase
   ```

## Funcionalidades Planejadas

### MVP (Versão 1)
- [ ] Dashboard principal com análises gerais do mês
- [ ] Tabela com todas as OS de garantia do mês
- [ ] Upload manual de arquivo Excel para importação
- [ ] Classificação automática de defeitos
- [ ] Filtros básicos por tipo de OS (G, GO, GU)

### Versões Futuras
- [ ] Análises específicas por mecânico
- [ ] Análises por motor e valores
- [ ] Calendário de previsões
- [ ] Modo planilha para visualização de dados brutos
- [ ] Integração direta com banco Access da empresa

## Desenvolvimento

Este projeto foi desenvolvido com auxílio de IAs:
- **Lovable** - Desenvolvimento visual do frontend
- **Cursos** - Desenvolvimento do backend
- **Claude** - Análise técnica e organização
- **DBExpert** - Modelagem do banco de dados

## Status Atual

✅ Banco de dados estruturado no Supabase
✅ Backend configurado e funcional
✅ Frontend React inicializado
⏳ Desenvolvimento do protótipo inicial em andamento

