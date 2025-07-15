-- Drop a função se ela já existir, para garantir que estamos criando a versão mais recente.
DROP FUNCTION IF EXISTS get_analysis_data(p_start_date date, p_end_date date, p_fabricante text, p_mecanico text, p_defeito_grupo text);

CREATE OR REPLACE FUNCTION get_analysis_data(
  p_start_date date DEFAULT NULL,
  p_end_date date DEFAULT NULL,
  p_fabricante text DEFAULT NULL,
  p_mecanico text DEFAULT NULL,
  p_defeito_grupo text DEFAULT NULL
)
RETURNS TABLE(
  kpis json,
  tendencias json,
  performance_mecanicos json
) AS $$
DECLARE
  -- Variáveis para armazenar os resultados intermediários
  v_kpis json;
  v_tendencias json;
  v_performance_mecanicos json;
BEGIN
  -- 1. Construir a query base com filtros dinâmicos
  WITH filtered_orders AS (
    SELECT *
    FROM ordens_servico
    WHERE
      (p_start_date IS NULL OR data_ordem >= p_start_date) AND
      (p_end_date IS NULL OR data_ordem <= p_end_date) AND
      (p_fabricante IS NULL OR fabricante_motor = p_fabricante) AND
      (p_mecanico IS NULL OR mecanico_responsavel = p_mecanico) AND
      (p_defeito_grupo IS NULL OR defeito_grupo = p_defeito_grupo)
  )
  -- 2. Calcular KPIs
  SELECT
    json_build_object(
      'totalOrdens', COUNT(*),
      'totalValor', COALESCE(SUM(total_geral), 0),
      'mediaValorPorOrdem', COALESCE(AVG(total_geral), 0),
      'topDefeitos', (
        SELECT json_agg(top_def)
        FROM (
          SELECT
            defeito_grupo as nome,
            COUNT(*) as quantidade
          FROM filtered_orders
          WHERE defeito_grupo IS NOT NULL
          GROUP BY defeito_grupo
          ORDER BY quantidade DESC
          LIMIT 5
        ) top_def
      )
    )
  INTO v_kpis
  FROM filtered_orders;

  -- 3. Calcular Tendências Mensais
  SELECT
    json_agg(tend)
  INTO v_tendencias
  FROM (
    SELECT
      to_char(data_ordem, 'YYYY-MM') as periodo,
      COUNT(*) as quantidade,
      SUM(total_geral) as valor
    FROM filtered_orders
    GROUP BY periodo
    ORDER BY periodo
  ) tend;

  -- 4. Calcular Performance dos Mecânicos
  SELECT
    json_agg(perf)
  INTO v_performance_mecanicos
  FROM (
    SELECT
      mecanico_responsavel as nome,
      COUNT(*) as totalOrdens,
      SUM(total_geral) as valorTotal,
      AVG(total_geral) as mediaPorOrdem
    FROM filtered_orders
    WHERE mecanico_responsavel IS NOT NULL
    GROUP BY mecanico_responsavel
    ORDER BY totalOrdens DESC
    LIMIT 10
  ) perf;

  -- 5. Retornar todos os resultados
  RETURN QUERY SELECT v_kpis, v_tendencias, v_performance_mecanicos;

END;
$$ LANGUAGE plpgsql;
