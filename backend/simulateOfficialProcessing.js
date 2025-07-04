const ExcelService = require('./src/services/excelService');
const NLPService = require('./src/services/nlpService');
const path = require('path');

async function simulateOfficialProcessing() {
  const filePath = path.join(__dirname, '../upload', 'GLú-Garantias(Oficial).xlsx');
  console.log(`Iniciando simulação de processamento para: ${filePath}`);

  try {
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

    // Aqui você adicionaria a lógica de inserção no Supabase
    // Por enquanto, apenas simulamos o processamento

  } catch (error) {
    console.error('Erro na simulação de processamento:', error);
  }
}

simulateOfficialProcessing();


