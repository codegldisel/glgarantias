const XLSX = require("xlsx");
const path = require("path");
const ExcelService = require("./src/services/excelService");
const NLPService = require("./src/services/nlpService");

const filePath = path.join("/home/ubuntu/upload/AnálisedasGarantias.xlsx");

async function simulateProcessing() {
  try {
    console.log("Iniciando simulação de processamento...");

    // 1. Ler o arquivo Excel
    console.log("Lendo arquivo Excel...");
    const excelData = ExcelService.readExcelFile(filePath);
    console.log(`Arquivo Excel lido. Total de linhas: ${excelData.totalRows}`);

    // 2. Mapear os dados do Excel para o formato do banco de dados
    console.log("Mapeando dados do Excel para o formato do banco de dados...");
    const mappedData = ExcelService.mapExcelDataToDatabase(excelData);
    console.log(`Dados mapeados. Total de registros: ${mappedData.length}`);

    // 3. Classificar os defeitos usando NLPService
    console.log("Classificando defeitos com NLPService...");
    const nlpService = new NLPService();
    const processedRecords = mappedData.map(record => {
      const classification = nlpService.classifyDefect(record.defeito_texto_bruto);
      return { ...record, ...classification };
    });
    console.log("Classificação de defeitos concluída.");

    // Verificações adicionais:
    console.log("\n--- Verificações Adicionais ---");
    const recordsWithNullDefeitoBruto = processedRecords.filter(r => r.defeito_texto_bruto === null || String(r.defeito_texto_bruto).trim() === "");
    console.log(`Registros com \'defeito_texto_bruto\' nulo ou vazio: ${recordsWithNullDefeitoBruto.length}`);

    const recordsNotClassified = processedRecords.filter(r => r.grupo === "Não Classificado");
    console.log(`Registros não classificados (Grupo \'Não Classificado\'): ${recordsNotClassified.length}`);

    const recordsWithInvalidNumbers = processedRecords.filter(r => 
      (r.total_pecas !== null && isNaN(r.total_pecas)) ||
      (r.total_servico !== null && isNaN(r.total_servico)) ||
      (r.total_geral !== null && isNaN(r.total_geral))
    );
    console.log(`Registros com valores numéricos inválidos: ${recordsWithInvalidNumbers.length}`);

    // Exibir exemplos de defeitos não classificados
    console.log("\n--- Exemplos de Defeitos Não Classificados (primeiros 20) ---");
    recordsNotClassified.slice(0, 20).forEach((record, index) => {
      console.log(`Exemplo ${index + 1}: ${record.defeito_texto_bruto}`);
    });

  } catch (error) {
    console.error("Erro durante a simulação de processamento:", error);
  }
}

simulateProcessing();


