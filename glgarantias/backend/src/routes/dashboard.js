const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Rota para estatísticas do dashboard
router.get('/stats', async (req, res) => {
  try {
    const { mes_servico, ano_servico } = req.query;
    
    console.log('Parâmetros recebidos na rota /stats:', { mes_servico, ano_servico });
    
    // Buscar todas as ordens de serviço
    const { data: ordensServico, error: ordensError } = await supabase
      .from('ordens_servico')
      .select('*')
      .limit(10000);

    if (ordensError) {
      console.error('Erro ao buscar ordens de serviço:', ordensError);
      return res.status(500).json({ error: 'Erro ao buscar dados' });
    }

    console.log('Total de ordens encontradas:', ordensServico.length);

    // Filtrar por mês e ano se especificados
    let ordensFiltradas = ordensServico;
    if (mes_servico && ano_servico) {
      ordensFiltradas = ordensServico.filter(os => {
        if (os.mes_servico && os.ano_servico) {
          return os.mes_servico === parseInt(mes_servico) && os.ano_servico === parseInt(ano_servico);
        }
        if (os.data_ordem) {
          const dataOrdem = new Date(os.data_ordem);
          const mesOrdem = dataOrdem.getMonth() + 1;
          const anoOrdem = dataOrdem.getFullYear();
          return mesOrdem === parseInt(mes_servico) && anoOrdem === parseInt(ano_servico);
        }
        return false;
      });
      console.log(`Filtrando para mes=${mes_servico} ano=${ano_servico}: ${ordensFiltradas.length} registros encontrados.`);
    }

    // Calcular estatísticas
    const totalOS = ordensFiltradas.length;
    const totalPecas = ordensFiltradas.reduce((sum, os) => sum + (os.total_pecas || 0), 0);
    const totalServicos = ordensFiltradas.reduce((sum, os) => sum + (os.total_servico || 0), 0);
    const totalGeral = totalPecas + totalServicos; // Total = Total Peças + Total Serviços
    
    // Contar mecânicos únicos
    const mecanicosUnicos = new Set(ordensFiltradas.map(os => os.mecanico_responsavel).filter(Boolean));
    const totalMecanicos = mecanicosUnicos.size;
    
    // Contar tipos de defeitos únicos
    const defeitosUnicos = new Set(ordensFiltradas.map(os => os.defeito_grupo).filter(Boolean));
    const totalTiposDefeitos = defeitosUnicos.size;

    const resultado = {
      totalOS,
      totalPecas,
      totalServicos,
      totalGeral,
      totalMecanicos,
      totalTiposDefeitos
    };

    console.log('Estatísticas calculadas:', resultado);

    res.json(resultado);

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

// Rota para dados do mês atual
router.get('/current-month', async (req, res) => {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // getMonth() retorna 0-11
    const currentYear = currentDate.getFullYear();

    console.log(`Buscando dados para: ${currentMonth}/${currentYear}`);

    // Buscar todas as ordens de serviço
    const { data: ordensServico, error } = await supabase
      .from('ordens_servico')
      .select('*');

    if (error) {
      console.error('Erro ao buscar dados do mês atual:', error);
      return res.status(500).json({ error: 'Erro ao buscar dados' });
    }

    // Filtrar por mês atual usando data_ordem
    const ordensDoMes = ordensServico.filter(os => {
      if (!os.data_ordem) return false;
      
      const dataOrdem = new Date(os.data_ordem);
      const mesOrdem = dataOrdem.getMonth() + 1;
      const anoOrdem = dataOrdem.getFullYear();
      
      return mesOrdem === currentMonth && anoOrdem === currentYear;
    });

    // Formatar dados para a tabela
    const formattedData = ordensDoMes.map(os => ({
      id: os.id,
      numero_ordem: os.numero_ordem || 'N/A',
      data_ordem: os.data_ordem ? new Date(os.data_ordem).toLocaleDateString('pt-BR') : 'N/A',
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
      month: currentMonth,
      year: currentYear
    });

  } catch (error) {
    console.error('Erro no endpoint /current-month:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota temporária para verificar meses disponíveis
router.get('/available-months', async (req, res) => {
  try {
    const { data: ordensServico, error } = await supabase
      .from('ordens_servico')
      .select('data_ordem')
      .not('data_ordem', 'is', null);

    if (error) {
      console.error('Erro ao buscar meses disponíveis:', error);
      return res.status(500).json({ error: 'Erro ao buscar dados' });
    }

    // Agrupar por mês/ano usando data_ordem
    const mesesDisponiveis = {};
    ordensServico.forEach(os => {
      if (os.data_ordem) {
        const data = new Date(os.data_ordem);
        const mes = data.getMonth() + 1;
        const ano = data.getFullYear();
        const chave = `${mes}/${ano}`;
        mesesDisponiveis[chave] = (mesesDisponiveis[chave] || 0) + 1;
      }
    });

    const mesesArray = Object.entries(mesesDisponiveis).map(([periodo, quantidade]) => ({
      periodo,
      quantidade,
      mes: parseInt(periodo.split('/')[0]),
      ano: parseInt(periodo.split('/')[1])
    }));

    // Ordenar por data
    mesesArray.sort((a, b) => {
      if (a.ano !== b.ano) return a.ano - b.ano;
      return a.mes - b.mes;
    });

    res.json({
      meses: mesesArray,
      total: ordensServico.length
    });

  } catch (error) {
    console.error('Erro no endpoint /available-months:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;

