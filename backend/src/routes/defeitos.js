const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// GET /api/defeitos/lista - Lista de defeitos com filtros
router.get('/lista', async (req, res) => {
  try {
    const { 
      grupo, 
      subgrupo, 
      subsubgrupo, 
      confianca_min, 
      data_inicio, 
      data_fim,
      page = 1,
      limit = 50
    } = req.query;

    let query = supabase
      .from('ordens_servico')
      .select('*');

    // Aplicar filtros
    if (grupo && grupo !== 'todos') {
      query = query.eq('defeito_grupo', grupo);
    }
    
    if (subgrupo && subgrupo !== 'todos') {
      query = query.eq('defeito_subgrupo', subgrupo);
    }
    
    if (subsubgrupo && subsubgrupo !== 'todos') {
      query = query.eq('defeito_subsubgrupo', subsubgrupo);
    }
    
    if (confianca_min) {
      query = query.gte('classificacao_confianca', parseFloat(confianca_min));
    }
    
    if (data_inicio) {
      query = query.gte('data_ordem', data_inicio);
    }
    
    if (data_fim) {
      query = query.lte('data_ordem', data_fim);
    }

    // Paginação
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.range(offset, offset + parseInt(limit) - 1);

    // Ordenar por data mais recente
    query = query.order('data_ordem', { ascending: false });

    const { data: defeitos, error: defeitosError } = await query;

    if (defeitosError) {
      console.error('Erro ao buscar defeitos:', defeitosError);
      return res.status(500).json({ error: 'Erro ao buscar dados' });
    }

    // Buscar total de registros para paginação
    let countQuery = supabase
      .from('ordens_servico')
      .select('*', { count: 'exact', head: true });

    // Aplicar os mesmos filtros para contagem
    if (grupo && grupo !== 'todos') {
      countQuery = countQuery.eq('defeito_grupo', grupo);
    }
    if (subgrupo && subgrupo !== 'todos') {
      countQuery = countQuery.eq('defeito_subgrupo', subgrupo);
    }
    if (subsubgrupo && subsubgrupo !== 'todos') {
      countQuery = countQuery.eq('defeito_subsubgrupo', subsubgrupo);
    }
    if (confianca_min) {
      countQuery = countQuery.gte('classificacao_confianca', parseFloat(confianca_min));
    }
    if (data_inicio) {
      countQuery = countQuery.gte('data_ordem', data_inicio);
    }
    if (data_fim) {
      countQuery = countQuery.lte('data_ordem', data_fim);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error('Erro ao contar defeitos:', countError);
      return res.status(500).json({ error: 'Erro ao buscar dados' });
    }

    res.json({
      defeitos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Erro ao buscar lista de defeitos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/defeitos/estatisticas - Estatísticas de defeitos
router.get('/estatisticas', async (req, res) => {
  try {
    const { data: ordensData, error: ordensError } = await supabase
      .from('ordens_servico')
      .select('*');

    if (ordensError) {
      console.error('Erro ao buscar ordens de serviço:', ordensError);
      return res.status(500).json({ error: 'Erro ao buscar dados' });
    }

    // Estatísticas por grupo
    const estatisticasPorGrupo = ordensData.reduce((acc, ordem) => {
      const grupo = ordem.defeito_grupo || 'Não Classificado';
      
      if (!acc[grupo]) {
        acc[grupo] = {
          nome: grupo,
          quantidade: 0,
          valorTotal: 0,
          confiancaMedia: 0,
          subgrupos: {}
        };
      }
      
      acc[grupo].quantidade += 1;
      acc[grupo].valorTotal += parseFloat(ordem.total_geral) || 0;
      acc[grupo].confiancaMedia += parseFloat(ordem.classificacao_confianca) || 0;
      
      // Subgrupos
      const subgrupo = ordem.defeito_subgrupo || 'Não Classificado';
      if (!acc[grupo].subgrupos[subgrupo]) {
        acc[grupo].subgrupos[subgrupo] = {
          nome: subgrupo,
          quantidade: 0,
          subsubgrupos: {}
        };
      }
      acc[grupo].subgrupos[subgrupo].quantidade += 1;
      
      // Subsubgrupos
      const subsubgrupo = ordem.defeito_subsubgrupo || 'Não Classificado';
      if (!acc[grupo].subgrupos[subgrupo].subsubgrupos[subsubgrupo]) {
        acc[grupo].subgrupos[subgrupo].subsubgrupos[subsubgrupo] = {
          nome: subsubgrupo,
          quantidade: 0
        };
      }
      acc[grupo].subgrupos[subgrupo].subsubgrupos[subsubgrupo].quantidade += 1;
      
      return acc;
    }, {});

    // Calcular médias e converter para arrays
    const estatisticasArray = Object.values(estatisticasPorGrupo)
      .map(grupo => ({
        ...grupo,
        confiancaMedia: grupo.quantidade > 0 ? grupo.confiancaMedia / grupo.quantidade : 0,
        valorMedio: grupo.quantidade > 0 ? grupo.valorTotal / grupo.quantidade : 0,
        subgrupos: Object.values(grupo.subgrupos).map(subgrupo => ({
          ...subgrupo,
          subsubgrupos: Object.values(subgrupo.subsubgrupos)
        }))
      }))
      .sort((a, b) => b.quantidade - a.quantidade);

    // Estatísticas gerais
    const totalDefeitos = ordensData.length;
    const defeitosClassificados = ordensData.filter(ordem => 
      ordem.defeito_grupo && ordem.defeito_grupo !== 'Não Classificado'
    ).length;
    const percentualClassificacao = totalDefeitos > 0 ? (defeitosClassificados / totalDefeitos) * 100 : 0;
    
    const confiancaMedia = ordensData.reduce((sum, ordem) => 
      sum + (parseFloat(ordem.classificacao_confianca) || 0), 0
    ) / totalDefeitos;

    // Top 5 defeitos mais caros
    const defeitosMaisCaros = ordensData
      .filter(ordem => ordem.defeito_grupo && ordem.defeito_grupo !== 'Não Classificado')
      .sort((a, b) => (parseFloat(b.total_geral) || 0) - (parseFloat(a.total_geral) || 0))
      .slice(0, 5)
      .map(ordem => ({
        grupo: ordem.defeito_grupo,
        subgrupo: ordem.defeito_subgrupo,
        valor: parseFloat(ordem.total_geral) || 0,
        numeroOrdem: ordem.numero_ordem,
        data: ordem.data_ordem
      }));

    res.json({
      estatisticasPorGrupo: estatisticasArray,
      resumo: {
        totalDefeitos,
        defeitosClassificados,
        percentualClassificacao,
        confiancaMedia,
        defeitosMaisCaros
      }
    });

  } catch (error) {
    console.error('Erro ao calcular estatísticas de defeitos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/defeitos/evolucao - Evolução temporal dos defeitos
router.get('/evolucao', async (req, res) => {
  try {
    const { grupo, periodo = 'mensal' } = req.query;

    let query = supabase
      .from('ordens_servico')
      .select('*')
      .order('data_ordem', { ascending: true });

    if (grupo && grupo !== 'todos') {
      query = query.eq('defeito_grupo', grupo);
    }

    const { data: ordensData, error: ordensError } = await query;

    if (ordensError) {
      console.error('Erro ao buscar ordens de serviço:', ordensError);
      return res.status(500).json({ error: 'Erro ao buscar dados' });
    }

    // Agrupar por período
    const evolucao = ordensData.reduce((acc, ordem) => {
      if (!ordem.data_ordem) return acc;
      
      const data = new Date(ordem.data_ordem);
      let chave;
      
      if (periodo === 'mensal') {
        chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
      } else if (periodo === 'semanal') {
        const inicioSemana = new Date(data);
        inicioSemana.setDate(data.getDate() - data.getDay());
        chave = inicioSemana.toISOString().split('T')[0];
      } else { // diário
        chave = data.toISOString().split('T')[0];
      }
      
      if (!acc[chave]) {
        acc[chave] = {
          periodo: chave,
          quantidade: 0,
          valorTotal: 0,
          grupos: {}
        };
      }
      
      acc[chave].quantidade += 1;
      acc[chave].valorTotal += parseFloat(ordem.total_geral) || 0;
      
      const grupoDefeito = ordem.defeito_grupo || 'Não Classificado';
      acc[chave].grupos[grupoDefeito] = (acc[chave].grupos[grupoDefeito] || 0) + 1;
      
      return acc;
    }, {});

    // Converter para array e ordenar
    const evolucaoArray = Object.values(evolucao)
      .sort((a, b) => a.periodo.localeCompare(b.periodo));

    // Calcular tendência (últimos 6 períodos vs 6 anteriores)
    const ultimosPeriodos = evolucaoArray.slice(-6);
    const periodosAnteriores = evolucaoArray.slice(-12, -6);
    
    const mediaUltimos = ultimosPeriodos.reduce((sum, p) => sum + p.quantidade, 0) / ultimosPeriodos.length;
    const mediaAnteriores = periodosAnteriores.reduce((sum, p) => sum + p.quantidade, 0) / periodosAnteriores.length;
    
    const tendencia = mediaAnteriores > 0 ? ((mediaUltimos - mediaAnteriores) / mediaAnteriores) * 100 : 0;

    res.json({
      evolucao: evolucaoArray,
      tendencia: {
        percentual: tendencia,
        direcao: tendencia > 0 ? 'crescimento' : tendencia < 0 ? 'declínio' : 'estável'
      }
    });

  } catch (error) {
    console.error('Erro ao calcular evolução de defeitos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/defeitos/categorias - Lista de categorias disponíveis
router.get('/categorias', async (req, res) => {
  try {
    const { data: ordensData, error: ordensError } = await supabase
      .from('ordens_servico')
      .select('defeito_grupo, defeito_subgrupo, defeito_subsubgrupo');

    if (ordensError) {
      console.error('Erro ao buscar ordens de serviço:', ordensError);
      return res.status(500).json({ error: 'Erro ao buscar dados' });
    }

    // Extrair categorias únicas
    const grupos = [...new Set(ordensData.map(ordem => ordem.defeito_grupo).filter(Boolean))];
    const subgrupos = [...new Set(ordensData.map(ordem => ordem.defeito_subgrupo).filter(Boolean))];
    const subsubgrupos = [...new Set(ordensData.map(ordem => ordem.defeito_subsubgrupo).filter(Boolean))];

    // Estrutura hierárquica
    const hierarquia = ordensData.reduce((acc, ordem) => {
      const grupo = ordem.defeito_grupo || 'Não Classificado';
      const subgrupo = ordem.defeito_subgrupo || 'Não Classificado';
      const subsubgrupo = ordem.defeito_subsubgrupo || 'Não Classificado';
      
      if (!acc[grupo]) {
        acc[grupo] = {};
      }
      if (!acc[grupo][subgrupo]) {
        acc[grupo][subgrupo] = new Set();
      }
      acc[grupo][subgrupo].add(subsubgrupo);
      
      return acc;
    }, {});

    // Converter Sets para arrays
    const hierarquiaFinal = Object.entries(hierarquia).map(([grupo, subgrupos]) => ({
      grupo,
      subgrupos: Object.entries(subgrupos).map(([subgrupo, subsubgrupos]) => ({
        subgrupo,
        subsubgrupos: Array.from(subsubgrupos)
      }))
    }));

    res.json({
      grupos: grupos.sort(),
      subgrupos: subgrupos.sort(),
      subsubgrupos: subsubgrupos.sort(),
      hierarquia: hierarquiaFinal
    });

  } catch (error) {
    console.error('Erro ao buscar categorias de defeitos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;

