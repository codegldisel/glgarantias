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

    // 2. Mapear os dados do Excel para o formato do banco de dados (já inclui filtro de status)
    console.log("Mapeando dados do Excel para o formato do banco de dados...");
    const mappedData = ExcelService.mapExcelDataToDatabase(excelData);
    console.log(`Dados mapeados e filtrados. Total de registros: ${mappedData.length}`);

    // 3. Classificar os defeitos usando NLPService
    console.log("Classificando defeitos com NLPService...");
    const nlpService = new NLPService();
    const processedRecords = mappedData.map(record => {
      const classification = nlpService.classifyDefect(record.defeito_texto_bruto);
      return { ...record, ...classification };
    });
    console.log("Classificação de defeitos concluída.");

    // Exibir os primeiros 5 registros processados para verificação
    console.log("\nPrimeiros 5 registros processados (com classificação de defeitos):\n");
    processedRecords.slice(0, 5).forEach((record, index) => {
      console.log(`Registro ${index + 1}:`);
      console.log(`  Número Ordem: ${record.numero_ordem}`);
      console.log(`  Data Ordem: ${record.data_ordem ? record.data_ordem.toISOString().split("T")[0] : "null"}`);
      console.log(`  Status: ${record.status}`);
      console.log(`  Defeito Bruto: ${record.defeito_texto_bruto}`);
      console.log(`  Grupo: ${record.grupo}`);
      console.log(`  Subgrupo: ${record.subgrupo}`);
      console.log(`  Subsubgrupo: ${record.subsubgrupo}`);
      console.log(`  Confiança: ${record.confianca}`);
      console.log(`  Mecânico: ${record.mecanico_responsavel}`);
      console.log(`  Modelo Motor: ${record.modelo_motor}`);
      console.log(`  Fabricante Motor: ${record.fabricante_motor}`);
      console.log(`  Total Peças: ${record.total_pecas}`);
      console.log(`  Total Serviço: ${record.total_servico}`);
      console.log(`  Total Geral: ${record.total_geral}`);
      console.log(`  Cliente Nome: ${record.cliente_nome}`);
      console.log(`  Observações: ${record.observacoes}`);
      console.log(`  Data Fechamento: ${record.data_fechamento ? record.data_fechamento.toISOString().split("T")[0] : "null"}`);
      console.log("----------------------------------------");
    });

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

  } catch (error) {
    console.error("Erro durante a simulação de processamento:", error);
  }
}

simulateProcessing();


