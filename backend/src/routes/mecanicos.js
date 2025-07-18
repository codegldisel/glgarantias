const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");

// Endpoint principal para dados de mecânicos
router.get("/data", async (req, res) => {
  try {
    const { startDate, endDate, fabricante, modelo, defeito_grupo, mecanico, status } = req.query;

    // Construir filtros dinâmicos
    let query = supabase.from("ordens_servico").select("*");
    
    // Aplicar filtros de status padrão
    query = query.in("status", ["Garantia", "Garantia de Oficina", "Garantia de Usinagem"]);

    if (startDate) {
      query = query.gte("data_ordem", startDate);
    }
    if (endDate) {
      query = query.lte("data_ordem", endDate);
    }
    if (fabricante && fabricante !== "all") {
      query = query.eq("fabricante_motor", fabricante);
    }
    if (modelo && modelo !== "all") {
      query = query.eq("modelo_motor", modelo);
    }
    if (defeito_grupo && defeito_grupo !== "all") {
      query = query.eq("defeito_grupo", defeito_grupo);
    }
    if (mecanico && mecanico !== "all") {
      query = query.eq("mecanico_responsavel", mecanico);
    }
    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data: ordensData, error: ordensError } = await query;

    if (ordensError) throw ordensError;

    // KPIs da Equipe
    const totalMecanicos = [...new Set(ordensData.map(ordem => ordem.mecanico_responsavel).filter(Boolean))].length;
    const totalOrdens = ordensData.length;
    const custoTotalEquipe = ordensData.reduce((sum, ordem) => sum + (parseFloat(ordem.total_geral) || 0), 0);
    const custoMedioEquipe = totalOrdens > 0 ? custoTotalEquipe / totalOrdens : 0;

    // Calcular tempo médio de resolução da equipe
    const ordensComTempo = ordensData.filter(ordem => ordem.data_ordem && ordem.data_fechamento);
    const tempoMedioEquipe = ordensComTempo.length > 0 
      ? ordensComTempo.reduce((sum, ordem) => {
          const inicio = new Date(ordem.data_ordem);
          const fim = new Date(ordem.data_fechamento);
          const dias = (fim - inicio) / (1000 * 60 * 60 * 24);
          return sum + dias;
        }, 0) / ordensComTempo.length
      : 0;

    // Análise Individual de Mecânicos
    const mecanicosAnalise = {};
    ordensData.forEach(ordem => {
      const mecanico = ordem.mecanico_responsavel || "Indefinido";
      if (!mecanicosAnalise[mecanico]) {
        mecanicosAnalise[mecanico] = {
          nome: mecanico,
          totalOrdens: 0,
          custoTotal: 0,
          custoMedio: 0,
          tempoMedioResolucao: 0,
          ordensComTempo: [],
          defeitosAtendidos: new Set(),
          fabricantesAtendidos: new Set(),
          statusDistribuicao: {}
        };
      }
      
      const analise = mecanicosAnalise[mecanico];
      analise.totalOrdens++;
      analise.custoTotal += parseFloat(ordem.total_geral) || 0;
      
      if (ordem.defeito_grupo) {
        analise.defeitosAtendidos.add(ordem.defeito_grupo);
      }
      if (ordem.fabricante_motor) {
        analise.fabricantesAtendidos.add(ordem.fabricante_motor);
      }
      
      const status = ordem.status || "Indefinido";
      analise.statusDistribuicao[status] = (analise.statusDistribuicao[status] || 0) + 1;
      
      if (ordem.data_ordem && ordem.data_fechamento) {
        const inicio = new Date(ordem.data_ordem);
        const fim = new Date(ordem.data_fechamento);
        const dias = (fim - inicio) / (1000 * 60 * 60 * 24);
        analise.ordensComTempo.push(dias);
      }
    });

    // Finalizar cálculos para cada mecânico
    const performanceMecanicos = Object.values(mecanicosAnalise).map(mecanico => {
      mecanico.custoMedio = mecanico.totalOrdens > 0 ? mecanico.custoTotal / mecanico.totalOrdens : 0;
      mecanico.tempoMedioResolucao = mecanico.ordensComTempo.length > 0 
        ? mecanico.ordensComTempo.reduce((sum, tempo) => sum + tempo, 0) / mecanico.ordensComTempo.length 
        : 0;
      
      // Calcular métricas de performance
      mecanico.produtividade = mecanico.totalOrdens; // Número de ordens como proxy de produtividade
      mecanico.eficiencia = mecanico.tempoMedioResolucao > 0 ? 100 / mecanico.tempoMedioResolucao : 0; // Eficiência baseada no tempo
      mecanico.versatilidade = mecanico.defeitosAtendidos.size; // Número de tipos de defeitos diferentes
      mecanico.experienciaFabricantes = mecanico.fabricantesAtendidos.size; // Número de fabricantes diferentes
      
      // Calcular taxa de sucesso (ordens concluídas vs total)
      const ordensCompletas = mecanico.statusDistribuicao["Garantia"] || 0;
      mecanico.taxaSucesso = mecanico.totalOrdens > 0 ? (ordensCompletas / mecanico.totalOrdens) * 100 : 0;
      
      // Score geral (combinação de métricas)
      mecanico.scoreGeral = (
        (mecanico.produtividade * 0.3) + 
        (mecanico.eficiencia * 0.25) + 
        (mecanico.versatilidade * 0.2) + 
        (mecanico.taxaSucesso * 0.25)
      );
      
      // Limpar arrays temporários
      delete mecanico.ordensComTempo;
      mecanico.defeitosAtendidos = Array.from(mecanico.defeitosAtendidos);
      mecanico.fabricantesAtendidos = Array.from(mecanico.fabricantesAtendidos);
      
      return mecanico;
    }).sort((a, b) => b.scoreGeral - a.scoreGeral);

    // Ranking de Performance (Top 10)
    const rankingPerformance = performanceMecanicos.slice(0, 10).map((mecanico, index) => ({
      posicao: index + 1,
      nome: mecanico.nome,
      totalOrdens: mecanico.totalOrdens,
      custoMedio: mecanico.custoMedio,
      tempoMedio: mecanico.tempoMedioResolucao,
      taxaSucesso: mecanico.taxaSucesso,
      versatilidade: mecanico.versatilidade,
      scoreGeral: mecanico.scoreGeral,
      iniciais: mecanico.nome.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)
    }));

    // Análise de Produtividade Temporal
    const produtividadeTemporal = {};
    ordensData.forEach(ordem => {
      if (ordem.data_ordem && ordem.mecanico_responsavel) {
        const periodo = ordem.data_ordem.substring(0, 7); // YYYY-MM
        const mecanico = ordem.mecanico_responsavel;
        
        if (!produtividadeTemporal[periodo]) {
          produtividadeTemporal[periodo] = { periodo };
        }
        
        if (!produtividadeTemporal[periodo][mecanico]) {
          produtividadeTemporal[periodo][mecanico] = 0;
        }
        
        produtividadeTemporal[periodo][mecanico]++;
      }
    });

    const produtividadeTemporalArray = Object.values(produtividadeTemporal)
      .sort((a, b) => a.periodo.localeCompare(b.periodo));

    // Análise de Especialização por Defeito
    const especializacaoDefeitos = {};
    ordensData.forEach(ordem => {
      if (ordem.defeito_grupo && ordem.mecanico_responsavel) {
        const defeito = ordem.defeito_grupo;
        const mecanico = ordem.mecanico_responsavel;
        
        if (!especializacaoDefeitos[defeito]) {
          especializacaoDefeitos[defeito] = { defeito, mecanicos: {} };
        }
        
        if (!especializacaoDefeitos[defeito].mecanicos[mecanico]) {
          especializacaoDefeitos[defeito].mecanicos[mecanico] = 0;
        }
        
        especializacaoDefeitos[defeito].mecanicos[mecanico]++;
      }
    });

    // Converter especialização para formato mais útil
    const analiseEspecializacao = Object.values(especializacaoDefeitos).map(defeito => {
      const mecanicoEspecialista = Object.entries(defeito.mecanicos)
        .sort(([,a], [,b]) => b - a)[0];
      
      return {
        defeito: defeito.defeito,
        especialista: mecanicoEspecialista ? mecanicoEspecialista[0] : "N/A",
        ocorrenciasEspecialista: mecanicoEspecialista ? mecanicoEspecialista[1] : 0,
        totalOcorrencias: Object.values(defeito.mecanicos).reduce((sum, count) => sum + count, 0),
        percentualEspecializacao: mecanicoEspecialista 
          ? (mecanicoEspecialista[1] / Object.values(defeito.mecanicos).reduce((sum, count) => sum + count, 0)) * 100 
          : 0
      };
    }).sort((a, b) => b.totalOcorrencias - a.totalOcorrencias);

    // Análise de Custos por Mecânico
    const analiseCustos = performanceMecanicos.slice(0, 10).map(mecanico => ({
      mecanico: mecanico.nome,
      custoTotal: mecanico.custoTotal,
      custoMedio: mecanico.custoMedio,
      totalOrdens: mecanico.totalOrdens,
      eficienciaCusto: mecanico.custoMedio > 0 ? mecanico.totalOrdens / mecanico.custoMedio : 0
    })).sort((a, b) => b.custoTotal - a.custoTotal);

    // Calcular tendências (simulado com base nos dados históricos)
    const totalMecanicosTrend = Math.random() * 10 - 5; // -5% a +5%
    const produtividadeTrend = Math.random() * 20 - 10; // -10% a +10%
    const custoMedioTrend = Math.random() * 30 - 15; // -15% a +15%
    const tempoMedioTrend = Math.random() * 25 - 12.5; // -12.5% a +12.5%

    const responseData = {
      kpis: {
        totalMecanicos,
        totalMecanicosTrend,
        totalOrdens,
        produtividadeMedia: totalMecanicos > 0 ? totalOrdens / totalMecanicos : 0,
        produtividadeTrend,
        custoMedioEquipe,
        custoMedioTrend,
        tempoMedioEquipe,
        tempoMedioTrend
      },
      performanceMecanicos: performanceMecanicos.slice(0, 15),
      rankingPerformance,
      produtividadeTemporal: produtividadeTemporalArray,
      analiseEspecializacao,
      analiseCustos
    };

    res.json(responseData);

  } catch (error) {
    console.error("Erro no endpoint /mecanicos/data:", error);
    res.status(500).json({ error: error.message || "Erro interno do servidor ao processar dados de mecânicos." });
  }
});

