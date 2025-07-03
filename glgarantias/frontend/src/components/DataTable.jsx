import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx'
import { Search, Filter, Download, Calendar } from 'lucide-react'

const DataTable = () => {
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [defeitoFilter, setDefeitoFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [error, setError] = useState(null)
  const itemsPerPage = 10

  // Buscar dados reais da API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const apiUrl = 'http://localhost:3000'
        const response = await fetch(`${apiUrl}/api/ordens?limit=1000`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`)
        }
        
        const result = await response.json()
        console.log('Dados carregados da API:', result)
        
        setData(result.data || [])
        setFilteredData(result.data || [])
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        setError('Erro ao carregar dados. Verifique se o backend está rodando.')
        setData([])
        setFilteredData([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    let filtered = data

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.numero_ordem.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.defeito_texto_bruto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.mecanico_responsavel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.modelo_motor.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter)
    }

    // Filtro por tipo de defeito
    if (defeitoFilter !== 'all') {
      filtered = filtered.filter(item => item.defeito_grupo === defeitoFilter)
    }

    setFilteredData(filtered)
    setCurrentPage(1)
  }, [data, searchTerm, statusFilter, defeitoFilter])

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

  // Paginação
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = filteredData.slice(startIndex, endIndex)

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
            <h3 className="text-lg font-semibold text-red-700">Erro ao carregar dados</h3>
            <p className="text-red-600">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
            >
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Dados Brutos das Ordens de Serviço
          </CardTitle>
          <CardDescription>
            Visualize e filtre todos os dados processados das planilhas Excel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por OS, defeito, mecânico ou motor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="Garantia">Garantia</SelectItem>
                <SelectItem value="Garantia de Oficina">Garantia de Oficina</SelectItem>
                <SelectItem value="Garantia de Usinagem">Garantia de Usinagem</SelectItem>
              </SelectContent>
            </Select>

            <Select value={defeitoFilter} onValueChange={setDefeitoFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filtrar por defeito" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Defeitos</SelectItem>
                <SelectItem value="Vazamentos">Vazamentos</SelectItem>
                <SelectItem value="Problemas de Funcionamento/Desempenho">Funcionamento/Desempenho</SelectItem>
                <SelectItem value="Ruídos e Vibrações">Ruídos e Vibrações</SelectItem>
                <SelectItem value="Quebra/Dano Estrutural">Quebra/Dano Estrutural</SelectItem>
                <SelectItem value="Erros de Montagem/Instalação">Erros de Montagem</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>

          {/* Informações de resultado */}
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>
              Mostrando {startIndex + 1}-{Math.min(endIndex, filteredData.length)} de {filteredData.length} registros
            </span>
            <span>
              Total de {data.length} ordens de serviço
            </span>
          </div>

          {/* Tabela */}
          <div className="border rounded-lg overflow-hidden">
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
                {currentData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.numero_ordem ?? '-'}</TableCell>
                    <TableCell>{item.data_ordem ? new Date(item.data_ordem).toLocaleDateString('pt-BR') : '-'}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(item.status)}>
                        {item.status ?? '-'}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.fabricante_motor ?? '-'}</TableCell>
                    <TableCell>{item.modelo_motor ?? '-'}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={item.defeito_texto_bruto ?? ''}>
                      {item.defeito_texto_bruto ?? '-'}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">
                        <div className="font-medium">{item.defeito_grupo ?? '-'}</div>
                        <div className="text-muted-foreground">{item.defeito_subgrupo ?? '-'}</div>
                        <div className="text-muted-foreground">{item.defeito_subsubgrupo ?? '-'}</div>
                      </div>
                    </TableCell>
                    <TableCell>{item.mecanico_responsavel ?? '-'}</TableCell>
                    <TableCell>R$ {(item.total_geral ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell>
                      <span className={getConfiancaColor(item.classificacao_confianca ?? 0)}>
                        {((item.classificacao_confianca ?? 0) * 100).toFixed(0)}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <Button
                    key={i}
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Próximo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default DataTable

