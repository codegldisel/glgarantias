const ExcelService = require('./src/services/excelService');
const NLPService = require('./src/services/nlpService');
const { Client } = require('pg');
const path = require('path');

const connectionString = 'postgresql://gpt_assistant.yvkdquddiwnnzydasfbi:GPTacesso123!@aws-0-sa-east-1.pooler.supabase.com:6543/postgres';

async function simulateOfficialProcessing() {
  const filePath = path.join(__dirname, '../upload', 'GLú-Garantias(Oficial).xlsx');
  console.log(`Iniciando simulação de processamento para: ${filePath}`);

  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false } // Necessário para Supabase
  });

  try {
    await client.connect();
    console.log('Conexão com Supabase estabelecida para inserção.');

    // 1. Ler e mapear dados do Excel
    const excelData = ExcelService.readExcelFile(filePath);
    console.log(`Total de registros lidos do Excel (antes do filtro de status): ${excelData.data.length}`);

    const mappedData = ExcelService.mapExcelDataToDatabase(excelData);
    console.log(`Total de registros mapeados e filtrados por status (G, GO, GU): ${mappedData.length}`);

    // 2. Classificar defeitos usando PLN e preparar para inserção
    const nlpService = new NLPService();
    const dataToInsert = mappedData.map(row => {
      const classification = nlpService.classifyDefect(row.defeito_texto_bruto);
      return {
        ...row,
        defeito_grupo: classification.grupo,
        defeito_subgrupo: classification.subgrupo,
        defeito_subsubgrupo: classification.subsubgrupo,
        classificacao_confianca: classification.confianca
      };
    });

    console.log('\n--- Amostra de Dados Processados (Primeiros 5 Registros) ---');
    dataToInsert.slice(0, 5).forEach((record, index) => {
      console.log(`\nRegistro ${index + 1}:`);
      console.log(`  Número OS: ${record.numero_ordem}`);
      console.log(`  Data OS: ${record.data_os ? record.data_os.toISOString().split('T')[0] : 'N/A'}`);
      console.log(`  Status: ${record.status}`);
      console.log(`  Defeito Bruto: ${record.defeito_texto_bruto}`);
      console.log(`  Classificação: ${record.defeito_grupo} > ${record.defeito_subgrupo} > ${record.defeito_subsubgrupo} (Confiança: ${record.classificacao_confianca})`);
      console.log(`  Total Geral: ${record.total_geral}`);
    });

    // Contagem de classificações
    const classificationCounts = {};
    dataToInsert.forEach(record => {
      const key = `${record.defeito_grupo} > ${record.defeito_subgrupo} > ${record.defeito_subsubgrupo}`;
      classificationCounts[key] = (classificationCounts[key] || 0) + 1;
    });

    console.log('\n--- Resumo das Classificações ---');
    for (const key in classificationCounts) {
      console.log(`${key}: ${classificationCounts[key]} registros`);
    }

    console.log(`\nTotal de registros prontos para inserção: ${dataToInsert.length}`);

    // 3. Inserir dados no Supabase
    console.log('\nIniciando inserção de dados no Supabase...');
    for (const record of dataToInsert) {
      const query = `
        INSERT INTO ordens_servico (
          numero_ordem, data_os, status, fabricante_motor, modelo_motor,
          defeito_texto_bruto, defeito_grupo, defeito_subgrupo, defeito_subsubgrupo,
          classificacao_confianca, total_pecas, total_servico, total_geral,
          mecanico_responsavel, cliente_nome, observacoes, data_fechamento
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        ON CONFLICT (numero_ordem) DO UPDATE SET
          data_os = EXCLUDED.data_os,
          status = EXCLUDED.status,
          fabricante_motor = EXCLUDED.fabricante_motor,
          modelo_motor = EXCLUDED.modelo_motor,
          defeito_texto_bruto = EXCLUDED.defeito_texto_bruto,
          defeito_grupo = EXCLUDED.defeito_grupo,
          defeito_subgrupo = EXCLUDED.defeito_subgrupo,
          defeito_subsubgrupo = EXCLUDED.defeito_subsubgrupo,
          classificacao_confianca = EXCLUDED.classificacao_confianca,
          total_pecas = EXCLUDED.total_pecas,
          total_servico = EXCLUDED.total_servico,
          total_geral = EXCLUDED.total_geral,
          mecanico_responsavel = EXCLUDED.mecanico_responsavel,
          cliente_nome = EXCLUDED.cliente_nome,
          observacoes = EXCLUDED.observacoes,
          data_fechamento = EXCLUDED.data_fechamento;
      `;
      const values = [
        record.numero_ordem,
        record.data_os,
        record.status,
        record.fabricante_motor,
        record.modelo_motor,
        record.defeito_texto_bruto,
        record.defeito_grupo,
        record.defeito_subgrupo,
        record.defeito_subsubgrupo,
        record.classificacao_confianca,
        record.total_pecas,
        record.total_servico,
        record.total_geral,
        record.mecanico_responsavel,
        record.cliente_nome,
        record.observacoes,
        record.data_fechamento
      ];
      await client.query(query, values);
    }
    console.log('Inserção de dados no Supabase concluída com sucesso!');

  } catch (error) {
    console.error('Erro na simulação de processamento ou inserção no Supabase:', error);
  } finally {
    await client.end();
  }
}

simulateOfficialProcessing();