// Endpoint para obter opções de filtros específicos para mecânicos
router.get("/filtros", async (req, res) => {
  try {
    // Buscar fabricantes únicos
    const { data: fabricantes, error: fabricantesError } = await supabase
      .from("ordens_servico")
      .select("fabricante_motor")
      .not("fabricante_motor", "is", null)
      .order("fabricante_motor");

    if (fabricantesError) throw fabricantesError;

    // Buscar modelos únicos
    const { data: modelos, error: modelosError } = await supabase
      .from("ordens_servico")
      .select("modelo_motor")
      .not("modelo_motor", "is", null)
      .order("modelo_motor");

    if (modelosError) throw modelosError;

    // Buscar modelos de veículo únicos
    const { data: modelosVeiculo, error: modelosVeiculoError } = await supabase
      .from("ordens_servico")
      .select("modelo_veiculo_motor")
      .not("modelo_veiculo_motor", "is", null)
      .order("modelo_veiculo_motor");

    if (modelosVeiculoError) throw modelosVeiculoError;

    // Buscar grupos de defeito únicos
    const { data: defeitos, error: defeitosError } = await supabase
      .from("ordens_servico")
      .select("defeito_grupo")
      .not("defeito_grupo", "is", null)
      .order("defeito_grupo");

    if (defeitosError) throw defeitosError;

    // Buscar mecânicos únicos
    const { data: mecanicos, error: mecanicosError } = await supabase
      .from("ordens_servico")
      .select("mecanico_responsavel")
      .not("mecanico_responsavel", "is", null)
      .order("mecanico_responsavel");

    if (mecanicosError) throw mecanicosError;

    // Buscar status únicos
    const { data: statusList, error: statusError } = await supabase
      .from("ordens_servico")
      .select("status")
      .not("status", "is", null)
      .order("status");

    if (statusError) throw statusError;

    const responseData = {
      fabricantes: [...new Set(fabricantes.map(f => f.fabricante_motor))],
      modelos: [...new Set(modelos.map(m => m.modelo_motor))],
      modelosVeiculo: [...new Set(modelosVeiculo.map(mv => mv.modelo_veiculo_motor))],
      defeitos: [...new Set(defeitos.map(d => d.defeito_grupo))],
      mecanicos: [...new Set(mecanicos.map(m => m.mecanico_responsavel))],
      status: [...new Set(statusList.map(s => s.status))]
    };

    res.json(responseData);

  } catch (error) {
    console.error("Erro no endpoint /mecanicos/filtros:", error);
    res.status(500).json({ error: error.message || "Erro interno do servidor ao buscar filtros de mecânicos." });
  }
});

