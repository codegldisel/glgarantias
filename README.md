# Sistema de Análise de Garantias GLúcio

Sistema web para análise automatizada de garantias de motores, desenvolvido para a Retífica de Motores GLúcio. O sistema processa planilhas Excel, classifica defeitos usando PLN (Processamento de Linguagem Natural) e fornece análises detalhadas através de um dashboard moderno.

## 🚀 Solução Definitiva Implementada (URLs Permanentes)

Para resolver os problemas recorrentes de conexão e dependência do ambiente de sandbox, foi implementada uma solução de deploy permanente com URLs fixas. Isso garante que a aplicação esteja sempre acessível e funcional, sem a necessidade de reconfigurações manuais a cada nova sessão.

### URLs de Acesso

- **Aplicação Principal (Frontend)**: `https://qzurdhes.manus.space`
- **API Backend**: `https://3dhkilcq1oxv.manus.space`

### Arquitetura da Solução

A arquitetura atualizada do sistema é a seguinte:

```
Frontend (React) → Backend (Flask com Integração Supabase)
     ↓                      ↓
URLs Permanentes      Comunicação Direta com Supabase
```

O backend Flask agora integra diretamente a lógica de comunicação com o Supabase, eliminando a necessidade de um servidor Node.js separado e um proxy. Todas as rotas de API foram reescritas em Python para interagir diretamente com o Supabase.

### Benefícios da Solução

- **Persistência**: As URLs não mudam entre sessões.
- **Independência**: Não depende de configuração manual do sandbox.
- **Simplificação**: Arquitetura mais simples, com menos componentes.
- **Compatibilidade**: Mantém toda a lógica de negócio original, agora em Python.
- **Estabilidade**: Elimina problemas de comunicação entre Node.js e Flask.

## 🏗️ Arquitetura e Componentes

### Backend (Flask)

O backend é responsável por:
- Receber e processar dados.
- Interagir diretamente com o banco de dados Supabase.
- Fornecer endpoints para o frontend.

**Estrutura:**
```
backend/
├── src/
│   └── main.py             # Aplicação Flask principal com lógica Supabase
├── .env                    # Variáveis de ambiente (credenciais Supabase)
└── requirements.txt        # Dependências Python (Flask, Flask-CORS, requests)
```

### Frontend (React + Vite)

O frontend é a interface do usuário, construída com React e Vite, e se comunica com o backend para exibir os dados.

**Estrutura:**
```
frontend/
├── src/
│   ├── App.jsx             # Componente principal
│   ├── components/         # Componentes reutilizáveis (Dashboard, UploadPage, etc.)
│   └── main.jsx
├── .env.production         # Configurações de ambiente para produção (URL da API)
└── package.json
```

## 🔧 Funcionalidades Principais

- **API RESTful**: Rotas organizadas para acesso aos dados.
- **Upload de arquivos**: Processamento de planilhas Excel.
- **Integração com Supabase**: Banco de dados PostgreSQL na nuvem.
- **Classificação automática de defeitos**: Utiliza PLN para categorizar defeitos.
- **Dashboard Interativo**: Exibe estatísticas e gráficos (KPIs, tendências, distribuição).
- **Interface Responsiva**: Design moderno com Tailwind CSS e shadcn/ui.
- **Navegação**: Sidebar com opções para Dashboard, Ordens de Serviço, Upload Excel, Análises, Defeitos, Mecânicos e Relatórios.

## 📊 Sistema de Classificação de Defeitos (PLN)

O sistema classifica os defeitos em grupos hierárquicos, utilizando palavras-chave e um índice de confiança. Exemplos de grupos:

- **Vazamentos** (Óleo, Água, Combustível)
- **Problemas de Funcionamento** (Superaquecimento, Perda de Potência)
- **Ruídos e Vibrações** (Mancal, Biela)
- **Quebra/Dano Estrutural**
- **Problemas de Combustão**
- **Desgaste e Folga**
- **Problemas de Lubrificação**
- **Erros de Montagem**

