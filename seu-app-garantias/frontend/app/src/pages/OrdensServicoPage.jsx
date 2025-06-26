import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  FileText, 
  Search, 
  Filter,
  Download,
  Calendar,
  AlertTriangle
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import ApiService from '../services/api'

const OrdensServicoPage = () => {
  const { t } = useTranslation()
  const [ordens, setOrdens] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredOrdens, setFilteredOrdens] = useState([])

  useEffect(() => {
    loadOrdens()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = ordens.filter(ordem => 
        ordem.numero_os?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ordem.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ordem.fabricante?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ordem.defeito?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredOrdens(filtered)
    } else {
      setFilteredOrdens(ordens)
    }
  }, [searchTerm, ordens])

  const loadOrdens = async () => {
    try {
      setLoading(true)
      const response = await ApiService.getOrdensServico()
      
      if (response && response.data) {
        setOrdens(response.data)
        setFilteredOrdens(response.data)
      }
    } catch (err) {
      console.error('Erro ao carregar ordens:', err)
      setError('Erro ao carregar dados. Verifique se o backend está rodando.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('pt-BR')
    } catch {
      return dateString
    }
  }

  const formatCurrency = (value) => {
    if (!value || isNaN(value)) return 'R$ 0,00'
    return `R$ ${parseFloat(value).toLocaleString('pt-BR', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    })}`
  }

  const getTipoOSBadge = (tipo) => {
    if (!tipo) return null
    
    const tipoUpper = tipo.toString().toUpperCase()
    let variant = 'secondary'
    
    if (tipoUpper.includes('G')) variant = 'destructive'
    if (tipoUpper.includes('GO')) variant = 'default'
    if (tipoUpper.includes('GU')) variant = 'outline'
    
    return <Badge variant={variant}>{tipo}</Badge>
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Ordens de Serviço</h1>
            <p className="text-muted-foreground">Gerenciar todas as ordens de serviço</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ordens de Serviço</h1>
          <p className="text-muted-foreground">
            Gerenciar todas as ordens de serviço • {filteredOrdens.length} ordem{filteredOrdens.length !== 1 ? 's' : ''} encontrada{filteredOrdens.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <div>
              <h4 className="font-semibold text-destructive">Erro de conexão</h4>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button 
                onClick={loadOrdens}
                variant="destructive"
                size="sm"
                className="mt-2"
              >
                Tentar novamente
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por número OS, cliente, fabricante ou defeito..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Lista de Ordens de Serviço
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOrdens.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {searchTerm ? 'Nenhuma OS encontrada' : 'Nenhuma OS cadastrada'}
              </h3>
              <p className="text-muted-foreground text-center">
                {searchTerm 
                  ? `Não há ordens de serviço que correspondam à busca "${searchTerm}".`
                  : 'Não há ordens de serviço cadastradas no sistema.'
                }
              </p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>OS</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Fabricante</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Defeito</TableHead>
                    <TableHead>Mecânico</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrdens.map((ordem, index) => (
                    <TableRow key={ordem.id || index} className="hover:bg-muted/50">
                      <TableCell>{formatDate(ordem.data_os)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="font-mono text-sm">{ordem.numero_os || '-'}</span>
                          {getTipoOSBadge(ordem.tipo_os)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[150px] truncate" title={ordem.cliente}>
                          {ordem.cliente || '-'}
                        </div>
                      </TableCell>
                      <TableCell>{ordem.fabricante || '-'}</TableCell>
                      <TableCell>{ordem.modelo || '-'}</TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate" title={ordem.defeito}>
                          {ordem.defeito || '-'}
                        </div>
                      </TableCell>
                      <TableCell>{ordem.mecanico_montador || '-'}</TableCell>
                      <TableCell className="text-right font-mono text-sm font-semibold">
                        {formatCurrency(ordem.total_geral)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default OrdensServicoPage