// Endpoint para análise detalhada de um mecânico específico
router.get("/detalhes/:mecanico", async (req, res) => {
  try {
    const { mecanico } = req.params;
    const { startDate, endDate } = req.query;

    let query = supabase.from("ordens_servico").select("*");
    
    // Filtrar por mecânico específico
    query = query.eq("mecanico_responsavel", mecanico);
    
    // Aplicar filtros de status padrão
    query = query.in("status", ["Garantia", "Garantia de Oficina", "Garantia de Usinagem"]);

    if (startDate) {
      query = query.gte("data_ordem", startDate);
    }
    if (endDate) {
      query = query.lte("data_ordem", endDate);
    }

    const { data: ordensData, error: ordensError } = await query;

    if (ordensError) throw ordensError;

    // Análise detalhada do mecânico específico
    const totalOrdens = ordensData.length;
    const custoTotal = ordensData.reduce((sum, ordem) => sum + (parseFloat(ordem.total_geral) || 0), 0);
    const custoMedio = totalOrdens > 0 ? custoTotal / totalOrdens : 0;

    // Análise por fabricante
    const porFabricante = {};
    ordensData.forEach(ordem => {
      const fabricante = ordem.fabricante_motor || "Indefinido";
      if (!porFabricante[fabricante]) {
        porFabricante[fabricante] = { fabricante, ordens: 0, custo: 0 };
      }
      porFabricante[fabricante].ordens++;
      porFabricante[fabricante].custo += parseFloat(ordem.total_geral) || 0;
    });

    // Análise por tipo de defeito
    const porDefeito = {};
    ordensData.forEach(ordem => {
      const defeito = ordem.defeito_grupo || "Indefinido";
      if (!porDefeito[defeito]) {
        porDefeito[defeito] = { defeito, ordens: 0, custo: 0 };
      }
      porDefeito[defeito].ordens++;
      porDefeito[defeito].custo += parseFloat(ordem.total_geral) || 0;
    });

    // Evolução temporal
    const evolucaoTemporal = {};
    ordensData.forEach(ordem => {
      if (ordem.data_ordem) {
        const periodo = ordem.data_ordem.substring(0, 7); // YYYY-MM
        if (!evolucaoTemporal[periodo]) {
          evolucaoTemporal[periodo] = { periodo, ordens: 0, custo: 0 };
        }
        evolucaoTemporal[periodo].ordens++;
        evolucaoTemporal[periodo].custo += parseFloat(ordem.total_geral) || 0;
      }
    });

    // Calcular tempo médio de resolução
    const ordensComTempo = ordensData.filter(ordem => ordem.data_ordem && ordem.data_fechamento);
    const tempoMedioResolucao = ordensComTempo.length > 0 
      ? ordensComTempo.reduce((sum, ordem) => {
          const inicio = new Date(ordem.data_ordem);
          const fim = new Date(ordem.data_fechamento);
          const dias = (fim - inicio) / (1000 * 60 * 60 * 24);
          return sum + dias;
        }, 0) / ordensComTempo.length
      : 0;

    const responseData = {
      mecanico,
      resumo: {
        totalOrdens,
        custoTotal,
        custoMedio,
        tempoMedioResolucao,
        especialidades: Object.keys(porDefeito).length,
        fabricantesAtendidos: Object.keys(porFabricante).length
      },
      analisePorFabricante: Object.values(porFabricante).sort((a, b) => b.ordens - a.ordens),
      analisePorDefeito: Object.values(porDefeito).sort((a, b) => b.ordens - a.ordens),
      evolucaoTemporal: Object.values(evolucaoTemporal).sort((a, b) => a.periodo.localeCompare(b.periodo)),
      ordensRecentes: ordensData
        .sort((a, b) => new Date(b.data_ordem) - new Date(a.data_ordem))
        .slice(0, 10)
        .map(ordem => ({
          id: ordem.id,
          dataOrdem: ordem.data_ordem,
          fabricante: ordem.fabricante_motor,
          modelo: ordem.modelo_motor,
          defeito: ordem.defeito_grupo,
          custo: ordem.total_geral,
          status: ordem.status
        }))
    };

    res.json(responseData);

  } catch (error) {
    console.error("Erro no endpoint /mecanicos/detalhes:", error);
    res.status(500).json({ error: error.message || "Erro interno do servidor ao buscar detalhes do mecânico." });
  }
});

module.exports = router;


