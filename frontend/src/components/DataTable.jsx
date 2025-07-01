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
  const itemsPerPage = 10

  // Dados mockados para demonstração
  const mockData = [
    {
      id: 1,
      numero_ordem: 'OS001234',
      data_ordem: '2024-06-15',
      status: 'Garantia',
      defeito_texto_bruto: 'Motor aquecendo muito, perdendo água do radiador',
      defeito_grupo: 'Problemas de Funcionamento/Desempenho',
      defeito_subgrupo: 'Superaquecimento',
      defeito_subsubgrupo: 'Com Perda de Água',
      mecanico_responsavel: 'João Silva',
      modelo_motor: 'MWM X10',
      fabricante_motor: 'MWM',
      total_pecas: 1250.00,
      total_servico: 800.00,
      total_geral: 2050.00,
      classificacao_confianca: 0.95
    },
    {
      id: 2,
      numero_ordem: 'OS001235',
      data_ordem: '2024-06-16',
      status: 'Garantia de Oficina',
      defeito_texto_bruto: 'Vazamento de óleo no cárter, muito óleo no chão',
      defeito_grupo: 'Vazamentos',
      defeito_subgrupo: 'Vazamento de Fluido',
      defeito_subsubgrupo: 'Óleo',
      mecanico_responsavel: 'Carlos Eduardo',
      modelo_motor: 'Cummins ISF',
      fabricante_motor: 'Cummins',
      total_pecas: 450.00,
      total_servico: 300.00,
      total_geral: 750.00,
      classificacao_confianca: 0.92
    },
    {
      id: 3,
      numero_ordem: 'OS001236',
      data_ordem: '2024-06-17',
      status: 'Garantia de Usinagem',
      defeito_texto_bruto: 'Ruído estranho no motor, barulho de batida na biela',
      defeito_grupo: 'Ruídos e Vibrações',
      defeito_subgrupo: 'Ruído Interno',
      defeito_subsubgrupo: 'Biela',
      mecanico_responsavel: 'Paulo Roberto',
      modelo_motor: 'Mercedes OM924',
      fabricante_motor: 'Mercedes-Benz',
      total_pecas: 2800.00,
      total_servico: 1200.00,
      total_geral: 4000.00,
      classificacao_confianca: 0.88
    },
    {
      id: 4,
      numero_ordem: 'OS001237',
      data_ordem: '2024-06-18',
      status: 'Garantia',
      defeito_texto_bruto: 'Pistão quebrado no 3º cilindro, motor travou',
      defeito_grupo: 'Quebra/Dano Estrutural',
      defeito_subgrupo: 'Quebra/Fratura',
      defeito_subsubgrupo: 'Pistão',
      mecanico_responsavel: 'Alexandre Cunha',
      modelo_motor: 'Volvo D13',
      fabricante_motor: 'Volvo',
      total_pecas: 3500.00,
      total_servico: 1800.00,
      total_geral: 5300.00,
      classificacao_confianca: 0.97
    },
    {
      id: 5,
      numero_ordem: 'OS001238',
      data_ordem: '2024-06-19',
      status: 'Garantia',
      defeito_texto_bruto: 'Filtro errado instalado, causou problema no motor',
      defeito_grupo: 'Erros de Montagem/Instalação',
      defeito_subgrupo: 'Componente Incompatível/Errado',
      defeito_subsubgrupo: 'Filtro',
      mecanico_responsavel: 'Wilson Santos',
      modelo_motor: 'Scania DC13',
      fabricante_motor: 'Scania',
      total_pecas: 180.00,
      total_servico: 120.00,
      total_geral: 300.00,
      classificacao_confianca: 0.91
    }
  ]

  useEffect(() => {
    // Simular carregamento de dados
    const timer = setTimeout(() => {
      setData(mockData)
      setFilteredData(mockData)
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
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
                    <TableCell className="font-medium">{item.numero_ordem}</TableCell>
                    <TableCell>{new Date(item.data_ordem).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(item.status)}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.fabricante_motor}</TableCell>
                    <TableCell>{item.modelo_motor}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={item.defeito_texto_bruto}>
                      {item.defeito_texto_bruto}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">
                        <div className="font-medium">{item.defeito_grupo}</div>
                        <div className="text-muted-foreground">{item.defeito_subgrupo}</div>
                        <div className="text-muted-foreground">{item.defeito_subsubgrupo}</div>
                      </div>
                    </TableCell>
                    <TableCell>{item.mecanico_responsavel}</TableCell>
                    <TableCell>R$ {item.total_geral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell>
                      <span className={getConfiancaColor(item.classificacao_confianca)}>
                        {(item.classificacao_confianca * 100).toFixed(0)}%
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

