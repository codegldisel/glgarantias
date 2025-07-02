const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// GET /api/mecanicos/lista - Lista de mecânicos
router.get('/lista', async (req, res) => {
  try {
    const { ativo = 'todos', ordenar = 'nome' } = req.query;

    const { data: ordensData, error: ordensError } = await supabase
      .from('ordens_servico')
      .select('*');

    if (ordensError) {
      console.error('Erro ao buscar ordens de serviço:', ordensError);
      return res.status(500).json({ error: 'Erro ao buscar dados' });
    }

    // Agrupar por mecânico
    const mecanicoStats = ordensData.reduce((acc, ordem) => {
      const mecanico = ordem.mecanico_responsavel || 'Não Informado';
      
      if (!acc[mecanico]) {
        acc[mecanico] = {
          nome: mecanico,
          totalOrdens: 0,
          valorTotal: 0,
          ultimaOrdem: null,
          primeiraOrdem: null,
          defeitos: {},
          garantias: {},
          motores: {}
        };
      }
      
      acc[mecanico].totalOrdens += 1;
      acc[mecanico].valorTotal += parseFloat(ordem.total_geral) || 0;
      
      // Datas
      const dataOrdem = ordem.data_ordem ? new Date(ordem.data_ordem) : null;
      if (dataOrdem) {
        if (!acc[mecanico].ultimaOrdem || dataOrdem > new Date(acc[mecanico].ultimaOrdem)) {
          acc[mecanico].ultimaOrdem = ordem.data_ordem;
        }
        if (!acc[mecanico].primeiraOrdem || dataOrdem < new Date(acc[mecanico].primeiraOrdem)) {
          acc[mecanico].primeiraOrdem = ordem.data_ordem;
        }
      }
      
      // Defeitos
      const grupo = ordem.defeito_grupo || 'Não Classificado';
      acc[mecanico].defeitos[grupo] = (acc[mecanico].defeitos[grupo] || 0) + 1;
      
      // Garantias
      const status = ordem.status || 'Não Informado';
      acc[mecanico].garantias[status] = (acc[mecanico].garantias[status] || 0) + 1;
      
      // Motores
      const fabricante = ordem.fabricante_motor || 'Não Informado';
      acc[mecanico].motores[fabricante] = (acc[mecanico].motores[fabricante] || 0) + 1;
      
      return acc;
    }, {});

    // Converter para array e calcular métricas
    let mecanicosArray = Object.values(mecanicoStats)
      .map(mecanico => {
        // Calcular se está ativo (trabalhou nos últimos 90 dias)
        const agora = new Date();
        const noventaDiasAtras = new Date(agora.getTime() - (90 * 24 * 60 * 60 * 1000));
        const ultimaOrdemData = mecanico.ultimaOrdem ? new Date(mecanico.ultimaOrdem) : null;
        const estaAtivo = ultimaOrdemData && ultimaOrdemData >= noventaDiasAtras;
        
        return {
          ...mecanico,
          valorMedio: mecanico.totalOrdens > 0 ? mecanico.valorTotal / mecanico.totalOrdens : 0,
          defeitoMaisComum: Object.entries(mecanico.defeitos)
            .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Nenhum',
          garantiaMaisComum: Object.entries(mecanico.garantias)
            .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Nenhuma',
          motorMaisComum: Object.entries(mecanico.motores)
            .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Nenhum',
          ativo: estaAtivo,
          diasSemTrabalhar: ultimaOrdemData ? Math.floor((agora - ultimaOrdemData) / (24 * 60 * 60 * 1000)) : null
        };
      });

    // Filtrar por status ativo
    if (ativo === 'sim') {
      mecanicosArray = mecanicosArray.filter(m => m.ativo);
    } else if (ativo === 'nao') {
      mecanicosArray = mecanicosArray.filter(m => !m.ativo);
    }

    // Ordenar
    switch (ordenar) {
      case 'ordens':
        mecanicosArray.sort((a, b) => b.totalOrdens - a.totalOrdens);
        break;
      case 'valor':
        mecanicosArray.sort((a, b) => b.valorTotal - a.valorTotal);
        break;
      case 'ultima_ordem':
        mecanicosArray.sort((a, b) => {
          if (!a.ultimaOrdem) return 1;
          if (!b.ultimaOrdem) return -1;
          return new Date(b.ultimaOrdem) - new Date(a.ultimaOrdem);
        });
        break;
      default: // nome
        mecanicosArray.sort((a, b) => a.nome.localeCompare(b.nome));
    }

    res.json({
      mecanicos: mecanicosArray,
      resumo: {
        total: mecanicosArray.length,
        ativos: mecanicosArray.filter(m => m.ativo).length,
        inativos: mecanicosArray.filter(m => !m.ativo).length
      }
    });

  } catch (error) {
    console.error('Erro ao buscar lista de mecânicos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/mecanicos/performance - Performance detalhada dos mecânicos
router.get('/performance', async (req, res) => {
  try {
    const { mecanico, periodo = '6meses' } = req.query;

    let query = supabase
      .from('ordens_servico')
      .select('*');

    if (mecanico && mecanico !== 'todos') {
      query = query.eq('mecanico_responsavel', mecanico);
    }

    // Filtro de período
    const agora = new Date();
    let dataInicio;
    
    switch (periodo) {
      case '1mes':
        dataInicio = new Date(agora.getFullYear(), agora.getMonth() - 1, agora.getDate());
        break;
      case '3meses':
        dataInicio = new Date(agora.getFullYear(), agora.getMonth() - 3, agora.getDate());
        break;
      case '1ano':
        dataInicio = new Date(agora.getFullYear() - 1, agora.getMonth(), agora.getDate());
        break;
      default: // 6meses
        dataInicio = new Date(agora.getFullYear(), agora.getMonth() - 6, agora.getDate());
    }

    query = query.gte('data_ordem', dataInicio.toISOString().split('T')[0]);

    const { data: ordensData, error: ordensError } = await query;

    if (ordensError) {
      console.error('Erro ao buscar ordens de serviço:', ordensError);
      return res.status(500).json({ error: 'Erro ao buscar dados' });
    }

    // Performance por mecânico
    const performanceMecanicos = ordensData.reduce((acc, ordem) => {
      const mecanicoNome = ordem.mecanico_responsavel || 'Não Informado';
      
      if (!acc[mecanicoNome]) {
        acc[mecanicoNome] = {
          nome: mecanicoNome,
          ordens: [],
          totalOrdens: 0,
          valorTotal: 0,
          defeitosPorGrupo: {},
          garantiasPorTipo: {},
          performanceMensal: {}
        };
      }
      
      acc[mecanicoNome].ordens.push(ordem);
      acc[mecanicoNome].totalOrdens += 1;
      acc[mecanicoNome].valorTotal += parseFloat(ordem.total_geral) || 0;
      
      // Defeitos por grupo
      const grupo = ordem.defeito_grupo || 'Não Classificado';
      acc[mecanicoNome].defeitosPorGrupo[grupo] = (acc[mecanicoNome].defeitosPorGrupo[grupo] || 0) + 1;
      
      // Garantias por tipo
      const status = ordem.status || 'Não Informado';
      acc[mecanicoNome].garantiasPorTipo[status] = (acc[mecanicoNome].garantiasPorTipo[status] || 0) + 1;
      
      // Performance mensal
      if (ordem.data_ordem) {
        const data = new Date(ordem.data_ordem);
        const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
        
        if (!acc[mecanicoNome].performanceMensal[chave]) {
          acc[mecanicoNome].performanceMensal[chave] = {
            mes: chave,
            ordens: 0,
            valor: 0
          };
        }
        
        acc[mecanicoNome].performanceMensal[chave].ordens += 1;
        acc[mecanicoNome].performanceMensal[chave].valor += parseFloat(ordem.total_geral) || 0;
      }
      
      return acc;
    }, {});

    // Converter para array e calcular métricas
    const performanceArray = Object.values(performanceMecanicos)
      .map(mecanico => ({
        ...mecanico,
        valorMedio: mecanico.totalOrdens > 0 ? mecanico.valorTotal / mecanico.totalOrdens : 0,
        defeitosPorGrupoArray: Object.entries(mecanico.defeitosPorGrupo)
          .map(([grupo, quantidade]) => ({ grupo, quantidade }))
          .sort((a, b) => b.quantidade - a.quantidade),
        garantiasPorTipoArray: Object.entries(mecanico.garantiasPorTipo)
          .map(([tipo, quantidade]) => ({ tipo, quantidade }))
          .sort((a, b) => b.quantidade - a.quantidade),
        performanceMensalArray: Object.values(mecanico.performanceMensal)
          .sort((a, b) => a.mes.localeCompare(b.mes))
      }))
      .sort((a, b) => b.totalOrdens - a.totalOrdens);

    // Estatísticas gerais
    const totalOrdens = ordensData.length;
    const valorTotal = ordensData.reduce((sum, ordem) => sum + (parseFloat(ordem.total_geral) || 0), 0);
    const mediaPorMecanico = performanceArray.length > 0 ? totalOrdens / performanceArray.length : 0;

    res.json({
      performance: performanceArray,
      resumo: {
        totalOrdens,
        valorTotal,
        totalMecanicos: performanceArray.length,
        mediaPorMecanico,
        periodo
      }
    });

  } catch (error) {
    console.error('Erro ao calcular performance dos mecânicos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/mecanicos/ranking - Ranking dos mecânicos
router.get('/ranking', async (req, res) => {
  try {
    const { criterio = 'ordens', periodo = '6meses' } = req.query;

    // Filtro de período
    const agora = new Date();
    let dataInicio;
    
    switch (periodo) {
      case '1mes':
        dataInicio = new Date(agora.getFullYear(), agora.getMonth() - 1, agora.getDate());
        break;
      case '3meses':
        dataInicio = new Date(agora.getFullYear(), agora.getMonth() - 3, agora.getDate());
        break;
      case '1ano':
        dataInicio = new Date(agora.getFullYear() - 1, agora.getMonth(), agora.getDate());
        break;
      default: // 6meses
        dataInicio = new Date(agora.getFullYear(), agora.getMonth() - 6, agora.getDate());
    }

    const { data: ordensData, error: ordensError } = await supabase
      .from('ordens_servico')
      .select('*')
      .gte('data_ordem', dataInicio.toISOString().split('T')[0]);

    if (ordensError) {
      console.error('Erro ao buscar ordens de serviço:', ordensError);
      return res.status(500).json({ error: 'Erro ao buscar dados' });
    }

    // Calcular métricas por mecânico
    const mecanicoMetricas = ordensData.reduce((acc, ordem) => {
      const mecanico = ordem.mecanico_responsavel || 'Não Informado';
      
      if (!acc[mecanico]) {
        acc[mecanico] = {
          nome: mecanico,
          totalOrdens: 0,
          valorTotal: 0,
          valorMedio: 0,
          eficiencia: 0, // ordens por dia útil
          qualidade: 0, // % de ordens sem retrabalho (baseado em confiança da classificação)
          diversidade: new Set() // tipos de defeitos diferentes
        };
      }
      
      acc[mecanico].totalOrdens += 1;
      acc[mecanico].valorTotal += parseFloat(ordem.total_geral) || 0;
      
      // Diversidade de defeitos
      if (ordem.defeito_grupo && ordem.defeito_grupo !== 'Não Classificado') {
        acc[mecanico].diversidade.add(ordem.defeito_grupo);
      }
      
      return acc;
    }, {});

    // Calcular métricas finais
    const rankingArray = Object.values(mecanicoMetricas)
      .map(mecanico => {
        const valorMedio = mecanico.totalOrdens > 0 ? mecanico.valorTotal / mecanico.totalOrdens : 0;
        
        // Calcular eficiência (assumindo 22 dias úteis por mês)
        const diasUteis = Math.floor((agora - dataInicio) / (24 * 60 * 60 * 1000)) * (22/30);
        const eficiencia = diasUteis > 0 ? mecanico.totalOrdens / diasUteis : 0;
        
        // Diversidade de defeitos
        const diversidade = mecanico.diversidade.size;
        
        return {
          ...mecanico,
          valorMedio,
          eficiencia,
          diversidade,
          diversidadeSet: undefined // Remover o Set do resultado
        };
      });

    // Ordenar por critério
    switch (criterio) {
      case 'valor':
        rankingArray.sort((a, b) => b.valorTotal - a.valorTotal);
        break;
      case 'valor_medio':
        rankingArray.sort((a, b) => b.valorMedio - a.valorMedio);
        break;
      case 'eficiencia':
        rankingArray.sort((a, b) => b.eficiencia - a.eficiencia);
        break;
      case 'diversidade':
        rankingArray.sort((a, b) => b.diversidade - a.diversidade);
        break;
      default: // ordens
        rankingArray.sort((a, b) => b.totalOrdens - a.totalOrdens);
    }

    // Adicionar posições no ranking
    const rankingFinal = rankingArray.map((mecanico, index) => ({
      ...mecanico,
      posicao: index + 1
    }));

    // Top 10
    const top10 = rankingFinal.slice(0, 10);

    res.json({
      ranking: rankingFinal,
      top10,
      criterio,
      periodo,
      resumo: {
        totalMecanicos: rankingFinal.length,
        totalOrdens: ordensData.length,
        valorTotal: ordensData.reduce((sum, ordem) => sum + (parseFloat(ordem.total_geral) || 0), 0)
      }
    });

  } catch (error) {
    console.error('Erro ao calcular ranking dos mecânicos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/mecanicos/estatisticas - Estatísticas gerais dos mecânicos
router.get('/estatisticas', async (req, res) => {
  try {
    const { data: ordensData, error: ordensError } = await supabase
      .from('ordens_servico')
      .select('*');

    if (ordensError) {
      console.error('Erro ao buscar ordens de serviço:', ordensError);
      return res.status(500).json({ error: 'Erro ao buscar dados' });
    }

    // Estatísticas gerais
    const mecanicoStats = ordensData.reduce((acc, ordem) => {
      const mecanico = ordem.mecanico_responsavel || 'Não Informado';
      
      if (!acc[mecanico]) {
        acc[mecanico] = {
          nome: mecanico,
          totalOrdens: 0,
          valorTotal: 0,
          primeiraOrdem: null,
          ultimaOrdem: null
        };
      }
      
      acc[mecanico].totalOrdens += 1;
      acc[mecanico].valorTotal += parseFloat(ordem.total_geral) || 0;
      
      const dataOrdem = ordem.data_ordem ? new Date(ordem.data_ordem) : null;
      if (dataOrdem) {
        if (!acc[mecanico].primeiraOrdem || dataOrdem < new Date(acc[mecanico].primeiraOrdem)) {
          acc[mecanico].primeiraOrdem = ordem.data_ordem;
        }
        if (!acc[mecanico].ultimaOrdem || dataOrdem > new Date(acc[mecanico].ultimaOrdem)) {
          acc[mecanico].ultimaOrdem = ordem.data_ordem;
        }
      }
      
      return acc;
    }, {});

    const mecanicosArray = Object.values(mecanicoStats);
    
    // Calcular estatísticas
    const totalMecanicos = mecanicosArray.length;
    const totalOrdens = ordensData.length;
    const valorTotal = ordensData.reduce((sum, ordem) => sum + (parseFloat(ordem.total_geral) || 0), 0);
    
    const mediaPorMecanico = totalMecanicos > 0 ? totalOrdens / totalMecanicos : 0;
    const valorMedioPorMecanico = totalMecanicos > 0 ? valorTotal / totalMecanicos : 0;
    
    // Mecânico mais produtivo
    const maisProdutivo = mecanicosArray.reduce((max, mecanico) => 
      mecanico.totalOrdens > (max?.totalOrdens || 0) ? mecanico : max, null
    );
    
    // Mecânico com maior valor
    const maiorValor = mecanicosArray.reduce((max, mecanico) => 
      mecanico.valorTotal > (max?.valorTotal || 0) ? mecanico : max, null
    );
    
    // Distribuição de ordens
    const distribuicao = mecanicosArray.map(m => m.totalOrdens).sort((a, b) => a - b);
    const mediana = distribuicao.length > 0 ? 
      distribuicao.length % 2 === 0 ? 
        (distribuicao[distribuicao.length/2 - 1] + distribuicao[distribuicao.length/2]) / 2 :
        distribuicao[Math.floor(distribuicao.length/2)] : 0;
    
    // Mecânicos ativos (últimos 90 dias)
    const agora = new Date();
    const noventaDiasAtras = new Date(agora.getTime() - (90 * 24 * 60 * 60 * 1000));
    const mecanicoAtivos = mecanicosArray.filter(m => 
      m.ultimaOrdem && new Date(m.ultimaOrdem) >= noventaDiasAtras
    ).length;

    res.json({
      resumo: {
        totalMecanicos,
        mecanicoAtivos,
        mecanicoInativos: totalMecanicos - mecanicoAtivos,
        totalOrdens,
        valorTotal,
        mediaPorMecanico,
        valorMedioPorMecanico,
        mediana
      },
      destaques: {
        maisProdutivo,
        maiorValor
      },
      distribuicao: {
        minimo: Math.min(...distribuicao),
        maximo: Math.max(...distribuicao),
        mediana,
        quartil1: distribuicao[Math.floor(distribuicao.length * 0.25)],
        quartil3: distribuicao[Math.floor(distribuicao.length * 0.75)]
      }
    });

  } catch (error) {
    console.error('Erro ao calcular estatísticas dos mecânicos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;

