require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const multer = require("multer");
const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Erro: Variáveis de ambiente do Supabase não configuradas.");

}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Middlewares
app.use(cors()); // Habilita CORS para todas as rotas
app.use(express.json({ limit: '1gb' })); // Habilita o parsing de JSON no corpo das requisições
app.use(express.urlencoded({ limit: '1gb', extended: true })); // Habilita o parsing de URL-encoded no corpo das requisições

// Middleware de log para debug
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Configuração de armazenamento personalizada para Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtro de arquivo para aceitar apenas Excel
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ];
  
  // Verificar por MIME type e extensão
  const isExcelByMime = allowedMimes.includes(file.mimetype);
  const isExcelByExt = file.originalname.toLowerCase().endsWith('.xlsx') || 
                      file.originalname.toLowerCase().endsWith('.xls');
  
  if (isExcelByMime || isExcelByExt) {
    cb(null, true);
  } else {
    cb(new Error('Apenas arquivos Excel (.xlsx, .xls) são permitidos'), false);
  }
};

// Configuração do upload com limites e filtros melhorados
const upload = multer({ 
  storage: storage,
  limits: { 
    fileSize: 1024 * 1024 * 1024, // 1GB para arquivos Excel grandes
    files: 1 // Apenas um arquivo por vez
  },
  fileFilter: fileFilter
});

// Middleware de tratamento de erro para upload
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          error: 'Arquivo muito grande',
          message: 'O arquivo deve ter no máximo 1GB'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          error: 'Muitos arquivos',
          message: 'Envie apenas um arquivo por vez'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          error: 'Campo de arquivo inválido',
          message: 'Use o campo correto para envio do arquivo'
        });
      default:
        return res.status(400).json({
          success: false,
          error: 'Erro no upload',
          message: err.message
        });
    }
  }
  
  if (err.message.includes('Apenas arquivos Excel')) {
    return res.status(400).json({
      success: false,
      error: 'Tipo de arquivo inválido',
      message: err.message
    });
  }
  
  next(err);
};

// Função para tentar recarregar schema em caso de erro
async function executeWithCacheRetry(operation, maxRetries = 2) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (error.message.includes('schema cache') && attempt < maxRetries) {
        console.log(`Tentativa ${attempt} falhou devido ao cache. Tentando novamente...`);
        
        // Tentar recarregar o schema
        try {
          await supabase.rpc('reload_schema_cache');
        } catch (reloadError) {
          console.log('Não foi possível recarregar cache automaticamente');
        }
        
        // Aguardar um pouco antes de tentar novamente
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      throw error;
    }
  }
}

// Rota de teste
app.get("/", (req, res) => {
  res.send("Backend do App de Garantias está funcionando!");
});

// Rota de teste para verificar se o servidor está funcionando
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Servidor funcionando!',
    timestamp: new Date().toISOString(),
    routes: ['/api/upload-excel', '/upload-excel', '/api/test']
  });
});

// Rota de teste para diagnóstico de limites
app.get('/test-limits', (req, res) => {
  res.json({
    maxFileSize: '1GB configurado',
    timestamp: new Date()
  });
});

// Rota de teste para upload de chunks (sem multer)
app.post("/api/upload-chunk-test", (req, res) => {
  res.json({ message: "Rota de teste funcionando!" });
});

// Rota para upload de chunks (pedaços de arquivo)
app.post("/api/upload-chunk", upload.single("chunk"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum chunk enviado." });
    }

    const { chunkIndex, totalChunks, uploadId, fileName, fileSize } = req.body;

    // Validar parâmetros
    if (!chunkIndex || !totalChunks || !uploadId || !fileName) {
      return res.status(400).json({ error: "Parâmetros de chunk inválidos." });
    }

    // Criar diretório para o upload se não existir
    const uploadDir = `uploads/chunks/${uploadId}`;
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Salvar chunk com nome sequencial
    const chunkPath = `${uploadDir}/chunk_${chunkIndex}`;
    fs.renameSync(req.file.path, chunkPath);

    console.log(`Chunk ${parseInt(chunkIndex) + 1}/${totalChunks} recebido para upload ${uploadId}`);

    res.status(200).json({ 
      message: `Chunk ${parseInt(chunkIndex) + 1}/${totalChunks} recebido com sucesso!`,
      chunkIndex: parseInt(chunkIndex),
      totalChunks: parseInt(totalChunks)
    });

  } catch (error) {
    console.error("Erro no upload do chunk:", error);
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: "Erro interno do servidor: " + error.message });
  }
});

