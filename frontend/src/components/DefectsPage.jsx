import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Search, Filter, AlertTriangle, TrendingUp, Eye, Download } from 'lucide-react'

const DefectsPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('todos')
  const [selectedSeverity, setSelectedSeverity] = useState('todos')
  const [defeitos, setDefeitos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDefeitos = async () => {
      setLoading(true)
      try {
        // O endpoint correto para análise de defeitos
        const res = await fetch(`/api/analises/dados`) 
        if (!res.ok) {
          // Lança um erro com a mensagem do servidor se a resposta não for OK
          const errorData = await res.json();
          throw new Error(errorData.error || 'Falha ao buscar dados de análise.');
        }
        const json = await res.json()
        // A rota /api/analises/dados retorna um objeto que contém a chave 'defeitos'
        setDefeitos(json.defeitos || []) 
      } catch (e) {
        console.error("Erro ao buscar defeitos:", e.message);
        setDefeitos([])
        // Opcional: Adicionar um estado para exibir a mensagem de erro na UI
        // setErrorMessage(e.message); 
      } finally {
        setLoading(false)
      }
    }
    fetchDefeitos()
  }, [])

  // Filtros e busca
  const filteredDefects = defeitos.filter(defeito => {
    const matchesSearch = searchTerm === '' || (
      defeito.defeito_texto_bruto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      defeito.defeito_grupo?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    const matchesCategory = selectedCategory === 'todos' || defeito.defeito_grupo === selectedCategory
    // Supondo que severidade venha do campo defeito.severidade
    const matchesSeverity = selectedSeverity === 'todos' || defeito.severidade === selectedSeverity
    return matchesSearch && matchesCategory && matchesSeverity
  })

  // Estatísticas rápidas
  const totalDefeitos = filteredDefects.length
  const maisFrequente = (() => {
    const count = {}
    filteredDefects.forEach(d => {
      if (d.defeito_grupo) count[d.defeito_grupo] = (count[d.defeito_grupo] || 0) + 1
    })
    const sorted = Object.entries(count).sort((a, b) => b[1] - a[1])
    return sorted.length > 0 ? { categoria: sorted[0][0], ocorrencias: sorted[0][1] } : null
  })()
  const custoMedio = filteredDefects.length > 0 ? (filteredDefects.reduce((acc, d) => acc + (d.total_geral || 0), 0) / filteredDefects.length) : 0
  const tempoMedio = filteredDefects.length > 0 ? (filteredDefects.reduce((acc, d) => acc + (d.tempo_reparo || 0), 0) / filteredDefects.length) : 0

  const defeitosPorMes = [
    { mes: 'Jan', vazamentos: 12, funcionamento: 8, ruidos: 5, quebras: 3, combustao: 4, desgaste: 2 },
    { mes: 'Fev', vazamentos: 15, funcionamento: 12, ruidos: 7, quebras: 4, combustao: 6, desgaste: 3 },
    { mes: 'Mar', vazamentos: 18, funcionamento: 10, ruidos: 9, quebras: 6, combustao: 5, desgaste: 4 },
    { mes: 'Abr', vazamentos: 14, funcionamento: 15, ruidos: 6, quebras: 5, combustao: 7, desgaste: 3 },
    { mes: 'Mai', vazamentos: 20, funcionamento: 18, ruidos: 8, quebras: 7, combustao: 8, desgaste: 5 },
    { mes: 'Jun', vazamentos: 16, funcionamento: 14, ruidos: 10, quebras: 4, combustao: 6, desgaste: 4 }
  ]

  const getSeverityColor = (severidade) => {
    switch (severidade) {
      case 'Crítica': return 'bg-red-100 text-red-800 border-red-200'
      case 'Alta': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'Média': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Baixa': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTrendIcon = (tendencia) => {
    switch (tendencia) {
      case 'crescente': return <TrendingUp className="h-4 w-4 text-red-500" />
      case 'decrescente': return <TrendingUp className="h-4 w-4 text-green-500 rotate-180" />
      case 'estavel': return <div className="h-4 w-4 bg-gray-400 rounded-full"></div>
      default: return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Análise de Defeitos</h2>
          <p className="text-sm text-gray-600 mt-1">
            Classificação detalhada e análise de padrões de defeitos
          </p>
        </div>
        
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Exportar Relatório
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por descrição ou categoria..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas as Categorias</SelectItem>
                <SelectItem value="Vazamentos">Vazamentos</SelectItem>
                <SelectItem value="Problemas de Funcionamento">Funcionamento</SelectItem>
                <SelectItem value="Ruídos e Vibrações">Ruídos e Vibrações</SelectItem>
                <SelectItem value="Quebra/Dano Estrutural">Quebra/Dano</SelectItem>
                <SelectItem value="Problemas de Combustão">Combustão</SelectItem>
                <SelectItem value="Desgaste e Folga">Desgaste</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Severidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                <SelectItem value="Crítica">Crítica</SelectItem>
                <SelectItem value="Alta">Alta</SelectItem>
                <SelectItem value="Média">Média</SelectItem>
                <SelectItem value="Baixa">Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Rápidas */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Defeitos</p>
                <p className="text-2xl font-bold text-gray-900">{totalDefeitos}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Mais Frequente</p>
                <p className="text-lg font-bold text-red-600">{maisFrequente ? maisFrequente.categoria : '-'}</p>
                <p className="text-xs text-gray-500">{maisFrequente ? `${maisFrequente.ocorrencias} ocorrências` : '-'}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Custo Médio</p>
                <p className="text-2xl font-bold text-blue-600">{custoMedio > 0 ? `R$ ${custoMedio.toFixed(2)}` : '-'}</p>
                <p className="text-xs text-gray-500">por reparo</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tempo Médio</p>
                <p className="text-2xl font-bold text-green-600">{tempoMedio > 0 ? `${tempoMedio.toFixed(1)}h` : '-'}</p>
                <p className="text-xs text-gray-500">de reparo</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Tendência */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução dos Defeitos por Mês</CardTitle>
          <CardDescription>
            Acompanhamento da frequência de cada tipo de defeito ao longo do tempo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={defeitosPorMes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="vazamentos" fill="#ef4444" name="Vazamentos" />
              <Bar dataKey="funcionamento" fill="#f97316" name="Funcionamento" />
              <Bar dataKey="ruidos" fill="#eab308" name="Ruídos" />
              <Bar dataKey="quebras" fill="#22c55e" name="Quebras" />
              <Bar dataKey="combustao" fill="#3b82f6" name="Combustão" />
              <Bar dataKey="desgaste" fill="#8b5cf6" name="Desgaste" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabela Detalhada de Defeitos */}
      <Card>
        <CardHeader>
          <CardTitle>Defeitos Detalhados</CardTitle>
          <CardDescription>
            Lista completa com classificação hierárquica e métricas de cada defeito
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Descrição</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Categoria</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Frequência</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Severidade</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Tempo Médio</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Custo Médio</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Tendência</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredDefects.map((defeito) => (
                  <tr key={defeito.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{defeito.defeito_texto_bruto}</p>
                        <p className="text-sm text-gray-500">
                          {defeito.defeito_grupo} → {defeito.defeito_subgrupo}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-xs">
                        {defeito.defeito_grupo}
                      </Badge>
                    </td>
                    <td className="text-center py-3 px-4 font-medium">{defeito.frequencia}</td>
                    <td className="text-center py-3 px-4">
                      <Badge className={`text-xs ${getSeverityColor(defeito.severidade)}`}>
                        {defeito.severidade}
                      </Badge>
                    </td>
                    <td className="text-center py-3 px-4">{defeito.tempo_reparo}h</td>
                    <td className="text-center py-3 px-4">R$ {defeito.total_geral?.toFixed(2) || '-'}</td>
                    <td className="text-center py-3 px-4">
                      <div className="flex justify-center">
                        {getTrendIcon(defeito.tendencia)}
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Insights sobre Defeitos */}
      <Card>
        <CardHeader>
          <CardTitle>Insights e Padrões Identificados</CardTitle>
          <CardDescription>
            Análises automáticas baseadas nos padrões de defeitos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-medium text-red-900 mb-2">🔴 Defeito Crítico em Crescimento</h4>
              <p className="text-sm text-red-700">
                "Vazamentos de óleo" apresentam tendência crescente (+25% nos últimos 3 meses). 
                Recomenda-se investigação dos fornecedores de juntas e procedimentos de montagem.
              </p>
            </div>
            
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">⚠️ Padrão Sazonal Detectado</h4>
              <p className="text-sm text-yellow-700">
                Problemas de superaquecimento aumentam 40% nos meses mais quentes (Dez-Mar). 
                Considere ajustes preventivos no sistema de arrefecimento.
              </p>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">📊 Correlação Identificada</h4>
              <p className="text-sm text-blue-700">
                Defeitos de "casquilho rodado" têm 80% de correlação com motores de alta quilometragem. 
                Implementar inspeção preventiva pode reduzir custos.
              </p>
            </div>
            
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">✅ Melhoria Detectada</h4>
              <p className="text-sm text-green-700">
                Defeitos de "válvula gastou" reduziram 30% após implementação do novo procedimento 
                de regulagem. Continuar monitoramento.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DefectsPage

