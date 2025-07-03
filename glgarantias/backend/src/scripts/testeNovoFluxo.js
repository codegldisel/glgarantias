const ExcelService = require('../services/excelService');
const NLPService = require('../services/nlpService');
const supabase = require('../config/supabase');

/**
 * Script para testar o novo fluxo de processamento
 * Valida se apenas dados limpos e válidos estão sendo salvos
 */
async function testarNovoFluxo() {
  try {
    console.log('🧪 Iniciando teste do novo fluxo de processamento...\n');
    
    // 1. Testar dados mockados com diferentes cenários
    const dadosTeste = [
      // Dados válidos
      {
        'NOrdem_OSv': '123456',
        'Status_OSv': 'G',
        'Data_OSv': '2024-06-15',
        'ObsCorpo_OSv': 'Motor aquecendo muito, perdendo água do radiador',
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
      // Status inválido (deve ser descartado)
      {
        'NOrdem_OSv': '123457',
        'Status_OSv': 'K',
        'Data_OSv': '2024-06-16',
        'ObsCorpo_OSv': 'Vazamento de óleo',
        'RazaoSocial_Cli': 'TESTE MECANICO',
        'Descricao_Mot': 'Cummins ISF',
        'Fabricante_Mot': 'Cummins',
        'DIA': 16,
        'MÊS': 6,
        'ANO': 2024,
        'TOT. PÇ': 450.00,
        'TOT. SERV.': 300.00,
        'TOT': 750.00
      },
      // Dados válidos com status GO
      {
        'NOrdem_OSv': '123458',
        'Status_OSv': 'GO',
        'Data_OSv': '2024-06-17',
        'ObsCorpo_OSv': 'Ruído estranho no motor, barulho de batida na biela',
        'RazaoSocial_Cli': 'ANTONIO ALVES DA LUZ',
        'Descricao_Mot': 'Mercedes OM924',
        'Fabricante_Mot': 'Mercedes-Benz',
        'DIA': 17,
        'MÊS': 6,
        'ANO': 2024,
        'TOT. PÇ': 2800.00,
        'TOT. SERV.': 1200.00,
        'TOT': 4000.00
      },
      // Dados válidos com status GU
      {
        'NOrdem_OSv': '123459',
        'Status_OSv': 'GU',
        'Data_OSv': '2024-06-18',
        'ObsCorpo_OSv': 'Pistão quebrado no 3º cilindro, motor travou',
        'RazaoSocial_Cli': 'ALEXSSANDRO MARCELINO',
        'Descricao_Mot': 'Volvo D13',
        'Fabricante_Mot': 'Volvo',
        'DIA': 18,
        'MÊS': 6,
        'ANO': 2024,
        'TOT. PÇ': 3500.00,
        'TOT. SERV.': 1800.00,
        'TOT': 5300.00
      }
    ];

    console.log('📊 Dados de teste criados:');
    dadosTeste.forEach((dado, index) => {
      console.log(`  ${index + 1}. OS: ${dado.NOrdem_OSv}, Status: ${dado.Status_OSv}, Mecânico: ${dado.RazaoSocial_Cli}`);
    });
    console.log('');

    // 2. Testar filtro de status
    console.log('🔍 Testando filtro de status...');
    const statusValidos = ['G', 'GO', 'GU'];
    const dadosFiltrados = dadosTeste.filter(dado => {
      const status = (dado.Status_OSv || '').toString().toUpperCase().trim();
      return statusValidos.includes(status);
    });
    
    console.log(`  Total de dados: ${dadosTeste.length}`);
    console.log(`  Dados válidos (G, GO, GU): ${dadosFiltrados.length}`);
    console.log(`  Dados descartados: ${dadosTeste.length - dadosFiltrados.length}`);
    console.log('');

    // 3. Testar mapeamento de dados
    console.log('🔄 Testando mapeamento de dados...');
    const dadosMapeados = dadosFiltrados.map((dado, index) => {
      const data_ordem = ExcelService.excelDateToISO(dado.Data_OSv);
      const mes_servico = ExcelService.parseMonth(dado.MÊS);
      const ano_servico = dado.ANO ? parseInt(dado.ANO) : null;
      const statusMapeado = ExcelService.mapStatus(dado.Status_OSv);
      
      console.log(`  ${index + 1}. OS: ${dado.NOrdem_OSv}`);
      console.log(`     Status: ${dado.Status_OSv} → ${statusMapeado}`);
      console.log(`     Data: ${dado.Data_OSv} → ${data_ordem}`);
      console.log(`     Mês/Ano: ${dado.MÊS}/${dado.ANO} → ${mes_servico}/${ano_servico}`);
      
      return {
        numero_ordem: dado.NOrdem_OSv,
        data_ordem: data_ordem,
        status: statusMapeado,
        defeito_texto_bruto: dado.ObsCorpo_OSv,
        mecanico_responsavel: dado.RazaoSocial_Cli,
        modelo_motor: dado.Descricao_Mot,
        fabricante_motor: dado.Fabricante_Mot,
        dia_servico: dado.DIA ? parseInt(dado.DIA) : null,
        mes_servico: mes_servico,
        ano_servico: ano_servico,
        total_pecas: ExcelService.parseNumber(dado['TOT. PÇ']),
        total_servico: ExcelService.parseNumber(dado['TOT. SERV.']),
        total_geral: ExcelService.parseNumber(dado.TOT)
      };
    });
    console.log('');

    // 4. Testar classificação de defeitos
    console.log('🤖 Testando classificação de defeitos...');
    const nlpService = new NLPService();
    
    const dadosComClassificacao = dadosMapeados.map((dado, index) => {
      const classification = nlpService.classifyDefect(dado.defeito_texto_bruto);
      
      console.log(`  ${index + 1}. OS: ${dado.numero_ordem}`);
      console.log(`     Defeito: "${dado.defeito_texto_bruto.substring(0, 50)}..."`);
      console.log(`     Classificação: ${classification.grupo} → ${classification.subgrupo} → ${classification.subsubgrupo}`);
      console.log(`     Confiança: ${(classification.confianca * 100).toFixed(1)}%`);
      
      return {
        ...dado,
        defeito_grupo: classification.grupo,
        defeito_subgrupo: classification.subgrupo,
        defeito_subsubgrupo: classification.subsubgrupo,
        classificacao_confianca: classification.confianca
      };
    });
    console.log('');

    // 5. Validar dados finais
    console.log('✅ Validando dados finais...');
    let dadosValidos = 0;
    let dadosInvalidos = 0;
    
    dadosComClassificacao.forEach((dado, index) => {
      const validacoes = [
        { campo: 'numero_ordem', valor: dado.numero_ordem, valido: !!dado.numero_ordem },
        { campo: 'data_ordem', valor: dado.data_ordem, valido: !!dado.data_ordem },
        { campo: 'status', valor: dado.status, valido: ['Garantia', 'Garantia de Oficina', 'Garantia de Usinagem'].includes(dado.status) },
        { campo: 'mes_servico', valor: dado.mes_servico, valido: dado.mes_servico >= 1 && dado.mes_servico <= 12 },
        { campo: 'ano_servico', valor: dado.ano_servico, valido: dado.ano_servico >= 2000 && dado.ano_servico <= 2030 },
        { campo: 'defeito_grupo', valor: dado.defeito_grupo, valido: !!dado.defeito_grupo && dado.defeito_grupo !== 'Não Classificado' }
      ];
      
      const invalidos = validacoes.filter(v => !v.valido);
      
      if (invalidos.length === 0) {
        dadosValidos++;
        console.log(`  ✅ OS ${dado.numero_ordem}: VÁLIDA`);
      } else {
        dadosInvalidos++;
        console.log(`  ❌ OS ${dado.numero_ordem}: INVÁLIDA`);
        invalidos.forEach(inv => {
          console.log(`     - ${inv.campo}: "${inv.valor}" (inválido)`);
        });
      }
    });
    console.log('');

    // 6. Resumo final
    console.log('📋 RESUMO DO TESTE:');
    console.log(`  Total de dados de entrada: ${dadosTeste.length}`);
    console.log(`  Dados com status válido: ${dadosFiltrados.length}`);
    console.log(`  Dados mapeados com sucesso: ${dadosMapeados.length}`);
    console.log(`  Dados classificados: ${dadosComClassificacao.length}`);
    console.log(`  Dados válidos finais: ${dadosValidos}`);
    console.log(`  Dados inválidos finais: ${dadosInvalidos}`);
    console.log('');

    if (dadosValidos === dadosFiltrados.length) {
      console.log('🎉 TESTE PASSOU! Todos os dados válidos foram processados corretamente.');
    } else {
      console.log('⚠️  TESTE FALHOU! Alguns dados válidos não foram processados corretamente.');
    }

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

// Executar o teste se for chamado diretamente
if (require.main === module) {
  testarNovoFluxo()
    .then(() => {
      console.log('Teste concluído');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Erro fatal:', error);
      process.exit(1);
    });
}

module.exports = { testarNovoFluxo }; 