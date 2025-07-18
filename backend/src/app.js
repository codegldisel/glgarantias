require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { trackingMiddleware, dataTracker } = require("./middleware/dataTracker");

const app = express();
const PORT = process.env.PORT || 3000;

const ExcelService = require("./services/excelService");
const NLPService = require("./services/nlpService");
const supabase = require("./config/supabase");

// Importar rotas
const dashboardRoutes = require("./routes/dashboard");
const ordensRoutes = require("./routes/ordens");
const analisesRoutes = require("./routes/analises");
const defeitosRoutes = require("./routes/defeitos");
const mecanicosRoutes = require("./routes/mecanicos");

// Configuração CORS para permitir todas as origens (para depuração)
app.use(cors());

// Middleware básico
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de rastreamento de dados
app.use(trackingMiddleware);

// Middleware para logar todas as requisições recebidas
app.use((req, res, next) => {
  console.log(`Requisição recebida: ${req.method} ${req.url}`);
  next();
});

// Rotas
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/ordens", ordensRoutes);
app.use("/api/analises", analisesRoutes);
app.use("/api/defeitos", defeitosRoutes);
app.use("/api/mecanicos", mecanicosRoutes);

// Configuração do multer para upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  },
  fileFilter: function (req, file, cb) {
    if (
      file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.mimetype === "application/vnd.ms-excel"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Apenas arquivos Excel são permitidos!"), false);
    }
  }
});

// Instanciar o serviço de PLN
const nlpService = new NLPService();

// Rotas básicas
app.get("/", (req, res) => {
  res.json({ message: "API de Análise de Garantias funcionando!" });
});

// Rota para obter relatório de rastreamento
app.get("/api/tracking/report", (req, res) => {
  const report = dataTracker.getUploadReport();
  res.json(report || { message: "Nenhum upload em andamento" });
});

// Rota para obter todos os logs
app.get("/api/tracking/logs", (req, res) => {
  const logs = dataTracker.getAllLogs();
  res.json(logs);
});

// Rota para limpar logs
app.post("/api/tracking/clear", (req, res) => {
  dataTracker.clearLogs();
  res.json({ message: "Logs limpos com sucesso" });
});

