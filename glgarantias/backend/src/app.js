require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Para deletar o arquivo temporário

const ExcelService = require('./services/excelService');
const NLPService = require('./services/nlpService');
const supabase = require('./config/supabase');

// Importar rotas
const dashboardRoutes = require('./routes/dashboard');
const ordensRoutes = require('./routes/ordens');
const analisesRoutes = require('./routes/analises');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ordens', ordensRoutes);
app.use('/api/analises', analisesRoutes);

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // Aumentado para 100MB para lidar com arquivos grandes
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos Excel são permitidos!'), false);
    }
  }
});

// Instanciar o serviço de PLN
const nlpService = new NLPService();

// Rotas básicas
app.get('/', (req, res) => {
  res.json({ message: 'API de Análise de Garantias funcionando!' });
});

// Rota de upload e processamento de planilha
app.post('/api/upload', upload.single('planilha'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo foi enviado' });
  }

  const filePath = req.file.path;
  const originalname = req.file.originalname;
  const fileSize = req.file.size;

  let uploadId; // Para rastrear o upload no banco de dados

  try {
    // 1. Registrar o upload no banco de dados
    const { data: uploadRecord, error: uploadError } = await supabase
      .from('uploads')
      .insert({
        nome_arquivo: originalname,
        tamanho_arquivo: fileSize,
        status: 'processando'
      })
      .select();

    if (uploadError) {
      console.error('Erro ao registrar upload no Supabase:', uploadError);
      throw new Error('Falha ao registrar upload.');
    }
    uploadId = uploadRecord[0].id;

    // 2. Ler e mapear dados do Excel
    const excelData = ExcelService.readExcelFile(filePath);
    const mappedData = ExcelService.mapExcelDataToDatabase(excelData);

    // 3. Classificar defeitos usando PLN e preparar para inserção
    console.log(`Iniciando classificação de defeitos para ${mappedData.length} registros...`);
    
    const dataToInsert = mappedData.map((row, index) => {
      // Classificar defeito se houver texto
      let classification = {
        grupo: 'Não Classificado',
        subgrupo: 'Não Classificado',
        subsubgrupo: 'Não Classificado',
        confianca: 0.0
      };
      
      if (row.defeito_texto_bruto && row.defeito_texto_bruto.trim() !== '') {
        try {
          classification = nlpService.classifyDefect(row.defeito_texto_bruto);
          console.log(`Registro ${index + 1}: "${row.defeito_texto_bruto.substring(0, 50)}..." → ${classification.grupo}`);
        } catch (error) {
          console.warn(`Erro ao classificar defeito do registro ${index + 1}:`, error.message);
        }
      } else {
        console.log(`Registro ${index + 1}: Sem texto de defeito para classificar`);
      }
      
      return {
        ...row,
        defeito_grupo: classification.grupo,
        defeito_subgrupo: classification.subgrupo,
        defeito_subsubgrupo: classification.subsubgrupo,
        classificacao_confianca: classification.confianca
      };
    });
    
    console.log(`Classificação concluída. ${dataToInsert.length} registros processados.`);

    // 4. Inserir dados processados no Supabase
    // Usar upsert para evitar duplicatas baseadas em numero_ordem
    const { error: insertError } = await supabase
      .from('ordens_servico')
      .upsert(dataToInsert, { onConflict: 'numero_ordem' });

    if (insertError) {
      console.error('Erro ao inserir dados no Supabase:', insertError);
      throw new Error('Falha ao salvar dados processados.');
    }

    // 5. Atualizar status do upload para 'concluido'
    await supabase
      .from('uploads')
      .update({ status: 'concluido', total_registros: dataToInsert.length, registros_processados: dataToInsert.length, completed_at: new Date().toISOString() })
      .eq('id', uploadId);

    res.json({
      message: 'Arquivo processado e dados salvos com sucesso!',
      filename: originalname,
      totalRecords: dataToInsert.length,
      uploadId: uploadId
    });

  } catch (error) {
    console.error('Erro no processamento da planilha:', error);

    // Atualizar status do upload para 'erro' se uploadId existir
    if (uploadId) {
      await supabase
        .from('uploads')
        .update({ status: 'erro', mensagem_erro: error.message, completed_at: new Date().toISOString() })
        .eq('id', uploadId);
    }

    res.status(500).json({ error: error.message || 'Erro interno do servidor ao processar planilha.' });
  } finally {
    // Sempre deletar o arquivo temporário após o processamento
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Arquivo temporário ${filePath} deletado.`);
    }
  }
});

// Middleware de tratamento de erros
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Arquivo muito grande. Máximo 100MB.' });
    }
  }

  console.error(error);
  res.status(500).json({ error: error.message || 'Erro interno do servidor' });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;

