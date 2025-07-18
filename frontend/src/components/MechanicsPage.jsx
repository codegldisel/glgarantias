import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Avatar, AvatarFallback } from '@/components/ui/avatar.jsx';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, ScatterChart, Scatter
} from 'recharts';
import {
  Search, Users, Award, Clock, TrendingUp, Star, Settings, Download,
  RefreshCw, Target, Zap, Activity, DollarSign, ArrowUp, ArrowDown,
  Minus, BarChart3, User, Trophy, Wrench
} from 'lucide-react';
import { DatePickerWithRange } from '@/components/ui/date-picker.jsx';

const MechanicsPage = () => {
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
        const response = await fetch(`${API_URL}/api/mecanicos/filtros`);
        if (response.ok) {
          const filtrosData = await response.json();
          setFiltros(filtrosData);
          console.log("Filtros carregados:", filtrosData);
        }
      } catch (error) {
        console.error('Erro ao carregar filtros:', error);
      }
    };

    loadFiltros();
  }, []);

  // Carregar dados de mecânicos
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

        const response = await fetch(`${API_URL}/api/mecanicos/data?${queryParams}`);
        
        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log("Dados brutos da API:", result);
        setData(result);
        console.log("Estado 'data' após setData:", result);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setError(error.message);
      } finally {
        setLoading(false);
        console.log("Estado 'loading' após loadData:", false);
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
      if (format === 'decimal') return value.toFixed(1);
      return value.toLocaleString('pt-BR');
    };

    const getTrendIcon = () => {
      if (trend === null || trend === undefined) return <Minus className="h-4 w-4 text-gray-400" />;
      if (trend > 0) return <ArrowUp className="h-4 w-4 text-green-500" />;
      if (trend < 0) return <ArrowDown className="h-4 w-4 text-red-500" />;
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

  const getPerformanceColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (score >= 40) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="space-y-8 p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Análise de Garantias</h1>
            <p className="text-lg text-gray-600">Performance, produtividade e análise da equipe técnica</p>
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
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardTitle className="flex items-center gap-3 text-xl">
              <Users className="h-6 w-6 text-blue-600" />
              Filtros de Análise de Mecânicos
            </CardTitle>
            <CardDescription className="text-base">
              Configure os parâmetros para análise detalhada da performance da equipe
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg text-gray-600">Processando análise de mecânicos...</p>
            </div>
          </div>
        ) : error ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-red-500 mx-auto mb-4" />
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
            {/* KPIs da Equipe */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <KPICard 
                title="Total de Mecânicos" 
                value={data.kpis?.totalMecanicos} 
                icon={<Users className="h-6 w-6" />}
                trend={data.kpis?.totalMecanicosTrend}
                description="Mecânicos ativos"
                color="blue"
              />
              <KPICard 
                title="Produtividade Média" 
                value={data.kpis?.produtividadeMedia} 
                format="decimal"
                icon={<Activity className="h-6 w-6" />}
                trend={data.kpis?.produtividadeTrend}
                description="OS por mecânico"
                color="green"
              />
              <KPICard 
                title="Custo Médio da Equipe" 
                value={data.kpis?.custoMedioEquipe} 
                format="currency" 
                icon={<DollarSign className="h-6 w-6" />}
                trend={data.kpis?.custoMedioTrend}
                description="Custo médio por OS"
                color="orange"
              />
              <KPICard 
                title="Tempo Médio da Equipe" 
                value={data.kpis?.tempoMedioEquipe} 
                format="time" 
                icon={<Clock className="h-6 w-6" />}
                trend={data.kpis?.tempoMedioTrend}
                description="Tempo de resolução"
                color="purple"
              />
            </div>

            {/* Cards dos Mecânicos */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <User className="h-6 w-6 text-blue-600" />
                  Performance Individual dos Mecânicos
                </CardTitle>
                <CardDescription>
                  Análise detalhada da performance de cada mecânico da equipe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {data.performanceMecanicos?.map((mecanico, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow border-l-4 border-l-blue-400">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                                {mecanico.nome?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold text-gray-900">{mecanico.nome}</h3>
                              <Badge className={`text-xs mt-1 ${getPerformanceColor(mecanico.scoreGeral)}`}>
                                Score: {mecanico.scoreGeral.toFixed(1)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Total de OS</span>
                            <span className="font-semibold">{mecanico.totalOrdens}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Custo Total</span>
                            <span className="font-semibold">R$ {mecanico.custoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Custo Médio</span>
                            <span className="font-semibold">R$ {mecanico.custoMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Tempo Médio</span>
                            <span className="font-semibold">{mecanico.tempoMedioResolucao.toFixed(1)} dias</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Taxa de Sucesso</span>
                            <span className="font-semibold text-green-600">{mecanico.taxaSucesso.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Versatilidade</span>
                            <span className="font-semibold">{mecanico.versatilidade} tipos</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Gráficos Principais */}
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Ranking de Performance */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Trophy className="h-6 w-6 text-yellow-600" />
                    Ranking de Performance
                  </CardTitle>
                  <CardDescription>
                    Top 10 mecânicos por score geral de performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={data.rankingPerformance} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        type="number" 
                        tick={{ fontSize: 12 }}
                        stroke="#666"
                      />
                      <YAxis 
                        type="category" 
                        dataKey="nome" 
                        width={100}
                        tick={{ fontSize: 11 }}
                        stroke="#666"
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        formatter={(value, name) => [
                          value.toFixed(1),
                          'Score Geral'
                        ]}
                      />
                      <Bar 
                        dataKey="scoreGeral" 
                        fill="#3B82F6" 
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Análise de Custos por Mecânico */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <DollarSign className="h-6 w-6 text-green-600" />
                    Análise de Custos por Mecânico
                  </CardTitle>
                  <CardDescription>
                    Comparação de custos totais e médios por mecânico
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={data.analiseCustos}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="mecanico" 
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
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        formatter={(value, name) => [
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

            {/* Produtividade Temporal */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                  Produtividade Temporal
                </CardTitle>
                <CardDescription>
                  Evolução da produtividade dos mecânicos ao longo do tempo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={data.produtividadeTemporal}>
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
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    {/* Renderizar linhas dinamicamente para cada mecânico */}
                    {data.produtividadeTemporal && data.produtividadeTemporal.length > 0 && 
                      Object.keys(data.produtividadeTemporal[0])
                        .filter(key => key !== 'periodo')
                        .slice(0, 5) // Limitar a 5 mecânicos para legibilidade
                        .map((mecanico, index) => (
                          <Line 
                            key={mecanico}
                            type="monotone" 
                            dataKey={mecanico} 
                            stroke={COLORS[index % COLORS.length]} 
                            strokeWidth={2}
                            dot={{ fill: COLORS[index % COLORS.length], strokeWidth: 2, r: 4 }}
                            name={mecanico}
                          />
                        ))
                    }
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Análise de Especialização */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Wrench className="h-6 w-6 text-orange-600" />
                  Especialização por Tipo de Defeito
                </CardTitle>
                <CardDescription>
                  Identificação de especialistas por tipo de defeito
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Tipo de Defeito</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Especialista</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Ocorrências do Especialista</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Total de Ocorrências</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">% Especialização</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.analiseEspecializacao?.slice(0, 10).map((item, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4 font-medium text-gray-900">{item.defeito}</td>
                          <td className="py-4 px-4 text-gray-900">{item.especialista}</td>
                          <td className="py-4 px-4 text-right font-semibold text-gray-900">{item.ocorrenciasEspecialista}</td>
                          <td className="py-4 px-4 text-right text-gray-600">{item.totalOcorrencias}</td>
                          <td className="py-4 px-4 text-right">
                            <Badge className={`text-xs ${getPerformanceColor(item.percentualEspecializacao)}`}>
                              {item.percentualEspecializacao.toFixed(1)}%
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Ranking Detalhado */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Target className="h-6 w-6 text-blue-600" />
                  Ranking Detalhado de Performance
                </CardTitle>
                <CardDescription>
                  Classificação completa com métricas detalhadas de cada mecânico
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.rankingPerformance?.map((mecanico, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 
                          index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                        }`}>
                          {mecanico.posicao}
                        </div>
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                            {mecanico.iniciais}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-gray-900">{mecanico.nome}</h4>
                          <p className="text-sm text-gray-600">Score Geral: {mecanico.scoreGeral.toFixed(1)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-8">
                        <div className="text-center">
                          <p className="text-xs text-gray-600">Total OS</p>
                          <p className="font-bold text-blue-600">{mecanico.totalOrdens}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600">Custo Médio</p>
                          <p className="font-bold text-green-600">R$ {mecanico.custoMedio.toFixed(0)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600">Tempo Médio</p>
                          <p className="font-bold text-orange-600">{mecanico.tempoMedio.toFixed(1)}d</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600">Taxa Sucesso</p>
                          <p className="font-bold text-purple-600">{mecanico.taxaSucesso.toFixed(1)}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600">Versatilidade</p>
                          <p className="font-bold text-indigo-600">{mecanico.versatilidade}</p>
                        </div>
                        {index < 3 && (
                          <Trophy className={`h-6 w-6 ${
                            index === 0 ? 'text-yellow-500' : 
                            index === 1 ? 'text-gray-400' : 'text-orange-600'
                          }`} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default MechanicsPage;


