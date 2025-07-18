const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Rota para listar ordens de serviço com filtros avançados e paginação aprimorada
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50,
      status, 
      fabricante,
      modelo,
      mecanico,
      defeito_grupo,
      defeito_subgrupo,
      defeito_subsubgrupo,
      startDate,
      endDate,
      search,
      sortBy = 'data_ordem',
      sortOrder = 'desc'
    } = req.query;

    let query = supabase
      .from('ordens_servico')
      .select('*', { count: 'exact' });

    // Filtros
    if (status && status !== 'all') query = query.eq('status', status);
    if (fabricante && fabricante !== 'all') query = query.eq('fabricante_motor', fabricante);
    if (modelo && modelo !== 'all') query = query.eq('modelo_motor', modelo);
    if (mecanico && mecanico !== 'all') query = query.eq('mecanico_responsavel', mecanico);
    if (defeito_grupo && defeito_grupo !== 'all') query = query.eq('defeito_grupo', defeito_grupo);
    if (defeito_subgrupo && defeito_subgrupo !== 'all') query = query.eq('defeito_subgrupo', defeito_subgrupo);
    if (defeito_subsubgrupo && defeito_subsubgrupo !== 'all') query = query.eq('defeito_subsubgrupo', defeito_subsubgrupo);
    if (startDate) query = query.gte('data_ordem', startDate);
    if (endDate) query = query.lte('data_ordem', endDate);
    
    // Filtro de busca textual
    if (search) {
      query = query.or(`numero_ordem.ilike.%${search}%,defeito_texto_bruto.ilike.%${search}%,fabricante_motor.ilike.%${search}%,modelo_motor.ilike.%${search}%,modelo_veiculo_motor.ilike.%${search}%`);
    }

    // Ordenação
    const validSortColumns = [
      'numero_ordem', 'data_ordem', 'status', 'fabricante_motor', 'modelo_motor', 'modelo_veiculo_motor',
      'defeito_grupo', 'defeito_subgrupo', 'defeito_subsubgrupo', 'mecanico_responsavel',
      'total_pecas', 'total_servico', 'total_geral'
    ];
    
    if (validSortColumns.includes(sortBy)) {
      const ascending = sortOrder === 'asc';
      query = query.order(sortBy, { ascending });
    } else {
      query = query.order('data_ordem', { ascending: false });
    }

    // Paginação
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Erro ao buscar ordens de serviço:', error);
      return res.status(500).json({ error: 'Erro ao buscar dados' });
    }

    res.json({
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Erro no endpoint /ordens:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para buscar valores únicos para os filtros (versão aprimorada)
router.get('/filters/options', async (req, res) => {
  try {
    // Buscar todos os dados necessários em consultas otimizadas
    const { data, error } = await supabase
      .from('ordens_servico')
      .select(`
        status, 
        fabricante_motor, 
        modelo_motor,
        modelo_veiculo_motor, 
        mecanico_responsavel, 
        defeito_grupo, 
        defeito_subgrupo, 
        defeito_subsubgrupo
      `)
      .limit(50000); // Aumentar limite para garantir que todas as opções apareçam

    if (error) {
      console.error('Erro ao buscar opções de filtro:', error);
      return res.status(500).json({ error: 'Erro ao buscar dados para filtros' });
    }

    // Processar os dados no JS para extrair valores únicos
    const status = [...new Set(data.map(item => item.status).filter(Boolean))].sort();
    const fabricantes = [...new Set(data.map(item => item.fabricante_motor).filter(Boolean))].sort();
    const modelos = [...new Set(data.map(item => item.modelo_motor).filter(Boolean))].sort();
    const modelosVeiculo = [...new Set(data.map(item => item.modelo_veiculo_motor).filter(Boolean))].sort();
    const mecanicos = [...new Set(data.map(item => item.mecanico_responsavel).filter(Boolean))].sort();
    const defeito_grupos = [...new Set(data.map(item => item.defeito_grupo).filter(Boolean))].sort();
    const defeito_subgrupos = [...new Set(data.map(item => item.defeito_subgrupo).filter(Boolean))].sort();
    const defeito_subsubgrupos = [...new Set(data.map(item => item.defeito_subsubgrupo).filter(Boolean))].sort();

    res.json({
      status,
      fabricantes,
      modelos,
      modelosVeiculo,
      mecanicos,
      defeito_grupos,
      defeito_subgrupos,
      defeito_subsubgrupos,
    });

  } catch (error) {
    console.error('Erro no endpoint /ordens/filters/options:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para atualizar a classificação de uma OS (mantida da versão original)
router.put('/:id/classificar', async (req, res) => {
  try {
    const { id } = req.params;
    const { defeito_grupo, defeito_subgrupo, defeito_subsubgrupo } = req.body;

    if (!defeito_grupo) {
      return res.status(400).json({ error: 'O campo "defeito_grupo" é obrigatório.' });
    }

    const updateData = { defeito_grupo };
    if (defeito_subgrupo) updateData.defeito_subgrupo = defeito_subgrupo;
    if (defeito_subsubgrupo) updateData.defeito_subsubgrupo = defeito_subsubgrupo;

    const { data, error } = await supabase
      .from('ordens_servico')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar ordem de serviço:', error);
      return res.status(500).json({ error: 'Não foi possível atualizar a classificação.' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Ordem de serviço não encontrada.' });
    }

    res.json(data);

  } catch (error) {
    console.error('Erro no endpoint /ordens/:id/classificar:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para estatísticas resumidas
router.get('/stats', async (req, res) => {
  try {
    const { 
      status, 
      fabricante,
      modelo,
      mecanico,
      defeito_grupo,
      startDate,
      endDate,
      search
    } = req.query;

    let query = supabase
      .from('ordens_servico')
      .select('total_geral', { count: 'exact' });

    // Aplicar os mesmos filtros da consulta principal
    if (status && status !== 'all') query = query.eq('status', status);
    if (fabricante && fabricante !== 'all') query = query.eq('fabricante_motor', fabricante);
    if (modelo && modelo !== 'all') query = query.eq('modelo_motor', modelo);
    if (mecanico && mecanico !== 'all') query = query.eq('mecanico_responsavel', mecanico);
    if (defeito_grupo && defeito_grupo !== 'all') query = query.eq('defeito_grupo', defeito_grupo);
    if (startDate) query = query.gte('data_ordem', startDate);
    if (endDate) query = query.lte('data_ordem', endDate);
    
    if (search) {
      query = query.or(`numero_ordem.ilike.%${search}%,defeito_texto_bruto.ilike.%${search}%,fabricante_motor.ilike.%${search}%,modelo_motor.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }

    const totalCost = data.reduce((sum, item) => sum + (item.total_geral || 0), 0);
    const avgCost = count > 0 ? totalCost / count : 0;

    res.json({
      totalOrders: count,
      totalCost,
      avgCost
    });

  } catch (error) {
    console.error('Erro no endpoint /ordens/stats:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;

