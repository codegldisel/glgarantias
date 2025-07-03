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
  const [error, setError] = useState(null)
  const [performanceMecanicos, setPerformanceMecanicos] = useState([])
  const [tendencias, setTendencias] = useState([])

  useEffect(() => {
    const fetchMecanicos = async () => {
      try {
        setLoading(true)
        setError(null)
        const apiUrl = 'http://localhost:3000'
        // Buscar performance dos mecânicos
        const response = await fetch(`${apiUrl}/api/analises/performance-mecanicos`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
        if (!response.ok) throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`)
        const result = await response.json()
        setPerformanceMecanicos(result)
        // Transformar dados da API para o formato esperado pelo componente
        const mecanicosFormatados = result.map((mecanico, index) => ({
          id: index + 1,
          nome: mecanico.mecanico_responsavel,
          iniciais: mecanico.mecanico_responsavel.split(' ').map(n => n[0]).join('').substring(0, 2),
          osCompletas: mecanico.total_ordens,
          osEmAndamento: 0, // Não disponível na API atual
          tempoMedioReparo: 0, // Não disponível na API atual
          qualidade: Math.round((mecanico.ordens_com_defeito / mecanico.total_ordens) * 100),
          especialidade: 'Motores', // Padrão
          experiencia: 5, // Padrão
          avaliacaoCliente: 4.5, // Padrão
          defeitosResolvidos: ['Vazamentos', 'Superaquecimento'], // Padrão
          produtividade: Math.round((mecanico.total_ordens / 30) * 100), // Estimativa
          pontualidade: 95, // Padrão
          status: 'ativo'
        }))
        setMecanicos(mecanicosFormatados)
        // Buscar tendências reais
        const tendenciasResponse = await fetch(`${apiUrl}/api/analises/tendencias`)
        if (!tendenciasResponse.ok) throw new Error('Erro ao buscar tendências')
        const tendenciasData = await tendenciasResponse.json()
        setTendencias(tendenciasData)
      } catch (error) {
        setError('Erro ao carregar dados de mecânicos. Verifique se o backend está rodando.')
        setMecanicos([])
        setPerformanceMecanicos([])
        setTendencias([])
      } finally {
        setLoading(false)
      }
    }
    fetchMecanicos()
  }, [])

  const filteredMecanicos = mecanicos.filter(mecanico =>
    mecanico.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mecanico.especialidade.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calcular performance comparativa real
  const performanceComparativa = mecanicos.slice(0, 5).map(m => ({
    mecanico: m.nome.split(' ')[0] + ' ' + (m.nome.split(' ')[1]?.charAt(0) || '') + '.',
    qualidade: m.qualidade,
    produtividade: m.produtividade,
    pontualidade: m.pontualidade,
    satisfacao: Math.round((m.qualidade + m.produtividade + m.pontualidade) / 3)
  }))

  // Calcular produtividade mensal real
  // Agrupar tendências por mês e por mecânico (se disponível)
  const produtividadeMensal = tendencias.map(t => ({
    mes: `${t.periodo.split('-')[1]}/${t.periodo.split('-')[0]}`,
    total: t.quantidade
  }))

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

  // Estatísticas rápidas reais
  const qualidadeMedia = mecanicos.length > 0 ? (mecanicos.reduce((sum, m) => sum + (m.qualidade || 0), 0) / mecanicos.length) : 0;
  const tempoMedio = mecanicos.length > 0 ? (mecanicos.reduce((sum, m) => sum + (m.tempoMedioReparo || 0), 0) / mecanicos.length) : 0;
  const produtividadeMedia = mecanicos.length > 0 ? (mecanicos.reduce((sum, m) => sum + (m.produtividade || 0), 0) / mecanicos.length) : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gestão de Mecânicos</h2>
            <p className="text-sm text-gray-600 mt-1">Carregando dados...</p>
          </div>
        </div>
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
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gestão de Mecânicos</h2>
            <p className="text-sm text-gray-600 mt-1">Erro ao carregar dados</p>
          </div>
        </div>
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
      </div>
    )
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
                <p className="text-2xl font-bold text-green-600">{qualidadeMedia.toFixed(1)}%</p>
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
                <p className="text-2xl font-bold text-orange-600">{tempoMedio.toFixed(1)}h</p>
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
                <p className="text-2xl font-bold text-purple-600">{produtividadeMedia.toFixed(1)}%</p>
                <p className="text-xs text-gray-500">eficiência geral</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cards dos Mecânicos */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredMecanicos.map((mecanico) => (
          <Card key={mecanico.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gray-100 text-gray-700 font-medium">
                        {mecanico.iniciais}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(mecanico.qualidade)}`}></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{mecanico.nome}</h3>
                    <p className="text-sm text-gray-600">{mecanico.especialidade}</p>
                  </div>
                </div>
                <Badge className={`text-xs ${getQualityColor(mecanico.qualidade)}`}>
                  {mecanico.qualidade}%
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">OS Completas</span>
                  <span className="font-medium">{mecanico.osCompletas}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tempo Médio</span>
                  <span className="font-medium">{mecanico.tempoMedioReparo}h</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Experiência</span>
                  <span className="font-medium">{mecanico.experiencia} anos</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avaliação</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{mecanico.avaliacaoCliente}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-600 mb-2">Especialidades:</p>
                <div className="flex flex-wrap gap-1">
                  {mecanico.defeitosResolvidos.map((defeito, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {defeito}
                    </Badge>
                  ))}
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

