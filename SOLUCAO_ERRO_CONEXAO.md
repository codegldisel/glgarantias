# 🔧 Solução para Erro de Conexão Backend

## 🚨 Problema Identificado
O erro "Erro de conexão - Erro ao carregar dados. Verifique se o backend está rodando" indica que o frontend não consegue se comunicar com o backend.

## ✅ Soluções Implementadas

### 1. **CORS Configurado Corretamente**
- Backend agora aceita requisições de qualquer origem
- Headers configurados adequadamente
- Métodos HTTP permitidos: GET, POST, PUT, DELETE, OPTIONS

### 2. **Múltiplos Arquivos .env**
Criados arquivos de ambiente para garantir que a URL da API seja encontrada:
- `.env` (principal)
- `.env.local` (local)
- `.env.development` (desenvolvimento)

### 3. **Debug Melhorado**
- Logs detalhados no console do navegador
- Mensagens de erro mais específicas
- Verificação de status HTTP

## 🔍 Como Diagnosticar

### 1. **Verificar se o Backend está Rodando**
```bash
# No terminal do backend
cd backend
npm start

# Deve mostrar: "Servidor rodando na porta 3000"
```

### 2. **Testar API Diretamente**
```bash
# Teste básico
curl http://localhost:3000

# Teste das rotas específicas
curl http://localhost:3000/api/dashboard/stats
curl http://localhost:3000/api/dashboard/charts
```

### 3. **Verificar Console do Navegador**
- Abra F12 → Console
- Procure por mensagens como:
  - "Tentando conectar com API em: http://localhost:3000"
  - "Dados de estatísticas recebidos: {...}"
  - Ou erros de rede/CORS

## 🛠️ Passos para Resolver

### **Opção 1: Reiniciar Tudo**
```bash
# 1. Parar todos os processos (Ctrl+C)

# 2. Reiniciar Backend
cd backend
npm start

# 3. Reiniciar Frontend (nova aba)
cd frontend
pnpm dev

# 4. Aguardar 30 segundos e testar
```

### **Opção 2: Verificar Portas**
```bash
# Verificar se a porta 3000 está em uso
netstat -tulpn | grep :3000

# Se estiver ocupada, matar o processo
sudo kill -9 <PID>
```

### **Opção 3: Usar Porta Diferente**
```bash
# Backend em porta diferente
cd backend
PORT=3001 npm start

# Atualizar frontend/.env
VITE_API_URL=http://localhost:3001
```

## 🔧 Configurações Aplicadas

### **Backend (app.js)**
```javascript
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### **Frontend (.env)**
```env
VITE_API_URL=http://localhost:3000
```

### **Frontend (Dashboard.jsx)**
- Logs detalhados adicionados
- Tratamento de erro melhorado
- Headers explícitos nas requisições

## 📋 Checklist de Verificação

- [ ] Backend rodando na porta 3000
- [ ] Frontend rodando na porta 5173
- [ ] Arquivo `.env` existe no frontend
- [ ] Console do navegador sem erros de CORS
- [ ] Teste `curl http://localhost:3000` funciona
- [ ] Teste `curl http://localhost:3000/api/dashboard/stats` retorna dados

## 🆘 Se Ainda Não Funcionar

1. **Verificar Firewall/Antivírus**
   - Pode estar bloqueando conexões localhost

2. **Tentar IP Explícito**
   ```env
   VITE_API_URL=http://127.0.0.1:3000
   ```

3. **Verificar Versão do Node.js**
   ```bash
   node --version  # Deve ser 20.x ou superior
   ```

4. **Limpar Cache do Navegador**
   - Ctrl+Shift+R (hard refresh)
   - Ou abrir em aba anônima

## 📞 Suporte
Se o problema persistir, verifique:
- Logs do terminal do backend
- Console do navegador (F12)
- Configurações de rede local

**O sistema está configurado para funcionar automaticamente! 🚀**

