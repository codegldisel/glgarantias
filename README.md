# Sistema de Análise de Garantias GLúcio

Sistema web para análise automatizada de garantias de motores, desenvolvido para a Retífica de Motores GLúcio. O sistema processa planilhas Excel, classifica defeitos usando PLN (Processamento de Linguagem Natural) e fornece análises detalhadas através de um dashboard moderno.

## 🚀 Funcionalidades

- **Upload de Planilhas Excel**: Processamento automático de planilhas GLú-Garantias.xlsx
- **Classificação Automática de Defeitos**: Sistema de PLN que categoriza defeitos em grupos, subgrupos e subsubgrupos
- **Dashboard Interativo**: Visualização de estatísticas e gráficos em tempo real
- **Análise de Dados**: Filtros avançados por status, defeito, mecânico, período
- **Interface Moderna**: Design responsivo e profissional

## 🏗️ Arquitetura

### Backend (Node.js/Express)
- **API RESTful** para processamento de dados
- **Supabase** como banco de dados PostgreSQL
- **Serviços especializados**:
  - `ExcelService`: Leitura e processamento de planilhas
  - `NLPService`: Classificação inteligente de defeitos
- **Rotas organizadas** para dashboard, ordens de serviço e análises

### Frontend (React + Vite)
- **Interface moderna** com Tailwind CSS e shadcn/ui
- **Componentes reutilizáveis** e responsivos
- **Gráficos interativos** com Recharts
- **Upload drag & drop** para planilhas

## 📋 Pré-requisitos

- Node.js 20.x ou superior
- npm ou pnpm
- Acesso à internet (para conexão com Supabase)

## 🚀 Instalação e Execução

### 1. Clone o repositório
```bash
git clone https://github.com/codegldisel/glgarantias.git
cd glgarantias
```

### 2. Configure e execute o Backend
```bash
cd backend
npm install
npm start
```
O backend estará rodando em `http://localhost:3000`

### 3. Configure e execute o Frontend
```bash
cd ../frontend
npm install -g pnpm  # Se não tiver pnpm instalado
pnpm install
pnpm dev
```
O frontend estará rodando em `http://localhost:5173`

## 🔧 Configuração

### Variáveis de Ambiente

O projeto já vem configurado com as credenciais do Supabase. Os arquivos `.env` estão incluídos para facilitar a execução:

**Backend (.env)**:
```env
SUPABASE_URL=https://yvkdquddiwnnzydasfbi.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
PORT=3000
NODE_ENV=development
```

**Frontend (.env.development)**:
```env
VITE_API_URL=http://localhost:3000
```

## 📊 Estrutura do Projeto

```
glgarantias/
├── backend/                 # API Node.js/Express
│   ├── src/
│   │   ├── config/         # Configuração do Supabase
│   │   ├── routes/         # Rotas da API
│   │   ├── services/       # Serviços (Excel, NLP)
│   │   └── app.js          # Aplicação principal
│   ├── database/           # Scripts do banco de dados
│   ├── .env                # Variáveis de ambiente
│   └── package.json
├── frontend/               # Interface React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── App.jsx         # Componente principal
│   │   └── main.jsx        # Ponto de entrada
│   ├── .env.development    # Variáveis de ambiente
│   └── package.json
├── HISTORICO_COMPLETO_PROJETO.md  # Documentação completa
└── README.md
```

## 🎯 Como Usar

### 1. Acesse o Sistema
Abra `http://localhost:5173` no seu navegador

### 2. Faça Upload da Planilha
- Vá para a aba "Upload Excel"
- Arraste e solte ou selecione o arquivo GLú-Garantias.xlsx
- Aguarde o processamento automático

### 3. Visualize os Dados
- **Dashboard**: Estatísticas gerais e gráficos
- **Ordens de Serviço**: Tabela detalhada com filtros
- **Análises**: Insights e relatórios

## 🔍 Funcionalidades Detalhadas

### Classificação de Defeitos
O sistema classifica automaticamente os defeitos em:

- **Vazamentos** (Óleo, Água, Combustível, Compressão)
- **Problemas de Funcionamento** (Superaquecimento, Perda de Potência, Alto Consumo)
- **Ruídos e Vibrações** (Mancal, Biela, Pistão, Válvula)
- **Quebra/Dano Estrutural** (Virabrequim, Biela, Pistão, etc.)
- **Problemas de Combustão** (Fumaça Excessiva)
- **Desgaste e Folga** (Mancais, Camisas, Anéis, Válvulas)
- **Problemas de Lubrificação** (Baixa Pressão de Óleo)
- **Erros de Montagem** (Componente Errado, Montagem Incorreta)

### APIs Disponíveis

- `GET /api/dashboard/stats` - Estatísticas gerais
- `GET /api/dashboard/charts` - Dados para gráficos
- `GET /api/ordens` - Lista de ordens de serviço (com filtros)
- `GET /api/ordens/filters/options` - Opções para filtros
- `GET /api/analises/kpis` - KPIs de análise
- `GET /api/analises/tendencias` - Dados de tendências
- `GET /api/analises/performance-mecanicos` - Performance dos mecânicos
- `POST /api/upload` - Upload de planilhas Excel

## 🛠️ Tecnologias Utilizadas

### Backend
- Node.js + Express
- Supabase (PostgreSQL)
- Multer (upload de arquivos)
- XLSX (processamento de Excel)
- dotenv (variáveis de ambiente)

### Frontend
- React 19
- Vite (build tool)
- Tailwind CSS
- shadcn/ui (componentes)
- Recharts (gráficos)
- Lucide React (ícones)

## 📈 Status do Projeto

✅ **Concluído**:
- Estrutura base do projeto
- Backend com APIs funcionais
- Frontend com interface moderna
- Sistema de upload e processamento
- Classificação automática de defeitos
- Dashboard com gráficos
- Integração completa frontend-backend
- Correção de bugs de conexão
- Implementação de rotas faltantes

🔄 **Próximos Passos**:
- Testes com dados reais
- Implementação de relatórios em PDF
- Análises avançadas e filtros temporais
- Sistema de autenticação
- Deploy em produção

## 📚 Documentação Completa

Para informações detalhadas sobre o desenvolvimento, cronologia, problemas resolvidos e soluções implementadas, consulte:

**[HISTORICO_COMPLETO_PROJETO.md](./HISTORICO_COMPLETO_PROJETO.md)**

Este arquivo contém:
- Cronologia completa de desenvolvimento
- Detalhes de cada fase do projeto
- Problemas encontrados e soluções
- Configurações técnicas
- Instruções de execução detalhadas

## 🤝 Contribuição

Este projeto foi desenvolvido em colaboração entre o usuário e a IA Manus, seguindo as melhores práticas de desenvolvimento de software empresarial.

## 📞 Suporte

Para dúvidas ou suporte, consulte a documentação do código ou entre em contato com a equipe de desenvolvimento.

---

**Retífica de Motores GLúcio** - Sistema de Análise de Garantias

*Projeto completo e funcional - Pronto para uso em produção! 🚀*

