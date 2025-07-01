const XLSX = require('xlsx');
const path = require('path');

class ExcelService {
  /**
   * Lê um arquivo Excel e extrai dados da planilha "Tabela"
   * @param {string} filePath - Caminho para o arquivo Excel
   * @returns {Array} Array com os dados extraídos
   */
  static readExcelFile(filePath) {
    try {
      console.log('Lendo arquivo Excel:', filePath);
      
      // Ler o arquivo Excel
      const workbook = XLSX.readFile(filePath);
      
      // Verificar se a planilha "Tabela" existe
      if (!workbook.SheetNames.includes('Tabela')) {
        throw new Error('Planilha "Tabela" não encontrada no arquivo Excel');
      }
      
      // Obter a planilha "Tabela"
      const worksheet = workbook.Sheets['Tabela'];
      
      // Converter para JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length === 0) {
        throw new Error('A planilha "Tabela" está vazia');
      }
      
      // A primeira linha contém os cabeçalhos
      const headers = jsonData[0];
      const rows = jsonData.slice(1);
      
      console.log('Cabeçalhos encontrados:', headers);
      console.log(`Total de linhas de dados: ${rows.length}`);
      
      // Mapear os dados para objetos
      const mappedData = rows.map(row => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] || null;
        });
        return obj;
      });
      
      return {
        headers,
        data: mappedData,
        totalRows: rows.length
      };
      
    } catch (error) {
      console.error('Erro ao ler arquivo Excel:', error);
      throw error;
    }
  }
  
  /**
   * Mapeia os dados do Excel para o formato do banco de dados
   * @param {Array} excelData - Dados extraídos do Excel
   * @returns {Array} Dados mapeados para o banco
   */
  static mapExcelDataToDatabase(excelData) {
    try {
      const mappedData = excelData.data.map(row => {
        return {
          numero_ordem: row['NOrdem_OSv'] || null,
          data_ordem: row['Data_OSv'] || null,
          status: this.mapStatus(row['Status_OSv']),
          defeito_texto_bruto: row['ObsCorpo_OSv'] || null,
          mecanico_responsavel: row['RazaoSocial_Cli'] || null,
          modelo_motor: row['Descricao_Mot'] || null,
          fabricante_motor: row['Fabricante_Mot'] || null,
          dia_servico: row['DIA'] || null,
          mes_servico: row['MÊS'] || null,
          ano_servico: row['ANO'] || null,
          total_pecas: this.parseNumber(row['TOT. PÇ']),
          total_servico: this.parseNumber(row['TOT. SERV.']),
          total_geral: this.parseNumber(row['TOT'])
        };
      });
      
      return mappedData;
    } catch (error) {
      console.error('Erro ao mapear dados do Excel:', error);
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
      case 'G':
        return 'Garantia';
      case 'GO':
        return 'Garantia de Oficina';
      case 'GU':
        return 'Garantia de Usinagem';
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
    if (value === null || value === undefined || value === '') {
      return null;
    }
    
    const num = parseFloat(value);
    return isNaN(num) ? null : num;
  }
}

module.exports = ExcelService;

