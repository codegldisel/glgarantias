# App de Garantias

Sistema completo para gestão e análise de ordens de serviço de garantia, desenvolvido com React, Node.js e Supabase.

## 🚀 Funcionalidades

- **Dashboard Interativo**: Visualização de métricas e KPIs em tempo real
- **Upload de Excel**: Importação automática de dados via drag & drop
- **Análise de Defeitos**: Categorização e mapeamento inteligente de defeitos
- **Relatórios**: Geração de relatórios personalizados
- **Gestão de Mecânicos**: Acompanhamento de performance por mecânico
- **Interface Responsiva**: Design moderno e adaptável a diferentes dispositivos

## 🏗️ Arquitetura

```
seu-app-garantias/
├── frontend/app/          # Aplicação React (Vite)
│   ├── src/
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── contexts/      # Gerenciamento de estado global
│   │   ├── services/      # Serviços de API
│   │   ├── hooks/         # Hooks customizados
│   │   └── utils/         # Utilitários
├── backend/               # API Node.js (Express)
│   └── src/
│       └── app.js         # Servidor principal
└── supabase/              # Migrações e configuração do banco
    └── migrations/        # Scripts SQL
```

## 🛠️ Tecnologias

### Frontend
- **React 19** - Biblioteca de UI
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework de estilos
- **Radix UI** - Componentes acessíveis
- **Recharts** - Gráficos e visualizações
- **React Router** - Roteamento
- **React Hook Form** - Formulários
- **i18next** - Internacionalização
- **Jest + Testing Library** - Testes

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **Supabase** - Banco de dados e autenticação
- **Multer** - Upload de arquivos
- **XLSX** - Processamento de Excel

### Banco de Dados
- **PostgreSQL** (via Supabase)
- **Row Level Security (RLS)**
- **Políticas de acesso configuradas**

## 📋 Pré-requisitos

- Node.js 18+ 
- pnpm (recomendado) ou npm
- Conta no Supabase
- Git

## 🚀 Instalação e Configuração

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd seu-app-garantias
```

### 2. Configure o Supabase
1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute as migrações na ordem:
   ```sql
   -- Execute no SQL Editor do Supabase
   -- 1. Grupos de defeito
   -- 2. Subgrupos de defeito  
   -- 3. Subsubgrupos de defeito
   -- 4. Mapeamento de defeitos
   -- 5. Ordens de serviço
   -- 6. Tabela temporária
   -- 7. Defeitos não mapeados
   ```

### 3. Configure as variáveis de ambiente

#### Frontend
```bash
cd frontend/app
cp env.example .env
```

Edite o `.env`:
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

#### Backend
```bash
cd backend
cp env.example .env
```

Edite o `.env`:
```env
PORT=3000
SUPABASE_URL=sua_url_do_supabase
SUPABASE_ANON_KEY=sua_chave_anonima
```

### 4. Instale as dependências

#### Frontend
```bash
cd frontend/app
pnpm install
```

#### Backend
```bash
cd backend
npm install
```

### 5. Execute o projeto

#### Backend (Terminal 1)
```bash
cd backend
npm start
```

#### Frontend (Terminal 2)
```bash
cd frontend/app
pnpm dev
```

Acesse: http://localhost:5173

## 📊 Estrutura do Banco de Dados

### Tabelas Principais

1. **ordens_servico**: Armazena as ordens de serviço de garantia
2. **grupos_defeito**: Categorias principais de defeitos
3. **subgrupos_defeito**: Subcategorias de defeitos
4. **subsubgrupos_defeito**: Sub-subcategorias de defeitos
5. **mapeamento_defeitos**: Mapeamento entre descrições originais e categorias
6. **defeitos_nao_mapeados**: Defeitos que não foram categorizados
7. **temp_import_access**: Tabela temporária para importação

### Relacionamentos
- `ordens_servico` → `grupos_defeito` (via grupo_defeito_id)
- `ordens_servico` → `subgrupos_defeito` (via subgrupo_defeito_id)
- `ordens_servico` → `subsubgrupos_defeito` (via subsubgrupo_defeito_id)
- `subgrupos_defeito` → `grupos_defeito` (via grupo_id)
- `subsubgrupos_defeito` → `subgrupos_defeito` (via subgrupo_id)

## 🔧 Desenvolvimento

### Scripts Disponíveis

#### Frontend
```bash
pnpm dev          # Desenvolvimento
pnpm build        # Build de produção
pnpm preview      # Preview do build
pnpm test         # Executar testes
pnpm test:watch   # Testes em modo watch
pnpm lint         # Linting
```

#### Backend
```bash
npm start         # Iniciar servidor
npm test          # Executar testes (quando implementados)
```

### Estrutura de Componentes

```
components/
├── ui/           # Componentes base (Button, Card, etc.)
├── dashboard/    # Componentes do dashboard
├── charts/       # Gráficos e visualizações
├── upload/       # Componentes de upload
├── layout/       # Layout da aplicação
└── common/       # Componentes comuns (Loading, Error, etc.)
```

### Padrões de Código

- **PropTypes**: Validação de props em todos os componentes
- **Hooks**: Uso de hooks customizados para lógica reutilizável
- **Context**: Gerenciamento de estado global via React Context
- **Error Boundaries**: Tratamento de erros em componentes
- **Loading States**: Estados de carregamento consistentes
- **Responsive Design**: Design adaptável a diferentes telas

## 🧪 Testes

### Executar Testes
```bash
cd frontend/app
pnpm test
```

### Cobertura de Testes
```bash
pnpm test:coverage
```

### Tipos de Testes
- **Unitários**: Componentes individuais
- **Integração**: Contexto e serviços
- **E2E**: Fluxos completos (quando implementados)

## 📦 Deploy

### Frontend (Vercel/Netlify)
1. Configure as variáveis de ambiente
2. Conecte o repositório
3. Deploy automático

### Backend (Railway/Render)
1. Configure as variáveis de ambiente
2. Conecte o repositório
3. Deploy automático

### Supabase
1. Execute as migrações
2. Configure as políticas de segurança
3. Configure autenticação (se necessário)

## 🔒 Segurança

- **Row Level Security (RLS)** habilitado em todas as tabelas
- **Políticas de acesso** configuradas
- **Validação de entrada** no backend
- **Sanitização de dados** no frontend
- **CORS** configurado adequadamente

## 📈 Monitoramento

- **Logs**: Console logs estruturados
- **Erros**: Error boundaries e tratamento de exceções
- **Performance**: Lazy loading e code splitting
- **Analytics**: Preparado para integração (Google Analytics, etc.)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Para suporte, abra uma issue no repositório ou entre em contato com a equipe de desenvolvimento.

## 🔄 Changelog

### v1.0.0
- Dashboard interativo
- Upload de Excel
- Análise de defeitos
- Relatórios básicos
- Interface responsiva
- Testes unitários
- Documentação completa

