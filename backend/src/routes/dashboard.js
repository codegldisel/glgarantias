const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Rota para estatísticas do dashboard
router.get('/stats', async (req, res) => {
  try {
    // Buscar estatísticas básicas
    const { data: ordensServico, error: ordensError } = await supabase
      .from('ordens_servico')
      .select('*');

    if (ordensError) {
      console.error('Erro ao buscar ordens de serviço:', ordensError);
      return res.status(500).json({ error: 'Erro ao buscar dados' });
    }

    // Calcular estatísticas
    const totalOS = ordensServico.length;
    const totalPecas = ordensServico.reduce((sum, os) => sum + (os.total_pecas || 0), 0);
    const totalServicos = ordensServico.reduce((sum, os) => sum + (os.total_servico || 0), 0);
    const totalGeral = ordensServico.reduce((sum, os) => sum + (os.total_geral || 0), 0);
    
    // Contar mecânicos únicos
    const mecanicosUnicos = new Set(ordensServico.map(os => os.mecanico_responsavel).filter(Boolean));
    const totalMecanicos = mecanicosUnicos.size;
    
    // Contar tipos de defeitos únicos
    const defeitosUnicos = new Set(ordensServico.map(os => os.defeito_grupo).filter(Boolean));
    const totalTiposDefeitos = defeitosUnicos.size;

    res.json({
      totalOS,
      totalPecas,
      totalServicos,
      totalGeral,
      totalMecanicos,
      totalTiposDefeitos
    });

  } catch (error) {
    console.error('Erro no endpoint /stats:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para dados de gráficos
router.get('/charts', async (req, res) => {
  try {
    const { data: ordensServico, error } = await supabase
      .from('ordens_servico')
      .select('*');

    if (error) {
      console.error('Erro ao buscar dados para gráficos:', error);
      return res.status(500).json({ error: 'Erro ao buscar dados' });
    }

    // Gráfico de defeitos por grupo
    const defeitosPorGrupo = {};
    ordensServico.forEach(os => {
      const grupo = os.defeito_grupo || 'Não Classificado';
      defeitosPorGrupo[grupo] = (defeitosPorGrupo[grupo] || 0) + 1;
    });

    const chartDefeitos = Object.entries(defeitosPorGrupo).map(([nome, valor]) => ({
      nome,
      valor
    }));

    // Gráfico de status
    const statusCount = {};
    ordensServico.forEach(os => {
      const status = os.status || 'Não Informado';
      statusCount[status] = (statusCount[status] || 0) + 1;
    });

    const chartStatus = Object.entries(statusCount).map(([nome, valor]) => ({
      nome,
      valor
    }));

    // Gráfico temporal (por mês)
    const ordensTemporais = {};
    ordensServico.forEach(os => {
      if (os.mes_servico && os.ano_servico) {
        const chave = `${os.mes_servico}/${os.ano_servico}`;
        ordensTemporais[chave] = (ordensTemporais[chave] || 0) + 1;
      }
    });

    const chartTemporal = Object.entries(ordensTemporais).map(([periodo, quantidade]) => ({
      periodo,
      quantidade
    }));

    res.json({
      defeitosPorGrupo: chartDefeitos,
      statusDistribuicao: chartStatus,
      ordensTemporais: chartTemporal
    });

  } catch (error) {
    console.error('Erro no endpoint /charts:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;

