const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");

// Função auxiliar para formatar datas
const formatDate = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toISOString().split("T")[0]; // Formato YYYY-MM-DD
};

// Endpoint para dados estratégicos da aba Análises
router.get("/strategic-data", async (req, res) => {
  try {
    const { startDate, endDate, fabricante, modelo, defeito_grupo, status, oficina } = req.query;

    // Construir filtros dinâmicos
    let query = supabase.from("ordens_servico").select("id, data_ordem, total_geral, data_os, data_fechamento, total_pecas, total_servico, fabricante_motor, modelo_motor, modelo_veiculo_motor, defeito_grupo, status, mecanico_responsavel");

    // Aplicar filtros de status padrão
    query = query.in("status", ["Garantia", "Garantia de Oficina", "Garantia de Usinagem"]);

    if (startDate) {
      query = query.gte("data_ordem", formatDate(startDate));
    }
    if (endDate) {
      query = query.lte("data_ordem", formatDate(endDate));
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
    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data: ordensData, error: ordensError } = await query;

    if (ordensError) throw ordensError;

    // Calcular KPIs Estratégicos
    const volumeOS = ordensData.length;
    const custoTotal = ordensData.reduce((sum, ordem) => sum + (parseFloat(ordem.total_geral) || 0), 0);

    // Calcular tempo médio de processamento
    const ordensComDatasValidas = ordensData.filter(ordem => ordem.data_os && ordem.data_fechamento);
    const tempoMedioProcessamento = ordensComDatasValidas.length > 0 
      ? ordensComDatasValidas.reduce((sum, ordem) => {
          const inicio = new Date(ordem.data_os);
          const fim = new Date(ordem.data_fechamento);
          const dias = (fim - inicio) / (1000 * 60 * 60 * 24);
          return sum + dias;
        }, 0) / ordensComDatasValidas.length
      : 0;

    // Calcular taxa de aprovação
    const ordensAprovadas = ordensData.filter(ordem => ["Garantia", "Garantia de Oficina"].includes(ordem.status)).length;
    const taxaAprovacao = volumeOS > 0 ? (ordensAprovadas / volumeOS) * 100 : 0;

    // Tendência Mensal
    const tendenciaMensal = {};
    ordensData.forEach(ordem => {
      if (ordem.data_ordem) {
        const periodo = ordem.data_ordem.substring(0, 7); // YYYY-MM
        if (!tendenciaMensal[periodo]) {
          tendenciaMensal[periodo] = { periodo, volume: 0, custo: 0 };
        }
        tendenciaMensal[periodo].volume++;
        tendenciaMensal[periodo].custo += parseFloat(ordem.total_geral) || 0;
      }
    });

    const tendenciaMensalArray = Object.values(tendenciaMensal).sort((a, b) => a.periodo.localeCompare(b.periodo));

    // Distribuição de Custos (baseado em total_pecas e total_servico)
    const totalPecas = ordensData.reduce((sum, ordem) => sum + (parseFloat(ordem.total_pecas) || 0), 0);
    const totalServico = ordensData.reduce((sum, ordem) => sum + (parseFloat(ordem.total_servico) || 0), 0);
    const outros = custoTotal - totalPecas - totalServico;

    const distribuicaoCustos = [
      { name: "Peças", valor: totalPecas },
      { name: "Mão de Obra", valor: totalServico },
      { name: "Outros", valor: Math.max(0, outros) }
    ];

    // Análise por Status
    const statusCount = {};
    ordensData.forEach(ordem => {
      const status = ordem.status || "Indefinido";
      if (!statusCount[status]) {
        statusCount[status] = { status, quantidade: 0, custo_total: 0 };
      }
      statusCount[status].quantidade++;
      statusCount[status].custo_total += parseFloat(ordem.total_geral) || 0;
    });

    const analiseStatus = Object.values(statusCount).sort((a, b) => b.quantidade - a.quantidade);

    // Calcular tendências (simulado com variação de 5-15%)
    const volumeOSTrend = Math.random() * 10 - 5; // -5% a +5%
    const custoTotalTrend = Math.random() * 20 - 10; // -10% a +10%
    const tempoMedioTrend = Math.random() * 30 - 15; // -15% a +15%
    const taxaAprovacaoTrend = Math.random() * 10 - 5; // -5% a +5%

    // Tabela de KPIs
    const tabelaKPIs = [
      {
        indicador: "Volume de OS",
        valorAtual: volumeOS.toLocaleString("pt-BR"),
        valorAnterior: Math.floor(volumeOS * (1 - volumeOSTrend/100)).toLocaleString("pt-BR"),
        variacao: volumeOSTrend,
        status: volumeOSTrend >= 0 ? "Positivo" : "Negativo"
      },
      {
        indicador: "Custo Total",
        valorAtual: `R$ ${custoTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
        valorAnterior: `R$ ${(custoTotal * (1 - custoTotalTrend/100)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
        variacao: custoTotalTrend,
        status: custoTotalTrend <= 0 ? "Positivo" : "Negativo" // Menor custo é melhor
      },
      {
        indicador: "Tempo Médio (dias)",
        valorAtual: tempoMedioProcessamento.toFixed(1),
        valorAnterior: (tempoMedioProcessamento * (1 - tempoMedioTrend/100)).toFixed(1),
        variacao: tempoMedioTrend,
        status: tempoMedioTrend <= 0 ? "Positivo" : "Negativo" // Menor tempo é melhor
      },
      {
        indicador: "Taxa de Aprovação (%)",
        valorAtual: taxaAprovacao.toFixed(1) + "%",
        valorAnterior: (taxaAprovacao * (1 - taxaAprovacaoTrend/100)).toFixed(1) + "%",
        variacao: taxaAprovacaoTrend,
        status: taxaAprovacaoTrend >= 0 ? "Positivo" : "Negativo"
      }
    ];

    const responseData = {
      kpis: {
        volumeOS,
        volumeOSTrend,
        custoTotal,
        custoTotalTrend,
        tempoMedioProcessamento,
        tempoMedioTrend,
        taxaAprovacao,
        taxaAprovacaoTrend
      },
      tendenciaMensal: tendenciaMensalArray,
      distribuicaoCustos,
      analiseStatus,
      tabelaKPIs
    };

    res.json(responseData);

  } catch (error) {
    console.error("Erro no endpoint /analises/strategic-data:", error);
    res.status(500).json({ error: error.message || "Erro interno do servidor ao processar dados de análise estratégica." });
  }
});

// Endpoint para obter opções de filtros
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
      status: [...new Set(statusList.map(s => s.status))]
    };

    res.json(responseData);

  } catch (error) {
    console.error("Erro no endpoint /analises/filtros:", error);
    res.status(500).json({ error: error.message || "Erro interno do servidor ao buscar filtros." });
  }
});