// Rota de upload e processamento de planilha
app.post("/api/upload", upload.single("planilha"), async (req, res) => {
  const tracker = req.dataTracker;
  
  if (!req.file) {
    tracker.logError("UPLOAD_ERROR", new Error("Nenhum arquivo foi enviado"));
    return res.status(400).json({ error: "Nenhum arquivo foi enviado" });
  }

  const filePath = req.file.path;
  const originalname = req.file.originalname;
  const fileSize = req.file.size;

  // Iniciar rastreamento do upload
  const uploadId = tracker.startUpload(originalname);
  tracker.log("FILE_RECEIVED", `Arquivo recebido: ${originalname}`, {
    size: `${(fileSize / 1024 / 1024).toFixed(2)} MB`,
    path: filePath,
    mimetype: req.file.mimetype
  });

  let dbUploadId; // Para rastrear o upload no banco de dados

  try {
    // 1. Registrar o upload no banco de dados
    tracker.log("DB_UPLOAD_START", "Registrando upload no banco de dados");
    const { data: uploadRecord, error: uploadError } = await supabase
      .from("uploads")
      .insert({
        nome_arquivo: originalname,
        tamanho_arquivo: fileSize,
        status: "processando"
      })
      .select();

    if (uploadError) {
      tracker.logError("DB_UPLOAD_ERROR", uploadError);
      throw new Error("Falha ao registrar upload.");
    }
    
    dbUploadId = uploadRecord[0].id;
    tracker.log("DB_UPLOAD_SUCCESS", `Upload registrado no banco com ID: ${dbUploadId}`);

    // 2. Ler dados do Excel
    tracker.log("EXCEL_READ_START", "Iniciando leitura do arquivo Excel");
    const excelData = ExcelService.readExcelFile(filePath, tracker);
    
    tracker.log("EXCEL_READ_SUCCESS", `Arquivo Excel lido com sucesso`, {
      totalRows: excelData.data.length,
      columns: excelData.columns
    });

    // 3. Mapear dados do Excel para o banco
    tracker.log("DATA_MAPPING_START", "Iniciando mapeamento dos dados");
    const mappedData = ExcelService.mapExcelDataToDatabase(excelData, tracker);
    
    tracker.log("DATA_MAPPING_SUCCESS", `Dados mapeados com sucesso`, {
      totalMapped: mappedData.length,
      sampleData: mappedData.slice(0, 2) // Primeiros 2 registros como exemplo
    });

    // 4. Classificar defeitos usando NLP
    tracker.log("NLP_CLASSIFICATION_START", "Iniciando classificação de defeitos");
    const dataToInsert = mappedData.map((row, index) => {
      if (index < 5) { // Log detalhado apenas dos primeiros 5
        tracker.log("NLP_PROCESSING", `Classificando defeito ${index + 1}`, {
          numero_ordem: row.numero_ordem,
          defeito_texto_bruto: row.defeito_texto_bruto
        });
      }
      
      const classification = nlpService.classifyDefect(row.defeito_texto_bruto);
      
      if (index < 5) { // Log detalhado apenas dos primeiros 5
        tracker.log("NLP_RESULT", `Classificação do defeito ${index + 1}`, {
          numero_ordem: row.numero_ordem,
          grupo: classification.grupo,
          subgrupo: classification.subgrupo,
          subsubgrupo: classification.subsubgrupo,
          confianca: classification.confianca
        });
      }
      
      return {
        ...row,
        defeito_grupo: classification.grupo,
        defeito_subgrupo: classification.subgrupo,
        defeito_subsubgrupo: classification.subsubgrupo,
        classificacao_confianca: classification.confianca
      };
    });

    tracker.log("NLP_CLASSIFICATION_SUCCESS", `Classificação de defeitos concluída`, {
      totalClassified: dataToInsert.length
    });

    // 5. Inserir dados processados no Supabase
    tracker.log("DB_INSERT_START", "Iniciando inserção dos dados no banco");
    const { error: insertError } = await supabase
      .from("ordens_servico")
      .upsert(dataToInsert, { onConflict: "numero_ordem" });

    if (insertError) {
      tracker.logError("DB_INSERT_ERROR", insertError, { dataToInsert: dataToInsert.slice(0, 2) });
      throw new Error("Falha ao salvar dados processados.");
    }

    tracker.log("DB_INSERT_SUCCESS", `Dados inseridos no banco com sucesso`, {
      totalInserted: dataToInsert.length
    });

    // 6. Atualizar status do upload para "concluido"
    await supabase
      .from("uploads")
      .update({ 
        status: "concluido", 
        total_registros: dataToInsert.length, 
        registros_processados: dataToInsert.length, 
        completed_at: new Date().toISOString() 
      })
      .eq("id", dbUploadId);

    // Finalizar rastreamento
    tracker.finishUpload("concluido", {
      totalRecords: dataToInsert.length,
      uploadId: dbUploadId,
      filename: originalname
    });

    res.json({
      message: "Arquivo processado e dados salvos com sucesso!",
      filename: originalname,
      totalRecords: dataToInsert.length,
      uploadId: dbUploadId,
      trackingId: uploadId
    });

  } catch (error) {
    tracker.logError("UPLOAD_PROCESS_ERROR", error);

    // Atualizar status do upload para "erro" se dbUploadId existir
    if (dbUploadId) {
      await supabase
        .from("uploads")
        .update({ 
          status: "erro", 
          mensagem_erro: error.message, 
          completed_at: new Date().toISOString() 
        })
        .eq("id", dbUploadId);
    }

    tracker.finishUpload("erro", { error: error.message });

    res.status(500).json({ 
      error: error.message || "Erro interno do servidor ao processar planilha.",
      trackingId: uploadId
    });
  } finally {
    // Sempre deletar o arquivo temporário após o processamento
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      tracker.log("FILE_CLEANUP", `Arquivo temporário deletado: ${filePath}`);
    }
  }
});

// Middleware de tratamento de erros
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "Arquivo muito grande. Máximo 100MB." });
    }
    return res.status(400).json({ error: error.message });
  }
  if (error.message === "Apenas arquivos Excel são permitidos!") {
    return res.status(400).json({ error: error.message });
  }
  console.error(error);
  res.status(500).json({ error: error.message || "Erro interno do servidor" });
});

// Iniciar servidor
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;



