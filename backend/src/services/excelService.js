const XLSX = require("xlsx");

class ExcelService {
  /**
   * Converte um valor de data do Excel para um objeto Date do JavaScript.
   * Suporta números seriais do Excel e strings em vários formatos, incluindo 'DD/MM/YYYY HH:MM:SS'.
   * @param {any} cellValue - Valor da célula do Excel (número, string ou Date).
   * @returns {Date|null} Objeto Date do JavaScript ou null se inválido.
   */
  static excelSerialDateToJSDate(cellValue) {
    if (cellValue === null || cellValue === undefined || cellValue === '') {
      return null;
    }

    // Se for um objeto Date, retornar diretamente
    if (cellValue instanceof Date && !isNaN(cellValue.getTime())) {
        return cellValue;
    }

    // Se for um número, tratar como data serial do Excel
    if (typeof cellValue === 'number' && isFinite(cellValue)) {
      const excelEpoch = new Date(Date.UTC(1899, 11, 30));
      const date = new Date(excelEpoch.getTime() + cellValue * 24 * 60 * 60 * 1000);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }

    // Se for uma string, tentar analisar formatos comuns
    if (typeof cellValue === 'string') {
      // Formato: DD/MM/YYYY HH:MM:SS (ex: 15/07/2025 00:00:00)
      const matchDateTime = cellValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{1,2}):(\d{1,2})$/);
      if (matchDateTime) {
        const [, day, month, year, hour, minute, second] = matchDateTime.map(Number);
        // Usar UTC para evitar problemas de fuso horário, mas construir com base local para compatibilidade
        const date = new Date(year, month - 1, day, hour, minute, second);
        if (!isNaN(date.getTime())) return date;
      }

      // Formato: DD/MM/YYYY ou DD-MM-YYYY
      const matchDMY = cellValue.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
      if (matchDMY) {
        const [, day, month, year] = matchDMY.map(Number);
        const date = new Date(year, month - 1, day);
        if (!isNaN(date.getTime())) return date;
      }

      // Formato: YYYY-MM-DD (padrão ISO)
      const matchYMD = cellValue.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
      if (matchYMD) {
        const [, year, month, day] = matchYMD.map(Number);
        const date = new Date(year, month - 1, day);
        if (!isNaN(date.getTime())) return date;
      }
      