## 🗄️ Estrutura do Banco de Dados (Supabase)

### Tabela: `ordens_servico`
Armazena os detalhes das ordens de serviço, incluindo dados do Excel e classificações de PLN.

**Colunas Cruciais Mapeadas:**
- `numero_ordem`
- `data_ordem`
- `status` (Garantia, Garantia de Oficina, Garantia de Usinagem)
- `defeito_texto_bruto`
- `defeito_grupo`, `defeito_subgrupo`, `defeito_subsubgrupo`
- `classificacao_confianca`
- `mecanico_responsavel`
- `modelo_motor`, `fabricante_motor`
- `dia_servico`, `mes_servico`, `ano_servico`
- `total_pecas`, `total_servico`, `total_geral`

### Tabela: `uploads`
Registra informações sobre os arquivos Excel processados.

## 📋 Como Executar e Desenvolver

### Pré-requisitos
- **Node.js** (para `pnpm`)
- **Python 3.x** (para Flask)
- **pnpm** (gerenciador de pacotes Node.js)

### Execução Rápida (URLs Permanentes)

Simplesmente acesse as URLs fornecidas na seção "URLs de Acesso". A aplicação já está deployada e funcional.

### Para Desenvolvimento Local

1. **Clone o projeto:**
   ```bash
   git clone https://github.com/codegldisel/glgarantias.git
   cd glgarantias
   ```

2. **Configurar Backend (Flask):**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   # Para rodar localmente (apenas para desenvolvimento):
   flask run
   ```
   *Nota: O backend localmente não iniciará o servidor Node.js. Ele espera que o Node.js esteja rodando separadamente na porta 3000 se você quiser usar a lógica original do Node.js. No entanto, a versão deployada do Flask já integra a lógica do Supabase diretamente.* 

3. **Configurar Frontend (React):**
   ```bash
   cd frontend
   npm install -g pnpm # Se ainda não tiver o pnpm
   pnpm install
   pnpm dev
   ```
   Acesse `http://localhost:5173` no seu navegador.

## 🐛 Solução de Problemas Comuns

### Erro de Conexão (502 Bad Gateway, Erro ao carregar dados)

Este problema foi resolvido com o deploy permanente da aplicação. Se você estiver usando as URLs permanentes e ainda vir um erro de conexão, pode ser um problema temporário de rede ou no serviço de deploy. Tente novamente após alguns minutos.

### Carregamento Visual (Skeleton Loading Persistente)

Se o dashboard ou outras abas mostrarem apenas o "skeleton loading" (barras cinzas) e não os dados, mesmo com o backend funcionando, é provável que um **bloqueador de anúncios ou extensão do navegador** esteja impedindo o carregamento de recursos. Para resolver:

1. **Desative** temporariamente bloqueadores de anúncios/extensões para `https://qzurdhes.manus.space`.
2. **Acesse** a aplicação em uma aba anônima/privada do seu navegador.
3. **Use** um navegador diferente que não possua extensões de bloqueio ativas.

O backend está retornando os dados corretamente, o problema é apenas visual no lado do cliente.

## 🎉 Status Atual

✅ **Frontend**: Deployado e acessível via URL permanente.
✅ **Backend**: Deployado com integração direta ao Supabase e acessível via URL permanente.
✅ **Dados do Supabase**: Conectados e funcionando, retornando dados corretamente.
✅ **URLs Permanentes**: Garantem acesso contínuo e estável à aplicação.

O sistema está pronto para uso e oferece uma experiência completa de análise de garantias com interface moderna e funcionalidades avançadas. As soluções implementadas visam a estabilidade e a facilidade de acesso para futuras interações.

## 🤝 Contribuição

Este projeto foi desenvolvido em colaboração entre o usuário e a IA Manus, seguindo as melhores práticas de desenvolvimento de software empresarial.

## 📞 Suporte

Para dúvidas ou suporte, consulte a documentação do código ou entre em contato com a equipe de desenvolvimento.


