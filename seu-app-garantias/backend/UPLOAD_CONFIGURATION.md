# Configuração de Upload de Arquivos Excel

Este documento descreve as configurações implementadas para resolver problemas de upload de arquivos Excel no App de Garantias.

## Configurações Implementadas

### 1. Backend (Node.js + Express + Multer)

#### Configuração do Multer
- **Limite de tamanho**: 15MB (aumentado de 100MB para um valor mais realista)
- **Tipos de arquivo aceitos**: `.xlsx` e `.xls`
- **MIME types aceitos**:
  - `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` (.xlsx)
  - `application/vnd.ms-excel` (.xls)
- **Storage personalizado**: Arquivos salvos com nomes únicos na pasta `uploads/`
- **Limite de arquivos**: 1 arquivo por upload

#### Rotas de Upload
1. **`POST /api/upload-excel`** (Nova rota recomendada)
   - Campo: `excel`
   - Resposta padronizada com `success: true/false`

2. **`POST /upload-excel`** (Rota original mantida para compatibilidade)
   - Campo: `file`
   - Processamento completo dos dados

#### Tratamento de Erros
- **LIMIT_FILE_SIZE**: Arquivo muito grande (> 15MB)
- **LIMIT_FILE_COUNT**: Muitos arquivos enviados
- **LIMIT_UNEXPECTED_FILE**: Campo de arquivo inválido
- **Tipo de arquivo inválido**: Apenas Excel aceito

### 2. Frontend (React)

#### Componente DragDropUpload
- **Tipos aceitos**: `.xlsx` e `.xls`
- **Limite de tamanho**: 15MB
- **Validação client-side**: Verifica tipo e tamanho antes do upload

#### Serviço de API
- **Método `uploadExcel()`**: Usa a nova rota `/api/upload-excel`
- **Campo de arquivo**: `excel` (conforme recomendado)
- **Método `uploadExcelLegacy()`**: Mantido para compatibilidade

### 3. Configuração NGINX (Produção)

Arquivo `nginx.conf` incluído com:
- **`client_max_body_size 20M`**: Limite de 20MB
- **Timeouts aumentados**: 120s para uploads
- **Configurações específicas** para rotas de upload

## Como Usar

### 1. Desenvolvimento Local

```bash
# Backend
cd seu-app-garantias/backend
npm start

# Frontend
cd seu-app-garantias/frontend/app
npm run dev
```

### 2. Teste de Upload

1. Acesse a página de upload no frontend
2. Selecione um arquivo Excel (.xlsx ou .xls)
3. O arquivo deve ter no máximo 15MB
4. Clique em "Fazer Upload"

### 3. Verificação de Limites

```bash
# Teste a configuração do backend
curl http://localhost:3000/test-limits
```

Resposta esperada:
```json
{
  "maxFileSize": "15MB configurado",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Solução de Problemas

### Erro "File too large"
1. Verifique se o arquivo tem menos de 15MB
2. Confirme que o backend está rodando com as novas configurações
3. Se usando NGINX, verifique `client_max_body_size`

### Erro "Tipo de arquivo inválido"
1. Certifique-se de que o arquivo é .xlsx ou .xls
2. Verifique se o arquivo não está corrompido

### Erro de conexão
1. Verifique se o backend está rodando na porta 3000
2. Confirme que não há firewall bloqueando a conexão

## Configurações de Produção

### 1. NGINX
Copie o arquivo `nginx.conf` para `/etc/nginx/sites-available/garantias` e:
```bash
sudo ln -s /etc/nginx/sites-available/garantias /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 2. Variáveis de Ambiente
Certifique-se de que as variáveis do Supabase estão configuradas:
```bash
SUPABASE_URL=sua_url_do_supabase
SUPABASE_ANON_KEY=sua_chave_anonima
```

### 3. Pasta de Uploads
Certifique-se de que a pasta `uploads/` existe e tem permissões corretas:
```bash
mkdir -p uploads
chmod 755 uploads
```

## Logs e Monitoramento

### Backend
Os logs incluem:
- Arquivo recebido e MIME type
- Número de linhas lidas do Excel
- OSs de garantia encontradas
- Erros de processamento

### Frontend
O componente `UploadProgress` mostra:
- Status do upload (uploading, processing, success, error)
- Progresso em tempo real
- Resultados detalhados
- Erros específicos

## Melhorias Futuras

1. **Compressão de arquivos**: Implementar compressão automática
2. **Upload em chunks**: Para arquivos muito grandes
3. **Validação avançada**: Verificar estrutura do Excel antes do processamento
4. **Retry automático**: Em caso de falhas de rede
5. **Progresso mais detalhado**: Mostrar etapas do processamento 