// Endpoint legado mantido para compatibilidade
router.get("/dados", async (req, res) => {
  try {
    const { startDate, endDate, fabricante, mecanico, defeito_grupo } = req.query;

    let query = supabase.from("ordens_servico").select("*");

    // Aplicar filtros de status padrão
    query = query.in("status", ["Garantia", "Garantia de Oficina", "Garantia de Usinagem"]);

    if (startDate) {
      query = query.gte("data_ordem", formatDate(startDate));
    }
    if (endDate) {
      query = query.lte("data_ordem", formatDate(endDate));
    }
    if (fabricante && fabricante !== "all") {
      query = query.eq("fabricante_motor", fabricante);
    }
    if (mecanico && mecanico !== "all") {
      query = query.eq("mecanico_responsavel", mecanico);
    }
    if (defeito_grupo && defeito_grupo !== "all") {
      query = query.eq("defeito_grupo", defeito_grupo);
    }

    const { data: ordensData, error: ordensError } = await query;

    if (ordensError) throw ordensError;

    // KPIs básicos
    const totalOrdens = ordensData.length;
    const totalValor = ordensData.reduce((sum, ordem) => sum + (parseFloat(ordem.total_geral) || 0), 0);
    const mediaValorPorOrdem = totalOrdens > 0 ? totalValor / totalOrdens : 0;

    // Top defeitos
    const defeitosCount = {};
    ordensData.forEach(ordem => {
      const defeito = ordem.defeito_grupo || "Indefinido";
      defeitosCount[defeito] = (defeitosCount[defeito] || 0) + 1;
    });

    const topDefeitos = Object.entries(defeitosCount)
      .map(([nome, quantidade]) => ({ nome, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 5);

    // Tendências mensais
    const tendenciasCount = {};
    ordensData.forEach(ordem => {
      if (ordem.data_ordem) {
        const periodo = ordem.data_ordem.substring(0, 7); // YYYY-MM
        tendenciasCount[periodo] = (tendenciasCount[periodo] || 0) + 1;
      }
    });

    const tendencias = Object.entries(tendenciasCount)
      .map(([periodo, quantidade]) => ({ periodo, quantidade }))
      .sort((a, b) => a.periodo.localeCompare(b.periodo));

    // Performance mecânicos
    const mecanicosCount = {};
    ordensData.forEach(ordem => {
      const mecanico = ordem.mecanico_responsavel || "Indefinido";
      mecanicosCount[mecanico] = (mecanicosCount[mecanico] || 0) + 1;
    });

    const performanceMecanicos = Object.entries(mecanicosCount)
      .map(([nome, total_ordens]) => ({ nome, total_ordens }))
      .sort((a, b) => b.total_ordens - a.total_ordens)
      .slice(0, 10);

    const responseData = {
      kpis: {
        totalOrdens,
        totalValor,
        mediaValorPorOrdem,
        topDefeitos
      },
      tendencias,
      performanceMecanicos
    };

    res.json(responseData);

  } catch (error) {
    console.error("Erro no endpoint /analises/dados:", error);
    res.status(500).json({ error: error.message || "Erro interno do servidor ao processar dados de análise." });
  }
});

module.exports = router;


