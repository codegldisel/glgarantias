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

      const apiUrl = 'http://localhost:3000'
      console.log('Tentando conectar com API em:', apiUrl)
      
      // Definir mês e ano para teste (junho/2025)
      const customMonth = 6; // Junho
      const customYear = 2025;
      
      // Buscar estatísticas filtradas por mês
      const timestamp = Date.now();
      const statsUrl = `${apiUrl}/api/dashboard/stats?mes_servico=${customMonth}&ano_servico=${customYear}&t=${timestamp}`;
      console.log('URL para estatísticas:', statsUrl);
      
      const statsResponse = await fetch(statsUrl, {
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
      console.log('URL chamada:', statsUrl)
      setStats(statsData)

      // Buscar dados de junho/2025
      const customMonthResponse = await fetch(`${apiUrl}/api/ordens?mes_servico=${customMonth}&ano_servico=${customYear}&limit=1000`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!customMonthResponse.ok) {
        throw new Error(`Erro HTTP: ${customMonthResponse.status} - ${customMonthResponse.statusText}`)
      }
      
      const customMonthData = await customMonthResponse.json()
      console.log('Dados de junho/2025 recebidos:', customMonthData)
      setCurrentMonthData({
        data: customMonthData.data,
        total: customMonthData.data.length,
        month: customMonth,
        year: customYear
      })

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
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Dashboard - {currentMonthData ? `${getMonthName(currentMonthData.month)} de ${currentMonthData.year}` : 'Carregando...'}</h2>
        <p className="text-sm text-gray-600">
          {currentMonthData ? 
            `Estatísticas e dados das ordens de serviço de ${getMonthName(currentMonthData.month)} de ${currentMonthData.year}` : 
            'Carregando dados do mês selecionado...'
          }
        </p>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleRetry}
          className="mt-2"
        >
          Recarregar Dados
        </Button>
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
              {stats ? `Ordens de serviço (Junho/2025)` : 'Dados indisponíveis'}
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
              {stats ? 'Valor total em peças (Junho/2025)' : 'Dados indisponíveis'}
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
              {stats ? 'Valor total em serviços (Junho/2025)' : 'Dados indisponíveis'}
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
              {stats ? 'Valor total geral (Junho/2025)' : 'Dados indisponíveis'}
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
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
          <p className="text-sm text-green-800">
            <strong>Dados filtrados por Junho/2025:</strong> Os cards de estatísticas mostram apenas dados de junho de 2025.
          </p>
        </div>
      </div>

      {/* Tabela do Mês Atual */}
      <Card className="bg-white">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-600" />
            <CardTitle className="text-lg font-semibold">
              Ordens de Serviço - {currentMonthData ? `${getMonthName(currentMonthData.month)} ${currentMonthData.year}` : 'Mês Selecionado'}
            </CardTitle>
          </div>
          <CardDescription>
            Dados das ordens de serviço processadas em {currentMonthData ? `${getMonthName(currentMonthData.month)} de ${currentMonthData.year}` : 'junho de 2025'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentMonthData && currentMonthData.data && currentMonthData.data.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>OS</TableHead>
                    <TableHead>Fabricante</TableHead>
                    <TableHead>Motor</TableHead>
                    <TableHead>Defeito</TableHead>
                    <TableHead>Mecânico Montador</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentMonthData.data
                    .filter(item => [
                      "G", "GO", "GU",
                      "GARANTIA", "GARANTIA DE OFICINA", "GARANTIA DE USINAGEM"
                    ].includes((item.status || '').toUpperCase()))
                    .map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.data_ordem ? new Date(item.data_ordem).toLocaleDateString('pt-BR') : 'N/A'}</TableCell>
                        <TableCell className="font-medium">{item.numero_ordem || 'N/A'}</TableCell>
                        <TableCell>{item.fabricante_motor || 'N/A'}</TableCell>
                        <TableCell>{item.modelo_motor || 'N/A'}</TableCell>
                        <TableCell className="max-w-xs truncate" title={item.defeito_texto_bruto || ''}>
                          {item.defeito_texto_bruto || 'N/A'}
                        </TableCell>
                        <TableCell>{item.mecanico_responsavel || 'N/A'}</TableCell>
                        <TableCell>
                          R$ {(() => {
                            const totalPecas = item.total_pecas || 0;
                            const totalServico = item.total_servico || 0;
                            const total = totalPecas + totalServico;
                            return total.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
                          })()}
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
                        'Carregando dados de junho de 2025...'
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

