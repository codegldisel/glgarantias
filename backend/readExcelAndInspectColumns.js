const XLSX = require("xlsx");
const path = require("path");

const filePath = path.join("/home/ubuntu/upload/AnálisedasGarantias.xlsx");

try {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0]; // Assume a primeira planilha
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: true, defval: null });

  if (jsonData.length === 0) {
    console.log("A planilha está vazia.");
    return;
  }

  const headers = jsonData[0];
  const obsCorpoIndex = headers.indexOf("ObsCorpo_OSv");
  const obsOsvIndex = headers.indexOf("Obs_Osv"); // Outra coluna de observações
  const descricaoTSrIndex = headers.indexOf("Descricao_TSr"); // Descrição do Tipo de Serviço

  console.log("--- Inspecionando colunas de defeito/observação (primeiras 20 linhas) ---");
  console.log("Headers:", headers);

  jsonData.slice(1, 21).forEach((row, index) => {
    const rowNum = index + 2;
    const obsCorpo = obsCorpoIndex !== -1 ? row[obsCorpoIndex] : "N/A";
    const obsOsv = obsOsvIndex !== -1 ? row[obsOsvIndex] : "N/A";
    const descricaoTSr = descricaoTSrIndex !== -1 ? row[descricaoTSrIndex] : "N/A";

    console.log(`\nLinha ${rowNum}:`);
    console.log(`  ObsCorpo_OSv: ${obsCorpo}`);
    console.log(`  Obs_Osv: ${obsOsv}`);
    console.log(`  Descricao_TSr: ${descricaoTSr}`);
  });

  // Contagem de valores nulos/vazios para ObsCorpo_OSv
  let nullObsCorpoCount = 0;
  let nullObsOsvCount = 0;
  let nullDescricaoTSrCount = 0;

  for (let i = 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (obsCorpoIndex !== -1 && (row[obsCorpoIndex] === null || String(row[obsCorpoIndex]).trim() === "")) {
      nullObsCorpoCount++;
    }
    if (obsOsvIndex !== -1 && (row[obsOsvIndex] === null || String(row[obsOsvIndex]).trim() === "")) {
      nullObsOsvCount++;
    }
    if (descricaoTSrIndex !== -1 && (row[descricaoTSrIndex] === null || String(row[descricaoTSrIndex]).trim() === "")) {
      nullDescricaoTSrCount++;
    }
  }

  console.log("\n--- Estatísticas de Nulos/Vazios ---");
  console.log(`Total de linhas na planilha (excluindo cabeçalho): ${jsonData.length - 1}`);
  console.log(`Registros com ObsCorpo_OSv nulo/vazio: ${nullObsCorpoCount}`);
  console.log(`Registros com Obs_Osv nulo/vazio: ${nullObsOsvCount}`);
  console.log(`Registros com Descricao_TSr nulo/vazio: ${nullDescricaoTSrCount}`);

} catch (error) {
  console.error("Erro ao ler a planilha Excel:", error);
}

