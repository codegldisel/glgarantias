const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Rota para KPIs de análise
router.get('/kpis', async (req, res) => {
  try {
    const { data: ordensServico, error } = await supabase
      .from('ordens_servico')
      .select('*');

    if (error) {
      console.error('Erro ao buscar dados para KPIs:', error);
      return res.status(500).json({ error: 'Erro ao buscar dados' });
    }

    // Calcular KPIs
    const totalOrdens = ordensServico.length;
    const totalValor = ordensServico.reduce((sum, os) => sum + (os.total_geral || 0), 0);
    const mediaValorPorOrdem = totalOrdens > 0 ? totalValor / totalOrdens : 0;

    // Calcular crescimento (simulado - últimos 6 meses vs anteriores)
    const agora = new Date();
    const seisMesesAtras = new Date(agora.getFullYear(), agora.getMonth() - 6, 1);
    
    const ordensRecentes = ordensServico.filter(os => {
      if (os.ano_servico && os.mes_servico) {
        const dataOS = new Date(os.ano_servico, os.mes_servico - 1, 1);
        return dataOS >= seisMesesAtras;
      }
      return false;
    });

    const ordensAnteriores = ordensServico.filter(os => {
      if (os.ano_servico && os.mes_servico) {
        const dataOS = new Date(os.ano_servico, os.mes_servico - 1, 1);
        return dataOS < seisMesesAtras;
      }
      return false;
    });

    const valorRecente = ordensRecentes.reduce((sum, os) => sum + (os.total_geral || 0), 0);
    const valorAnterior = ordensAnteriores.reduce((sum, os) => sum + (os.total_geral || 0), 0);
    
    const percentualCrescimento = valorAnterior > 0 
      ? ((valorRecente - valorAnterior) / valorAnterior) * 100 
      : 0;

    // Top 5 defeitos mais comuns
    const defeitosCount = {};
    ordensServico.forEach(os => {
      const defeito = os.defeito_grupo || 'Não Classificado';
      defeitosCount[defeito] = (defeitosCount[defeito] || 0) + 1;
    });

    const topDefeitos = Object.entries(defeitosCount)
      .map(([nome, quantidade]) => ({ nome, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 5);

    res.json({
      totalOrdens,
      totalValor,
      mediaValorPorOrdem,
      percentualCrescimento,
      topDefeitos
    });

  } catch (error) {
    console.error('Erro no endpoint /kpis:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para tendências
router.get('/tendencias', async (req, res) => {
  try {
    const { data: ordensServico, error } = await supabase
      .from('ordens_servico')
      .select('*');

    if (error) {
      console.error('Erro ao buscar dados para tendências:', error);
      return res.status(500).json({ error: 'Erro ao buscar dados' });
    }

    // Agrupar por mês/ano
    const dadosPorMes = {};
    ordensServico.forEach(os => {
      if (os.ano_servico && os.mes_servico) {
        const chave = `${os.ano_servico}-${os.mes_servico.toString().padStart(2, '0')}`;
        if (!dadosPorMes[chave]) {
          dadosPorMes[chave] = {
            periodo: chave,
            quantidade: 0,
            valor: 0
          };
        }
        dadosPorMes[chave].quantidade += 1;
        dadosPorMes[chave].valor += (os.total_geral || 0);
      }
    });

    const tendencias = Object.values(dadosPorMes)
      .sort((a, b) => a.periodo.localeCompare(b.periodo))
      .slice(-12); // Últimos 12 meses

    res.json(tendencias);

  } catch (error) {
    console.error('Erro no endpoint /tendencias:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para análise de defeitos
router.get('/defeitos', async (req, res) => {
  try {
    const { data: ordensServico, error } = await supabase
      .from('ordens_servico')
      .select('*');

    if (error) {
      console.error('Erro ao buscar dados para defeitos:', error);
      return res.status(500).json({ error: 'Erro ao buscar dados' });
    }

    // Agrupar por grupo de defeito
    const defeitosPorGrupo = {};
    const defeitosPorSubgrupo = {};
    const defeitosPorSubsubgrupo = {};

    ordensServico.forEach(os => {
      const grupo = os.defeito_grupo || 'Não Classificado';
      const subgrupo = os.defeito_subgrupo || 'Não Classificado';
      const subsubgrupo = os.defeito_subsubgrupo || 'Não Classificado';

      // Contar por grupo
      defeitosPorGrupo[grupo] = (defeitosPorGrupo[grupo] || 0) + 1;

      // Contar por subgrupo
      const chaveSubgrupo = `${grupo} > ${subgrupo}`;
      defeitosPorSubgrupo[chaveSubgrupo] = (defeitosPorSubgrupo[chaveSubgrupo] || 0) + 1;

      // Contar por subsubgrupo
      const chaveSubsubgrupo = `${grupo} > ${subgrupo} > ${subsubgrupo}`;
      defeitosPorSubsubgrupo[chaveSubsubgrupo] = (defeitosPorSubsubgrupo[chaveSubsubgrupo] || 0) + 1;
    });

    // Converter para arrays e ordenar
    const grupos = Object.entries(defeitosPorGrupo)
      .map(([nome, quantidade]) => ({ nome, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade);

    const subgrupos = Object.entries(defeitosPorSubgrupo)
      .map(([nome, quantidade]) => ({ nome, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 10); // Top 10

    const subsubgrupos = Object.entries(defeitosPorSubsubgrupo)
      .map(([nome, quantidade]) => ({ nome, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 10); // Top 10

    // Calcular estatísticas de confiança
    const confiancaMedia = ordensServico.reduce((sum, os) => sum + (os.classificacao_confianca || 0), 0) / ordensServico.length;
    const ordensComBaixaConfianca = ordensServico.filter(os => (os.classificacao_confianca || 0) < 0.5).length;

    res.json({
      grupos,
      subgrupos,
      subsubgrupos,
      confiancaMedia,
      ordensComBaixaConfianca,
      totalOrdens: ordensServico.length
    });

  } catch (error) {
    console.error('Erro no endpoint /defeitos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para performance dos mecânicos
router.get('/performance-mecanicos', async (req, res) => {
  try {
    const { data: ordensServico, error } = await supabase
      .from('ordens_servico')
      .select('*');

    if (error) {
      console.error('Erro ao buscar dados para performance:', error);
      return res.status(500).json({ error: 'Erro ao buscar dados' });
    }

    // Agrupar por mecânico
    const performancePorMecanico = {};
    ordensServico.forEach(os => {
      const mecanico = os.mecanico_responsavel || 'Não Informado';
      if (!performancePorMecanico[mecanico]) {
        performancePorMecanico[mecanico] = {
          nome: mecanico,
          totalOrdens: 0,
          valorTotal: 0,
          mediaPorOrdem: 0
        };
      }
      performancePorMecanico[mecanico].totalOrdens += 1;
      performancePorMecanico[mecanico].valorTotal += (os.total_geral || 0);
    });

    // Calcular média por ordem
    Object.values(performancePorMecanico).forEach(mecanico => {
      mecanico.mediaPorOrdem = mecanico.totalOrdens > 0 
        ? mecanico.valorTotal / mecanico.totalOrdens 
        : 0;
    });

    const performance = Object.values(performancePorMecanico)
      .sort((a, b) => b.valorTotal - a.valorTotal)
      .slice(0, 10); // Top 10 mecânicos

    res.json(performance);

  } catch (error) {
    console.error('Erro no endpoint /performance-mecanicos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 