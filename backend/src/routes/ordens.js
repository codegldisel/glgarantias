const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Rota para listar ordens de serviço com filtros avançados e paginação
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 30, // Aumentado o limite padrão para 30
      status, 
      mecanico,
      startDate,
      endDate,
      search // Busca por texto em numero_ordem ou defeito_texto_bruto
    } = req.query;

    let query = supabase
      .from('ordens_servico')
      .select('*', { count: 'exact' });

    // Filtros
    if (status) query = query.eq('status', status);
    if (mecanico) query = query.eq('mecanico_responsavel', mecanico);
    if (startDate) query = query.gte('data_ordem', startDate);
    if (endDate) query = query.lte('data_ordem', endDate);
    
    // Filtro de busca textual
    if (search) {
      // A busca será feita no número da ordem OU no texto do defeito
      query = query.or(`numero_ordem.ilike.%${search}%,defeito_texto_bruto.ilike.%${search}%`);
    }

    // Paginação
    const offset = (page - 1) * limit;
    query = query
      .range(offset, offset + parseInt(limit) - 1)
      .order('data_ordem', { ascending: false }); // Ordenar pelos mais recentes

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

// Rota para atualizar a classificação de uma OS
router.put('/:id/classificar', async (req, res) => {
  try {
    const { id } = req.params;
    const { defeito_grupo } = req.body;

    if (!defeito_grupo) {
      return res.status(400).json({ error: 'O campo "defeito_grupo" é obrigatório.' });
    }

    const { data, error } = await supabase
      .from('ordens_servico')
      .update({ 
        defeito_grupo: defeito_grupo,
        status: 'Analisado' // Opcional: Mudar status para "Analisado" ao classificar
      })
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


// Rota para buscar valores únicos para os filtros
router.get('/filters/options', async (req, res) => {
  try {
    // Buscar todos os dados necessários em uma única consulta para otimizar
    const { data, error } = await supabase
      .from('ordens_servico')
      .select('status, mecanico_responsavel, defeito_grupo')
      .limit(10000); // Pegar um grande número de registros para garantir que todas as opções apareçam

    if (error) {
      console.error('Erro ao buscar opções de filtro:', error);
      return res.status(500).json({ error: 'Erro ao buscar dados para filtros' });
    }

    // Processar os dados no JS para extrair valores únicos
    const status = [...new Set(data.map(item => item.status).filter(Boolean))].sort();
    const mecanicos = [...new Set(data.map(item => item.mecanico_responsavel).filter(Boolean))].sort();
    const defeito_grupos = [...new Set(data.map(item => item.defeito_grupo).filter(Boolean))].sort();

    res.json({
      status,
      mecanicos,
      defeito_grupos,
    });

  } catch (error) {
    console.error('Erro no endpoint /ordens/filters/options:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});


module.exports = router;

