import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts'
import { TrendingUp, Calendar, Filter, Download, BarChart3, AlertTriangle, RefreshCw } from 'lucide-react'

const AnalysisPage = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('6meses')
  const [kpis, setKpis] = useState(null)
  const [tendencias, setTendencias] = useState(null)
  const [performanceMecanicos, setPerformanceMecanicos] = useState(null)

  const fetchAnalysisData = async () => {
    try {
      setLoading(true)
      setError(false)

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
      
      // Buscar KPIs
      const kpisResponse = await fetch(`${apiUrl}/api/analises/kpis`)
      if (!kpisResponse.ok) throw new Error('Erro ao buscar KPIs')
      const kpisData = await kpisResponse.json()
      setKpis(kpisData)

      // Buscar tendências
      const tendenciasResponse = await fetch(`${apiUrl}/api/analises/tendencias`)
      if (!tendenciasResponse.ok) throw new Error('Erro ao buscar tendências')
      const tendenciasData = await tendenciasResponse.json()
      setTendencias(tendenciasData)

      // Buscar performance dos mecânicos
      const performanceResponse = await fetch(`${apiUrl}/api/analises/performance-mecanicos`)
      if (!performanceResponse.ok) throw new Error('Erro ao buscar performance')
      const performanceData = await performanceResponse.json()
      setPerformanceMecanicos(performanceData)

    } catch (error) {
      console.error('Erro ao carregar dados de análise:', error)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalysisData()
  }, [])

  const handleRetry = () => {
    fetchAnalysisData()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Análises Avançadas</h2>
          <p className="text-sm text-gray-600 mt-1">
            Insights detalhados sobre defeitos, tendências e performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleRetry}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="flex items-center justify-between">
              <div>
                <strong>Erro de conexão</strong>
                <br />
                Erro ao carregar dados de análise. Verifique se o backend está rodando.
              </div>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleRetry}
                className="ml-4"
              >
                Tentar novamente
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Total de Ordens</p>
              <BarChart3 className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {kpis ? kpis.totalOrdens.toLocaleString() : '---'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {kpis ? 'Ordens analisadas' : 'Dados indisponíveis'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Valor Total</p>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {kpis ? `R$ ${kpis.totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '---'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {kpis ? 'Valor total processado' : 'Dados indisponíveis'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Valor Médio</p>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {kpis ? `R$ ${kpis.mediaValorPorOrdem.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '---'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {kpis ? 'Por ordem de serviço' : 'Dados indisponíveis'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Crescimento</p>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {kpis ? `${kpis.percentualCrescimento.toFixed(1)}%` : '---'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {kpis ? 'Últimos 6 meses' : 'Dados indisponíveis'}
            </p>
          </CardContent>
        </Card>
      </div>
      {/* Top Defeitos */}
      <Card className="bg-white">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-gray-600" />
            <CardTitle className="text-lg font-semibold">Top 5 Defeitos Mais Comuns</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {kpis && kpis.topDefeitos && kpis.topDefeitos.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={kpis.topDefeitos}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantidade" fill="#374151" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <div className="text-center">
                {error ? (
                  <>
                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar dados</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Erro ao carregar dados de defeitos.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={handleRetry}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Tentar novamente
                    </Button>
                  </>
                ) : (
                  <>
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum dado encontrado</h3>
                    <p className="text-sm text-gray-600">
                      Faça o upload de uma planilha para visualizar os defeitos.
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tendências Mensais */}
      {tendencias && tendencias.tendenciasMensais && tendencias.tendenciasMensais.length > 0 && (
        <Card className="bg-white">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-gray-600" />
              <CardTitle className="text-lg font-semibold">Tendências Mensais</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={tendencias.tendenciasMensais}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="periodo" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="quantidade" stroke="#374151" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Performance dos Mecânicos */}
      {performanceMecanicos && performanceMecanicos.topMecanicos && performanceMecanicos.topMecanicos.length > 0 && (
        <Card className="bg-white">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-gray-600" />
              <CardTitle className="text-lg font-semibold">Top 10 Mecânicos - Performance</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={performanceMecanicos.topMecanicos.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="totalOrdens" fill="#374151" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default AnalysisPage
