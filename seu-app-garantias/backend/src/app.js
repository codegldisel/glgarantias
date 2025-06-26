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

// Nova rota para upload de arquivo Excel
app.post("/upload-excel", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado ou tipo inválido." });
    }

    // Verifica extensão do arquivo
    if (!req.file.originalname.endsWith(".xlsx")) {
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
      const tipoOS = row["TIPO_OS"] || row["NORDEM_OSV"] || "";
      const observacoes = row["OBSERVACOES"] || "";
      const defeito = row["DEFEITO"] || "";
      const isGarantia =
        (typeof tipoOS === "string" && (tipoOS.includes("G") || tipoOS.includes("GO") || tipoOS.includes("GU"))) ||
        (typeof observacoes === "string" && observacoes.toLowerCase().includes("garantia")) ||
        (typeof defeito === "string" && defeito.toLowerCase().includes("garantia"));
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

// Nova rota para processar dados da temp_import_access e mover para ordens_servico
app.post("/process-data", async (req, res) => {
  try {
    // 1. Ler dados da temp_import_access
    const { data: tempData, error: tempError } = await supabase
      .from("temp_import_access")
      .select("*");

    if (tempError) throw tempError;

    const processedData = [];
    const unmappedDefects = new Set();

    // Buscar todos os mapeamentos de defeitos uma vez para otimizar
    const { data: mappingData, error: mappingError } = await supabase
      .from("mapeamento_defeitos")
      .select("descricao_original, grupo_id, subgrupo_id, subsubgrupo_id");

    if (mappingError) throw mappingError;

    const defectMap = new Map();
    mappingData.forEach(m => defectMap.set(m.descricao_original.toLowerCase(), m));

    for (const row of tempData) {
      let grupo_defeito_id = null;
      let subgrupo_defeito_id = null;
      let subsubgrupo_defeito_id = null;

      const originalDefect = row["DEFEITO"] ? String(row["DEFEITO"]).toLowerCase() : null;

      if (originalDefect && defectMap.has(originalDefect)) {
        const mapped = defectMap.get(originalDefect);
        grupo_defeito_id = mapped.grupo_id;
        subgrupo_defeito_id = mapped.subgrupo_id;
        subsubgrupo_defeito_id = mapped.subsubgrupo_defeito_id;
      } else if (originalDefect) {
        unmappedDefects.add(originalDefect);
      }

      // Preparar dados para inserção em ordens_servico
      processedData.push({
        data_os: row["DATA_OS"] || null,
        numero_os: row["NUMERO_OS"] || row["NORDEM_OSV"] || null,
        fabricante: row["FABRICANTE"] || null,
        motor: row["MOTOR"] || null,
        modelo: row["MODELO"] || null,
        observacoes: row["OBSERVACOES"] || null,
        defeito: row["DEFEITO"] || null,
        mecanico_montador: row["MECANICO_MONTADOR"] || null,
        cliente: row["CLIENTE"] || null,
        total_pecas: row["TOTAL_PECAS"] || 0,
        total_servicos: row["TOTAL_SERVICOS"] || 0,
        total_geral: row["TOTAL_GERAL"] || 0,
        tipo_os: row["TIPO_OS"] || row["NORDEM_OSV"] || null, // Usar a lógica de filtragem anterior
        grupo_defeito_id: grupo_defeito_id,
        subgrupo_defeito_id: subgrupo_defeito_id,
        subsubgrupo_defeito_id: subsubgrupo_defeito_id,
      });
    }

    // 2. Inserir/atualizar dados na tabela ordens_servico usando upsert
    const { error: upsertError } = await supabase
      .from("ordens_servico")
      .upsert(processedData, { onConflict: "numero_os" }); // Assumindo "numero_os" como chave de conflito

    if (upsertError) throw upsertError;

    // 3. Limpar temp_import_access após o processamento
    const { error: deleteError } = await supabase
      .from("temp_import_access")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Deleta tudo, exceto um ID fictício para evitar erro de delete sem where

    if (deleteError) console.error("Erro ao limpar temp_import_access:", deleteError.message);

    res.status(200).json({
      message: "Dados processados e movidos para ordens_servico com sucesso!",
      count: processedData.length,
      unmappedDefects: Array.from(unmappedDefects),
    });
  } catch (error) {
    console.error("Erro no processamento de dados:", error.message);
    res.status(500).json({ error: error.message || "Erro interno do servidor." });
  }
});

// 1. Buscar ordens de serviço com filtros e paginação
app.get("/api/ordens-servico", async (req, res) => {
  try {
    const { tipo_os, mecanico, cliente, data_inicio, data_fim, limit = 20, offset = 0 } = req.query;
    let query = supabase.from("ordens_servico").select("*", { count: "exact" });
    if (tipo_os) query = query.ilike("tipo_os", `%${tipo_os}%`);
    if (mecanico) query = query.ilike("mecanico_montador", `%${mecanico}%`);
    if (cliente) query = query.ilike("cliente", `%${cliente}%`);
    if (data_inicio) query = query.gte("data_os", data_inicio);
    if (data_fim) query = query.lte("data_os", data_fim);
    query = query.range(Number(offset), Number(offset) + Number(limit) - 1);
    const { data, error, count } = await query;
    if (error) throw error;
    res.status(200).json({ data, count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Buscar grupos de defeito
app.get("/api/grupos-defeito", async (req, res) => {
  try {
    const { data, error } = await supabase.from("grupos_defeito").select("*");
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Buscar subgrupos de defeito
app.get("/api/subgrupos-defeito", async (req, res) => {
  try {
    const { grupo_id } = req.query;
    let query = supabase.from("subgrupos_defeito").select("*");
    if (grupo_id) query = query.eq("grupo_id", grupo_id);
    const { data, error } = await query;
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Buscar subsubgrupos de defeito
app.get("/api/subsubgrupos-defeito", async (req, res) => {
  try {
    const { subgrupo_id } = req.query;
    let query = supabase.from("subsubgrupos_defeito").select("*");
    if (subgrupo_id) query = query.eq("subgrupo_id", subgrupo_id);
    const { data, error } = await query;
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Buscar mapeamento de defeitos
app.get("/api/mapeamento-defeitos", async (req, res) => {
  try {
    const { data, error } = await supabase.from("mapeamento_defeitos").select("*");
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Salvar defeitos não mapeados em uma tabela específica
// (Assume que existe tabela defeitos_nao_mapeados com campo descricao)
app.post("/api/defeitos-nao-mapeados", async (req, res) => {
  try {
    const { defeitos } = req.body;
    if (!Array.isArray(defeitos) || defeitos.length === 0) {
      return res.status(400).json({ error: "Envie um array de defeitos não mapeados." });
    }
    // Remove duplicados
    const uniqueDefeitos = [...new Set(defeitos.map(d => String(d).toLowerCase().trim()))];
    // Insere defeitos não mapeados
    const inserts = uniqueDefeitos.map(descricao => ({ descricao }));
    const { error } = await supabase.from("defeitos_nao_mapeados").upsert(inserts, { onConflict: "descricao" });
    if (error) throw error;
    res.status(200).json({ message: "Defeitos não mapeados salvos com sucesso!", coun// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});


