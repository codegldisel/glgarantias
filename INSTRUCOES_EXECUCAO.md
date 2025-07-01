# 🚀 Instruções de Execução - Sistema GLGarantias

## ⚡ Execução Rápida (Recomendada)

### 1. Clone o projeto
```bash
git clone https://github.com/codegldisel/glgarantias.git
cd glgarantias
```

### 2. Execute o Backend
```bash
cd backend
npm install
npm start
```
✅ Backend rodando em `http://localhost:3000`

### 3. Execute o Frontend (nova aba do terminal)
```bash
cd frontend
npm install -g pnpm
pnpm install
pnpm dev
```
✅ Frontend rodando em `http://localhost:5173`

### 4. Acesse o Sistema
Abra seu navegador em: `http://localhost:5173`

---

## 🔧 Configuração Detalhada

### Pré-requisitos
- **Node.js 20.x** ou superior
- **npm** (vem com Node.js)
- **pnpm** (será instalado automaticamente)

### Verificar Instalação
```bash
node --version  # Deve mostrar v20.x.x ou superior
npm --version   # Deve mostrar 10.x.x ou superior
```

---

## 📁 Estrutura do Projeto

```
glgarantias/
├── backend/           # API Node.js/Express (Porta 3000)
│   ├── src/          # Código fonte
│   ├── .env          # ✅ Já configurado
│   └── package.json
├── frontend/         # Interface React (Porta 5173)
│   ├── src/          # Código fonte
│   ├── .env.development  # ✅ Já configurado
│   └── package.json
└── README.md
```

---

## 🎯 Testando o Sistema

### 1. Verificar Backend
```bash
curl http://localhost:3000
# Deve retornar: {"message":"API de Análise de Garantias funcionando!"}
```

### 2. Verificar Frontend
Acesse `http://localhost:5173` - deve carregar a interface do sistema

### 3. Testar Upload
- Vá para a aba "Upload Excel"
- Faça upload de uma planilha .xlsx
- Verifique se o processamento funciona

---

## 🐛 Solução de Problemas

### Erro: "npm: command not found"
```bash
# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Erro: "Cannot read properties of null"
```bash
# Use pnpm em vez de npm para o frontend
npm install -g pnpm
cd frontend
pnpm install
```

### Erro: "EACCES: permission denied"
```bash
# Instalar pnpm com sudo
sudo npm install -g pnpm
```

### Backend não conecta com Supabase
- Verifique se o arquivo `.env` existe em `backend/`
- As credenciais já estão configuradas automaticamente

### Frontend não conecta com Backend
- Verifique se o backend está rodando na porta 3000
- O arquivo `.env.development` já está configurado

---

## 🔄 Comandos Úteis

### Backend
```bash
cd backend
npm start          # Iniciar servidor
npm run dev        # Modo desenvolvimento (com nodemon)
npm run test-supabase  # Testar conexão com banco
```

### Frontend
```bash
cd frontend
pnpm dev           # Modo desenvolvimento
pnpm build         # Build para produção
pnpm preview       # Preview do build
```

---

## 📊 Funcionalidades Disponíveis

### ✅ Implementadas
- Dashboard com estatísticas
- Upload de planilhas Excel
- Classificação automática de defeitos
- Tabela de ordens de serviço
- Filtros avançados
- Gráficos interativos

### 🔄 Em Desenvolvimento
- Relatórios em PDF
- Análises temporais
- Sistema de autenticação
- Deploy em produção

---

## 🎯 Próximos Passos

1. **Teste com dados reais**: Faça upload de planilhas reais
2. **Explore as funcionalidades**: Dashboard, filtros, gráficos
3. **Feedback**: Identifique melhorias necessárias
4. **Customização**: Ajuste conforme suas necessidades

---

## 📞 Suporte

- **Documentação**: README.md
- **Código**: Totalmente comentado e organizado
- **Estrutura**: Seguindo padrões empresariais

**Sistema pronto para uso! 🚀**

