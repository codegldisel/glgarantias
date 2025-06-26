import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Users, 
  Search, 
  Plus,
  Edit,
  TrendingUp,
  Award,
  Clock
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

const MecanicosPage = () => {
  const { t } = useTranslation()
  const [mecanicos, setMecanicos] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Dados mockados para demonstração
  const mockMecanicos = [
    {
      id: 1,
      nome: 'João Silva',
      email: 'joao.silva@empresa.com',
      telefone: '(11) 99999-1111',
      especialidade: 'Elétrica',
      os_concluidas: 28,
      os_pendentes: 3,
      eficiencia: 95,
      tempo_medio: 2.5,
      status: 'ativo',
      data_contratacao: '2020-03-15'
    },
    {
      id: 2,
      nome: 'Pedro Santos',
      email: 'pedro.santos@empresa.com',
      telefone: '(11) 99999-2222',
      especialidade: 'Mecânica',
      os_concluidas: 24,
      os_pendentes: 2,
      eficiencia: 92,
      tempo_medio: 3.1,
      status: 'ativo',
      data_contratacao: '2019-08-22'
    },
    {
      id: 3,
      nome: 'Carlos Lima',
      email: 'carlos.lima@empresa.com',
      telefone: '(11) 99999-3333',
      especialidade: 'Hidráulica',
      os_concluidas: 22,
      os_pendentes: 4,
      eficiencia: 88,
      tempo_medio: 3.8,
      status: 'ativo',
      data_contratacao: '2021-01-10'
    },
    {
      id: 4,
      nome: 'Ana Costa',
      email: 'ana.costa@empresa.com',
      telefone: '(11) 99999-4444',
      especialidade: 'Geral',
      os_concluidas: 20,
      os_pendentes: 1,
      eficiencia: 94,
      tempo_medio: 2.8,
      status: 'ativo',
      data_contratacao: '2020-11-05'
    },
    {
      id: 5,
      nome: 'Roberto Alves',
      email: 'roberto.alves@empresa.com',
      telefone: '(11) 99999-5555',
      especialidade: 'Elétrica',
      os_concluidas: 18,
      os_pendentes: 2,
      eficiencia: 90,
      tempo_medio: 3.2,
      status: 'inativo',
      data_contratacao: '2018-06-12'
    }
  ]

  useEffect(() => {
    loadMecanicos()
  }, [])

  const loadMecanicos = async () => {
    try {
      setLoading(true)
      // Simular carregamento de dados
      setTimeout(() => {
        setMecanicos(mockMecanicos)
        setLoading(false)
      }, 1000)
    } catch (err) {
      console.error('Erro ao carregar mecânicos:', err)
      setLoading(false)
    }
  }

  const filteredMecanicos = mecanicos.filter(mecanico =>
    mecanico.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mecanico.especialidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mecanico.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status) => {
    return (
      <Badge variant={status === 'ativo' ? 'default' : 'secondary'}>
        {status === 'ativo' ? 'Ativo' : 'Inativo'}
      </Badge>
    )
  }

  const getEficienciaColor = (eficiencia) => {
    if (eficiencia >= 95) return 'text-green-600'
    if (eficiencia >= 90) return 'text-blue-600'
    if (eficiencia >= 85) return 'text-yellow-600'
    return 'text-red-600'
  }

  const totalOS = mecanicos.reduce((sum, m) => sum + m.os_concluidas, 0)
  const totalPendentes = mecanicos.reduce((sum, m) => sum + m.os_pendentes, 0)
  const eficienciaMedia = mecanicos.length > 0 
    ? mecanicos.reduce((sum, m) => sum + m.eficiencia, 0) / mecanicos.length 
    : 0
  const mecanicosAtivos = mecanicos.filter(m => m.status === 'ativo').length

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mecânicos</h1>
            <p className="text-muted-foreground">Gerenciar equipe de mecânicos</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-20 bg-muted animate-pulse rounded"></div>
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
          <h1 className="text-3xl font-bold">Mecânicos</h1>
          <p className="text-muted-foreground">
            Gerenciar equipe de mecânicos • {filteredMecanicos.length} mecânico{filteredMecanicos.length !== 1 ? 's' : ''} encontrado{filteredMecanicos.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Novo Mecânico
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mecânicos Ativos</p>
                <p className="text-2xl font-bold">{mecanicosAtivos}</p>
                <p className="text-xs text-muted-foreground">de {mecanicos.length} total</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">OS Concluídas</p>
                <p className="text-2xl font-bold">{totalOS}</p>
                <p className="text-xs text-muted-foreground">este mês</p>
              </div>
              <Award className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">OS Pendentes</p>
                <p className="text-2xl font-bold">{totalPendentes}</p>
                <p className="text-xs text-muted-foreground">em andamento</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Eficiência Média</p>
                <p className="text-2xl font-bold">{eficienciaMedia.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">da equipe</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, especialidade ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Mecânicos Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lista de Mecânicos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Especialidade</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>OS Concluídas</TableHead>
                  <TableHead>OS Pendentes</TableHead>
                  <TableHead>Eficiência</TableHead>
                  <TableHead>Tempo Médio</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMecanicos.map((mecanico) => (
                  <TableRow key={mecanico.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <p className="font-medium">{mecanico.nome}</p>
                        <p className="text-sm text-muted-foreground">{mecanico.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{mecanico.especialidade}</Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{mecanico.telefone}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{mecanico.os_concluidas}</span>
                        <Award className="h-4 w-4 text-green-600" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span>{mecanico.os_pendentes}</span>
                        <Clock className="h-4 w-4 text-yellow-600" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className={`font-semibold ${getEficienciaColor(mecanico.eficiencia)}`}>
                            {mecanico.eficiencia}%
                          </span>
                        </div>
                        <Progress value={mecanico.eficiencia} className="h-2" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{mecanico.tempo_medio}h</span>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(mecanico.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
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

      {/* Performance Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mecanicos
                .filter(m => m.status === 'ativo')
                .sort((a, b) => b.eficiencia - a.eficiencia)
                .slice(0, 3)
                .map((mecanico, index) => (
                  <div key={mecanico.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{mecanico.nome}</p>
                        <p className="text-sm text-muted-foreground">{mecanico.especialidade}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{mecanico.eficiencia}%</p>
                      <p className="text-sm text-muted-foreground">{mecanico.os_concluidas} OS</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Mais Rápidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mecanicos
                .filter(m => m.status === 'ativo')
                .sort((a, b) => a.tempo_medio - b.tempo_medio)
                .slice(0, 3)
                .map((mecanico, index) => (
                  <div key={mecanico.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{mecanico.nome}</p>
                      <p className="text-sm text-muted-foreground">{mecanico.especialidade}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-blue-600">{mecanico.tempo_medio}h</p>
                      <p className="text-sm text-muted-foreground">tempo médio</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Mais Produtivos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mecanicos
                .filter(m => m.status === 'ativo')
                .sort((a, b) => b.os_concluidas - a.os_concluidas)
                .slice(0, 3)
                .map((mecanico, index) => (
                  <div key={mecanico.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{mecanico.nome}</p>
                      <p className="text-sm text-muted-foreground">{mecanico.especialidade}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-purple-600">{mecanico.os_concluidas}</p>
                      <p className="text-sm text-muted-foreground">OS concluídas</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default MecanicosPage

