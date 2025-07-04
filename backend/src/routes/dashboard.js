const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Rota para estatísticas do dashboard
router.get('/stats', async (req, res) => {
  try {
    // Permitir filtro por mês/ano via query
    let { mes, ano } = req.query;
    const now = new Date();
    if (!mes) mes = now.getMonth() + 1;
    if (!ano) ano = now.getFullYear();

    // Buscar estatísticas filtradas
    const { data: ordensServico, error: ordensError } = await supabase
      .from('ordens_servico')
      .select('*')
      .eq('mes_servico', parseInt(mes))
      .eq('ano_servico', parseInt(ano));

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

// Rota para dados do mês selecionado
router.get('/current-month', async (req, res) => {
  try {
    let { mes, ano } = req.query;
    const now = new Date();
    if (!mes) mes = now.getMonth() + 1;
    if (!ano) ano = now.getFullYear();

    console.log(`Buscando dados para: ${mes}/${ano}`);

    const { data: ordensServico, error } = await supabase
      .from('ordens_servico')
      .select('*')
      .eq('mes_servico', parseInt(mes))
      .eq('ano_servico', parseInt(ano));

    if (error) {
      console.error('Erro ao buscar dados do mês selecionado:', error);
      return res.status(500).json({ error: 'Erro ao buscar dados' });
    }

    // Formatar dados para a tabela
    const formattedData = ordensServico.map(os => ({
      id: os.id,
      numero_ordem: os.numero_ordem || 'N/A',
      data_ordem: os.data_ordem || 'N/A',
      status: os.status || 'N/A',
      fabricante_motor: os.fabricante_motor || 'N/A',
      modelo_motor: os.modelo_motor || 'N/A',
      defeito: os.defeito_texto_bruto || 'N/A',
      classificacao: os.defeito_grupo || 'N/A',
      mecanico: os.mecanico_responsavel || 'N/A',
      total: os.total_geral || 0,
      confianca: os.classificacao_confianca || 0
    }));

    res.json({
      data: formattedData,
      total: formattedData.length,
      month: parseInt(mes),
      year: parseInt(ano)
    });

  } catch (error) {
    console.error('Erro no endpoint /current-month:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;

