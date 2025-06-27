import { useApp } from '../../contexts/AppContext'
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react'

const ConnectionStatus = ({ className = '' }) => {
  const { state } = useApp()
  const { conexao } = state

  const getStatusConfig = () => {
    switch (conexao.status) {
      case 'connected':
        return {
          icon: Wifi,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          text: 'Conectado',
          description: 'API funcionando'
        }
      case 'disconnected':
        return {
          icon: WifiOff,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          text: 'Desconectado',
          description: 'Erro de conexão'
        }
      default:
        return {
          icon: AlertTriangle,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          text: 'Verificando',
          description: 'Status desconhecido'
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`p-1 rounded-full ${config.bgColor}`}>
        <Icon className={`h-3 w-3 ${config.color}`} />
      </div>
      <div className="text-xs">
        <p className={`font-medium ${config.color}`}>{config.text}</p>
        <p className="text-muted-foreground">{config.description}</p>
      </div>
      {conexao.ultimaVerificacao && (
        <div className="text-xs text-muted-foreground">
          {new Date(conexao.ultimaVerificacao).toLocaleTimeString()}
        </div>
      )}
    </div>
  )
}

export default ConnectionStatus

