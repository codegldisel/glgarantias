const XLSX = require("xlsx");
const path = require("path");

const filePath = path.join("/home/ubuntu/upload/AnálisedasGarantias.xlsx");

try {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0]; // Assume a primeira planilha
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  if (jsonData.length === 0) {
    console.log("A planilha está vazia.");
    return;
  }

  const headers = jsonData[0];
  const obsCorpoIndex = headers.indexOf("ObsCorpo_OSv");

  if (obsCorpoIndex === -1) {
    console.log("Coluna 'ObsCorpo_OSv' não encontrada na planilha.");
    return;
  }

  console.log(`Conteúdo da coluna 'ObsCorpo_OSv' (primeiras 20 linhas):`);
  jsonData.slice(1, 21).forEach((row, index) => {
    console.log(`Linha ${index + 2}: ${row[obsCorpoIndex]}`);
  });

} catch (error) {
  console.error("Erro ao ler a planilha Excel:", error);
}

