import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, ScatterChart, Scatter
} from 'recharts';
import {
  Search, Filter, AlertTriangle, TrendingUp, Eye, Download, RefreshCw,
  ArrowUp, ArrowDown, Minus, DollarSign, Clock, Users, Target, Zap,
  BarChart3, PieChart as PieChartIcon, Activity, AlertCircle
} from 'lucide-react';
import { DatePickerWithRange } from '@/components/ui/date-picker.jsx';

const DefectsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [filtros, setFiltros] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    fabricante: 'all',
    modelo: 'all',
    modeloVeiculo: 'all',
    defeito_grupo: 'all',
    mecanico: 'all',
    status: 'all'
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // Carregar opções de filtros
  useEffect(() => {
    const loadFiltros = async () => {
      try {
        const response = await fetch(`${API_URL}/api/defeitos/filtros`);
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

  // Carregar dados de defeitos
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

        const response = await fetch(`${API_URL}/api/defeitos/data?${queryParams}`);
        
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
      if (format === 'text') return value;
      return value.toLocaleString('pt-BR');
    };

    const getTrendIcon = () => {
      if (trend === null || trend === undefined) return <Minus className="h-4 w-4 text-gray-400" />;
      if (trend > 0) return <ArrowUp className="h-4 w-4 text-red-500" />; // Para defeitos, aumento é ruim
      if (trend < 0) return <ArrowDown className="h-4 w-4 text-green-500" />; // Para defeitos, diminuição é boa
      return <Minus className="h-4 w-4 text-gray-400" />;
    };

    const getTrendColor = () => {
      if (trend === null || trend === undefined) return 'text-gray-400';
      if (trend > 0) return 'text-red-600'; // Para defeitos, aumento é ruim
      if (trend < 0) return 'text-green-600'; // Para defeitos, diminuição é boa
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
      <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-red-500">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${colorClasses[color] || colorClasses.red}`}>
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

  const getCriticidadeColor = (criticidade) => {
    switch (criticidade) {
      case 'Alta': return 'bg-red-100 text-red-800 border-red-200';
      case 'Média': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Baixa': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const COLORS = ['#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9'];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="space-y-8 p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Análise de Garantias</h1>
            <p className="text-lg text-gray-600">Classificação detalhada, padrões e análise de custos por defeito</p>
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
          <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
            <CardTitle className="flex items-center gap-3 text-xl">
              <Filter className="h-6 w-6 text-red-600" />
              Filtros de Análise de Defeitos
            </CardTitle>
            <CardDescription className="text-base">
              Configure os parâmetros para análise detalhada dos padrões de defeitos
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Modelo Veículo</label>
                <Select value={filters.modeloVeiculo} onValueChange={(v) => handleFilterChange('modeloVeiculo', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Modelos de Veículo</SelectItem>
                    {filtros?.modelosVeiculo?.map(modeloVeiculo => (
                      <SelectItem key={modeloVeiculo} value={modeloVeiculo}>{modeloVeiculo}</SelectItem>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Mecânico</label>
                <Select value={filters.mecanico} onValueChange={(v) => handleFilterChange('mecanico', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Mecânicos</SelectItem>
                    {filtros?.mecanicos?.map(mecanico => (
                      <SelectItem key={mecanico} value={mecanico}>{mecanico}</SelectItem>
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-lg text-gray-600">Processando análise de defeitos...</p>
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
            {/* KPIs de Defeitos */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <KPICard 
                title="Total de Defeitos" 
                value={data.kpis?.totalDefeitos} 
                icon={<AlertTriangle className="h-6 w-6" />}
                trend={data.kpis?.totalDefeitosTrend}
                description="Ocorrências no período"
                color="red"
              />
              <KPICard 
                title="Defeito Mais Frequente" 
                value={data.kpis?.defeitoMaisFrequente} 
                format="text"
                icon={<Target className="h-6 w-6" />}
                description={`${data.kpis?.frequenciaMaisFrequente || 0} ocorrências`}
                color="orange"
              />
              <KPICard 
                title="Custo Médio por Defeito" 
                value={data.kpis?.custoMedioDefeito} 
                format="currency" 
                icon={<DollarSign className="h-6 w-6" />}
                trend={data.kpis?.custoMedioTrend}
                description="Custo médio de reparo"
                color="green"
              />
              <KPICard 
                title="Tempo Médio de Resolução" 
                value={data.kpis?.tempoMedioResolucao} 
                format="time" 
                icon={<Clock className="h-6 w-6" />}
                trend={data.kpis?.tempoResolucaoTrend}
                description="Tempo para resolver defeito"
                color="blue"
              />
            </div>

            {/* Gráficos Principais */}
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Ranking de Defeitos por Frequência */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <BarChart3 className="h-6 w-6 text-red-600" />
                    Ranking de Defeitos por Frequência
                  </CardTitle>
                  <CardDescription>
                    Top 10 defeitos mais recorrentes no período
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={data.rankingDefeitos?.slice(0, 10)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        type="number" 
                        tick={{ fontSize: 12 }}
                        stroke="#666"
                      />
                      <YAxis 
                        type="category" 
                        dataKey="defeito" 
                        width={120}
                        tick={{ fontSize: 11 }}
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
                          value.toLocaleString('pt-BR'),
                          'Frequência'
                        ]}
                      />
                      <Bar 
                        dataKey="frequencia" 
                        fill="#EF4444" 
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Análise de Custos por Defeito */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <DollarSign className="h-6 w-6 text-green-600" />
                    Análise de Custos por Defeito
                  </CardTitle>
                  <CardDescription>
                    Top 10 defeitos com maior impacto financeiro
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={data.analiseCustos}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="defeito" 
                        tick={{ fontSize: 10, angle: -45 }}
                        height={80}
                        stroke="#666"
                      />
                      <YAxis 
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
                          name === 'custoTotal' ? 
                            `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` :
                            `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                          name === 'custoTotal' ? 'Custo Total' : 'Custo Médio'
                        ]}
                      />
                      <Bar 
                        dataKey="custoTotal" 
                        fill="#10B981" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Tendência Temporal de Defeitos */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Activity className="h-6 w-6 text-blue-600" />
                  Tendência Temporal de Defeitos
                </CardTitle>
                <CardDescription>
                  Evolução dos defeitos mais comuns ao longo do tempo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={data.tendenciaTemporal}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="periodo" 
                      tick={{ fontSize: 12 }}
                      stroke="#666"
                    />
                    <YAxis 
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
                    />
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                      name="Total de Defeitos"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Análise de Padrões por Fabricante */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Zap className="h-6 w-6 text-purple-600" />
                  Padrões de Defeitos por Fabricante
                </CardTitle>
                <CardDescription>
                  Análise comparativa de defeitos entre fabricantes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Fabricante</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Total OS</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Custo Total</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Custo Médio</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Defeito Mais Comum</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Frequência</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.analisePatroesFabricante?.map((fabricante, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4 font-medium text-gray-900">{fabricante.fabricante}</td>
                          <td className="py-4 px-4 text-right text-gray-900">{fabricante.totalOS.toLocaleString('pt-BR')}</td>
                          <td className="py-4 px-4 text-right font-semibold text-gray-900">
                            R$ {fabricante.custoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-4 px-4 text-right text-gray-600">
                            R$ {fabricante.custoMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-4 px-4 text-gray-900">{fabricante.defeitoMaisComum}</td>
                          <td className="py-4 px-4 text-right text-gray-600">{fabricante.frequenciaDefeitoMaisComum}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Matriz de Impacto vs Frequência */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Target className="h-6 w-6 text-orange-600" />
                  Matriz de Impacto vs Frequência
                </CardTitle>
                <CardDescription>
                  Classificação de defeitos por criticidade (frequência × impacto financeiro)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {/* Gráfico de Dispersão */}
                  <ResponsiveContainer width="100%" height={400}>
                    <ScatterChart data={data.matrizImpacto}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        type="number" 
                        dataKey="frequencia" 
                        name="Frequência"
                        tick={{ fontSize: 12 }}
                        stroke="#666"
                      />
                      <YAxis 
                        type="number" 
                        dataKey="impactoFinanceiro" 
                        name="Impacto Financeiro"
                        tick={{ fontSize: 12 }}
                        stroke="#666"
                      />
                      <Tooltip 
                        cursor={{ strokeDasharray: '3 3' }}
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        formatter={(value, name) => [
                          name === 'frequencia' ? value.toLocaleString('pt-BR') :
                          `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                          name === 'frequencia' ? 'Frequência' : 'Impacto Financeiro'
                        ]}
                        labelFormatter={(label, payload) => payload?.[0]?.payload?.defeito || ''}
                      />
                      <Scatter 
                        dataKey="impactoFinanceiro" 
                        fill="#F59E0B"
                      />
                    </ScatterChart>
                  </ResponsiveContainer>

                  {/* Tabela de Criticidade */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Defeito</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-700">Frequência</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-700">Impacto Financeiro</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-700">Custo Médio</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-700">Tempo Médio</th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-700">Criticidade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.matrizImpacto?.map((item, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-4 px-4 font-medium text-gray-900">{item.defeito}</td>
                            <td className="py-4 px-4 text-right text-gray-900">{item.frequencia.toLocaleString('pt-BR')}</td>
                            <td className="py-4 px-4 text-right font-semibold text-gray-900">
                              R$ {item.impactoFinanceiro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-4 px-4 text-right text-gray-600">
                              R$ {item.custoMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-4 px-4 text-right text-gray-600">
                              {item.tempoMedio.toFixed(1)} dias
                            </td>
                            <td className="py-4 px-4 text-center">
                              <Badge className={`text-xs ${getCriticidadeColor(item.criticidade)}`}>
                                {item.criticidade}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default DefectsPage;

