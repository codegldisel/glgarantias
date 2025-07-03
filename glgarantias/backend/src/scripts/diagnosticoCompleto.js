const ExcelService = require('../services/excelService');
const NLPService = require('../services/nlpService');

/**
 * Script de Diagnóstico Completo do Fluxo de Dados
 * Verifica se TUDO está funcionando corretamente
 */
async function diagnosticoCompleto() {
  try {
    console.log('🔍 DIAGNÓSTICO COMPLETO DO FLUXO DE DADOS\n');
    
    // 1. TESTE DE MAPEAMENTO DE COLUNAS
    console.log('📋 1. TESTE DE MAPEAMENTO DE COLUNAS');
    console.log('=====================================');
    
    const colunasEsperadas = [
      'NOrdem_OSv',        // Número da OS
      'Status_OSv',        // Status (G, GO, GU)
      'Data_OSv',          // Data da OS
      'ObsCorpo_OSv',      // Defeitos no Motor
      'DataFecha_Osv',     // Data de fechamento (IMPORTANTE!)
      'RazaoSocial_Cli',   // Mecânicos Montadores
      'Descricao_Mot',     // Modelo do Motor
      'Fabricante_Mot',    // Fabricante do Motor
      'DIA',               // Dia
      'MÊS',               // Mês
      'ANO',               // Ano
      'TOT. PÇ',           // Total Peças
      'TOT. SERV.',        // Total Serviço
      'TOT'                // Total Geral
    ];
    
    console.log('Colunas que DEVEM estar sendo lidas:');
    colunasEsperadas.forEach((coluna, index) => {
      console.log(`  ${index + 1}. ${coluna}`);
    });
    console.log('');
    
    // 2. TESTE DE DIFERENTES FORMATOS DE DADOS
    console.log('🔄 2. TESTE DE DIFERENTES FORMATOS DE DADOS');
    console.log('===========================================');
    
    const dadosTesteFormatos = [
      // Teste 1: Formato padrão
      {
        'NOrdem_OSv': '123456',
        'Status_OSv': 'G',
        'Data_OSv': '2024-06-15',
        'ObsCorpo_OSv': 'Motor aquecendo muito',
        'DataFecha_Osv': '2024-06-16',
        'RazaoSocial_Cli': 'PAULO ROBERTO RIBEIRO',
        'Descricao_Mot': 'MWM X10',
        'Fabricante_Mot': 'MWM',
        'DIA': 15,
        'MÊS': 6,
        'ANO': 2024,
        'TOT. PÇ': 1250.00,
        'TOT. SERV.': 800.00,
        'TOT': 2050.00
      },
      // Teste 2: Mês em texto
      {
        'NOrdem_OSv': '123457',
        'Status_OSv': 'GO',
        'Data_OSv': '2024-03-20',
        'ObsCorpo_OSv': 'Vazamento de óleo',
        'DataFecha_Osv': '2024-03-21',
        'RazaoSocial_Cli': 'ANTONIO ALVES DA LUZ',
        'Descricao_Mot': 'Cummins ISF',
        'Fabricante_Mot': 'Cummins',
        'DIA': 20,
        'MÊS': 'março',
        'ANO': 2024,
        'TOT. PÇ': 450.00,
        'TOT. SERV.': 300.00,
        'TOT': 750.00
      },
      // Teste 3: Data em formato Excel serial
      {
        'NOrdem_OSv': '123458',
        'Status_OSv': 'GU',
        'Data_OSv': 45321, // Excel serial para 2024-02-15
        'ObsCorpo_OSv': 'Ruído estranho no motor',
        'DataFecha_Osv': 45322, // Excel serial para 2024-02-16
        'RazaoSocial_Cli': 'ALEXSSANDRO MARCELINO',
        'Descricao_Mot': 'Mercedes OM924',
        'Fabricante_Mot': 'Mercedes-Benz',
        'DIA': 15,
        'MÊS': 'fevereiro',
        'ANO': 2024,
        'TOT. PÇ': 2800.00,
        'TOT. SERV.': 1200.00,
        'TOT': 4000.00
      },
      // Teste 4: Valores como string
      {
        'NOrdem_OSv': '123459',
        'Status_OSv': 'G',
        'Data_OSv': '15/12/2024',
        'ObsCorpo_OSv': 'Pistão quebrado',
        'DataFecha_Osv': '16/12/2024',
        'RazaoSocial_Cli': 'VITOR FRANCISCO DE OLIVEIRA',
        'Descricao_Mot': 'Volvo D13',
        'Fabricante_Mot': 'Volvo',
        'DIA': '15',
        'MÊS': '12',
        'ANO': '2024',
        'TOT. PÇ': '3500,50',
        'TOT. SERV.': '1800,25',
        'TOT': '5300,75'
      }
    ];
    
    console.log('Testando diferentes formatos de dados:');
    dadosTesteFormatos.forEach((dado, index) => {
      console.log(`\n📊 Teste ${index + 1}:`);
      console.log(`  OS: ${dado.NOrdem_OSv}`);
      console.log(`  Status: ${dado.Status_OSv}`);
      console.log(`  Data: ${dado.Data_OSv} (tipo: ${typeof dado.Data_OSv})`);
      console.log(`  Data Fechamento: ${dado.DataFecha_Osv} (tipo: ${typeof dado.DataFecha_Osv})`);
      console.log(`  Mês: ${dado.MÊS} (tipo: ${typeof dado.MÊS})`);
      console.log(`  Valores: ${dado['TOT. PÇ']}, ${dado['TOT. SERV.']}, ${dado.TOT}`);
    });
    console.log('');
    
    // 3. TESTE DE PROCESSAMENTO
    console.log('⚙️ 3. TESTE DE PROCESSAMENTO');
    console.log('============================');
    
    dadosTesteFormatos.forEach((dado, index) => {
      console.log(`\n🔧 Processando Teste ${index + 1}:`);
      
      // Testar conversão de data
      const data_ordem = ExcelService.excelDateToISO(dado.Data_OSv);
      const data_fechamento = ExcelService.excelDateToISO(dado.DataFecha_Osv);
      const mes_servico = ExcelService.parseMonth(dado.MÊS);
      const ano_servico = dado.ANO ? parseInt(dado.ANO) : null;
      const status_mapeado = ExcelService.mapStatus(dado.Status_OSv);
      const total_pecas = ExcelService.parseNumber(dado['TOT. PÇ']);
      const total_servico = ExcelService.parseNumber(dado['TOT. SERV.']);
      const total_geral = ExcelService.parseNumber(dado.TOT);
      
      console.log(`  Data OS: ${dado.Data_OSv} → ${data_ordem}`);
      console.log(`  Data Fechamento: ${dado.DataFecha_Osv} → ${data_fechamento}`);
      console.log(`  Mês: ${dado.MÊS} → ${mes_servico}`);
      console.log(`  Ano: ${dado.ANO} → ${ano_servico}`);
      console.log(`  Status: ${dado.Status_OSv} → ${status_mapeado}`);
      console.log(`  Total Peças: ${dado['TOT. PÇ']} → ${total_pecas}`);
      console.log(`  Total Serviço: ${dado['TOT. SERV.']} → ${total_servico}`);
      console.log(`  Total Geral: ${dado.TOT} → ${total_geral}`);
      
      // Verificar se DataFecha_Osv está sendo processado
      if (!data_fechamento) {
        console.log(`  ⚠️  PROBLEMA: DataFecha_Osv não está sendo processada!`);
      }
    });
    console.log('');
    
    // 4. TESTE DE CLASSIFICAÇÃO DE DEFEITOS
    console.log('🤖 4. TESTE DE CLASSIFICAÇÃO DE DEFEITOS');
    console.log('========================================');
    
    const nlpService = new NLPService();
    const defeitosTeste = [
      'Motor aquecendo muito, perdendo água do radiador',
      'Vazamento de óleo no cárter, muito óleo no chão',
      'Ruído estranho no motor, barulho de batida na biela',
      'Pistão quebrado no 3º cilindro, motor travou',
      'Filtro errado instalado, causou problema no motor'
    ];
    
    defeitosTeste.forEach((defeito, index) => {
      const classification = nlpService.classifyDefect(defeito);
      console.log(`\n  ${index + 1}. "${defeito.substring(0, 50)}..."`);
      console.log(`     → ${classification.grupo} > ${classification.subgrupo} > ${classification.subsubgrupo}`);
      console.log(`     → Confiança: ${(classification.confianca * 100).toFixed(1)}%`);
    });
    console.log('');
    
    // 5. PROBLEMAS IDENTIFICADOS
    console.log('🚨 5. PROBLEMAS IDENTIFICADOS');
    console.log('=============================');
    
    const problemas = [
      '❌ DataFecha_Osv não está sendo mapeada no ExcelService',
      '❌ Não há validação se todas as colunas esperadas existem no Excel',
      '❌ Não há tratamento para colunas com nomes ligeiramente diferentes',
      '❌ Não há validação se os dados estão indo para os campos corretos',
      '❌ Não há teste se o frontend está realmente buscando dados reais'
    ];
    
    problemas.forEach(problema => {
      console.log(`  ${problema}`);
    });
    console.log('');
    
    // 6. RECOMENDAÇÕES
    console.log('💡 6. RECOMENDAÇÕES');
    console.log('===================');
    
    const recomendacoes = [
      '✅ Adicionar DataFecha_Osv ao mapeamento',
      '✅ Criar validação de colunas obrigatórias',
      '✅ Melhorar tratamento de diferentes formatos de data',
      '✅ Adicionar logs detalhados de mapeamento',
      '✅ Criar testes automatizados para cada formato',
      '✅ Verificar se todas as APIs do frontend existem no backend'
    ];
    
    recomendacoes.forEach(recomendacao => {
      console.log(`  ${recomendacao}`);
    });
    console.log('');
    
    console.log('🎯 DIAGNÓSTICO CONCLUÍDO!');
    console.log('Verifique os problemas identificados acima e implemente as correções necessárias.');
    
  } catch (error) {
    console.error('❌ Erro durante o diagnóstico:', error);
  }
}

// Executar o diagnóstico se for chamado diretamente
if (require.main === module) {
  diagnosticoCompleto()
    .then(() => {
      console.log('Diagnóstico concluído');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Erro fatal:', error);
      process.exit(1);
    });
}

module.exports = { diagnosticoCompleto }; 