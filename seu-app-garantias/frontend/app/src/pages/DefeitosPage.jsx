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
  AlertTriangle, 
  Search, 
  Plus,
  Edit,
  Trash2,
  Database
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

const DefeitosPage = () => {
  const { t } = useTranslation()
  const [grupos, setGrupos] = useState([])
  const [subgrupos, setSubgrupos] = useState([])
  const [mapeamentos, setMapeamentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Dados mockados para demonstração
  const mockGrupos = [
    { id: 1, nome: 'Problemas Elétricos', descricao: 'Defeitos relacionados ao sistema elétrico' },
    { id: 2, nome: 'Falhas Mecânicas', descricao: 'Problemas no sistema mecânico' },
    { id: 3, nome: 'Desgaste Natural', descricao: 'Desgastes por uso normal' },
    { id: 4, nome: 'Problemas Hidráulicos', descricao: 'Defeitos no sistema hidráulico' }
  ]

  const mockSubgrupos = [
    { id: 1, grupo_id: 1, nome: 'Curto-circuito', descricao: 'Problemas de curto-circuito' },
    { id: 2, grupo_id: 1, nome: 'Sobrecarga', descricao: 'Sobrecarga elétrica' },
    { id: 3, grupo_id: 2, nome: 'Quebra de Peça', descricao: 'Peças quebradas ou danificadas' },
    { id: 4, grupo_id: 2, nome: 'Desalinhamento', descricao: 'Problemas de alinhamento' }
  ]

  const mockMapeamentos = [
    { id: 1, descricao_original: 'motor queimado', grupo_id: 1, subgrupo_id: 1, ocorrencias: 15 },
    { id: 2, descricao_original: 'peça quebrada', grupo_id: 2, subgrupo_id: 3, ocorrencias: 12 },
    { id: 3, descricao_original: 'vazamento óleo', grupo_id: 4, subgrupo_id: null, ocorrencias: 8 },
    { id: 4, descricao_original: 'ruído excessivo', grupo_id: 2, subgrupo_id: 4, ocorrencias: 6 }
  ]

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      // Simular carregamento de dados
      setTimeout(() => {
        setGrupos(mockGrupos)
        setSubgrupos(mockSubgrupos)
        setMapeamentos(mockMapeamentos)
        setLoading(false)
      }, 1000)
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      setError('Erro ao carregar dados. Verifique se o backend está rodando.')
      setLoading(false)
    }
  }

  const getGrupoNome = (grupoId) => {
    const grupo = grupos.find(g => g.id === grupoId)
    return grupo ? grupo.nome : 'N/A'
  }

  const getSubgrupoNome = (subgrupoId) => {
    const subgrupo = subgrupos.find(s => s.id === subgrupoId)
    return subgrupo ? subgrupo.nome : 'N/A'
  }

  const filteredMapeamentos = mapeamentos.filter(mapeamento =>
    mapeamento.descricao_original.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getGrupoNome(mapeamento.grupo_id).toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gestão de Defeitos</h1>
            <p className="text-muted-foreground">Gerenciar categorias e mapeamentos de defeitos</p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-4 bg-muted animate-pulse rounded"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Defeitos</h1>
          <p className="text-muted-foreground">
            Gerenciar categorias e mapeamentos de defeitos
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Novo Grupo
          </Button>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Novo Mapeamento
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
                onClick={loadData}
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

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Grupos</p>
                <p className="text-2xl font-bold">{grupos.length}</p>
              </div>
              <Database className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Subgrupos</p>
                <p className="text-2xl font-bold">{subgrupos.length}</p>
              </div>
              <Database className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mapeamentos</p>
                <p className="text-2xl font-bold">{mapeamentos.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Ocorrências</p>
                <p className="text-2xl font-bold">
                  {mapeamentos.reduce((sum, m) => sum + m.ocorrencias, 0)}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Grupos de Defeitos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Grupos de Defeitos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {grupos.map((grupo) => (
                <div key={grupo.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{grupo.nome}</h4>
                    <p className="text-sm text-muted-foreground">{grupo.descricao}</p>
                    <Badge variant="secondary" className="mt-1">
                      {subgrupos.filter(s => s.grupo_id === grupo.id).length} subgrupos
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Subgrupos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Subgrupos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {subgrupos.map((subgrupo) => (
                <div key={subgrupo.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{subgrupo.nome}</h4>
                    <p className="text-sm text-muted-foreground">{subgrupo.descricao}</p>
                    <Badge variant="outline" className="mt-1">
                      {getGrupoNome(subgrupo.grupo_id)}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mapeamentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Mapeamentos de Defeitos
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar mapeamentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição Original</TableHead>
                  <TableHead>Grupo</TableHead>
                  <TableHead>Subgrupo</TableHead>
                  <TableHead>Ocorrências</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMapeamentos.map((mapeamento) => (
                  <TableRow key={mapeamento.id}>
                    <TableCell className="font-medium">
                      {mapeamento.descricao_original}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {getGrupoNome(mapeamento.grupo_id)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {mapeamento.subgrupo_id ? (
                        <Badge variant="outline">
                          {getSubgrupoNome(mapeamento.subgrupo_id)}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">
                        {mapeamento.ocorrencias}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DefeitosPage

