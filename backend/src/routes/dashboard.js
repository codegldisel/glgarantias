const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Função auxiliar para buscar estatísticas de um período
const getDashboardStats = async (ano, mes) => {
  const { data, error } = await supabase
    .from('ordens_servico')
    .select('total_pecas, total_servico, total_geral, mecanico_responsavel, defeito_grupo')
    .eq('ano_servico', ano)
    .eq('mes_servico', mes);

  if (error) {
    console.error(`Erro ao buscar dados para ${mes}/${ano}:`, error);
    throw new Error('Erro ao buscar dados do dashboard.');
  }

  const totalOS = data.length;
  if (totalOS === 0) {
    return { totalOS: 0, totalPecas: 0, totalServicos: 0, totalGeral: 0, totalMecanicos: 0, osNaoClassificadas: 0 };
  }

  const totalPecas = data.reduce((sum, os) => sum + (os.total_pecas || 0), 0);
  const totalServicos = data.reduce((sum, os) => sum + (os.total_servico || 0), 0);
  const totalGeral = data.reduce((sum, os) => sum + (os.total_geral || 0), 0);
  const mecanicosUnicos = new Set(data.map(os => os.mecanico_responsavel).filter(Boolean));
  const osNaoClassificadas = data.filter(os => !os.defeito_grupo || os.defeito_grupo === 'Não Classificado').length;

  return {
    totalOS,
    totalPecas,
    totalServicos,
    totalGeral,
    totalMecanicos: mecanicosUnicos.size,
    osNaoClassificadas,
  };
};


// Rota para buscar todos os anos e meses disponíveis que possuem dados
router.get('/available-dates', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('ordens_servico')
      .select('ano_servico, mes_servico')
      .not('ano_servico', 'is', null)
      .not('mes_servico', 'is', null)
      .order('ano_servico', { ascending: false })
      .order('mes_servico', { ascending: false })
      .range(0, 9999); // Remove o limite padrão de 1000 linhas, buscando até 10000 resultados

    if (error) {
      console.error('Erro ao buscar datas disponíveis:', error);
      return res.status(500).json({ error: 'Erro ao buscar dados de datas.' });
    }

    // Criar uma lista única de anos e de meses por ano
    const availableDates = data.reduce((acc, { ano_servico, mes_servico }) => {
      if (!acc.years.includes(ano_servico)) {
        acc.years.push(ano_servico);
      }
      const yearData = acc.monthsByYear[ano_servico];
      if (yearData && !yearData.includes(mes_servico)) {
        acc.monthsByYear[ano_servico].push(mes_servico);
      } else if (!yearData) {
        acc.monthsByYear[ano_servico] = [mes_servico];
      }
      return acc;
    }, { years: [], monthsByYear: {} });

    // Para cada ano, garantir que todos os meses de 1 a 12 estejam presentes
    for (const year of availableDates.years) {
      const monthsSet = new Set(availableDates.monthsByYear[year]);
      for (let m = 1; m <= 12; m++) {
        monthsSet.add(m);
      }
      // Ordenar meses em ordem crescente
      availableDates.monthsByYear[year] = Array.from(monthsSet).sort((a, b) => a - b);
    }

    // Ordenar anos em ordem decrescente
    availableDates.years.sort((a, b) => b - a);

    res.json(availableDates);

  } catch (error) {
    console.error('Erro no endpoint /available-dates:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota unificada para buscar todos os dados do dashboard para um mês/ano específico
router.get('/data', async (req, res) => {
  const { ano, mes } = req.query;

  if (!ano || !mes) {
    return res.status(400).json({ error: 'Os parâmetros "ano" e "mes" são obrigatórios.' });
  }

  try {
    const anoInt = parseInt(ano);
    const mesInt = parseInt(mes);

    // Calcular mês/ano anterior
    let prevMes = mesInt - 1;
    let prevAno = anoInt;
    if (prevMes === 0) {
      prevMes = 12;
      prevAno = anoInt - 1;
    }

    // Buscar dados do mês atual e do anterior em paralelo
    const [stats, previousMonthStats, { data: ordensServico, error: tableError }] = await Promise.all([
      getDashboardStats(anoInt, mesInt),
      getDashboardStats(prevAno, prevMes),
      supabase.from('ordens_servico').select('*').eq('ano_servico', anoInt).eq('mes_servico', mesInt)
    ]);

    if (tableError) {
      console.error(`Erro ao buscar dados da tabela para ${mes}/${ano}:`, tableError);
      return res.status(500).json({ error: 'Erro ao buscar dados da tabela.' });
    }

    // Formatar Dados da Tabela
    const tableData = ordensServico.map(os => ({
      id: os.id,
      numero_ordem: os.numero_ordem || 'N/A',
      data_ordem: os.data_ordem || 'N/A',
      status: os.status || 'N/A',
      fabricante_motor: os.fabricante_motor || 'N/A',
      modelo_motor: os.modelo_motor || 'N/A',
      defeito: os.defeito_texto_bruto || 'N/A',
      classificacao: os.defeito_grupo || 'Não Classificado',
      mecanico: os.mecanico_responsavel || 'N/A',
      total: os.total_geral || 0,
      confianca: os.classificacao_confianca || 0
    }));

    // Retornar objeto unificado
    res.json({
      stats,
      previousMonthStats,
      tableData,
      month: mesInt,
      year: anoInt,
    });

  } catch (error) {
    console.error('Erro no endpoint /data:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