      // Tentar parsing direto, pode funcionar para formatos como 'YYYY-MM-DDTHH:mm:ss.sssZ'
      const directDate = new Date(cellValue);
      if (!isNaN(directDate.getTime())) {
        return directDate;
      }
    }
    
    console.warn(`[excelService] Não foi possível converter o valor de data:`, cellValue);
    return null;
  }

  /**
   * Lê um arquivo Excel e extrai dados da planilha "Tabela"
   * @param {string} filePath - Caminho para o arquivo Excel
   * @returns {Array} Array com os dados extraídos
   */
  static readExcelFile(filePath) {
    try {
      console.log("Lendo arquivo Excel:", filePath);
      
      // Ler o arquivo Excel
      const workbook = XLSX.readFile(filePath);
      
      // Verificar se a planilha "Tabela" existe
      if (!workbook.SheetNames.includes("Tabela")) {
        throw new Error("Planilha \"Tabela\" não encontrada no arquivo Excel");
      }
      
      // Obter a planilha "Tabela"
      const worksheet = workbook.Sheets["Tabela"];
      
      // Converter para JSON, garantindo que células vazias sejam tratadas como null e lendo valores brutos
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: true, defval: null });
      
      if (jsonData.length === 0) {
        throw new Error("A planilha \"Tabela\" está vazia");
      }
      
      // A primeira linha contém os cabeçalhos
      const headers = jsonData[0];
      const rows = jsonData.slice(1);
      
      console.log("Cabeçalhos encontrados:", headers);
      console.log(`Total de linhas de dados: ${rows.length}`);
      
      // Mapear os dados para objetos
      const mappedData = rows.map(row => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index]; // Já deve ser null se a célula estiver vazia
        });
        return obj;
      });
      
      return {
        headers,
        data: mappedData,
        totalRows: rows.length
      };
      
    } catch (error) {
      console.error("Erro ao ler arquivo Excel:", error);
      throw error;
    }
  }
  
  /**
   * Mapeia os dados do Excel para o formato do banco de dados e filtra por status G, GO, GU e ano >= 2019.
   * @param {Array} excelData - Dados extraídos do Excel
   * @returns {Array} Dados mapeados e filtrados para o banco
   */
  static mapExcelDataToDatabase(excelData) {
    const mappedData = [];
    const warnings = [];
    let totalProcessed = 0;
    let filteredByStatus = 0;
    let filteredByYear = 0;
    let filteredByValidation = 0;

    for (const [index, row] of excelData.data.entries()) {
      const originalRowNumber = index + 2;
      totalProcessed++;

      const numeroOrdem = row["NOrdem_OSv"];
      if (!numeroOrdem) {
        warnings.push({ row: originalRowNumber, reason: "Linha descartada: Número da Ordem (NOrdem_OSv) está ausente." });
        continue;
      }

      // Verificar se o status é válido (G, GO, GU)
      const statusRaw = row["Status_OSv"] ? row["Status_OSv"].toString().toUpperCase().trim() : null;
      const statusValidos = ["G", "GO", "GU"];
      if (!statusValidos.includes(statusRaw)) {
        filteredByStatus++;
        warnings.push({ row: originalRowNumber, reason: `Linha descartada: Status inválido ou não é de garantia ('${row["Status_OSv"]}' ).` });
        continue;
      }

      const status = this.mapStatus(statusRaw);
      if (!status) {
        warnings.push({ row: originalRowNumber, reason: `Linha descartada: Erro no mapeamento do status ('${statusRaw}').` });
        continue;
      }

      let dataOrdem = ExcelService.excelSerialDateToJSDate(row["Data_OSv"]);
      let anoServico = null;
      let mesServico = null;
      let diaServico = null;

      if (dataOrdem) {
        anoServico = dataOrdem.getFullYear();
        mesServico = dataOrdem.getMonth() + 1;
        diaServico = dataOrdem.getDate();

        // NOVO: Verificar se o ano é >= 2019
        if (anoServico < 2019) {
          filteredByYear++;
          warnings.push({ row: originalRowNumber, reason: `Linha descartada: Ano da Data_OSv (${anoServico}) anterior a 2019.` });
          continue;
        }
      } else {
        warnings.push({ row: originalRowNumber, reason: `Linha descartada: Data_OSv inválida ou ausente ('${row["Data_OSv"]}' ).` });
        continue;
      }
      
      let totalPecasRaw = this.parseNumber(row["TotalProd_OSv"]);
      let totalPecas = totalPecasRaw !== null ? totalPecasRaw / 2 : null; // Dividir por 2
      
      let totalServico = this.parseNumber(row["TotalServ_OSv"]);
      let totalGeral = this.parseNumber(row["Total_OSv"]);

      // Validação: (TotalProd_OSv/2) + TotalServ_OSv = Total_OSv
      if (totalPecas !== null && totalServico !== null && totalGeral !== null) {
        const calculatedTotal = totalPecas + totalServico;
        if (Math.abs(calculatedTotal - totalGeral) > 0.01) { // Usar tolerância para float
          filteredByValidation++;
          warnings.push({ row: originalRowNumber, reason: `Linha descartada: Validação de totais falhou. Calculado: ${calculatedTotal}, Esperado: ${totalGeral}.` });
          continue;
        }
      } else if (totalPecas === null || totalServico === null || totalGeral === null) {
        // Se algum dos totais for nulo, descartar a linha
        filteredByValidation++;
        warnings.push({ row: originalRowNumber, reason: `Linha descartada: Um ou mais valores de totais (TotalProd_OSv, TotalServ_OSv, Total_OSv) estão ausentes ou inválidos.` });
        continue;
      }

      mappedData.push({
        numero_ordem: numeroOrdem,
        data_ordem: dataOrdem,
        status: status,
        defeito_texto_bruto: row["ObsCorpo_OSv"] || null,
        mecanico_responsavel: row["RazaoSocial_Cli"] || null,
        modelo_motor: row["Descricao_Mot"] || null,
        fabricante_motor: row["Fabricante_Mot"] || null,
        dia_servico: diaServico,
        mes_servico: mesServico,
        ano_servico: anoServico,
        total_pecas: totalPecas,
        total_servico: totalServico,
        total_geral: totalGeral,
      });
    }

    // Log de estatísticas de filtragem
    console.log("================== ESTATÍSTICAS DE FILTRAGEM ==================");
    console.log(`Total de linhas processadas: ${totalProcessed}`);
    console.log(`Filtradas por status (não G/GO/GU): ${filteredByStatus}`);
    console.log(`Filtradas por ano (< 2019): ${filteredByYear}`);
    console.log(`Filtradas por validação de totais: ${filteredByValidation}`);
    console.log(`Registros válidos após filtragem: ${mappedData.length}`);
    console.log("===============================================================");

    if (warnings.length > 0) {
      console.warn("================== AVISOS DURANTE O PROCESSAMENTO ==================");
      console.warn(`Total de ${warnings.length} avisos gerados.`);
      warnings.slice(0, 15).forEach(w => console.warn(`- Linha ${w.row}: ${w.reason}`));
      if (warnings.length > 15) {
        console.warn(`- ... e mais ${warnings.length - 15} outros avisos.`);
      }
      console.warn("====================================================================");
    }

    return mappedData;
  }
  
  /**
   * Mapeia o status do Excel para o formato do banco
   * @param {string} status - Status do Excel (G, GO, GU)
   * @returns {string} Status mapeado
   */
  static mapStatus(status) {
    if (!status) return null;
    
    const statusUpper = String(status).toUpperCase().trim();
    
    switch (statusUpper) {
      case "G":
        return "Garantia";
      case "GO":
        return "Garantia de Oficina";
      case "GU":
        return "Garantia de Usinagem";
      default:
        // Se não for um dos status de garantia válidos, retorna null.
        return null;
    }
  }
  
  /**
   * Converte string para número, tratando valores inválidos
   * @param {any} value - Valor a ser convertido
   * @returns {number|null} Número convertido ou null
   */
  static parseNumber(value) {
    if (value === null || value === undefined || value === "") {
      return null;
    }
    
    const num = parseFloat(value);
    return isNaN(num) ? null : num;
  }
}

module.exports = ExcelService;



