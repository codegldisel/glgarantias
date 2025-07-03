# Sistema de Análise de Garantias de Motores

Sistema completo para análise e gestão de garantias de motores, incluindo dashboard, upload de planilhas, classificação automática de defeitos e relatórios.

## 🚀 Tecnologias

- **Frontend**: React + Vite + Tailwind CSS + Shadcn/ui
- **Backend**: Node.js + Express
- **Banco de Dados**: Supabase (PostgreSQL)
- **Processamento**: NLP para classificação de defeitos

## 📁 Estrutura do Projeto

```
projeto-gl/
├── glgarantias/
│   ├── backend/          # API Node.js
│   │   ├── src/
│   │   │   ├── routes/   # Rotas da API
│   │   │   ├── services/ # Serviços (Excel, NLP)
│   │   │   └── config/   # Configurações
│   │   └── database/     # Schema do banco
│   └── frontend/         # Aplicação React
│       ├── src/
│       │   ├── components/ # Componentes React
│       │   └── hooks/      # Hooks customizados
│       └── public/
├── HISTORICO_PROBLEMAS_DADOS.md # Diagnóstico de problemas
└── README.md
```

## 🛠️ Instalação

### Backend
```bash
cd glgarantias/backend
npm install
npm start
```

### Frontend
```bash
cd glgarantias/frontend
npm install
npm run dev
```

## 📊 Funcionalidades

- **Dashboard**: Visualização de estatísticas e dados por mês
- **Upload de Planilhas**: Importação de dados Excel
- **Classificação Automática**: NLP para categorizar defeitos
- **Relatórios**: Análises e exportações
- **Filtros**: Por mês, ano, status, mecânico, etc.

## 🔧 Configuração

1. Configure as variáveis de ambiente no backend (`.env`)
2. Configure o Supabase no frontend
3. Execute o schema do banco de dados

## 📝 Documentação

- [Histórico de Problemas de Dados](HISTORICO_PROBLEMAS_DADOS.md) - Diagnóstico completo dos problemas encontrados e recomendações para reestruturação

## 🚨 Problemas Conhecidos

Veja o documento [HISTORICO_PROBLEMAS_DADOS.md](HISTORICO_PROBLEMAS_DADOS.md) para um diagnóstico completo dos problemas de dados, backend e banco de dados, incluindo:

- Campos de data inconsistentes
- Status de garantia variados
- Limitações de consulta do Supabase
- Soluções temporárias implementadas
- Recomendações para reestruturação definitiva

## 📄 Licença

Este projeto é privado e confidencial. 