// Rota para finalizar upload (remontar arquivo)
app.post("/api/finalize-upload", async (req, res) => {
  try {
    const { uploadId, fileName, totalChunks } = req.body;

    if (!uploadId || !fileName || !totalChunks) {
      return res.status(400).json({ error: "Parâmetros de finalização inválidos." });
    }

    const uploadDir = `uploads/chunks/${uploadId}`;
    const finalFilePath = `uploads/${fileName}`;

    // Verificar se todos os chunks existem
    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = `${uploadDir}/chunk_${i}`;
      if (!fs.existsSync(chunkPath)) {
        return res.status(400).json({ error: `Chunk ${i} não encontrado.` });
      }
    }

    // Remontar arquivo
    const writeStream = fs.createWriteStream(finalFilePath);
    
    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = `${uploadDir}/chunk_${i}`;
      const chunkData = fs.readFileSync(chunkPath);
      writeStream.write(chunkData);
    }
    
    writeStream.end();

    // Aguardar finalização da escrita
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    console.log(`Arquivo ${fileName} remontado com sucesso!`);

    // Processar arquivo Excel remontado
    const workbook = xlsx.readFile(finalFilePath);
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
      // Limpar arquivos temporários
      fs.unlinkSync(finalFilePath);
      fs.rmSync(uploadDir, { recursive: true, force: true });
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

    // Limpar arquivos temporários
    fs.unlinkSync(finalFilePath);
    fs.rmSync(uploadDir, { recursive: true, force: true });

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
    console.error("Erro na finalização do upload:", error);
    res.status(500).json({ error: "Erro interno do servidor: " + error.message });
  }
});

// Nova rota de upload usando campo "excel" conforme recomendado
app.post('/api/upload-excel', upload.single('excel'), handleUploadError, async (req, res) => {
  try {
    console.log('=== PROCESSAMENTO COMPLETO ===');
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum arquivo foi enviado'
      });
    }
    
    // 1. Verificar arquivo
    console.log('Arquivo recebido:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
    
    // 2. Ler workbook
    const workbook = xlsx.readFile(req.file.path);
    console.log('Abas disponíveis:', workbook.SheetNames);
    
    // 3. Analisar primeira aba
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    console.log('Range da planilha:', worksheet['!ref']);
    
    // 4. Usar método robusto que funcionou no diagnóstico
    const rawData = xlsx.utils.sheet_to_json(worksheet, { 
      header: 1, 
      defval: '', 
      blankrows: false, 
      raw: false 
    });
    
    console.log('Total de linhas lidas:', rawData.length);
    
    if (rawData.length < 2) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        error: 'Planilha deve ter cabeçalho + dados'
      });
    }
    
    // 5. Processar cabeçalhos
    const headers = rawData[0].map(h => String(h || '').trim());
    console.log('Cabeçalhos processados:', headers.length);
    
    // 6. Filtrar dados de garantia
    const garantiaData = [];
    for (let i = 1; i < rawData.length; i++) {
      const row = rawData[i];
      const statusIndex = headers.indexOf('Status_OSv');
      const statusValue = statusIndex >= 0 ? String(row[statusIndex] || '').toUpperCase() : '';
      
      if (['G', 'GO', 'GU'].includes(statusValue)) {
        const rowObj = {};
        headers.forEach((header, index) => {
          if (header) {
            rowObj[header] = row[index] || '';
          }
        });
        garantiaData.push(rowObj);
      }
    }
    
    console.log('Dados de garantia filtrados:', garantiaData.length);
    
    if (garantiaData.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        error: 'Nenhuma OS de garantia encontrada no arquivo'
      });
    }
    
    // 7. Mapear dados para o formato do banco
    const dadosFormatados = garantiaData.map(row => {
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
        // Apenas as colunas que existem na tabela temp_import_access
        data_os: dataOS,
        numero_os: row["NOrdem_OSv"] || null,
        fabricante: row["Fabricante_Mot"] || null,
        motor: row["Descricao_Mot"] || null,
        modelo: row["ModeloVei_Osv"] || null,
        observacoes: row["Obs_Osv"] || null,
        defeito: row["ObsCorpo_OSv"] || null,
        mecanico_montador: row["Mecanico"] || null,
        cliente: row["Nome_Cli"] || null,
        total_pecas: parseFloat(row["TOT. PÇ"]) || 0,
        total_servicos: parseFloat(row["TOT. SERV."]) || 0,
        total_geral: parseFloat(row["TOT"]) || 0,
        tipo_os: row["Status_OSv"] || null
      };
    });
    
    console.log('Dados formatados para inserção:', dadosFormatados.length);
    
    // 8. Inserir dados na tabela temp_import_access com retry
    const insertOperation = async () => {
      const { data, error } = await supabase
        .from("temp_import_access")
        .insert(dadosFormatados)
        .select();

      if (error) {
        throw new Error(`Erro na inserção: ${error.message}`);
      }
      
      return data;
    };

    let insertedData;
    try {
      insertedData = await executeWithCacheRetry(insertOperation);
      console.log('Dados inseridos com sucesso na tabela temporária');
    } catch (error) {
      console.error("Erro ao inserir no Supabase:", error);
      
      // Remove arquivo temporário
      fs.unlinkSync(req.file.path);
      
      // Tratamento específico para erros de schema cache
      if (error.message.includes('schema cache')) {
        return res.status(503).json({
          success: false,
          error: 'Erro temporário do banco de dados',
          message: 'Tente novamente em alguns segundos.'
        });
      }
      
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
    
    // 9. Limpar arquivo temporário
    fs.unlinkSync(req.file.path);
    
    res.status(200).json({
      success: true,
      message: 'Arquivo processado e dados inseridos com sucesso!',
      count: insertedData.length
    });

  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// Middleware de tratamento de erros global
app.use((err, req, res, next) => {
  console.error("Erro global capturado:", err);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({ error: "Erro interno do servidor." });
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});



