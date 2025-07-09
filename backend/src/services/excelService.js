const XLSX = require("xlsx");

class ExcelService {
  /**
   * Converte um número de série de data do Excel para um objeto Date do JavaScript.
   * @param {number} serial - Número de série da data do Excel.
   * @returns {Date|null} Objeto Date do JavaScript ou null se inválido.
   */
  static excelSerialDateToJSDate(cellValue) {
    if (cellValue === null || cellValue === undefined) {
      return null;
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
      // Formato: DD/MM/YYYY ou DD-MM-YYYY
      const matchDMY = cellValue.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
      if (matchDMY) {
        const [, day, month, year] = matchDMY.map(Number);
        const date = new Date(Date.UTC(year, month - 1, day));
        if (!isNaN(date.getTime())) return date;
      }

      // Formato: YYYY-MM-DD (padrão ISO)
      const matchYMD = cellValue.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
      if (matchYMD) {
        const [, year, month, day] = matchYMD.map(Number);
        const date = new Date(Date.UTC(year, month - 1, day));
        if (!isNaN(date.getTime())) return date;
      }
      
      // Tentar parsing direto, pode funcionar para formatos como 'YYYY-MM-DDTHH:mm:ss.sssZ'
      const directDate = new Date(cellValue);
      if (!isNaN(directDate.getTime())) {
        return directDate;
      }
    }
    
    // Se for um objeto Date, retornar diretamente
    if (cellValue instanceof Date && !isNaN(cellValue.getTime())) {
        return cellValue;
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
   * Mapeia os dados do Excel para o formato do banco de dados e filtra por status G, GO, GU.
   * @param {Array} excelData - Dados extraídos do Excel
   * @returns {Array} Dados mapeados e filtrados para o banco
   */
  static mapExcelDataToDatabase(excelData) {
    const mappedData = [];
    const warnings = [];

    for (const [index, row] of excelData.data.entries()) {
      const originalRowNumber = index + 2;

      const numeroOrdem = row["NOrdem_OSv"];
      if (!numeroOrdem) {
        warnings.push({ row: originalRowNumber, reason: "Linha descartada: Número da Ordem (NOrdem_OSv) está ausente." });
        continue;
      }

      const status = this.mapStatus(row["Status_OSv"]);
      if (!status) {
        warnings.push({ row: originalRowNumber, reason: `Linha descartada: Status inválido ou não é de garantia ('${row["Status_OSv"]}').` });
        continue;
      }

      let dataOrdem = ExcelService.excelSerialDateToJSDate(row["Data_OSv"]);
      let anoServico = null;
      let mesServico = null;
      let diaServico = null;

      if (dataOrdem) {
        anoServico = dataOrdem.getUTCFullYear();
        mesServico = dataOrdem.getUTCMonth() + 1;
        diaServico = dataOrdem.getUTCDate();
      } else {
        warnings.push({ row: originalRowNumber, reason: `Data_OSv inválida ('${row["Data_OSv"]}').` });
      }
      
      let defeitoTextoBruto = row["ObsCorpo_OSv"] || row["Obs_Osv"] || row["Descricao_TSr"];

      mappedData.push({
        numero_ordem: numeroOrdem,
        data_ordem: dataOrdem,
        status: status, // Corrigido para usar a variável 'status' já processada
        defeito_texto_bruto: defeitoTextoBruto || null,
        mecanico_responsavel: row["RazaoSocial_Cli"] || null,
        modelo_motor: row["Descricao_Mot"] || null,
        fabricante_motor: row["Fabricante_Mot"] || null,
        dia_servico: diaServico,
        mes_servico: mesServico,
        ano_servico: anoServico,
        total_pecas: this.parseNumber(row["TOT. PÇ"]),
        total_servico: this.parseNumber(row["TOT. SERV."]),
        total_geral: this.parseNumber(row["TOT"]),
        cliente_nome: row["Nome_Cli"] || null,
        observacoes: row["Obs_Osv"] || null,
        data_fechamento: ExcelService.excelSerialDateToJSDate(row["DataFecha_OSv"]),
      });
    }

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

  /**
   * Converte mês textual (ex: 'julho') para número (1-12), aceitando erros comuns de digitação e variações.
   * @param {string|number} mes - Mês textual ou numérico
   * @returns {number|null}
   */
  static parseMonth(mes) {
    if (typeof mes === 'number') return mes;
    if (!mes) return null;
    // Normaliza: minúsculo, sem acento, sem espaços
    let mesNorm = mes.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '');
    // Correções de erros comuns
    const correcoes = {
      'setemebro': 'setembro',
      'setemebto': 'setembro',
      'setemrbo': 'setembro',
      'setemro': 'setembro',
      'setembro': 'setembro',
      'novembro': 'novembro',
      'novbro': 'novembro',
      'novemrbo': 'novembro',
      'dezembro': 'dezembro',
      'dezembroo': 'dezembro',
      'dezembro': 'dezembro',
      'jan': 'janeiro',
      'fev': 'fevereiro',
      'mar': 'marco',
      'abr': 'abril',
      'mai': 'maio',
      'jun': 'junho',
      'jul': 'julho',
      'ago': 'agosto',
      'set': 'setembro',
      'out': 'outubro',
      'nov': 'novembro',
      'dez': 'dezembro',
    };
    if (correcoes[mesNorm]) mesNorm = correcoes[mesNorm];
    // Lista de meses válidos
    const meses = [
      'janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];
    const idx = meses.findIndex(m => m === mesNorm);
    if (idx >= 0) return idx + 1;
    // Tenta converter para número
    const num = parseInt(mes);
    return isNaN(num) ? null : num;
  }
}

module.exports = ExcelService;


