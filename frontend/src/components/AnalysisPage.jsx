import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts'
import { TrendingUp, Calendar, Filter, Download, BarChart3 } from 'lucide-react'

const AnalysisPage = () => {
  const [loading, setLoading] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('mes')
  const [selectedYear, setSelectedYear] = useState('2025')

  // Dados de exemplo para demonstração
  const defeitosTemporais = [
    { periodo: 'Jan', vazamentos: 12, funcionamento: 8, ruidos: 5, quebras: 3 },
    { periodo: 'Fev', vazamentos: 15, funcionamento: 12, ruidos: 7, quebras: 4 },
    { periodo: 'Mar', vazamentos: 18, funcionamento: 10, ruidos: 9, quebras: 6 },
    { periodo: 'Abr', vazamentos: 14, funcionamento: 15, ruidos: 6, quebras: 5 },
    { periodo: 'Mai', vazamentos: 20, funcionamento: 18, ruidos: 8, quebras: 7 },
    { periodo: 'Jun', vazamentos: 16, funcionamento: 14, ruidos: 10, quebras: 4 }
  ]

  const defeitosPorCategoria = [
    { nome: 'Vazamentos', valor: 95, cor: '#ef4444' },
    { nome: 'Problemas de Funcionamento', valor: 77, cor: '#f97316' },
    { nome: 'Ruídos e Vibrações', valor: 45, cor: '#eab308' },
    { nome: 'Quebra/Dano Estrutural', valor: 29, cor: '#22c55e' },
    { nome: 'Problemas de Combustão', valor: 18, cor: '#3b82f6' },
    { nome: 'Desgaste e Folga', valor: 12, cor: '#8b5cf6' }
  ]

  const eficienciaMecanicos = [
    { nome: 'Carlos Eduardo', osCompletas: 45, tempoMedio: 2.3, qualidade: 95 },
    { nome: 'Wilson Silva', osCompletas: 38, tempoMedio: 2.8, qualidade: 92 },
    { nome: 'Gilson Paula', osCompletas: 42, tempoMedio: 2.5, qualidade: 88 },
    { nome: 'Paulo Roberto', osCompletas: 35, tempoMedio: 3.1, qualidade: 90 },
    { nome: 'Jean Santos', osCompletas: 40, tempoMedio: 2.7, qualidade: 87 }
  ]

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Análises Avançadas</h2>
          <p className="text-sm text-gray-600 mt-1">
            Insights detalhados sobre defeitos, tendências e performance
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mes">Mensal</SelectItem>
              <SelectItem value="trimestre">Trimestral</SelectItem>
              <SelectItem value="semestre">Semestral</SelectItem>
              <SelectItem value="ano">Anual</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPIs de Análise */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa de Reincidência</p>
                <p className="text-2xl font-bold text-red-600">12.5%</p>
                <p className="text-xs text-gray-500 mt-1">↓ 2.3% vs mês anterior</p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tempo Médio Reparo</p>
                <p className="text-2xl font-bold text-blue-600">2.7h</p>
                <p className="text-xs text-gray-500 mt-1">↑ 0.2h vs mês anterior</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Defeito Mais Comum</p>
                <p className="text-2xl font-bold text-orange-600">Vazamentos</p>
                <p className="text-xs text-gray-500 mt-1">38% dos casos</p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Satisfação Cliente</p>
                <p className="text-2xl font-bold text-green-600">94.2%</p>
                <p className="text-xs text-gray-500 mt-1">↑ 1.8% vs mês anterior</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de Análise */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tendência Temporal de Defeitos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Tendência de Defeitos por Período
            </CardTitle>
            <CardDescription>
              Evolução dos principais tipos de defeitos ao longo do tempo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={defeitosTemporais}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="periodo" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="vazamentos" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                <Area type="monotone" dataKey="funcionamento" stackId="1" stroke="#f97316" fill="#f97316" fillOpacity={0.6} />
                <Area type="monotone" dataKey="ruidos" stackId="1" stroke="#eab308" fill="#eab308" fillOpacity={0.6} />
                <Area type="monotone" dataKey="quebras" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição de Defeitos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Distribuição de Defeitos
            </CardTitle>
            <CardDescription>
              Proporção dos diferentes tipos de defeitos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={defeitosPorCategoria}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ nome, valor }) => `${nome}: ${valor}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="valor"
                >
                  {defeitosPorCategoria.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance dos Mecânicos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance dos Mecânicos
          </CardTitle>
          <CardDescription>
            Análise de eficiência e qualidade por mecânico
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Mecânico</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">OS Completas</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Tempo Médio (h)</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Qualidade (%)</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {eficienciaMecanicos.map((mecanico, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{mecanico.nome}</td>
                    <td className="text-center py-3 px-4">{mecanico.osCompletas}</td>
                    <td className="text-center py-3 px-4">{mecanico.tempoMedio}</td>
                    <td className="text-center py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        mecanico.qualidade >= 90 
                          ? 'bg-green-100 text-green-800' 
                          : mecanico.qualidade >= 85 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {mecanico.qualidade}%
                      </span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        mecanico.qualidade >= 90 
                          ? 'bg-green-100 text-green-800' 
                          : mecanico.qualidade >= 85 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {mecanico.qualidade >= 90 ? 'Excelente' : mecanico.qualidade >= 85 ? 'Bom' : 'Atenção'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Insights e Recomendações */}
      <Card>
        <CardHeader>
          <CardTitle>Insights e Recomendações</CardTitle>
          <CardDescription>
            Análises automáticas baseadas nos dados coletados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-medium text-red-900 mb-2">⚠️ Atenção: Aumento em Vazamentos</h4>
              <p className="text-sm text-red-700">
                Detectado aumento de 15% nos casos de vazamento nos últimos 2 meses. 
                Recomenda-se revisar os procedimentos de vedação e qualidade das juntas.
              </p>
            </div>
            
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">📊 Oportunidade: Otimização de Tempo</h4>
              <p className="text-sm text-yellow-700">
                O tempo médio de reparo aumentou 0.2h. Considere treinamento adicional 
                para os mecânicos com performance abaixo da média.
              </p>
            </div>
            
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">✅ Destaque: Melhoria na Satisfação</h4>
              <p className="text-sm text-green-700">
                A satisfação do cliente aumentou 1.8% este mês, indicando melhoria 
                na qualidade dos serviços prestados.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AnalysisPage

