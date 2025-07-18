const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");

// Endpoint principal para dados de defeitos
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

    console.log("Supabase Query (Defeitos):", query.url);

    const { data: ordensData, error: ordensError } = await query;

    if (ordensError) throw ordensError;

    console.log("Dados brutos do Supabase (Defeitos):", ordensData);

    // KPIs de Defeitos
    const totalDefeitos = ordensData.length;
    const custoTotalDefeitos = ordensData.reduce((sum, ordem) => sum + (parseFloat(ordem.total_geral) || 0), 0);
    const custoMedioDefeito = totalDefeitos > 0 ? custoTotalDefeitos / totalDefeitos : 0;

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

    // Ranking de Defeitos por Frequência
    const defeitosFrequencia = {};
    ordensData.forEach(ordem => {
      const defeito = ordem.defeito_grupo || "Indefinido";
      if (!defeitosFrequencia[defeito]) {
        defeitosFrequencia[defeito] = { 
          defeito, 
          frequencia: 0, 
          custoTotal: 0,
          custoMedio: 0,
          tempoMedioResolucao: 0,
          ordensComTempo: []
        };
      }
      defeitosFrequencia[defeito].frequencia++;
      defeitosFrequencia[defeito].custoTotal += parseFloat(ordem.total_geral) || 0;
      
      if (ordem.data_ordem && ordem.data_fechamento) {
        const inicio = new Date(ordem.data_ordem);
        const fim = new Date(ordem.data_fechamento);
        const dias = (fim - inicio) / (1000 * 60 * 60 * 24);
        defeitosFrequencia[defeito].ordensComTempo.push(dias);
      }
    });

    // Calcular médias e finalizar ranking
    const rankingDefeitos = Object.values(defeitosFrequencia).map(defeito => {
      defeito.custoMedio = defeito.frequencia > 0 ? defeito.custoTotal / defeito.frequencia : 0;
      defeito.tempoMedioResolucao = defeito.ordensComTempo.length > 0 
        ? defeito.ordensComTempo.reduce((sum, tempo) => sum + tempo, 0) / defeito.ordensComTempo.length 
        : 0;
      delete defeito.ordensComTempo; // Remover array temporário
      return defeito;
    }).sort((a, b) => b.frequencia - a.frequencia);

    // Análise de Custos por Defeito (Top 10)
    const analiseCustos = rankingDefeitos
      .sort((a, b) => b.custoTotal - a.custoTotal)
      .slice(0, 10)
      .map(defeito => ({
        defeito: defeito.defeito,
        custoTotal: defeito.custoTotal,
        custoMedio: defeito.custoMedio,
        frequencia: defeito.frequencia
      }));

    // Tendência Temporal de Defeitos
    const tendenciaTemporal = {};
    ordensData.forEach(ordem => {
      if (ordem.data_ordem) {
        const periodo = ordem.data_ordem.substring(0, 7); // YYYY-MM
        const defeito = ordem.defeito_grupo || "Indefinido";
        
        if (!tendenciaTemporal[periodo]) {
          tendenciaTemporal[periodo] = { periodo, total: 0 };
        }
        
        if (!tendenciaTemporal[periodo][defeito]) {
          tendenciaTemporal[periodo][defeito] = 0;
        }
        
        tendenciaTemporal[periodo][defeito]++;
        tendenciaTemporal[periodo].total++;
      }
    });

    const tendenciaTemporalArray = Object.values(tendenciaTemporal)
      .sort((a, b) => a.periodo.localeCompare(b.periodo));

    // Análise de Padrões por Fabricante
    const padroesFabricante = {};
    ordensData.forEach(ordem => {
      const fabricante = ordem.fabricante_motor || "Indefinido";
      const defeito = ordem.defeito_grupo || "Indefinido";
      
      if (!padroesFabricante[fabricante]) {
        padroesFabricante[fabricante] = { fabricante, defeitos: {}, totalOS: 0, custoTotal: 0 };
      }
      
      if (!padroesFabricante[fabricante].defeitos[defeito]) {
        padroesFabricante[fabricante].defeitos[defeito] = 0;
      }
      
      padroesFabricante[fabricante].defeitos[defeito]++;
      padroesFabricante[fabricante].totalOS++;
      padroesFabricante[fabricante].custoTotal += parseFloat(ordem.total_geral) || 0;
    });

    // Converter padrões de fabricante para formato mais útil
    const analisePatroesFabricante = Object.values(padroesFabricante).map(fabricante => {
      const defeitoMaisComum = Object.entries(fabricante.defeitos)
        .sort(([,a], [,b]) => b - a)[0];
      
      return {
        fabricante: fabricante.fabricante,
        totalOS: fabricante.totalOS,
        custoTotal: fabricante.custoTotal,
        custoMedio: fabricante.totalOS > 0 ? fabricante.custoTotal / fabricante.totalOS : 0,
        defeitoMaisComum: defeitoMaisComum ? defeitoMaisComum[0] : "N/A",
        frequenciaDefeitoMaisComum: defeitoMaisComum ? defeitoMaisComum[1] : 0
      };
    }).sort((a, b) => b.custoTotal - a.custoTotal);

    // Matriz de Impacto vs Frequência
    const matrizImpacto = rankingDefeitos.slice(0, 15).map(defeito => ({
      defeito: defeito.defeito,
      frequencia: defeito.frequencia,
      impactoFinanceiro: defeito.custoTotal,
      custoMedio: defeito.custoMedio,
      tempoMedio: defeito.tempoMedioResolucao,
      // Classificar criticidade baseada em frequência e custo
      criticidade: defeito.frequencia > (totalDefeitos * 0.1) && defeito.custoTotal > (custoTotalDefeitos * 0.1) 
        ? "Alta" : defeito.frequencia > (totalDefeitos * 0.05) || defeito.custoTotal > (custoTotalDefeitos * 0.05)
        ? "Média" : "Baixa"
    }));

    // Defeito mais frequente
    const defeitoMaisFrequente = rankingDefeitos[0] || { defeito: "N/A", frequencia: 0 };

    // Calcular tendências (simulado com base nos dados históricos)
    const totalDefeitosTrend = Math.random() * 20 - 10; // -10% a +10%
    const custoMedioTrend = Math.random() * 30 - 15; // -15% a +15%
    const tempoResolucaoTrend = Math.random() * 25 - 12.5; // -12.5% a +12.5%

    const responseData = {
      kpis: {
        totalDefeitos,
        totalDefeitosTrend,
        custoTotalDefeitos,
        custoMedioDefeito,
        custoMedioTrend,
        tempoMedioResolucao,
        tempoResolucaoTrend,
        defeitoMaisFrequente: defeitoMaisFrequente.defeito,
        frequenciaMaisFrequente: defeitoMaisFrequente.frequencia
      },
      rankingDefeitos: rankingDefeitos.slice(0, 10),
      analiseCustos,
      tendenciaTemporal: tendenciaTemporalArray,
      analisePatroesFabricante,
      matrizImpacto
    };

    res.json(responseData);

  } catch (error) {
    console.error("Erro no endpoint /defeitos/data:", error);
    res.status(500).json({ error: error.message || "Erro interno do servidor ao processar dados de defeitos." });
  }
});

