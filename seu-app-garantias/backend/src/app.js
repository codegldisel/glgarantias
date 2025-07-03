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

// Função para normalizar datas de diferentes formatos
function normalizarData(dataInput) {
  if (!dataInput) return null;
  
  try {
    // Se for um número (formato Excel serial date)
    if (typeof dataInput === 'number') {
      const date = new Date((dataInput - 25569) * 86400 * 1000);
      return date.toISOString().split('T')[0];
    }
    
    // Se for string, tentar diferentes formatos
    if (typeof dataInput === 'string') {
      const dataStr = dataInput.trim();
      
      // Formato DD/MM/YYYY ou DD/MM/YY
      if (dataStr.match(/^\d{1,2}\/\d{1,2}\/\d{2,4}$/)) {
        const [dia, mes, ano] = dataStr.split('/');
        const anoCompleto = ano.length === 2 ? `20${ano}` : ano;
        return `${anoCompleto}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
      }
      
      // Formato MM/DD/YYYY
      if (dataStr.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
        const date = new Date(dataStr);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      }
      
      // Formato YYYY-MM-DD
      if (dataStr.match(/^\d{4}-\d{1,2}-\d{1,2}$/)) {
        const date = new Date(dataStr);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      }
    }
    
    // Tentar conversão direta
    const date = new Date(dataInput);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    
    return null;
  } catch (error) {
    console.warn("Erro ao normalizar data:", dataInput, error);
    return null;
  }
}

// Função para normalizar mês (texto para número)
function normalizarMes(mesInput) {
  if (!mesInput) return null;
  
  // Se já for número, retornar
  if (typeof mesInput === 'number') {
    return mesInput;
  }
  
  const mesStr = String(mesInput).toLowerCase().trim();
  
  // Se for número em string
  const mesNum = parseInt(mesStr);
  if (!isNaN(mesNum) && mesNum >= 1 && mesNum <= 12) {
    return mesNum;
  }
  
  // Mapeamento de nomes de meses
  const meses = {
    'janeiro': 1, 'jan': 1,
    'fevereiro': 2, 'fev': 2,
    'março': 3, 'mar': 3,
    'abril': 4, 'abr': 4,
    'maio': 5, 'mai': 5,
    'junho': 6, 'jun': 6,
    'julho': 7, 'jul': 7,
    'agosto': 8, 'ago': 8,
    'setembro': 9, 'set': 9,
    'outubro': 10, 'out': 10,
    'novembro': 11, 'nov': 11,
    'dezembro': 12, 'dez': 12
  };
  
  return meses[mesStr] || null;
}

// Função para normalizar valores numéricos
function normalizarNumero(valor) {
  if (valor === null || valor === undefined || valor === '') return 0;
  
  if (typeof valor === 'number') return valor;
  
  // Remover caracteres não numéricos exceto vírgula e ponto
  const valorLimpo = String(valor).replace(/[^\d,.-]/g, '');
  
  // Substituir vírgula por ponto (formato brasileiro)
  const valorFormatado = valorLimpo.replace(',', '.');
  
  const numero = parseFloat(valorFormatado);
  return isNaN(numero) ? 0 : numero;
}

// Função para classificar defeitos usando a tabela classificacao_defeitos
async function classificarDefeito(textoDefeito) {
  if (!textoDefeito || textoDefeito.trim() === '') {
    return { 
      grupo: null, 
      subgrupo: null, 
      subsubgrupo: null, 
      confianca: 0 
    };
  }

  try {
    // Buscar classificações de defeitos no banco
    const { data: classificacoes, error } = await supabase
      .from('classificacao_defeitos')
      .select('*')
      .eq('ativo', true);

    if (error) {
      console.error('Erro ao buscar classificações de defeitos:', error);
      return { grupo: null, subgrupo: null, subsubgrupo: null, confianca: 0 };
    }

    const textoLimpo = textoDefeito.toLowerCase().trim();
    let melhorMatch = null;
    let maiorPontuacao = 0;

    // Algoritmo de correspondência por palavras-chave
    for (const classificacao of classificacoes) {
      if (!classificacao.palavras_chave || !Array.isArray(classificacao.palavras_chave)) {
        continue;
      }

      for (const palavraChave of classificacao.palavras_chave) {
        const palavraLimpa = palavraChave.toLowerCase();
        
        if (textoLimpo.includes(palavraLimpa)) {
          // Pontuação baseada no comprimento da palavra-chave (palavras mais específicas têm maior pontuação)
          const pontuacao = palavraLimpa.length;
          
          if (pontuacao > maiorPontuacao) {
            maiorPontuacao = pontuacao;
            melhorMatch = {
              grupo: classificacao.grupo,
              subgrupo: classificacao.subgrupo,
              subsubgrupo: classificacao.subsubgrupo,
              confianca: Math.min(pontuacao / textoLimpo.length, 1) // Confiança baseada na proporção
            };
          }
        }
      }
    }

    if (melhorMatch) {
      return melhorMatch;
    }

    // Se não encontrou correspondência, retornar valores nulos
    return { grupo: null, subgrupo: null, subsubgrupo: null, confianca: 0 };

  } catch (error) {
    console.error('Erro na classificação de defeito:', error);
    return { grupo: null, subgrupo: null, subsubgrupo: null, confianca: 0 };
  }
}

// Função para verificar se uma OS já existe no banco
async function osJaExiste(numeroOrdem) {
  try {
    const { data, error } = await supabase
      .from('ordens_servico')
      .select('id')
      .eq('numero_ordem', numeroOrdem)
      .limit(1);

    if (error) {
      console.error('Erro ao verificar OS existente:', error);
      return false;
    }

    return data && data.length > 0;
  } catch (error) {
    console.error('Erro ao verificar OS existente:', error);
    return false;
  }
}

// Função para processar dados do Excel
async function processarDadosExcel(dadosGarantia) {
  const dadosProcessados = [];
  const ossDuplicadas = [];

  for (const row of dadosGarantia) {
    const numeroOrdem = row["NOrdem_OSv"];
    
    // Verificar se a OS já existe (para evitar duplicatas)
    if (numeroOrdem && await osJaExiste(numeroOrdem)) {
      ossDuplicadas.push(numeroOrdem);
      continue;
    }

    // Normalizar data da OS
    const dataOS = normalizarData(row["Data_OSv"]);
    const dataFechamento = normalizarData(row["DataFecha_Osv"]);

    // Classificar defeito usando NLP
    const textoDefeito = row["ObsCorpo_OSv"] || "";
    const classificacao = await classificarDefeito(textoDefeito);

    // Normalizar valores financeiros
    const totalPecas = normalizarNumero(row["TOT. PÇ"]);
    const totalServico = normalizarNumero(row["TOT. SERV."]);
    const totalGeral = normalizarNumero(row["TOT"]);

    // Normalizar mês
    const mes = normalizarMes(row["MÊS"]);

    // Mapear dados para o formato da tabela ordens_servico
    const dadoFormatado = {
      numero_ordem: numeroOrdem || null,
      data_ordem: dataOS,
      status: row["Status_OSv"] || null,
      defeito_texto_bruto: textoDefeito,
      defeito_grupo: classificacao.grupo,
      defeito_subgrupo: classificacao.subgrupo,
      defeito_subsubgrupo: classificacao.subsubgrupo,
      classificacao_confianca: classificacao.confianca,
      mecanico_responsavel: row["RazaoSocial_Cli"] || null,
      modelo_motor: row["Descricao_Mot"] || null,
      fabricante_motor: row["Fabricante_Mot"] || null,
      dia_servico: parseInt(row["DIA"]) || null,
      mes_servico: mes,
      ano_servico: parseInt(row["ANO"]) || null,
      total_pecas: totalPecas,
      total_servico: totalServico,
      total_geral: totalGeral,
      data_os: dataOS, // Campo adicional para compatibilidade
      observacoes: row["Obs_Osv"] || null,
      cliente_nome: row["Nome_Cli"] || null
    };

    dadosProcessados.push(dadoFormatado);
  }

  return { dadosProcessados, ossDuplicadas };
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

    // Registrar upload na tabela uploads
    const { data: uploadRecord, error: uploadError } = await supabase
      .from('uploads')
      .insert({
        nome_arquivo: req.file.originalname,
        tamanho_arquivo: req.file.size,
        status: 'processando'
      })
      .select()
      .single();

    if (uploadError) {
      console.error('Erro ao registrar upload:', uploadError);
    }

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
    
    // Filtrar apenas OSs de garantia (Status_OSv = "G", "GO" ou "GU")
    const garantiaData = [];
    for (let i = 1; i < rawData.length; i++) {
      const row = rawData[i];
      const statusIndex = headers.indexOf('Status_OSv');
      const statusValue = statusIndex >= 0 ? String(row[statusIndex] || '').trim().toUpperCase() : '';
      
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

    console.log(`OSs de garantia encontradas: ${garantiaData.length}`);

    if (garantiaData.length === 0) {
      fs.unlinkSync(req.file.path);
      
      // Atualizar status do upload
      if (uploadRecord) {
        await supabase
          .from('uploads')
          .update({
            status: 'erro',
            mensagem_erro: 'Nenhuma OS de garantia encontrada',
            completed_at: new Date().toISOString()
          })
          .eq('id', uploadRecord.id);
      }
      
      return res.status(400).json({
        success: false,
        error: 'Nenhuma OS de garantia encontrada no arquivo'
      });
    }

    // Processar dados com classificação de defeitos
    const { dadosProcessados, ossDuplicadas } = await processarDadosExcel(garantiaData);

    console.log(`Dados processados: ${dadosProcessados.length}, OSs duplicadas ignoradas: ${ossDuplicadas.length}`);

    // Inserir dados na tabela ordens_servico (apenas os novos)
    let dadosInseridos = 0;
    if (dadosProcessados.length > 0) {
      const { data, error } = await supabase
        .from("ordens_servico")
        .insert(dadosProcessados)
        .select();

      if (error) {
        console.error("Erro ao inserir no Supabase:", error);
        
        // Atualizar status do upload
        if (uploadRecord) {
          await supabase
            .from('uploads')
            .update({
              status: 'erro',
              mensagem_erro: error.message,
              total_registros: garantiaData.length,
              registros_com_erro: garantiaData.length,
              completed_at: new Date().toISOString()
            })
            .eq('id', uploadRecord.id);
        }
        
        fs.unlinkSync(req.file.path);
        return res.status(500).json({
          success: false,
          error: 'Erro ao salvar dados no banco',
          details: error.message
        });
      }
      
      dadosInseridos = data ? data.length : 0;
    }

    // Atualizar status do upload
    if (uploadRecord) {
      await supabase
        .from('uploads')
        .update({
          status: 'concluido',
          total_registros: garantiaData.length,
          registros_processados: dadosInseridos,
          completed_at: new Date().toISOString()
        })
        .eq('id', uploadRecord.id);
    }

    // Limpar arquivo temporário
    fs.unlinkSync(req.file.path);

    res.status(200).json({ 
      success: true,
      message: "Arquivo processado com sucesso!", 
      detalhes: {
        total_linhas_excel: rawData.length - 1,
        oss_garantia_encontradas: garantiaData.length,
        oss_novas_inseridas: dadosInseridos,
        oss_duplicadas_ignoradas: ossDuplicadas.length,
        duplicadas: ossDuplicadas
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

// Rota para listar uploads
app.get('/api/uploads', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('uploads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar uploads',
        details: error.message
      });
    }

    res.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error("Erro ao buscar uploads:", error);
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
    // Total de OSs
    const { count: totalOS, error: errorTotal } = await supabase
      .from('ordens_servico')
      .select('*', { count: 'exact', head: true });

    // OSs com defeitos classificados
    const { count: defeitosClassificados, error: errorClassificados } = await supabase
      .from('ordens_servico')
      .select('*', { count: 'exact', head: true })
      .not('defeito_grupo', 'is', null);

    // OSs por status
    const { data: porStatus, error: errorStatus } = await supabase
      .from('ordens_servico')
      .select('status')
      .not('status', 'is', null);

    if (errorTotal || errorClassificados || errorStatus) {
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar estatísticas'
      });
    }

    // Contar por status
    const statusCount = {};
    porStatus.forEach(item => {
      const status = item.status;
      statusCount[status] = (statusCount[status] || 0) + 1;
    });

    res.json({
      success: true,
      estatisticas: {
        total_os: totalOS || 0,
        defeitos_classificados: defeitosClassificados || 0,
        defeitos_nao_classificados: (totalOS || 0) - (defeitosClassificados || 0),
        por_status: statusCount
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

// Rota para buscar OSs com filtros
app.get('/api/ordens-servico', async (req, res) => {
  try {
    const { 
      status, 
      data_inicio, 
      data_fim, 
      mecanico, 
      fabricante, 
      modelo,
      page = 1, 
      limit = 50 
    } = req.query;

    let query = supabase
      .from('ordens_servico')
      .select('*');

    // Aplicar filtros
    if (status) {
      query = query.eq('status', status);
    }
    
    if (data_inicio) {
      query = query.gte('data_ordem', data_inicio);
    }
    
    if (data_fim) {
      query = query.lte('data_ordem', data_fim);
    }
    
    if (mecanico) {
      query = query.ilike('mecanico_responsavel', `%${mecanico}%`);
    }
    
    if (fabricante) {
      query = query.ilike('fabricante_motor', `%${fabricante}%`);
    }
    
    if (modelo) {
      query = query.ilike('modelo_motor', `%${modelo}%`);
    }

    // Paginação
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);
    
    // Ordenar por data mais recente
    query = query.order('data_ordem', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar ordens de serviço',
        details: error.message
      });
    }

    res.json({
      success: true,
      data: data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count
      }
    });

  } catch (error) {
    console.error("Erro ao buscar ordens de serviço:", error);
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

