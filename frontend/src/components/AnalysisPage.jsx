import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import {
  DollarSign, Clock, TrendingUp, TrendingDown, RefreshCw, Filter, Calendar, 
  Users, AlertTriangle, CheckCircle, BarChart3, PieChart as PieChartIcon,
  Activity, Target, Zap, ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react';
import { DatePickerWithRange } from '@/components/ui/date-picker.jsx';

const AnalysisPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [filtros, setFiltros] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    fabricante: 'all',
    modelo: 'all',
    defeito_grupo: 'all',
    status: 'all',
    oficina: 'all'
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // Carregar opções de filtros
  useEffect(() => {
    const loadFiltros = async () => {
      try {
        const response = await fetch(`${API_URL}/api/analises/filtros`);
        if (response.ok) {
          const filtrosData = await response.json();
          setFiltros(filtrosData);
        }
      } catch (error) {
        console.error('Erro ao carregar filtros:', error);
      }
    };

    loadFiltros();
  }, []);

  // Carregar dados da análise
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value && value !== 'all') {
            queryParams.append(key, value);
          }
        });

        const response = await fetch(`${API_URL}/api/analises/strategic-data?${queryParams}`);
        
        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleDateRangeChange = (range) => {
    setFilters(prev => ({
      ...prev,
      startDate: range?.from ? range.from.toISOString().split('T')[0] : '',
      endDate: range?.to ? range.to.toISOString().split('T')[0] : ''
    }));
  };

  const KPICard = ({ title, value, icon, format = 'number', trend = null, description, color = 'blue' }) => {
    const formattedValue = () => {
      if (value === null || value === undefined) return '---';
      if (format === 'currency') return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      if (format === 'percentage') return `${value.toFixed(1)}%`;
      if (format === 'time') return `${value.toFixed(1)} dias`;
      return value.toLocaleString('pt-BR');
    };

    const getTrendIcon = () => {
      if (trend === null || trend === undefined) return <Minus className="h-4 w-4 text-gray-400" />;
      if (trend > 0) return <ArrowUpRight className="h-4 w-4 text-green-500" />;
      if (trend < 0) return <ArrowDownRight className="h-4 w-4 text-red-500" />;
      return <Minus className="h-4 w-4 text-gray-400" />;
    };

    const getTrendColor = () => {
      if (trend === null || trend === undefined) return 'text-gray-400';
      if (trend > 0) return 'text-green-600';
      if (trend < 0) return 'text-red-600';
      return 'text-gray-400';
    };

    const trendValue = trend !== null && trend !== undefined ? `${Math.abs(trend).toFixed(1)}%` : '';

    const colorClasses = {
      blue: 'text-blue-600 bg-blue-50',
      green: 'text-green-600 bg-green-50',
      orange: 'text-orange-600 bg-orange-50',
      purple: 'text-purple-600 bg-purple-50',
      red: 'text-red-600 bg-red-50'
    };

    return (
      <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${colorClasses[color] || colorClasses.blue}`}>
                {icon}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                <p className="text-3xl font-bold text-gray-900">{formattedValue()}</p>
                {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
              </div>
            </div>
            {trend !== null && trend !== undefined && (
              <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
                {getTrendIcon()}
                <span className="text-sm font-semibold">{trendValue}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="space-y-8 p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Análise Estratégica</h1>
            <p className="text-lg text-gray-600">Visão executiva da eficiência operacional e impacto econômico das garantias</p>
          </div>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            size="lg"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-5 w-5" />
            Atualizar Dados
          </Button>
        </div>

        {/* Filtros Avançados */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="flex items-center gap-3 text-xl">
              <Filter className="h-6 w-6 text-blue-600" />
              Filtros de Análise Estratégica
            </CardTitle>
            <CardDescription className="text-base">
              Configure os parâmetros para análise personalizada dos dados de garantia
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <div className="xl:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
                <DatePickerWithRange 
                  date={{ 
                    from: filters.startDate ? new Date(filters.startDate) : null,
                    to: filters.endDate ? new Date(filters.endDate) : null
                  }} 
                  onDateChange={handleDateRangeChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fabricante</label>
                <Select value={filters.fabricante} onValueChange={(v) => handleFilterChange('fabricante', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Fabricantes</SelectItem>
                    {filtros?.fabricantes?.map(fabricante => (
                      <SelectItem key={fabricante} value={fabricante}>{fabricante}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Modelo</label>
                <Select value={filters.modelo} onValueChange={(v) => handleFilterChange('modelo', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Modelos</SelectItem>
                    {filtros?.modelos?.map(modelo => (
                      <SelectItem key={modelo} value={modelo}>{modelo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Grupo de Defeito</label>
                <Select value={filters.defeito_grupo} onValueChange={(v) => handleFilterChange('defeito_grupo', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Defeitos</SelectItem>
                    {filtros?.defeitos?.map(defeito => (
                      <SelectItem key={defeito} value={defeito}>{defeito}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <Select value={filters.status} onValueChange={(v) => handleFilterChange('status', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    {filtros?.status?.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg text-gray-600">Processando análise estratégica...</p>
            </div>
          </div>
        ) : error ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">Erro ao Carregar Dados</h3>
              <p className="text-red-600">{error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline" 
                className="mt-4"
              >
                Tentar Novamente
              </Button>
            </CardContent>
          </Card>
        ) : data ? (
          <>
            {/* KPIs Estratégicos */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <KPICard 
                title="Volume de OS" 
                value={data.kpis?.volumeOS} 
                icon={<Activity className="h-6 w-6" />}
                trend={data.kpis?.volumeOSTrend}
                description="Total de ordens no período"
                color="blue"
              />
              <KPICard 
                title="Custo Total" 
                value={data.kpis?.custoTotal} 
                format="currency" 
                icon={<DollarSign className="h-6 w-6" />}
                trend={data.kpis?.custoTotalTrend}
                description="Investimento total em garantias"
                color="green"
              />
              <KPICard 
                title="Tempo Médio" 
                value={data.kpis?.tempoMedioProcessamento} 
                format="time" 
                icon={<Clock className="h-6 w-6" />}
                trend={data.kpis?.tempoMedioTrend}
                description="Processamento de OS"
                color="orange"
              />
              <KPICard 
                title="Taxa de Aprovação" 
                value={data.kpis?.taxaAprovacao} 
                format="percentage" 
                icon={<Target className="h-6 w-6" />}
                trend={data.kpis?.taxaAprovacaoTrend}
                description="Aprovação de garantias"
                color="purple"
              />
            </div>

            {/* Gráficos Principais */}
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Tendência Mensal */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                    Tendência Mensal: Volume × Custo
                  </CardTitle>
                  <CardDescription>
                    Evolução temporal do volume de OS e custos associados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={data.tendenciaMensal}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="periodo" 
                        tick={{ fontSize: 12 }}
                        stroke="#666"
                      />
                      <YAxis 
                        yAxisId="left" 
                        orientation="left" 
                        stroke="#3B82F6"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        yAxisId="right" 
                        orientation="right" 
                        stroke="#10B981"
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        formatter={(value, name) => [
                          name === 'volume' ? value.toLocaleString('pt-BR') : 
                          `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                          name === 'volume' ? 'Volume de OS' : 'Custo Total'
                        ]}
                      />
                      <Line 
                        yAxisId="left" 
                        type="monotone" 
                        dataKey="volume" 
                        stroke="#3B82F6" 
                        strokeWidth={3}
                        dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                        name="volume"
                      />
                      <Line 
                        yAxisId="right" 
                        type="monotone" 
                        dataKey="custo" 
                        stroke="#10B981" 
                        strokeWidth={3}
                        dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                        name="custo"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Distribuição de Custos */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <PieChartIcon className="h-6 w-6 text-green-600" />
                    Distribuição de Custos
                  </CardTitle>
                  <CardDescription>
                    Composição dos custos: Peças vs Mão de Obra vs Outros
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={data.distribuicaoCustos}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent, valor }) => 
                          `${name}: ${(percent * 100).toFixed(1)}%`
                        }
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="valor"
                      >
                        {data.distribuicaoCustos?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [
                          `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 
                          'Valor'
                        ]}
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Análise por Status */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <BarChart3 className="h-6 w-6 text-orange-600" />
                  Análise por Status de OS
                </CardTitle>
                <CardDescription>
                  Distribuição de ordens de serviço por status e impacto financeiro
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={data.analiseStatus}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="status" 
                      tick={{ fontSize: 12 }}
                      stroke="#666"
                    />
                    <YAxis 
                      yAxisId="left"
                      tick={{ fontSize: 12 }}
                      stroke="#666"
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right"
                      tick={{ fontSize: 12 }}
                      stroke="#666"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value, name) => [
                        name === 'quantidade' ? value.toLocaleString('pt-BR') : 
                        `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                        name === 'quantidade' ? 'Quantidade' : 'Custo Total'
                      ]}
                    />
                    <Bar 
                      yAxisId="left"
                      dataKey="quantidade" 
                      fill="#3B82F6" 
                      name="quantidade"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      yAxisId="right"
                      dataKey="custo_total" 
                      fill="#10B981" 
                      name="custo_total"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Tabela de KPIs Operacionais */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Zap className="h-6 w-6 text-purple-600" />
                  KPIs Operacionais Comparativos
                </CardTitle>
                <CardDescription>
                  Comparação de indicadores-chave com período anterior
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Indicador</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Valor Atual</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Período Anterior</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Variação</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.tabelaKPIs?.map((kpi, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4 font-medium text-gray-900">{kpi.indicador}</td>
                          <td className="py-4 px-4 text-right font-semibold text-gray-900">{kpi.valorAtual}</td>
                          <td className="py-4 px-4 text-right text-gray-600">{kpi.valorAnterior}</td>
                          <td className={`py-4 px-4 text-right font-semibold ${
                            kpi.variacao > 0 ? 'text-green-600' : 
                            kpi.variacao < 0 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {kpi.variacao > 0 ? '+' : ''}{kpi.variacao.toFixed(1)}%
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              kpi.status === 'Positivo' ? 'bg-green-100 text-green-800' : 
                              kpi.status === 'Negativo' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {kpi.status === 'Positivo' ? '✓' : kpi.status === 'Negativo' ? '✗' : '−'} {kpi.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default AnalysisPage;

