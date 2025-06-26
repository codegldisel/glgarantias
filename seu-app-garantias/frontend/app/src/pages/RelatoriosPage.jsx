import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Download, 
  Calendar,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Settings
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

const RelatoriosPage = () => {
  const { t } = useTranslation()
  const [generating, setGenerating] = useState(null)

  const relatorios = [
    {
      id: 1,
      titulo: 'Relatório Mensal de Garantias',
      descricao: 'Resumo completo das ordens de serviço do mês',
      tipo: 'mensal',
      icon: Calendar,
      formato: ['PDF', 'Excel'],
      ultimaGeracao: '2025-06-25',
      status: 'disponivel'
    },
    {
      id: 2,
      titulo: 'Análise de Defeitos',
      descricao: 'Estatísticas detalhadas dos tipos de defeitos',
      tipo: 'analise',
      icon: BarChart3,
      formato: ['PDF', 'Excel'],
      ultimaGeracao: '2025-06-24',
      status: 'disponivel'
    },
    {
      id: 3,
      titulo: 'Performance dos Mecânicos',
      descricao: 'Avaliação de produtividade e eficiência',
      tipo: 'performance',
      icon: Users,
      formato: ['PDF', 'Excel'],
      ultimaGeracao: '2025-06-23',
      status: 'disponivel'
    },
    {
      id: 4,
      titulo: 'Distribuição de Custos',
      descricao: 'Análise financeira de peças e serviços',
      tipo: 'financeiro',
      icon: PieChart,
      formato: ['PDF', 'Excel'],
      ultimaGeracao: '2025-06-22',
      status: 'disponivel'
    },
    {
      id: 5,
      titulo: 'Tendências Trimestrais',
      descricao: 'Evolução das garantias nos últimos 3 meses',
      tipo: 'tendencia',
      icon: TrendingUp,
      formato: ['PDF', 'Excel'],
      ultimaGeracao: '2025-06-20',
      status: 'desatualizado'
    },
    {
      id: 6,
      titulo: 'Relatório Customizado',
      descricao: 'Relatório personalizado com filtros específicos',
      tipo: 'customizado',
      icon: Settings,
      formato: ['PDF', 'Excel'],
      ultimaGeracao: null,
      status: 'novo'
    }
  ]

  const handleGenerate = async (relatorioId, formato) => {
    setGenerating(`${relatorioId}-${formato}`)
    
    // Simular geração de relatório
    setTimeout(() => {
      setGenerating(null)
      // Aqui seria feito o download do arquivo
      console.log(`Relatório ${relatorioId} gerado em ${formato}`)
    }, 3000)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'disponivel':
        return <Badge variant="default">Disponível</Badge>
      case 'desatualizado':
        return <Badge variant="destructive">Desatualizado</Badge>
      case 'novo':
        return <Badge variant="secondary">Novo</Badge>
      default:
        return <Badge variant="outline">Indefinido</Badge>
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'disponivel':
        return 'border-green-200 bg-green-50'
      case 'desatualizado':
        return 'border-red-200 bg-red-50'
      case 'novo':
        return 'border-blue-200 bg-blue-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground">
            Gerar e baixar relatórios de garantias
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Agendar Relatório
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Relatórios Disponíveis</p>
                <p className="text-2xl font-bold">
                  {relatorios.filter(r => r.status === 'disponivel').length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Desatualizados</p>
                <p className="text-2xl font-bold text-red-600">
                  {relatorios.filter(r => r.status === 'desatualizado').length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Novos Relatórios</p>
                <p className="text-2xl font-bold text-blue-600">
                  {relatorios.filter(r => r.status === 'novo').length}
                </p>
              </div>
              <Settings className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Relatórios</p>
                <p className="text-2xl font-bold">{relatorios.length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Relatórios Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {relatorios.map((relatorio) => {
          const IconComponent = relatorio.icon
          return (
            <Card key={relatorio.id} className={`transition-all hover:shadow-md ${getStatusColor(relatorio.status)}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{relatorio.titulo}</CardTitle>
                      {getStatusBadge(relatorio.status)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {relatorio.descricao}
                </p>

                {relatorio.ultimaGeracao && (
                  <div className="text-xs text-muted-foreground">
                    Última geração: {new Date(relatorio.ultimaGeracao).toLocaleDateString('pt-BR')}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {relatorio.formato.map((formato) => (
                    <Button
                      key={formato}
                      variant="outline"
                      size="sm"
                      onClick={() => handleGenerate(relatorio.id, formato)}
                      disabled={generating === `${relatorio.id}-${formato}`}
                      className="flex-1"
                    >
                      {generating === `${relatorio.id}-${formato}` ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                          <span>Gerando...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Download className="h-3 w-3" />
                          <span>{formato}</span>
                        </div>
                      )}
                    </Button>
                  ))}
                </div>

                {relatorio.tipo === 'customizado' && (
                  <Button variant="default" size="sm" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Configurar Relatório
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Relatórios Agendados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Relatórios Agendados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Relatório Mensal Automático</p>
                  <p className="text-sm text-muted-foreground">Todo dia 1º do mês às 08:00</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="default">Ativo</Badge>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <BarChart3 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Análise Semanal de Defeitos</p>
                  <p className="text-sm text-muted-foreground">Toda segunda-feira às 09:00</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="default">Ativo</Badge>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-center py-8 text-center">
              <div>
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Configure relatórios automáticos para receber atualizações regulares
                </p>
                <Button variant="outline" className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Agendar Novo Relatório
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default RelatoriosPage

