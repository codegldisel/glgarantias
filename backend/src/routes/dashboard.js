const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// GET /api/dashboard/stats - Estatísticas gerais
router.get('/stats', async (req, res) => {
  try {
    console.log('Buscando estatísticas do dashboard...');
    
    // Buscar todas as ordens de serviço
    const { data: ordens, error: ordensError } = await supabase
      .from('ordens_servico')
      .select('*');
    
    if (ordensError) {
      console.error('Erro ao buscar ordens:', ordensError);
      throw ordensError;
    }
    
    // Calcular estatísticas
    const totalOS = ordens.length;
    const totalPecas = ordens.reduce((sum, ordem) => sum + (ordem.valor_pecas || 0), 0);
    const totalServicos = ordens.reduce((sum, ordem) => sum + (ordem.valor_servicos || 0), 0);
    const totalGeral = ordens.reduce((sum, ordem) => sum + (ordem.valor_total || 0), 0);
    
    // Contar mecânicos únicos
    const mecanicosUnicos = new Set(ordens.map(ordem => ordem.mecanico_responsavel).filter(Boolean));
    const totalMecanicos = mecanicosUnicos.size;
    
    // Contar tipos de defeitos únicos
    const defeitosUnicos = new Set(ordens.map(ordem => ordem.defeito_grupo).filter(Boolean));
    const totalTiposDefeitos = defeitosUnicos.size;
    
    const stats = {
      totalOS,
      totalPecas: Math.round(totalPecas * 100) / 100,
      totalServicos: Math.round(totalServicos * 100) / 100,
      totalGeral: Math.round(totalGeral * 100) / 100,
      totalMecanicos,
      totalTiposDefeitos
    };
    
    console.log('Estatísticas calculadas:', stats);
    res.json(stats);
    
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/dashboard/charts - Dados para gráficos
router.get('/charts', async (req, res) => {
  try {
    console.log('Buscando dados para gráficos...');
    
    // Buscar todas as ordens de serviço
    const { data: ordens, error: ordensError } = await supabase
      .from('ordens_servico')
      .select('*');
    
    if (ordensError) {
      console.error('Erro ao buscar ordens:', ordensError);
      throw ordensError;
    }
    
    // Agrupar defeitos por grupo
    const defeitosPorGrupo = {};
    ordens.forEach(ordem => {
      const grupo = ordem.defeito_grupo || 'Não Classificado';
      if (!defeitosPorGrupo[grupo]) {
        defeitosPorGrupo[grupo] = 0;
      }
      defeitosPorGrupo[grupo]++;
    });
    
    const defeitosChart = Object.entries(defeitosPorGrupo).map(([grupo, count]) => ({
      grupo,
      quantidade: count
    }));
    
    // Distribuição por status
    const statusDistribuicao = [
      { status: 'Processado', quantidade: ordens.filter(o => o.status === 'processado').length },
      { status: 'Pendente', quantidade: ordens.filter(o => o.status === 'pendente').length },
      { status: 'Concluído', quantidade: ordens.filter(o => o.status === 'concluido').length }
    ];
    
    // Ordens por período (últimos 6 meses)
    const ordensTemporais = [];
    const hoje = new Date();
    for (let i = 5; i >= 0; i--) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const mes = data.toLocaleDateString('pt-BR', { month: 'short' });
      const ano = data.getFullYear();
      
      const ordensDoMes = ordens.filter(ordem => {
        if (!ordem.data_os) return false;
        const dataOS = new Date(ordem.data_os);
        return dataOS.getMonth() === data.getMonth() && dataOS.getFullYear() === data.getFullYear();
      });
      
      ordensTemporais.push({
        periodo: `${mes}/${ano}`,
        quantidade: ordensDoMes.length,
        valor: ordensDoMes.reduce((sum, ordem) => sum + (ordem.valor_total || 0), 0)
      });
    }
    
    const charts = {
      defeitosPorGrupo: defeitosChart,
      statusDistribuicao,
      ordensTemporais
    };
    
    console.log('Dados dos gráficos calculados:', charts);
    res.json(charts);
    
  } catch (error) {
    console.error('Erro ao buscar dados dos gráficos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/dashboard/recent-orders - Ordens recentes
router.get('/recent-orders', async (req, res) => {
  try {
    console.log('Buscando ordens recentes...');
    
    const { data: ordens, error } = await supabase
      .from('ordens_servico')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('Erro ao buscar ordens recentes:', error);
      throw error;
    }
    
    console.log(`Encontradas ${ordens.length} ordens recentes`);
    res.json(ordens);
    
  } catch (error) {
    console.error('Erro ao buscar ordens recentes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;

