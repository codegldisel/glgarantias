const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Endpoint unificado e OTIMIZADO para todos os dados da página de Análises
router.get('/dados', async (req, res) => {
  try {
    const { startDate, endDate, fabricante, mecanico, defeito_grupo } = req.query;

    // Para chamar a função, precisamos passar os filtros como parâmetros
    const params = {
      p_start_date: startDate || null,
      p_end_date: endDate || null,
      p_fabricante: fabricante !== 'all' ? fabricante : null,
      p_mecanico: mecanico !== 'all' ? mecanico : null,
      p_defeito_grupo: defeito_grupo !== 'all' ? defeito_grupo : null,
    };

    // Chamada para a Stored Procedure (Remote Procedure Call) no Supabase
    const { data, error } = await supabase.rpc('get_analysis_data', params);

    if (error) {
      console.error('Erro ao chamar a função get_analysis_data:', error);
      throw new Error('Falha ao executar a análise no banco de dados.');
    }
    
    // A função já retorna os dados no formato que precisamos
    res.json(data[0]);

  } catch (error) {
    console.error('Erro no endpoint /analises/dados:', error);
    res.status(500).json({ error: error.message || 'Erro interno do servidor ao processar dados de análise.' });
  }
});

module.exports = router;
