import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertTriangle, Calendar, FileText } from 'lucide-react'
import ApiService from '../../services/api'

const OSTable = () => {
  const [ordens, setOrdens] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadOrdensDoMes()
  }, [])

  const loadOrdensDoMes = async () => {
    try {
      setLoading(true)
      const response = await ApiService.getOrdensDoMesAtual()
      
      if (response && response.data) {
        setOrdens(response.data)
      }
    } catch (err) {
      console.error('Erro ao carregar ordens do mês:', err)
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

  const currentMonth = new Date().toLocaleDateString('pt-BR', { 
    month: 'long', 
    year: 'numeric' 
  })

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Ordens de Serviço do Mês
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Ordens de Serviço do Mês
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Erro ao carregar dados</h3>
            <p className="text-muted-foreground mb-4 text-center">{error}</p>
            <button 
              onClick={loadOrdensDoMes}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (ordens.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Ordens de Serviço do Mês
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {currentMonth}
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma OS encontrada</h3>
            <p className="text-muted-foreground text-center">
              Não há ordens de serviço de garantia para {currentMonth}.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Ordens de Serviço do Mês
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {currentMonth} • {ordens.length} ordem{ordens.length !== 1 ? 's' : ''} encontrada{ordens.length !== 1 ? 's' : ''}
        </p>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">DIA</TableHead>
                <TableHead className="w-[120px]">OS</TableHead>
                <TableHead className="w-[150px]">FABRICANTE</TableHead>
                <TableHead className="w-[120px]">MOTOR</TableHead>
                <TableHead className="w-[150px]">MODELO</TableHead>
                <TableHead className="w-[200px]">OBSERVAÇÕES</TableHead>
                <TableHead className="w-[200px]">DEFEITO</TableHead>
                <TableHead className="w-[180px]">MECÂNICO MONTADOR</TableHead>
                <TableHead className="w-[150px]">CLIENTE</TableHead>
                <TableHead className="w-[120px] text-right">TOTAL PEÇAS</TableHead>
                <TableHead className="w-[120px] text-right">TOTAL SERVIÇOS</TableHead>
                <TableHead className="w-[120px] text-right">TOTAL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordens.map((ordem, index) => (
                <TableRow key={ordem.id || index} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    {formatDate(ordem.data_os)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-sm">{ordem.numero_os || '-'}</span>
                      {getTipoOSBadge(ordem.tipo_os)}
                    </div>
                  </TableCell>
                  <TableCell>{ordem.fabricante || '-'}</TableCell>
                  <TableCell>{ordem.motor || '-'}</TableCell>
                  <TableCell>{ordem.modelo || '-'}</TableCell>
                  <TableCell>
                    <div className="max-w-[200px] truncate" title={ordem.observacoes}>
                      {ordem.observacoes || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px] truncate" title={ordem.defeito}>
                      {ordem.defeito || '-'}
                    </div>
                  </TableCell>
                  <TableCell>{ordem.mecanico_montador || '-'}</TableCell>
                  <TableCell>
                    <div className="max-w-[150px] truncate" title={ordem.cliente}>
                      {ordem.cliente || '-'}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatCurrency(ordem.total_pecas)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatCurrency(ordem.total_servicos)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm font-semibold">
                    {formatCurrency(ordem.total_geral)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

export default OSTable

