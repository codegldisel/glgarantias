import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'
import { 
  TrendingUp, 
  BarChart3, 
  PieChart as PieChartIcon,
  Calendar,
  Download
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

const AnalisesPage = () => {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)

  // Dados mockados para demonstração
  const [defeitosData] = useState([
    { nome: 'Problema Elétrico', quantidade: 45, valor: 25000 },
    { nome: 'Falha Mecânica', quantidade: 32, valor: 18500 },
    { nome: 'Desgaste Natural', quantidade: 28, valor: 15200 },
    { nome: 'Problema Hidráulico', quantidade: 22, valor: 12800 },
    { nome: 'Outros', quantidade: 18, valor: 9500 }
  ])

  const [tendenciaData] = useState([
    { mes: 'Jan', os: 65, valor: 45000 },
    { mes: 'Fev', os: 72, valor: 52000 },
    { mes: 'Mar', os: 68, valor: 48000 },
    { mes: 'Abr', os: 85, valor: 62000 },
    { mes: 'Mai', os: 78, valor: 58000 },
    { mes: 'Jun', os: 92, valor: 68000 }
  ])

  const [mecanicosData] = useState([
    { nome: 'João Silva', os: 28, eficiencia: 95 },
    { nome: 'Pedro Santos', os: 24, eficiencia: 92 },
    { nome: 'Carlos Lima', os: 22, eficiencia: 88 },
    { nome: 'Ana Costa', os: 20, eficiencia: 94 },
    { nome: 'Roberto Alves', os: 18, eficiencia: 90 }
  ])

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  useEffect(() => {
    // Simular carregamento
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Análises</h1>
            <p className="text-muted-foreground">Análises detalhadas e relatórios</p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-64 bg-muted animate-pulse rounded"></div>
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
          <h1 className="text-3xl font-bold">Análises</h1>
          <p className="text-muted-foreground">
            Análises detalhadas e relatórios de garantias
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Período
          </Button>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Defeitos por Tipo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Defeitos por Tipo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={defeitosData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="nome" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'quantidade' ? `${value} OS` : `R$ ${value.toLocaleString('pt-BR')}`,
                    name === 'quantidade' ? 'Quantidade' : 'Valor Total'
                  ]}
                />
                <Bar dataKey="quantidade" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição de Valores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Distribuição de Valores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={defeitosData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ nome, percent }) => `${nome}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="valor"
                >
                  {defeitosData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Valor']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tendência Mensal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tendência Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={tendenciaData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'os' ? `${value} OS` : `R$ ${value.toLocaleString('pt-BR')}`,
                    name === 'os' ? 'Ordens de Serviço' : 'Valor Total'
                  ]}
                />
                <Line yAxisId="left" type="monotone" dataKey="os" stroke="#8884d8" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="valor" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance dos Mecânicos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance dos Mecânicos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mecanicosData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="nome" type="category" width={100} fontSize={12} />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'os' ? `${value} OS` : `${value}%`,
                    name === 'os' ? 'Ordens Concluídas' : 'Eficiência'
                  ]}
                />
                <Bar dataKey="os" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Defeito Mais Comum</p>
                <p className="text-2xl font-bold">Problema Elétrico</p>
                <p className="text-xs text-muted-foreground">45 ocorrências</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mecânico Destaque</p>
                <p className="text-2xl font-bold">João Silva</p>
                <p className="text-xs text-muted-foreground">95% eficiência</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Crescimento Mensal</p>
                <p className="text-2xl font-bold text-green-600">+18%</p>
                <p className="text-xs text-muted-foreground">vs mês anterior</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor Médio OS</p>
                <p className="text-2xl font-bold">R$ 1.245</p>
                <p className="text-xs text-muted-foreground">por ordem</p>
              </div>
              <PieChartIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AnalisesPage

