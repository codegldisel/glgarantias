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
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Middlewares
app.use(cors());
app.use(express.json({ limit: '1gb' }));
app.use(express.urlencoded({ limit: '1gb', extended: true }));

// Middleware de log para debug
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Adicionar middleware para logar todas as rotas registradas
app.use((req, res, next) => {
  console.log('Rotas registradas:');
  app._router.stack.forEach(function(r){
    if (r.route && r.route.path){
      console.log(r.route.path)
    }
  })
  next();
})

// Configuração do upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ];
  
  const isExcelByMime = allowedMimes.includes(file.mimetype);
  const isExcelByExt = file.originalname.toLowerCase().endsWith('.xlsx') || 
                      file.originalname.toLowerCase().endsWith('.xls');
  
  if (isExcelByMime || isExcelByExt) {
    cb(null, true);
  } else {
    cb(new Error('Apenas arquivos Excel (.xlsx, .xls) são permitidos'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: { 
    fileSize: 1024 * 1024 * 1024, // 1GB
    files: 1
  },
  fileFilter: fileFilter
});

// Função para classificar defeitos usando NLP simples
async function classificarDefeito(textoDefeito) {
  if (!textoDefeito || textoDefeito.trim() === '') {
    return { grupo_id: null, subgrupo_id: null, subsubgrupo_id: null };
  }

  try {
    // Buscar palavras-chave no banco de dados
    const { data: palavrasChave, error } = await supabase
      .from('palavras_chave_defeitos')
      .select(`
        palavra_chave,
        grupos_defeito!inner(id, nome_grupo),
        subgrupos_defeito(id, nome_subgrupo),
        subsubgrupos_defeito(id, nome_subsubgrupo)
      `);

    if (error) {
      console.error('Erro ao buscar palavras-chave:', error);
      return { grupo_id: null, subgrupo_id: null, subsubgrupo_id: null };
    }

    const textoLimpo = textoDefeito.toLowerCase().trim();
    let melhorMatch = null;
    let maiorPontuacao = 0;

    // Algoritmo simples de correspondência por palavras-chave
    for (const item of palavrasChave) {
      const palavraChave = item.palavra_chave.toLowerCase();
      
      if (textoLimpo.includes(palavraChave)) {
        const pontuacao = palavraChave.length; // Palavras mais específicas têm maior pontuação
        
        if (pontuacao > maiorPontuacao) {
          maiorPontuacao = pontuacao;
          melhorMatch = {
            grupo_id: item.grupos_defeito.id,
            subgrupo_id: item.subgrupos_defeito?.id || null,
            subsubgrupo_id: item.subsubgrupos_defeito?.id || null
          };
        }
      }
    }

    if (melhorMatch) {
      return melhorMatch;
    }

    // Se não encontrou correspondência, inserir na tabela de defeitos não mapeados
    const { error: insertError } = await supabase
      .from('defeitos_nao_mapeados')
      .insert({ descricao: textoDefeito })
      .select();

    if (insertError && !insertError.message.includes('duplicate key')) {
      console.error('Erro ao inserir defeito não mapeado:', insertError);
    }

    return { grupo_id: null, subgrupo_id: null, subsubgrupo_id: null };

  } catch (error) {
    console.error('Erro na classificação de defeito:', error);
    return { grupo_id: null, subgrupo_id: null, subsubgrupo_id: null };
  }
}

// Função para processar dados do Excel
async function processarDadosExcel(dadosGarantia) {
  const dadosProcessados = [];

  for (const row of dadosGarantia) {
    // Converter data para formato ISO
    let dataOS = null;
    if (row["Data_OSv"]) {
      try {
        const date = new Date(row["Data_OSv"]);
        if (!isNaN(date.getTime())) {
          dataOS = date.toISOString().split('T')[0];
        }
      } catch (e) {
        console.warn("Erro ao converter data:", row["Data_OSv"]);
      }
    }

    // Classificar defeito usando NLP
    const textoDefeito = row["ObsCorpo_OSv"] || "";
    const classificacao = await classificarDefeito(textoDefeito);

    // Mapear dados para o formato da nova tabela ordens_servico
    const dadoFormatado = {
      numero_ordem: row["NOrdem_OSv"] || null,
      data_ordem: dataOS,
      status: row["Status_OSv"] || null,
      defeito_texto_bruto: textoDefeito,
      grupo_defeito_id: classificacao.grupo_id,
      subgrupo_defeito_id: classificacao.subgrupo_id,
      subsubgrupo_defeito_id: classificacao.subsubgrupo_id,
      mecanico_responsavel: row["RazaoSocial_Cli"] || null,
      modelo_motor: row["Descricao_Mot"] || null,
      fabricante_motor: row["Fabricante_Mot"] || null,
      dia_servico: row["DIA"] || null,
      mes_servico: row["MES"] || null,
      ano_servico: row["ANO"] || null,
      total_pecas: parseFloat(row["TOT. PC"]) || 0,
      total_servico: parseFloat(row["TOT. SERV."]) || 0,
      total_geral: parseFloat(row["TOT"]) || 0
    };

    dadosProcessados.push(dadoFormatado);
  }

  return dadosProcessados;
}

// Rotas
app.get("/", (req, res) => {
  res.send("Backend do App de Garantias está funcionando!");
});

app.get("/api/test", (req, res) => {
  res.json({
    message: "Servidor funcionando!",
    timestamp: new Date().toISOString(),
    supabase_configured: !!(supabaseUrl && supabaseAnonKey),
  });
});

// Rota principal para upload de Excel
app.post('/api/upload-excel', upload.single('excel'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum arquivo foi enviado'
      });
    }

    console.log('Processando arquivo:', req.file.originalname);

    // Ler arquivo Excel
    const workbook = xlsx.readFile(req.file.path);
    
    // Procurar pela aba "Tabela" conforme especificação
    let worksheet;
    if (workbook.SheetNames.includes('Tabela')) {
      worksheet = workbook.Sheets['Tabela'];
    } else {
      // Se não encontrar "Tabela", usar a primeira aba
      worksheet = workbook.Sheets[workbook.SheetNames[0]];
    }

    // Converter para JSON
    const rawData = xlsx.utils.sheet_to_json(worksheet, { 
      header: 1, 
      defval: '', 
      blankrows: false, 
      raw: false 
    });

    if (rawData.length < 2) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        error: 'Planilha deve ter cabeçalho e dados'
      });
    }

    // Processar cabeçalhos
    const headers = rawData[0].map(h => String(h || '').trim());
    
    // Filtrar apenas OSs de garantia (Status_OSv = "Garantia")
    const garantiaData = [];
    for (let i = 1; i < rawData.length; i++) {
      const row = rawData[i];
      const statusIndex = headers.indexOf('Status_OSv');
      const statusValue = statusIndex >= 0 ? String(row[statusIndex] || '').trim() : '';
      
      if (statusValue === "Garantia") {
        const rowObj = {};
        headers.forEach((header, index) => {
          if (header) {
            rowObj[header] = row[index] || '';
          }
        });
        garantiaData.push(rowObj);
      }
    }

    console.log(`OSs de garantia encontradas: ${garantiaData.length}`);

    if (garantiaData.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        error: 'Nenhuma OS de garantia encontrada no arquivo'
      });
    }

    // Processar dados com classificação de defeitos
    const dadosProcessados = await processarDadosExcel(garantiaData);

    // Inserir dados na tabela ordens_servico
    const { data, error } = await supabase
      .from("ordens_servico")
      .insert(dadosProcessados)
      .select();

    // Limpar arquivo temporário
    fs.unlinkSync(req.file.path);

    if (error) {
      console.error("Erro ao inserir no Supabase:", error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao salvar dados no banco',
        details: error.message
      });
    }

    res.status(200).json({ 
      success: true,
      message: "Arquivo processado com sucesso!", 
      count: dadosProcessados.length,
      detalhes: {
        total_linhas_excel: rawData.length - 1,
        oss_garantia_encontradas: garantiaData.length,
        oss_inseridas: dadosProcessados.length
      }
    });

  } catch (error) {
    console.error("Erro no processamento:", error);
    
    // Limpar arquivo temporário em caso de erro
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// Rota para listar defeitos não mapeados
app.get('/api/defeitos-nao-mapeados', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('defeitos_nao_mapeados')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar defeitos não mapeados',
        details: error.message
      });
    }

    res.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error("Erro ao buscar defeitos não mapeados:", error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// Rota para estatísticas
app.get('/api/estatisticas', async (req, res) => {
  try {
    const { data: totalOS, error: errorTotal } = await supabase
      .from('ordens_servico')
      .select('id', { count: 'exact' });

    const { data: defeitosClassificados, error: errorClassificados } = await supabase
      .from('ordens_servico')
      .select('id', { count: 'exact' })
      .not('grupo_defeito_id', 'is', null);

    const { data: defeitosNaoMapeados, error: errorNaoMapeados } = await supabase
      .from('defeitos_nao_mapeados')
      .select('id', { count: 'exact' });

    if (errorTotal || errorClassificados || errorNaoMapeados) {
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar estatísticas'
      });
    }

    res.json({
      success: true,
      estatisticas: {
        total_os: totalOS?.length || 0,
        defeitos_classificados: defeitosClassificados?.length || 0,
        defeitos_nao_mapeados: defeitosNaoMapeados?.length || 0
      }
    });

  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// Criar diretório de uploads se não existir
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});



