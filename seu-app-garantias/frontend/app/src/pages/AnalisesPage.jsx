import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  BarChart3, 
  PieChart as PieChartIcon,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react'
import { DefeitosBarChart, ValoresLineChart, MecanicosPieChart } from '../components/charts'

const AnalisesPage = () => {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
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
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
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
              Defeitos Mais Comuns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DefeitosBarChart key={`defeitos-${refreshKey}`} />
          </CardContent>
        </Card>

        {/* Distribuição por Mecânicos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Distribuição por Mecânico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MecanicosPieChart key={`mecanicos-${refreshKey}`} />
          </CardContent>
        </Card>

        {/* Evolução dos Valores */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Evolução dos Valores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ValoresLineChart key={`valores-${refreshKey}`} />
          </CardContent>
        </Card>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Dados em Tempo Real</p>
                <p className="text-lg font-bold">Conectado</p>
                <p className="text-xs text-muted-foreground">API funcionando</p>
              </div>
              <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fonte de Dados</p>
                <p className="text-lg font-bold">Supabase</p>
                <p className="text-xs text-muted-foreground">Base de dados</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Atualização</p>
                <p className="text-lg font-bold">Automática</p>
                <p className="text-xs text-muted-foreground">Em tempo real</p>
              </div>
              <RefreshCw className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Visualização</p>
                <p className="text-lg font-bold">Recharts</p>
                <p className="text-xs text-muted-foreground">Biblioteca de gráficos</p>
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

