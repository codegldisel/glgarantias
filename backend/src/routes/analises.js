const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// GET /api/analises/kpis - KPIs de análises
router.get('/kpis', async (req, res) => {
  try {
    // Buscar dados básicos
    const { data: ordensData, error: ordensError } = await supabase
      .from('ordens_servico')
      .select('*');

    if (ordensError) {
      console.error('Erro ao buscar ordens de serviço:', ordensError);
      return res.status(500).json({ error: 'Erro ao buscar dados' });
    }

    // Calcular KPIs
    const totalOrdens = ordensData.length;
    const totalValor = ordensData.reduce((sum, ordem) => sum + (parseFloat(ordem.total_geral) || 0), 0);
    const mediaValorPorOrdem = totalOrdens > 0 ? totalValor / totalOrdens : 0;
    
    // Análise por status de garantia
    const garantiaStats = ordensData.reduce((acc, ordem) => {
      const status = ordem.status || 'Não Informado';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Análise por defeitos mais comuns
    const defeitosComuns = ordensData.reduce((acc, ordem) => {
      const grupo = ordem.defeito_grupo || 'Não Classificado';
      acc[grupo] = (acc[grupo] || 0) + 1;
      return acc;
    }, {});

    // Top 5 defeitos mais comuns
    const topDefeitos = Object.entries(defeitosComuns)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([nome, quantidade]) => ({ nome, quantidade }));

    // Análise temporal (últimos 6 meses)
    const agora = new Date();
    const seiseMesesAtras = new Date(agora.getFullYear(), agora.getMonth() - 6, 1);
    
    const ordensRecentes = ordensData.filter(ordem => {
      if (!ordem.data_ordem) return false;
      const dataOrdem = new Date(ordem.data_ordem);
      return dataOrdem >= seiseMesesAtras;
    });

    const tendenciaRecente = ordensRecentes.length;
    const percentualCrescimento = totalOrdens > 0 ? ((tendenciaRecente / totalOrdens) * 100) : 0;

    res.json({
      totalOrdens,
      totalValor,
      mediaValorPorOrdem,
      garantiaStats,
      topDefeitos,
      tendenciaRecente,
      percentualCrescimento
    });

  } catch (error) {
    console.error('Erro ao calcular KPIs:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/analises/tendencias - Análise de tendências
router.get('/tendencias', async (req, res) => {
  try {
    const { data: ordensData, error: ordensError } = await supabase
      .from('ordens_servico')
      .select('*')
      .order('data_ordem', { ascending: true });

    if (ordensError) {
      console.error('Erro ao buscar ordens de serviço:', ordensError);
      return res.status(500).json({ error: 'Erro ao buscar dados' });
    }

    // Agrupar por mês/ano
    const tendenciasMensais = ordensData.reduce((acc, ordem) => {
      if (!ordem.data_ordem) return acc;
      
      const data = new Date(ordem.data_ordem);
      const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[chave]) {
        acc[chave] = {
          periodo: chave,
          quantidade: 0,
          valorTotal: 0,
          defeitos: {}
        };
      }
      
      acc[chave].quantidade += 1;
      acc[chave].valorTotal += parseFloat(ordem.total_geral) || 0;
      
      const grupo = ordem.defeito_grupo || 'Não Classificado';
      acc[chave].defeitos[grupo] = (acc[chave].defeitos[grupo] || 0) + 1;
      
      return acc;
    }, {});

    // Converter para array e ordenar
    const tendenciasArray = Object.values(tendenciasMensais)
      .sort((a, b) => a.periodo.localeCompare(b.periodo));

    // Análise de sazonalidade
    const sazonalidade = ordensData.reduce((acc, ordem) => {
      if (!ordem.data_ordem) return acc;
      
      const data = new Date(ordem.data_ordem);
      const mes = data.getMonth() + 1; // 1-12
      
      acc[mes] = (acc[mes] || 0) + 1;
      return acc;
    }, {});

    // Converter sazonalidade para array
    const sazonalidadeArray = Array.from({ length: 12 }, (_, i) => ({
      mes: i + 1,
      nomeMs: new Date(2024, i, 1).toLocaleDateString('pt-BR', { month: 'long' }),
      quantidade: sazonalidade[i + 1] || 0
    }));

    res.json({
      tendenciasMensais: tendenciasArray,
      sazonalidade: sazonalidadeArray
    });

  } catch (error) {
    console.error('Erro ao calcular tendências:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/analises/performance-mecanicos - Performance dos mecânicos
router.get('/performance-mecanicos', async (req, res) => {
  try {
    const { data: ordensData, error: ordensError } = await supabase
      .from('ordens_servico')
      .select('*');

    if (ordensError) {
      console.error('Erro ao buscar ordens de serviço:', ordensError);
      return res.status(500).json({ error: 'Erro ao buscar dados' });
    }

    // Análise por mecânico
    const performanceMecanicos = ordensData.reduce((acc, ordem) => {
      const mecanico = ordem.mecanico_responsavel || 'Não Informado';
      
      if (!acc[mecanico]) {
        acc[mecanico] = {
          nome: mecanico,
          totalOrdens: 0,
          valorTotal: 0,
          defeitos: {},
          garantias: {}
        };
      }
      
      acc[mecanico].totalOrdens += 1;
      acc[mecanico].valorTotal += parseFloat(ordem.total_geral) || 0;
      
      const grupo = ordem.defeito_grupo || 'Não Classificado';
      acc[mecanico].defeitos[grupo] = (acc[mecanico].defeitos[grupo] || 0) + 1;
      
      const status = ordem.status || 'Não Informado';
      acc[mecanico].garantias[status] = (acc[mecanico].garantias[status] || 0) + 1;
      
      return acc;
    }, {});

    // Converter para array e calcular métricas
    const performanceArray = Object.values(performanceMecanicos)
      .map(mecanico => ({
        ...mecanico,
        valorMedio: mecanico.totalOrdens > 0 ? mecanico.valorTotal / mecanico.totalOrdens : 0,
        defeitoMaisComum: Object.entries(mecanico.defeitos)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Nenhum',
        garantiaMaisComum: Object.entries(mecanico.garantias)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Nenhuma'
      }))
      .sort((a, b) => b.totalOrdens - a.totalOrdens);

    // Top 10 mecânicos
    const topMecanicos = performanceArray.slice(0, 10);

    // Estatísticas gerais
    const totalMecanicos = performanceArray.length;
    const mediaTotalOrdens = performanceArray.reduce((sum, m) => sum + m.totalOrdens, 0) / totalMecanicos;
    const mediaValorTotal = performanceArray.reduce((sum, m) => sum + m.valorTotal, 0) / totalMecanicos;

    res.json({
      topMecanicos,
      totalMecanicos,
      mediaTotalOrdens,
      mediaValorTotal,
      todosOsMecanicos: performanceArray
    });

  } catch (error) {
    console.error('Erro ao calcular performance dos mecânicos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;

