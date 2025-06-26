require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const multer = require("multer");
const xlsx = require("xlsx");

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

// Configuração do Multer para upload de arquivos
const upload = multer({ dest: "uploads/" });

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

// Nova rota para upload de arquivo Excel
app.post("/upload-excel", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado." });
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    // Lógica para filtrar OS de garantia e inserir em temp_import_access
    const garantiaOS = data.filter(row => {
      // Adapte esta lógica conforme as colunas reais do seu Excel
      const tipoOS = row["Tipo OS"] || row["NOrdem_OSv"] || ""; // Exemplo de coluna para tipo de OS
      const observacoes = row["OBSERVAÇÕES"] || "";
      const defeito = row["DEFEITO"] || "";

      const isGarantia = tipoOS.includes("G") || tipoOS.includes("GO") || tipoOS.includes("GU") ||
                         observacoes.includes("garantia") || defeito.includes("garantia");
      return isGarantia;
    });

    // Inserir dados filtrados na tabela temp_import_access
    const { error } = await supabase.from("temp_import_access").insert(garantiaOS);

    if (error) {
      console.error("Erro ao inserir dados no Supabase:", error.message);
      return res.status(500).json({ error: "Erro ao processar e salvar dados." });
    }

    res.status(200).json({ message: "Arquivo processado e dados inseridos com sucesso!", count: garantiaOS.length });
  } catch (error) {
    console.error("Erro no upload do Excel:", error.message);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});



