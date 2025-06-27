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
app.use(express.json({ limit: '100mb' })); // Habilita o parsing de JSON no corpo das requisições
app.use(express.urlencoded({ limit: '100mb', extended: true })); // Habilita o parsing de URL-encoded no corpo das requisições

// Configuração do Multer para upload de arquivos (apenas .xlsx, limite de 100MB)
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
    fieldSize: 100 * 1024 * 1024,
    fields: 50,
    files: 10
  },
  fileFilter: (req, file, cb) => {
    // Aceitar tanto por extensão quanto por MIME type
    const isXlsx = file.originalname.toLowerCase().endsWith('.xlsx') || 
                   file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    
    if (isXlsx) {
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

// Rota de teste para diagnóstico de limites
app.get('/test-limits', (req, res) => {
  res.json({
    maxFileSize: '100MB configurado',
    timestamp: new Date()
  });
});

// Nova rota para upload de arquivo Excel - CORRIGIDA PARA DADOS REAIS
app.post("/upload-excel", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado ou tipo inválido." });
    }

    console.log("Arquivo recebido:", req.file.originalname, "MIME:", req.file.mimetype);

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    let data = xlsx.utils.sheet_to_json(sheet);

    console.log(`Dados lidos do Excel: ${data.length} linhas`);
    console.log("Colunas disponíveis:", Object.keys(data[0] || {}));

    // Filtrar apenas OSs de garantia baseado nos dados reais
    const garantiaOS = data.filter(row => {
      const statusOS = row["Status_OSv"] || "";
      // Filtrar por Status_OSv = G, GO, GU (dados reais de garantia)
      const isGarantia = statusOS === "G" || statusOS === "GO" || statusOS === "GU";
      return isGarantia;
    });

    console.log(`OSs de garantia encontradas: ${garantiaOS.length}`);

    if (garantiaOS.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "Nenhuma OS de garantia encontrada no arquivo." });
    }

    // Mapear dados para o formato esperado pelo banco
    const dadosFormatados = garantiaOS.map(row => {
      // Converter data para formato ISO se necessário
      let dataOS = null;
      if (row["Data_OSv"]) {
        try {
          const date = new Date(row["Data_OSv"]);
          if (!isNaN(date.getTime())) {
            dataOS = date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
          }
        } catch (e) {
          console.warn("Erro ao converter data:", row["Data_OSv"]);
        }
      }

      return {
        // Mapeamento correto baseado nos dados reais
        numero_os: row["NOrdem_OSv"] || null,
        data_os: dataOS,
        fabricante: row["Fabricante_Mot"] || null,
        motor: row["Descricao_Mot"] || null,
        modelo: row["ModeloVei_Osv"] || null,
        observacoes: row["Obs_Osv"] || null,
        defeito: row["ObsCorpo_OSv"] || null, // Esta é a coluna real de defeitos!
        mecanico_montador: row["Mecanico"] || null,
        cliente: row["Nome_Cli"] || null,
        total_pecas: parseFloat(row["TOT. PÇ"]) || 0,
        total_servicos: parseFloat(row["TOT. SERV."]) || 0,
        total_geral: parseFloat(row["TOT"]) || 0,
        tipo_os: row["Status_OSv"] || null,
        // Campos adicionais que podem ser úteis
        codigo_cliente: row["Codigo_Cli"] || null,
        placa: row["Placa_Osv"] || null,
        km: row["KM_Osv"] || null,
        montador: row["Montador"] || null,
        razao_social_cliente: row["RazaoSocial_Cli"] || null
      };
    });

    // Inserir dados formatados na tabela temp_import_access
    const { error } = await supabase.from("temp_import_access").insert(dadosFormatados);

    // Remove arquivo temporário
    fs.unlinkSync(req.file.path);

    if (error) {
      console.error("Erro ao inserir no Supabase:", error);
      return res.status(500).json({ error: "Erro ao processar e salvar dados: " + error.message });
    }

    res.status(200).json({ 
      message: "Arquivo processado e dados inseridos com sucesso!", 
      count: dadosFormatados.length,
      detalhes: {
        total_linhas_excel: data.length,
        oss_garantia_encontradas: garantiaOS.length,
        oss_inseridas: dadosFormatados.length
      }
    });
  } catch (error) {
    console.error("Erro no upload:", error);
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: "Erro interno do servidor: " + error.message });
  }
});

