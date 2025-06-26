require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Erro: Variáveis de ambiente do Supabase não configuradas.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Middlewares
app.use(cors()); // Habilita CORS para todas as rotas
app.use(express.json()); // Habilita o parsing de JSON no corpo das requisições

// Rota de teste
app.get("/", (req, res) => {
  res.send("Backend do App de Garantias está funcionando!");
});

// Exemplo de rota para buscar dados (apenas para teste inicial)
app.get("/ordens-servico", async (req, res) => {
  try {
    const { data, error } = await supabase.from("ordens_servico").select("*");
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error("Erro ao buscar ordens de serviço:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});


