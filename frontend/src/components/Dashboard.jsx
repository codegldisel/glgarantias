import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Button } from '@/components/ui/button.jsx'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { AlertTriangle, RefreshCw, FileText, TrendingUp, TrendingDown } from 'lucide-react'

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [stats, setStats] = useState(null)
  const [charts, setCharts] = useState(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(false)

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
      console.log('Tentando conectar com API em:', apiUrl)
      
      // Buscar estatísticas
      const statsResponse = await fetch(`${apiUrl}/api/dashboard/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!statsResponse.ok) {
        throw new Error(`Erro HTTP: ${statsResponse.status} - ${statsResponse.statusText}`)
      }
      
      const statsData = await statsResponse.json()
      console.log('Dados de estatísticas recebidos:', statsData)
      setStats(statsData)

      // Buscar dados dos gráficos
      const chartsResponse = await fetch(`${apiUrl}/api/dashboard/charts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!chartsResponse.ok) {
        throw new Error(`Erro HTTP: ${chartsResponse.status} - ${chartsResponse.statusText}`)
      }
      
      const chartsData = await chartsResponse.json()
      console.log('Dados de gráficos recebidos:', chartsData)
      setCharts(chartsData)

    } catch (error) {
      console.error('Erro detalhado ao carregar dados:', error)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleRetry = () => {
    fetchData()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-6">
          {[...Array(6)].map((_, i) => (
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

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Análises Gerais</h2>
        <p className="text-sm text-gray-600">Resumo das ordens de serviço de junho de 2025</p>
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
                Erro ao carregar dados. Verifique se o backend está rodando.
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-6">
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Total de OS</p>
              <FileText className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats ? stats.totalOS.toLocaleString() : '---'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {stats ? 'Ordens de serviço' : 'Dados indisponíveis'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Total Peças</p>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats ? `R$ ${stats.totalPecas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '---'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {stats ? 'Valor total em peças' : 'Dados indisponíveis'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Total Serviços</p>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats ? `R$ ${stats.totalServicos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '---'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {stats ? 'Valor total em serviços' : 'Dados indisponíveis'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Total Geral</p>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats ? `R$ ${stats.totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '---'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {stats ? 'Valor total geral' : 'Dados indisponíveis'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Mecânicos Ativos</p>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats ? stats.totalMecanicos : '---'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {stats ? 'Mecânicos únicos' : 'Dados indisponíveis'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Tipos de Defeitos</p>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats ? stats.totalTiposDefeitos : '---'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {stats ? 'Categorias de defeitos' : 'Dados indisponíveis'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Info Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
          <p className="text-sm text-blue-800">
            Os dados são atualizados automaticamente conforme novas ordens de serviço são processadas.
          </p>
        </div>
      </div>

      {/* Orders Chart Section */}
      <Card className="bg-white">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-600" />
            <CardTitle className="text-lg font-semibold">Defeitos por Categoria</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {charts && charts.defeitosPorGrupo && charts.defeitosPorGrupo.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={charts.defeitosPorGrupo}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="valor" fill="#374151" />
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
                      Erro ao carregar dados. Verifique se o backend está rodando.
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
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum dado encontrado</h3>
                    <p className="text-sm text-gray-600">
                      Faça o upload de uma planilha para visualizar os gráficos.
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard

