const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Rota para listar ordens de serviço com filtros
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      defeito_grupo, 
      mecanico_responsavel,
      mes_servico,
      ano_servico 
    } = req.query;

    // Construir query base
    let query = supabase
      .from('ordens_servico')
      .select('*', { count: 'exact' });

    // Aplicar filtros
    if (status) {
      query = query.eq('status', status);
    }
    
    if (defeito_grupo) {
      query = query.eq('defeito_grupo', defeito_grupo);
    }
    
    if (mecanico_responsavel) {
      query = query.eq('mecanico_responsavel', mecanico_responsavel);
    }
    
    if (mes_servico) {
      query = query.eq('mes_servico', parseInt(mes_servico));
    }
    
    if (ano_servico) {
      query = query.eq('ano_servico', parseInt(ano_servico));
    }

    // Aplicar paginação
    const offset = (page - 1) * limit;
    query = query
      .range(offset, offset + parseInt(limit) - 1)
      .order('numero_ordem', { ascending: false });

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

// Rota para buscar uma ordem específica
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('ordens_servico')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar ordem de serviço:', error);
      return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
    }

    res.json(data);

  } catch (error) {
    console.error('Erro no endpoint /ordens/:id:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para buscar filtros disponíveis
router.get('/filters/options', async (req, res) => {
  try {
    const { data: ordensServico, error } = await supabase
      .from('ordens_servico')
      .select('status, defeito_grupo, mecanico_responsavel, mes_servico, ano_servico')
      .range(0, 9999); // Remove o limite padrão de 1000 linhas

    if (error) {
      console.error('Erro ao buscar opções de filtro:', error);
      return res.status(500).json({ error: 'Erro ao buscar dados' });
    }

    // Extrair valores únicos para cada filtro
    const statusOptions = [...new Set(ordensServico.map(os => os.status).filter(Boolean))];
    const defeitoGrupoOptions = [...new Set(ordensServico.map(os => os.defeito_grupo).filter(Boolean))];
    const mecanicoOptions = [...new Set(ordensServico.map(os => os.mecanico_responsavel).filter(Boolean))];
    const mesOptions = [...new Set(ordensServico.map(os => os.mes_servico).filter(Boolean))].sort((a, b) => a - b);
    const anoOptions = [...new Set(ordensServico.map(os => os.ano_servico).filter(Boolean))].sort((a, b) => b - a);

    res.json({
      status: statusOptions,
      defeito_grupo: defeitoGrupoOptions,
      mecanico_responsavel: mecanicoOptions,
      mes_servico: mesOptions,
      ano_servico: anoOptions
    });

  } catch (error) {
    console.error('Erro no endpoint /ordens/filters/options:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;

