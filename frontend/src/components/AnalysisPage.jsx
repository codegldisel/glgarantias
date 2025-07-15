import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Alert, AlertDescription } from '@/components/ui/alert.jsx';
import { DatePickerWithRange } from '@/components/ui/date-picker.jsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, BarChart3, AlertTriangle, RefreshCw, Filter, Download, Users, DollarSign } from 'lucide-react';

const AnalysisPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const [filters, setFilters] = useState({
    dateRange: { from: null, to: null },
    fabricante: 'all',
    mecanico: 'all',
    defeito_grupo: 'all',
  });

  const [filterOptions, setFilterOptions] = useState({
    mecanicos: [],
    fabricantes: [],
    defeito_grupos: [],
  });

  const fetchAnalysisData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.dateRange.from) params.append('startDate', filters.dateRange.from.toISOString().split('T')[0]);
      if (filters.dateRange.to) params.append('endDate', filters.dateRange.to.toISOString().split('T')[0]);
      if (filters.fabricante !== 'all') params.append('fabricante', filters.fabricante);
      if (filters.mecanico !== 'all') params.append('mecanico', filters.mecanico);
      if (filters.defeito_grupo !== 'all') params.append('defeito_grupo', filters.defeito_grupo);

      const res = await fetch(`/api/analises/dados?${params.toString()}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Falha ao carregar dados de análise.');
      }
      const jsonData = await res.json();
      setData(jsonData);
    } catch (error) {
      console.error('Erro ao carregar dados de análise:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAnalysisData();
  }, [fetchAnalysisData]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await fetch(`/api/ordens/filters/options`);
        const json = await res.json();
        setFilterOptions(json);
      } catch (e) {
        console.error("Falha ao buscar opções de filtro:", e);
      }
    };
    fetchOptions();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const StatCard = ({ title, value, icon, format = 'number' }) => {
    const formattedValue = () => {
      if (value === null || value === undefined) return '---';
      if (format === 'currency') return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      return value.toLocaleString('pt-BR');
    };
    return (
      <Card>
        <CardContent className="flex items-center p-6">
          {icon}
          <div className="ml-4">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{formattedValue()}</p>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Análises Avançadas</h2>
          <p className="text-sm text-muted-foreground">Insights detalhados sobre defeitos, tendências e performance</p>
        </div>
        <Button onClick={fetchAnalysisData} variant="outline" size="sm" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Filter className="h-5 w-5" />Filtros de Análise</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <DatePickerWithRange date={filters.dateRange} onDateChange={(range) => handleFilterChange('dateRange', range)} />
          <Select value={filters.fabricante} onValueChange={(v) => handleFilterChange('fabricante', v)}>
            <SelectTrigger><SelectValue placeholder="Fabricante" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Fabricantes</SelectItem>
              {filterOptions.fabricantes.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.mecanico} onValueChange={(v) => handleFilterChange('mecanico', v)}>
            <SelectTrigger><SelectValue placeholder="Mecânico" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Mecânicos</SelectItem>
              {filterOptions.mecanicos.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.defeito_grupo} onValueChange={(v) => handleFilterChange('defeito_grupo', v)}>
            <SelectTrigger><SelectValue placeholder="Grupo de Defeito" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Grupos</SelectItem>
              {filterOptions.defeito_grupos.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center p-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p>Carregando análises...</p>
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription><strong>Erro:</strong> {error}</AlertDescription>
        </Alert>
      ) : data ? (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <StatCard title="Total de Ordens" value={data.kpis.totalOrdens} icon={<BarChart3 className="h-8 w-8 text-blue-500" />} />
            <StatCard title="Valor Total" value={data.kpis.totalValor} format="currency" icon={<DollarSign className="h-8 w-8 text-green-500" />} />
            <StatCard title="Valor Médio por Ordem" value={data.kpis.mediaValorPorOrdem} format="currency" icon={<TrendingUp className="h-8 w-8 text-orange-500" />} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Defeitos Mais Comuns</CardTitle>
                <CardDescription>Contagem de defeitos para o período e filtros selecionados.</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.kpis.topDefeitos} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="nome" width={150} />
                    <Tooltip />
                    <Bar dataKey="quantidade" fill="#374151" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tendência Mensal de Ordens</CardTitle>
                <CardDescription>Volume de ordens de serviço ao longo do tempo.</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.tendencias}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="periodo" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="quantidade" stroke="#374151" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top 10 Mecânicos por Volume de OS</CardTitle>
              <CardDescription>Mecânicos com maior número de ordens no período.</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.performanceMecanicos}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nome" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [value, name === 'totalOrdens' ? 'Total de Ordens' : name]} />
                  <Bar dataKey="totalOrdens" fill="#374151" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
};

export default AnalysisPage;