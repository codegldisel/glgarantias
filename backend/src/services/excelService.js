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
   * @param {Object} tracker - Objeto de rastreamento opcional
   * @returns {Array} Array com os dados extraídos
   */
  static readExcelFile(filePath, tracker = null) {
    try {
      if (tracker) tracker.log('EXCEL_FILE_ACCESS', `Acessando arquivo: ${filePath}`);
      
      // Ler o arquivo Excel
      const workbook = XLSX.readFile(filePath);
      if (tracker) tracker.log('EXCEL_WORKBOOK_LOADED', 'Workbook carregado com sucesso', {
        sheetNames: workbook.SheetNames
      });
      
      // Verificar se a planilha "Tabela" existe
      if (!workbook.SheetNames.includes("Tabela")) {
        const error = new Error("Planilha \"Tabela\" não encontrada no arquivo Excel");
        if (tracker) tracker.logError('EXCEL_SHEET_NOT_FOUND', error, {
          availableSheets: workbook.SheetNames
        });
        throw error;
      }
      
      if (tracker) tracker.log('EXCEL_SHEET_FOUND', 'Planilha "Tabela" encontrada');
      
      // Obter a planilha "Tabela"
      const worksheet = workbook.Sheets["Tabela"];
      
      // Converter para JSON, garantindo que células vazias sejam tratadas como null e lendo valores brutos
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: true, defval: null });
      
      if (jsonData.length === 0) {
        const error = new Error("A planilha \"Tabela\" está vazia");
        if (tracker) tracker.logError('EXCEL_EMPTY_SHEET', error);
        throw error;
      }
      
      // A primeira linha contém os cabeçalhos
      const headers = jsonData[0];
      const rows = jsonData.slice(1);
      
      if (tracker) tracker.log('EXCEL_HEADERS_EXTRACTED', 'Cabeçalhos extraídos', {
        headers: headers,
        totalDataRows: rows.length
      });
      
      // Mapear os dados para objetos
      const mappedData = rows.map(row => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index]; // Já deve ser null se a célula estiver vazia
        });
        return obj;
      });
      
      if (tracker) tracker.log('EXCEL_DATA_MAPPED', 'Dados mapeados para objetos', {
        totalMappedRows: mappedData.length,
        sampleRow: mappedData.length > 0 ? mappedData[0] : null
      });
      
      return {
        headers,
        data: mappedData,
        totalRows: rows.length
      };
      
    } catch (error) {
      if (tracker) tracker.logError('EXCEL_READ_ERROR', error);
      console.error("Erro ao ler arquivo Excel:", error);
      throw error;
    }
  }
  
  /**
   * Mapeia os dados do Excel para o formato do banco de dados e filtra por status G, GO, GU e ano >= 2019.
   * @param {Array} excelData - Dados extraídos do Excel
   * @param {Object} tracker - Objeto de rastreamento opcional
   * @returns {Array} Dados mapeados e filtrados para o banco
   */
  static mapExcelDataToDatabase(excelData, tracker = null) {
    if (tracker) tracker.log('MAPPING_START', 'Iniciando mapeamento dos dados do Excel', {
      totalRows: excelData.data.length,
      headers: excelData.headers
    });

    const mappedData = [];
    const warnings = [];
    let totalProcessed = 0;
    let filteredByStatus = 0;
    let filteredByYear = 0;
    let filteredByValidation = 0;

    // Verificar se as colunas necessárias estão presentes
    const requiredColumns = ['NOrdem_OSv', 'Data_OSv', 'Fabricante_Mot', 'Descricao_Mot', 'ModeloVei_Osv', 'ObsCorpo_OSv', 'RazaoSocial_Cli', 'TotalProd_OSv', 'Total_OSv', 'Status_OSv'];
    const missingColumns = requiredColumns.filter(col => !excelData.headers.includes(col));
    
    if (missingColumns.length > 0) {
      const error = new Error(`Colunas obrigatórias não encontradas: ${missingColumns.join(', ')}`);
      if (tracker) tracker.logError('MAPPING_MISSING_COLUMNS', error, {
        missingColumns,
        availableColumns: excelData.headers
      });
      throw error;
    }

    if (tracker) tracker.log('MAPPING_COLUMNS_VALIDATED', 'Todas as colunas obrigatórias encontradas', {
      requiredColumns
    });

    for (const [index, row] of excelData.data.entries()) {
      const originalRowNumber = index + 2;
      totalProcessed++;

      // Log detalhado para as primeiras 5 linhas
      if (index < 5 && tracker) {
        tracker.log('MAPPING_ROW_START', `Processando linha ${originalRowNumber}`, {
          rowData: row
        });
      }

      const numeroOrdem = row["NOrdem_OSv"];
      if (!numeroOrdem) {
        const warning = { row: originalRowNumber, reason: "Linha descartada: Número da Ordem (NOrdem_OSv) está ausente." };
        warnings.push(warning);
        if (index < 5 && tracker) tracker.log('MAPPING_ROW_SKIPPED', `Linha ${originalRowNumber} descartada`, warning);
        continue;
      }

      // Verificar se o status é válido (G, GO, GU)
      const statusRaw = row["Status_OSv"] ? row["Status_OSv"].toString().toUpperCase().trim() : null;
      const status = this.mapStatus(statusRaw);

      if (!["Garantia", "Garantia de Oficina", "Garantia de Usinagem"].includes(status)) {
        filteredByStatus++;
        const warning = { row: originalRowNumber, reason: `Linha descartada: Status_OSv inválido (${statusRaw}).` };
        warnings.push(warning);
        if (index < 5 && tracker) tracker.log("MAPPING_ROW_FILTERED_STATUS", `Linha ${originalRowNumber} filtrada por status`, warning);
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

        // Verificar se o ano é >= 2019
        if (anoServico < 2019) {
          filteredByYear++;
          const warning = { row: originalRowNumber, reason: `Linha descartada: Ano da Data_OSv (${anoServico}) anterior a 2019.` };
          warnings.push(warning);
          if (index < 5 && tracker) tracker.log("MAPPING_ROW_FILTERED_YEAR", `Linha ${originalRowNumber} filtrada por ano`, warning);
          continue;
        }
      } else {
        const warning = { row: originalRowNumber, reason: `Linha descartada: Data_OSv inválida ou ausente ('${row["Data_OSv"]}').` };
        warnings.push(warning);
        if (index < 5 && tracker) tracker.log('MAPPING_ROW_DATE_ERROR', `Linha ${originalRowNumber} erro na data`, warning);
        continue;
      }
      
      let totalPecasRaw = this.parseNumber(row["TotalProd_OSv"]);
      let totalPecas = totalPecasRaw !== null ? totalPecasRaw / 2 : null; // Dividir por 2
      
      let totalGeral = this.parseNumber(row["Total_OSv"]);

      
      mappedData.push({
        numero_ordem: numeroOrdem,
        data_ordem: dataOrdem,
        status: status,
        defeito_texto_bruto: row["ObsCorpo_OSv"] || null,
        mecanico_responsavel: row["RazaoSocial_Cli"] || null,
        modelo_motor: row["Descricao_Mot"] || null,
        modelo_veiculo_motor: row["ModeloVei_Osv"] || null,
        fabricante_motor: row["Fabricante_Mot"] || null,
        dia_servico: diaServico,
        mes_servico: mesServico,
        ano_servico: anoServico,
        total_pecas: totalPecas,
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
        return statusUpper; // Retorna o status original se não for um dos válidos
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



