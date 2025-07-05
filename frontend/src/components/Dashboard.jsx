import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx'
import { AlertTriangle, RefreshCw, FileText, TrendingUp, TrendingDown, Calendar, DollarSign, Users, AlertCircle, Target, Clock, BarChart3 } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [stats, setStats] = useState(null)
  const [currentMonthData, setCurrentMonthData] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  const fetchData = async (mes = selectedMonth, ano = selectedYear) => {
    try {
      setLoading(true)
      setError(false)

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
      console.log('Tentando conectar com API em:', apiUrl)
      
      // Buscar estatísticas sem especificar mês/ano para usar dados disponíveis
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

      // Atualizar mês/ano selecionado com os dados reais retornados
      if (statsData.mes && statsData.ano) {
        setSelectedMonth(statsData.mes)
        setSelectedYear(statsData.ano)
      }

      // Buscar dados do mês selecionado
      const currentMonthResponse = await fetch(`${apiUrl}/api/dashboard/current-month`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!currentMonthResponse.ok) {
        throw new Error(`Erro HTTP: ${currentMonthResponse.status} - ${currentMonthResponse.statusText}`)
      }
      
      const currentMonthData = await currentMonthResponse.json()
      console.log('Dados do mês atual recebidos:', currentMonthData)
      setCurrentMonthData(currentMonthData)

    } catch (error) {
      console.error('Erro detalhado ao carregar dados:', error)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(selectedMonth, selectedYear)
  }, [selectedMonth, selectedYear])

  const handleRetry = () => {
    fetchData(selectedMonth, selectedYear)
  }

  const getMonthName = (monthNumber) => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[monthNumber - 1] || 'Desconhecido';
  }

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'Garantia':
        return 'default'
      case 'Garantia de Oficina':
        return 'secondary'
      case 'Garantia de Usinagem':
        return 'outline'
      default:
        return 'default'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString || dateString === 'N/A') {
      return 'N/A'
    }
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return 'N/A'
      }
      
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch (error) {
      return 'N/A'
    }
  }

  const getConfiancaColor = (confianca) => {
    if (confianca >= 0.9) return 'text-green-600'
    if (confianca >= 0.7) return 'text-yellow-600'
    return 'text-red-600'
  }

  // Calcular métricas avançadas
  const calculateAdvancedMetrics = () => {
    if (!stats) return {}
    
    const custoMedioOS = stats.totalOS > 0 ? stats.totalGeral / stats.totalOS : 0
    const percentualPecas = stats.totalGeral > 0 ? (stats.totalPecas / stats.totalGeral) * 100 : 0
    const percentualServicos = stats.totalGeral > 0 ? (stats.totalServicos / stats.totalGeral) * 100 : 0
    const osClassificadas = stats.totalOS - (stats.osNaoClassificadas || 0)
    const taxaClassificacao = stats.totalOS > 0 ? (osClassificadas / stats.totalOS) * 100 : 0
    
    return {
      custoMedioOS,
      percentualPecas,
      percentualServicos,
      taxaClassificacao,
      osClassificadas
    }
  }

  const metrics = calculateAdvancedMetrics()

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
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Dashboard de Análise de Garantias</h2>
        <p className="text-sm text-gray-600">
            {`Análise detalhada de ${getMonthName(selectedMonth)} de ${selectedYear}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedMonth} onValueChange={v => setSelectedMonth(Number(v))}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {[...Array(12)].map((_, i) => (
                <SelectItem key={i+1} value={String(i+1)}>{getMonthName(i+1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedYear} onValueChange={v => setSelectedYear(Number(v))}>
            <SelectTrigger className="w-24">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {[2023, 2024, 2025, 2026].map(y => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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

      {/* KPI Cards Aprimorados */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-6">
        {/* Card 1: Volume de Ordens */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-blue-700">Volume de OS</p>
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {stats ? stats.totalOS.toLocaleString() : '---'}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              {stats ? 'Ordens processadas' : 'Dados indisponíveis'}
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Custo Médio por OS */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-green-700">Custo Médio/OS</p>
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-900">
              {stats ? `R$ ${metrics.custoMedioOS.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '---'}
            </p>
            <p className="text-xs text-green-600 mt-1">
              {stats ? 'Valor médio por ordem' : 'Dados indisponíveis'}
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Taxa de Classificação */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-purple-700">Taxa Classificação</p>
              <Target className="h-4 w-4 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-900">
              {stats ? `${metrics.taxaClassificacao.toFixed(1)}%` : '---'}
            </p>
            <p className="text-xs text-purple-600 mt-1">
              {stats ? `${metrics.osClassificadas} de ${stats.totalOS} OS` : 'Dados indisponíveis'}
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Proporção Peças vs Serviços */}
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-orange-700">Peças vs Serviços</p>
              <BarChart3 className="h-4 w-4 text-orange-600" />
            </div>
            <p className="text-lg font-bold text-orange-900">
              {stats ? `${metrics.percentualPecas.toFixed(0)}% / ${metrics.percentualServicos.toFixed(0)}%` : '---'}
            </p>
            <p className="text-xs text-orange-600 mt-1">
              {stats ? 'Distribuição de custos' : 'Dados indisponíveis'}
            </p>
          </CardContent>
        </Card>

        {/* Card 5: Mecânicos Ativos */}
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-indigo-700">Mecânicos Ativos</p>
              <Users className="h-4 w-4 text-indigo-600" />
            </div>
            <p className="text-2xl font-bold text-indigo-900">
              {stats ? stats.totalMecanicos : '---'}
            </p>
            <p className="text-xs text-indigo-600 mt-1">
              {stats ? `${(stats.totalOS / stats.totalMecanicos).toFixed(1)} OS/mecânico` : 'Dados indisponíveis'}
            </p>
          </CardContent>
        </Card>

        {/* Card 6: Valor Total de Garantias */}
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-red-700">Impacto Financeiro</p>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-900">
              {stats ? `R$ ${stats.totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '---'}
            </p>
            <p className="text-xs text-red-600 mt-1">
              {stats ? 'Custo total de garantias' : 'Dados indisponíveis'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Info Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Insights dos Dados:</p>
            <ul className="space-y-1 text-xs">
              <li>• <strong>Taxa de Classificação:</strong> Indica a eficácia do sistema de PLN na categorização de defeitos</li>
              <li>• <strong>Custo Médio/OS:</strong> Permite identificar tendências de custos e comparar períodos</li>
              <li>• <strong>Peças vs Serviços:</strong> Mostra a distribuição de custos entre materiais e mão de obra</li>
              <li>• <strong>OS/Mecânico:</strong> Indica a produtividade e distribuição de trabalho da equipe</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tabela do Mês Atual */}
      <Card className="bg-white">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-600" />
            <CardTitle className="text-lg font-semibold">
              Ordens de Serviço - {currentMonthData ? `${getMonthName(currentMonthData.month)} ${currentMonthData.year}` : 'Mês Atual'}
            </CardTitle>
          </div>
          <CardDescription>
            Detalhamento das ordens de serviço processadas no período selecionado
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentMonthData && currentMonthData.data && currentMonthData.data.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>OS</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Fabricante</TableHead>
                    <TableHead>Motor</TableHead>
                    <TableHead>Defeito</TableHead>
                    <TableHead>Classificação</TableHead>
                    <TableHead>Mecânico</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Confiança</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentMonthData.data.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.numero_ordem}</TableCell>
                      <TableCell>{formatDate(item.data_ordem)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(item.status)}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.fabricante_motor}</TableCell>
                      <TableCell>{item.modelo_motor}</TableCell>
                      <TableCell className="max-w-xs truncate" title={item.defeito}>
                        {item.defeito}
                      </TableCell>
                      <TableCell className="max-w-xs truncate" title={item.classificacao}>
                        {item.classificacao}
                      </TableCell>
                      <TableCell>{item.mecanico}</TableCell>
                      <TableCell>
                        R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <span className={getConfiancaColor(item.confianca)}>
                          {(item.confianca * 100).toFixed(0)}%
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
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
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma ordem encontrada</h3>
                    <p className="text-sm text-gray-600">
                      {currentMonthData ? 
                        `Não há ordens de serviço para ${getMonthName(currentMonthData.month)} de ${currentMonthData.year}` :
                        'Carregando dados...'
                      }
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

