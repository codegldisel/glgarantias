const XLSX = require("xlsx");
const path = require("path");

class ExcelService {
  /**
   * Converte um número de série de data do Excel para um objeto Date do JavaScript.
   * @param {number} serial - Número de série da data do Excel.
   * @returns {Date|null} Objeto Date do JavaScript ou null se inválido.
   */
  static excelSerialDateToJSDate(serial) {
    if (typeof serial !== 'number' || isNaN(serial)) {
      return null;
    }
    const utc_days  = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);

    const fractional_day = serial - Math.floor(serial) + 0.0000001; 

    let total_seconds = Math.floor(86400 * fractional_day);

    const seconds = total_seconds % 60;
    total_seconds -= seconds;

    const minutes = total_seconds / 60 % 60;
    total_seconds -= minutes * 60;

    const hours = Math.floor(total_seconds / 3600);

    const resultDate = new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);
    if (isNaN(resultDate.getTime())) {
      return null;
    }
    return resultDate;
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
    try {
      const mappedData = excelData.data.map(row => {
        let defeitoTextoBruto = row["ObsCorpo_OSv"];
        if (!defeitoTextoBruto) {
          defeitoTextoBruto = row["Obs_Osv"];
        }
        if (!defeitoTextoBruto) {
          defeitoTextoBruto = row["Descricao_TSr"];
        }

        return {
          numero_ordem: row["NOrdem_OSv"] || null,
          data_ordem: ExcelService.excelSerialDateToJSDate(row["Data_OSv"]),
          status: this.mapStatus(row["Status_OSv"]),
          defeito_texto_bruto: defeitoTextoBruto || null,
          mecanico_responsavel: row["RazaoSocial_Cli"] || null,
          modelo_motor: row["Descricao_Mot"] || null,
          fabricante_motor: row["Fabricante_Mot"] || null,
          dia_servico: row["DIA"] || null,
          mes_servico: row["MÊS"] || null,
          ano_servico: row["ANO"] || null,
          total_pecas: this.parseNumber(row["TOT. PÇ"]),
          total_servico: this.parseNumber(row["TOT. SERV."]),
          total_geral: this.parseNumber(row["TOT"]),
          cliente_nome: row["Nome_Cli"] || null,
          data_os: ExcelService.excelSerialDateToJSDate(row["Data_OSv"]),
          observacoes: row["Obs_Osv"] || null,
          data_fechamento: ExcelService.excelSerialDateToJSDate(row["DataFecha_OSv"]),
        };
      });
      
      // Filtrar registros com base no status (G, GO, GU)
      const filteredData = mappedData.filter(record => {
        const status = record.status; 
        return status === 'Garantia' || status === 'Garantia de Oficina' || status === 'Garantia de Usinagem';
      });

      return filteredData;
    } catch (error) {
      console.error('Erro ao mapear e filtrar dados do Excel:', error);
      throw error;
    }
  }
  
  /**
   * Mapeia o status do Excel para o formato do banco
   * @param {string} status - Status do Excel (G, GO, GU)
   * @returns {string} Status mapeado
   */
  static mapStatus(status) {
    if (!status) return null;
    
    const statusUpper = status.toString().toUpperCase().trim();
    
    switch (statusUpper) {
      case "G":
        return "Garantia";
      case "GO":
        return "Garantia de Oficina";
      case "GU":
        return "Garantia de Usinagem";
      default:
        return status; // Retorna o valor original se não for reconhecido
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