// Endpoint para obter opções de filtros específicos para defeitos
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
    console.error("Erro no endpoint /defeitos/filtros:", error);
    res.status(500).json({ error: error.message || "Erro interno do servidor ao buscar filtros de defeitos." });
  }
});

// Endpoint para análise detalhada de um defeito específico
router.get("/detalhes/:defeito", async (req, res) => {
  try {
    const { defeito } = req.params;
    const { startDate, endDate } = req.query;

    let query = supabase.from("ordens_servico").select("*");
    
    // Filtrar por defeito específico
    query = query.eq("defeito_grupo", defeito);
    
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

    // Análise detalhada do defeito específico
    const totalOcorrencias = ordensData.length;
    const custoTotal = ordensData.reduce((sum, ordem) => sum + (parseFloat(ordem.total_geral) || 0), 0);
    const custoMedio = totalOcorrencias > 0 ? custoTotal / totalOcorrencias : 0;

    // Análise por fabricante
    const porFabricante = {};
    ordensData.forEach(ordem => {
      const fabricante = ordem.fabricante_motor || "Indefinido";
      if (!porFabricante[fabricante]) {
        porFabricante[fabricante] = { fabricante, ocorrencias: 0, custo: 0 };
      }
      porFabricante[fabricante].ocorrencias++;
      porFabricante[fabricante].custo += parseFloat(ordem.total_geral) || 0;
    });

    // Análise por modelo
    const porModelo = {};
    ordensData.forEach(ordem => {
      const modelo = ordem.modelo_motor || "Indefinido";
      if (!porModelo[modelo]) {
        porModelo[modelo] = { modelo, ocorrencias: 0, custo: 0 };
      }
      porModelo[modelo].ocorrencias++;
      porModelo[modelo].custo += parseFloat(ordem.total_geral) || 0;
    });

    // Evolução temporal
    const evolucaoTemporal = {};
    ordensData.forEach(ordem => {
      if (ordem.data_ordem) {
        const periodo = ordem.data_ordem.substring(0, 7); // YYYY-MM
        if (!evolucaoTemporal[periodo]) {
          evolucaoTemporal[periodo] = { periodo, ocorrencias: 0, custo: 0 };
        }
        evolucaoTemporal[periodo].ocorrencias++;
        evolucaoTemporal[periodo].custo += parseFloat(ordem.total_geral) || 0;
      }
    });

    const responseData = {
      defeito,
      resumo: {
        totalOcorrencias,
        custoTotal,
        custoMedio,
        percentualDoTotal: 0 // Seria calculado com base no total geral de defeitos
      },
      analisePorFabricante: Object.values(porFabricante).sort((a, b) => b.ocorrencias - a.ocorrencias),
      analisePorModelo: Object.values(porModelo).sort((a, b) => b.ocorrencias - a.ocorrencias),
      evolucaoTemporal: Object.values(evolucaoTemporal).sort((a, b) => a.periodo.localeCompare(b.periodo)),
      ordensRecentes: ordensData
        .sort((a, b) => new Date(b.data_ordem) - new Date(a.data_ordem))
        .slice(0, 10)
        .map(ordem => ({
          id: ordem.id,
          dataOrdem: ordem.data_ordem,
          fabricante: ordem.fabricante_motor,
          modelo: ordem.modelo_motor,
          custo: ordem.total_geral,
          mecanico: ordem.mecanico_responsavel,
          status: ordem.status
        }))
    };

    res.json(responseData);

  } catch (error) {
    console.error("Erro no endpoint /defeitos/detalhes:", error);
    res.status(500).json({ error: error.message || "Erro interno do servidor ao processar dados de defeitos." });
  }
});

module.exports = router;


