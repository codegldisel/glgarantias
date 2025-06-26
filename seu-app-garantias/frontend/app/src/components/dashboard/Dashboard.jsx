import { useState, useEffect } from 'react'
import { 
  FileText, 
  AlertTriangle, 
  Users, 
  DollarSign,
  TrendingUp,
  Calendar
} from 'lucide-react'
import MetricCard from './MetricCard'
import OSTable from './OSTable'
import ApiService from '../../services/api'

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    totalOS: 0,
    totalPecas: 0,
    totalServicos: 0,
    totalGeral: 0,
    mecanicos: 0,
    defeitosComuns: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const response = await ApiService.getOrdensDoMesAtual()
      
      if (response && response.data) {
        const ordens = response.data
        
        // Calcular métricas
        const totalOS = ordens.length
        const totalPecas = ordens.reduce((sum, os) => sum + (parseFloat(os.total_pecas) || 0), 0)
        const totalServicos = ordens.reduce((sum, os) => sum + (parseFloat(os.total_servicos) || 0), 0)
        const totalGeral = ordens.reduce((sum, os) => sum + (parseFloat(os.total_geral) || 0), 0)
        
        // Contar mecânicos únicos
        const mecanicosUnicos = new Set(
          ordens
            .map(os => os.mecanico_montador)
            .filter(mecanico => mecanico && mecanico.trim() !== '')
        )
        
        // Contar defeitos mais comuns
        const defeitosCount = {}
        ordens.forEach(os => {
          if (os.defeito && os.defeito.trim() !== '') {
            defeitosCount[os.defeito] = (defeitosCount[os.defeito] || 0) + 1
          }
        })
        
        setMetrics({
          totalOS,
          totalPecas,
          totalServicos,
          totalGeral,
          mecanicos: mecanicosUnicos.size,
          defeitosComuns: Object.keys(defeitosCount).length
        })
      }
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err)
      setError('Erro ao carregar dados. Verifique se o backend está rodando.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  const currentMonth = new Date().toLocaleDateString('pt-BR', { 
    month: 'long', 
    year: 'numeric' 
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Análises Gerais</h2>
          <p className="text-muted-foreground">
            Resumo das ordens de serviço de {currentMonth}
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Atualizado agora</span>
        </div>
      </div>

      {/* Error Alert (se houver erro) */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <div>
              <h4 className="font-semibold text-destructive">Erro de conexão</h4>
              <p className="text-sm text-muted-foreground">{error}</p>
              <button 
                onClick={loadDashboardData}
                className="mt-2 px-3 py-1 text-xs bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard
          title="Total de OS"
          value={metrics.totalOS}
          icon={FileText}
          description="Ordens de serviço do mês"
          hasError={!!error}
        />
        
        <MetricCard
          title="Total Peças"
          value={`R$ ${metrics.totalPecas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          description="Valor total em peças"
          hasError={!!error}
        />
        
        <MetricCard
          title="Total Serviços"
          value={`R$ ${metrics.totalServicos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={TrendingUp}
          description="Valor total em serviços"
          hasError={!!error}
        />
        
        <MetricCard
          title="Total Geral"
          value={`R$ ${metrics.totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          description="Valor total das OS"
          hasError={!!error}
        />
        
        <MetricCard
          title="Mecânicos Ativos"
          value={metrics.mecanicos}
          icon={Users}
          description="Mecânicos trabalhando"
          hasError={!!error}
        />
        
        <MetricCard
          title="Tipos de Defeitos"
          value={metrics.defeitosComuns}
          icon={AlertTriangle}
          description="Defeitos identificados"
          hasError={!!error}
        />
      </div>

      {/* Additional Info */}
      <div className="bg-muted/50 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-primary rounded-full"></div>
          <span>
            Os dados são atualizados automaticamente conforme novas ordens de serviço são processadas.
          </span>
        </div>
      </div>

      {/* Tabela de Ordens de Serviço */}
      <OSTable />
    </div>
  )
}

export default Dashboard

