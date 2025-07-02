import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx'
import { AlertTriangle, RefreshCw, FileText, TrendingUp, TrendingDown, Calendar } from 'lucide-react'

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [stats, setStats] = useState(null)
  const [currentMonthData, setCurrentMonthData] = useState(null)

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

      // Buscar dados do mês atual
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
    fetchData()
  }, [])

  const handleRetry = () => {
    fetchData()
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

  const getConfiancaColor = (confianca) => {
    if (confianca >= 0.9) return 'text-green-600'
    if (confianca >= 0.7) return 'text-yellow-600'
    return 'text-red-600'
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
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Dashboard</h2>
        <p className="text-sm text-gray-600">
          {currentMonthData ? 
            `Ordens de serviço de ${getMonthName(currentMonthData.month)} de ${currentMonthData.year}` : 
            'Carregando dados do mês atual...'
          }
        </p>
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
            Dados das ordens de serviço processadas no mês atual
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
                      <TableCell>{item.data_ordem}</TableCell>
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