// Rota para consultar dados da tabela temporária
app.get("/temp-import-access", async (req, res) => {
  try {
    const { data, error } = await supabase.from("temp_import_access").select("*");
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota para processar dados da temp_import_access e movê-los para ordens_servico
app.post("/process-data", async (req, res) => {
  try {
    // 1. Buscar dados da temp_import_access
    const { data: tempData, error: fetchError } = await supabase
      .from("temp_import_access")
      .select("*");

    if (fetchError) throw fetchError;

    if (!tempData || tempData.length === 0) {
      return res.status(400).json({ error: "Nenhum dado encontrado na tabela temporária." });
    }

    // Buscar mapeamentos de defeitos
    const { data: mapeamentos, error: mapError } = await supabase
      .from("mapeamento_defeitos")
      .select("*");

    if (mapError) throw mapError;

    const unmappedDefects = new Set();

    // Processar cada registro
    const processedData = tempData.map(row => {
      let grupo_id = null;
      let subgrupo_id = null;
      let subsubgrupo_id = null;

      // Tentar mapear o defeito baseado na coluna ObsCorpo_OSv (defeito real)
      if (row.defeito) {
        const mapeamento = mapeamentos.find(m => 
          row.defeito.toLowerCase().includes(m.descricao_original.toLowerCase())
        );
        
        if (mapeamento) {
          grupo_id = mapeamento.grupo_id;
          subgrupo_id = mapeamento.subgrupo_id;
          subsubgrupo_id = mapeamento.subsubgrupo_id;
        } else {
          unmappedDefects.add(row.defeito);
        }
      }

      return {
        numero_os: row.numero_os,
        data_os: row.data_os,
        fabricante: row.fabricante,
        motor: row.motor,
        modelo: row.modelo,
        observacoes: row.observacoes,
        defeito: row.defeito,
        mecanico_montador: row.mecanico_montador,
        cliente: row.cliente,
        total_pecas: parseFloat(row.total_pecas) || 0,
        total_servicos: parseFloat(row.total_servicos) || 0,
        total_geral: parseFloat(row.total_geral) || 0,
        grupo_id,
        subgrupo_id,
        subsubgrupo_id,
        tipo_os: row.tipo_os,
        // Campos adicionais
        codigo_cliente: row.codigo_cliente,
        placa: row.placa,
        km: row.km,
        montador: row.montador,
        razao_social_cliente: row.razao_social_cliente
      };
    });

    // 2. Inserir/atualizar dados na tabela ordens_servico usando upsert
    const { error: upsertError } = await supabase
      .from("ordens_servico")
      .upsert(processedData, { onConflict: "numero_os" });

    if (upsertError) throw upsertError;

    // 3. Limpar temp_import_access após o processamento
    const { error: deleteError } = await supabase
      .from("temp_import_access")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (deleteError) console.error("Erro ao limpar temp_import_access:", deleteError.message);

    res.status(200).json({
      message: "Dados processados e movidos para ordens_servico com sucesso!",
      count: processedData.length,
      unmappedDefects: Array.from(unmappedDefects),
    });
  } catch (error) {
    console.error("Erro no processamento:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

// 1. Buscar Ordens de Serviço com Filtros e Paginação
app.get("/api/ordens-servico", async (req, res) => {
  try {
    const { tipo_os, mecanico, cliente, data_inicio, data_fim, limit = 20, offset = 0 } = req.query;

    let query = supabase.from("ordens_servico").select("*", { count: "exact" });

    // Aplicar filtros
    if (tipo_os) query = query.eq("tipo_os", tipo_os);
    if (mecanico) query = query.ilike("mecanico_montador", `%${mecanico}%`);
    if (cliente) query = query.ilike("cliente", `%${cliente}%`);
    if (data_inicio) query = query.gte("data_os", data_inicio);
    if (data_fim) query = query.lte("data_os", data_fim);

    // Aplicar paginação
    query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    res.status(200).json({ data, count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Buscar Grupos de Defeito
app.get("/api/grupos-defeito", async (req, res) => {
  try {
    const { data, error } = await supabase.from("grupos_defeito").select("*");
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Buscar Subgrupos de Defeito
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

// 4. Buscar Subsubgrupos de Defeito
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

// 5. Buscar Mapeamento de Defeitos
app.get("/api/mapeamento-defeitos", async (req, res) => {
  try {
    const { data, error } = await supabase.from("mapeamento_defeitos").select("*");
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Salvar defeitos não mapeados
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
    
    res.status(200).json({ 
      message: "Defeitos não mapeados salvos com sucesso!", 
      count: uniqueDefeitos.length 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

