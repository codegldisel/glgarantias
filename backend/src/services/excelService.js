const XLSX = require('xlsx');
const path = require('path');

class ExcelService {
  /**
   * Lê um arquivo Excel e extrai dados da planilha "Planilha6" (dados de garantia)
   * @param {string} filePath - Caminho para o arquivo Excel
   * @returns {Object} Objeto com headers e dados extraídos
   */
  static readExcelFile(filePath) {
    try {
      console.log('Lendo arquivo Excel:', filePath);
      
      // Ler o arquivo Excel
      const workbook = XLSX.readFile(filePath);
      
      console.log('Planilhas encontradas:', workbook.SheetNames);
      
      // Verificar se a planilha "Planilha6" existe (dados de garantia)
      if (!workbook.SheetNames.includes('Planilha6')) {
        throw new Error('Planilha "Planilha6" não encontrada no arquivo Excel. Planilhas disponíveis: ' + workbook.SheetNames.join(', '));
      }
      
      // Obter a planilha "Planilha6"
      const worksheet = workbook.Sheets['Planilha6'];
      
      // Converter para JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length === 0) {
        throw new Error('A planilha "Planilha6" está vazia');
      }
      
      // A primeira linha contém os cabeçalhos
      const headers = jsonData[0];
      const rows = jsonData.slice(1);
      
      console.log('Cabeçalhos encontrados:', headers);
      console.log(`Total de linhas de dados: ${rows.length}`);
      
      // Mapear os dados para objetos, filtrando linhas vazias
      const mappedData = rows
        .filter(row => row && row.length > 0 && row.some(cell => cell !== null && cell !== undefined && cell !== ''))
        .map((row, index) => {
          const obj = {};
          headers.forEach((header, headerIndex) => {
            if (header) { // Só mapear se o header existir
              obj[header] = row[headerIndex] || null;
            }
          });
          obj._rowIndex = index + 2; // +2 porque começamos da linha 2 (header é linha 1)
          return obj;
        });
      
      console.log(`Dados válidos processados: ${mappedData.length}`);
      
      return {
        headers,
        data: mappedData,
        totalRows: mappedData.length
      };
      
    } catch (error) {
      console.error('Erro ao ler arquivo Excel:', error);
      throw error;
    }
  }

  /**
   * Mapeia dados do Excel para o formato do banco de dados
   * @param {Object} excelData - Dados extraídos do Excel
   * @returns {Array} Array de objetos formatados para inserção no banco
   */
  static mapExcelDataToDatabase(excelData) {
    try {
      console.log('Mapeando dados do Excel para formato do banco...');
      
      const mappedData = excelData.data.map(row => {
        // Extrair e limpar dados
        const numeroOS = row['OS'] ? String(row['OS']).trim() : null;
        const fabricante = row['FABRICANTE'] ? String(row['FABRICANTE']).trim() : null;
        const motor = row['MOTOR'] ? String(row['MOTOR']).trim() : null;
        const observacoes = row['OBSERVAÇÕES'] ? String(row['OBSERVAÇÕES']).trim() : null;
        const defeito = row['DEFEITO'] ? String(row['DEFEITO']).trim() : null;
        const mecanico = row['MECÂNICO MONTADOR'] ? String(row['MECÂNICO MONTADOR']).trim() : null;
        const cliente = row['CLIENTE'] ? String(row['CLIENTE']).trim() : null;
        
        // Converter valores monetários
        const totalPecas = this.parseNumericValue(row['TOTAL PEÇAS']);
        const totalServicos = this.parseNumericValue(row['TOTAL SERVIÇOS']);
        const total = this.parseNumericValue(row['TOTAL']);
        
        // Processar data
        const dia = row['DIA'] ? parseInt(row['DIA']) : null;
        const mes = row['MÊS'] ? String(row['MÊS']).trim() : null;
        const ano = row['ANO'] ? parseInt(row['ANO']) : null;
        
        let dataOS = null;
        if (dia && mes && ano) {
          const mesNumero = this.convertMonthNameToNumber(mes);
          if (mesNumero) {
            dataOS = new Date(ano, mesNumero - 1, dia).toISOString().split('T')[0];
          }
        }
        
        return {
          numero_ordem: numeroOS,
          data_os: dataOS,
          fabricante_motor: fabricante,
          modelo_motor: motor,
          cliente_nome: cliente,
          mecanico_responsavel: mecanico,
          observacoes: observacoes,
          defeito_texto_bruto: defeito || observacoes, // Usar observações se defeito estiver vazio
          total_pecas: totalPecas,
          total_servico: totalServicos,
          total_geral: total,
          status: 'processado',
          created_at: new Date().toISOString(),
          // Campos que serão preenchidos pelo NLP
          defeito_grupo: null,
          defeito_subgrupo: null,
          defeito_subsubgrupo: null,
          classificacao_confianca: null
        };
      }).filter(item => item.numero_ordem); // Filtrar apenas registros com número de OS
      
      console.log(`Dados mapeados: ${mappedData.length} registros válidos`);
      
      return mappedData;
      
    } catch (error) {
      console.error('Erro ao mapear dados:', error);
      throw error;
    }
  }
  
  /**
   * Converte valor para número, tratando diferentes formatos
   */
  static parseNumericValue(value) {
    if (!value) return 0;
    
    // Se já é número, retorna
    if (typeof value === 'number') return value;
    
    // Se é string, limpa e converte
    if (typeof value === 'string') {
      const cleaned = value.replace(/[^\d,.-]/g, '').replace(',', '.');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    }
    
    return 0;
  }
  
  /**
   * Converte nome do mês para número
   */
  static convertMonthNameToNumber(monthName) {
    const months = {
      'janeiro': 1, 'jan': 1,
      'fevereiro': 2, 'fev': 2,
      'março': 3, 'mar': 3,
      'abril': 4, 'abr': 4,
      'maio': 5, 'mai': 5,
      'junho': 6, 'jun': 6,
      'julho': 7, 'jul': 7,
      'agosto': 8, 'ago': 8,
      'setembro': 9, 'set': 9,
      'outubro': 10, 'out': 10,
      'novembro': 11, 'nov': 11,
      'dezembro': 12, 'dez': 12
    };
    
    return months[monthName.toLowerCase()] || null;
  }
}

module.exports = ExcelService;

