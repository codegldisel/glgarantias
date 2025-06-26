require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const multer = require("multer");
const xlsx = require("xlsx");
const fs = require("fs");

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

// Configuração do Multer para upload de arquivos (apenas .xlsx, limite de 5MB)
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
      cb(null, true);
    } else {
      cb(new Error("Apenas arquivos .xlsx são permitidos."));
    }
  },
});

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
      return res.status(400).json({ error: "Nenhum arquivo enviado ou tipo inválido." });
    }

    // Verifica extensão do arquivo
    if (!req.file.originalname.endsWith('.xlsx')) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "Apenas arquivos .xlsx são permitidos." });
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    let data = xlsx.utils.sheet_to_json(sheet);

    // Normaliza nomes de colunas para evitar problemas de acentuação/maiúsculas
    data = data.map(row => {
      const normalized = {};
      Object.keys(row).forEach(key => {
        const normKey = key.normalize("NFD").replace(/\p{Diacritic}/gu, "").toUpperCase().replace(/\s+/g, "_");
        normalized[normKey] = row[key];
      });
      return normalized;
    });

    // Lógica para filtrar OS de garantia e inserir em temp_import_access
    const garantiaOS = data.filter(row => {
      const tipoOS = row["TIPO_OS"] || row["NORDEN_OSV"] || "";
      const observacoes = row["OBSERVACOES"] || "";
      const defeito = row["DEFEITO"] || "";
      const isGarantia =
        (typeof tipoOS === 'string' && (tipoOS.includes("G") || tipoOS.includes("GO") || tipoOS.includes("GU"))) ||
        (typeof observacoes === 'string' && observacoes.toLowerCase().includes("garantia")) ||
        (typeof defeito === 'string' && defeito.toLowerCase().includes("garantia"));
      return isGarantia;
    });

    if (garantiaOS.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "Nenhuma OS de garantia encontrada no arquivo." });
    }

    // Inserir dados filtrados na tabela temp_import_access
    const { error } = await supabase.from("temp_import_access").insert(garantiaOS);

    // Remove arquivo temporário
    fs.unlinkSync(req.file.path);

    if (error) {
      return res.status(500).json({ error: "Erro ao processar e salvar dados: " + error.message });
    }

    res.status(200).json({ message: "Arquivo processado e dados inseridos com sucesso!", count: garantiaOS.length });
  } catch (error) {
    // Remove arquivo temporário se existir
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: error.message || "Erro interno do servidor." });
  }
});

// Endpoint para leitura dos dados temporários
app.get("/temp-import-access", async (req, res) => {
  try {
    const { data, error } = await supabase.from("temp_import_access").select("*");
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error("Erro ao buscar dados temporários:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});



