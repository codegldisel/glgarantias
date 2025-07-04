import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Avatar, AvatarFallback } from '@/components/ui/avatar.jsx'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { Search, Users, Award, Clock, TrendingUp, Star, Settings, Download } from 'lucide-react'

const MechanicsPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState('mes')
  const [selectedMetric, setSelectedMetric] = useState('eficiencia')
  const [mecanicos, setMecanicos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMecanicos = async () => {
      setLoading(true)
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
        const res = await fetch(`${apiUrl}/api/analises/performance-mecanicos`)
        const json = await res.json()
        setMecanicos(json || [])
      } catch (e) {
        setMecanicos([])
      } finally {
        setLoading(false)
      }
    }
    fetchMecanicos()
  }, [])

  const performanceComparativa = [
    { mecanico: 'Carlos E.', qualidade: 95, produtividade: 92, pontualidade: 98, satisfacao: 96 },
    { mecanico: 'Wilson S.', qualidade: 92, produtividade: 88, pontualidade: 95, satisfacao: 92 },
    { mecanico: 'Gilson P.', qualidade: 88, produtividade: 85, pontualidade: 92, satisfacao: 88 },
    { mecanico: 'Paulo R.', qualidade: 90, produtividade: 82, pontualidade: 90, satisfacao: 90 },
    { mecanico: 'Jean S.', qualidade: 87, produtividade: 89, pontualidade: 94, satisfacao: 86 }
  ]

  const produtividadeMensal = [
    { mes: 'Jan', carlos: 42, wilson: 35, gilson: 38, paulo: 32, jean: 37 },
    { mes: 'Fev', carlos: 45, wilson: 38, gilson: 40, paulo: 34, jean: 39 },
    { mes: 'Mar', carlos: 48, wilson: 36, gilson: 42, paulo: 35, jean: 41 },
    { mes: 'Abr', carlos: 44, wilson: 39, gilson: 41, paulo: 33, jean: 38 },
    { mes: 'Mai', carlos: 46, wilson: 37, gilson: 43, paulo: 36, jean: 40 },
    { mes: 'Jun', carlos: 45, wilson: 38, gilson: 42, paulo: 35, jean: 40 }
  ]

  const filteredMecanicos = mecanicos.filter(mecanico =>
    mecanico.nome && mecanico.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getQualityColor = (qualidade) => {
    if (qualidade >= 90) return 'bg-green-100 text-green-800 border-green-200'
    if (qualidade >= 85) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-red-100 text-red-800 border-red-200'
  }

  const getStatusColor = (qualidade) => {
    if (qualidade >= 90) return 'bg-green-500'
    if (qualidade >= 85) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Mecânicos</h2>
          <p className="text-sm text-gray-600 mt-1">
            Performance, produtividade e análise da equipe técnica
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurar
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Relatório
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nome ou especialidade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mes">Este Mês</SelectItem>
                <SelectItem value="trimestre">Trimestre</SelectItem>
                <SelectItem value="semestre">Semestre</SelectItem>
                <SelectItem value="ano">Ano</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="eficiencia">Eficiência</SelectItem>
                <SelectItem value="qualidade">Qualidade</SelectItem>
                <SelectItem value="produtividade">Produtividade</SelectItem>
                <SelectItem value="pontualidade">Pontualidade</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas da Equipe */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Mecânicos Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{filteredMecanicos.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Qualidade Média</p>
                <p className="text-2xl font-bold text-green-600">90.4%</p>
                <p className="text-xs text-gray-500">↑ 2.1% vs mês anterior</p>
              </div>
              <Award className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tempo Médio</p>
                <p className="text-2xl font-bold text-orange-600">2.7h</p>
                <p className="text-xs text-gray-500">por OS</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Produtividade</p>
                <p className="text-2xl font-bold text-purple-600">87.2%</p>
                <p className="text-xs text-gray-500">eficiência geral</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cards dos Mecânicos */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredMecanicos.length === 0 ? (
          <Card><CardContent className="p-6 text-center text-muted-foreground">Nenhum mecânico encontrado.</CardContent></Card>
        ) : filteredMecanicos.map((mecanico, idx) => (
          <Card key={mecanico.nome + idx} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gray-100 text-gray-700 font-medium">
                        {mecanico.nome?.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{mecanico.nome}</h3>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">OS Completas</span>
                  <span className="font-medium">{mecanico.totalOrdens ?? '-'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Valor Total</span>
                  <span className="font-medium">R$ {mecanico.valorTotal?.toLocaleString('pt-BR', {minimumFractionDigits:2}) ?? '-'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Média por Ordem</span>
                  <span className="font-medium">R$ {mecanico.mediaPorOrdem?.toLocaleString('pt-BR', {minimumFractionDigits:2}) ?? '-'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráficos de Performance */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Performance Comparativa */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Comparativa</CardTitle>
            <CardDescription>
              Comparação de métricas principais entre mecânicos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={performanceComparativa}>
                <PolarGrid />
                <PolarAngleAxis dataKey="mecanico" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Qualidade" dataKey="qualidade" stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} />
                <Radar name="Produtividade" dataKey="produtividade" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                <Radar name="Pontualidade" dataKey="pontualidade" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Produtividade Mensal */}
        <Card>
          <CardHeader>
            <CardTitle>Produtividade Mensal</CardTitle>
            <CardDescription>
              Evolução da produtividade de cada mecânico ao longo dos meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={produtividadeMensal}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="carlos" fill="#ef4444" name="Carlos E." />
                <Bar dataKey="wilson" fill="#f97316" name="Wilson S." />
                <Bar dataKey="gilson" fill="#eab308" name="Gilson P." />
                <Bar dataKey="paulo" fill="#22c55e" name="Paulo R." />
                <Bar dataKey="jean" fill="#3b82f6" name="Jean S." />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Ranking e Reconhecimentos */}
      <Card>
        <CardHeader>
          <CardTitle>Ranking de Performance</CardTitle>
          <CardDescription>
            Classificação baseada em qualidade, produtividade e satisfação do cliente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mecanicos
              .sort((a, b) => (b.qualidade + b.produtividade + b.avaliacaoCliente * 20) - (a.qualidade + a.produtividade + a.avaliacaoCliente * 20))
              .map((mecanico, index) => (
                <div key={mecanico.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gray-100 text-gray-700">
                        {mecanico.iniciais}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium text-gray-900">{mecanico.nome}</h4>
                      <p className="text-sm text-gray-600">{mecanico.especialidade}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Qualidade</p>
                      <p className="font-bold text-green-600">{mecanico.qualidade}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Produtividade</p>
                      <p className="font-bold text-blue-600">{mecanico.produtividade}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Avaliação</p>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold">{mecanico.avaliacaoCliente}</span>
                      </div>
                    </div>
                    {index < 3 && (
                      <Award className={`h-6 w-6 ${
                        index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-orange-600'
                      }`} />
                    )}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights e Recomendações */}
      <Card>
        <CardHeader>
          <CardTitle>Insights da Equipe</CardTitle>
          <CardDescription>
            Análises e recomendações baseadas na performance da equipe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">🏆 Destaque do Mês</h4>
              <p className="text-sm text-green-700">
                Carlos Eduardo mantém liderança com 95% de qualidade e excelente avaliação dos clientes. 
                Considere promovê-lo a supervisor técnico.
              </p>
            </div>
            
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">📈 Oportunidade de Melhoria</h4>
              <p className="text-sm text-yellow-700">
                Jean Santos mostra potencial de crescimento. Recomenda-se treinamento adicional 
                em motores diesel para ampliar suas especialidades.
              </p>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">💡 Sugestão de Treinamento</h4>
              <p className="text-sm text-blue-700">
                A equipe mostra excelente performance geral. Considere implementar programa de 
                mentoria entre mecânicos sênior e júnior para acelerar o desenvolvimento.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default MechanicsPage

