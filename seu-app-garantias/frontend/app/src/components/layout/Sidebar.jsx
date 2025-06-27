import { 
  BarChart3, 
  FileText, 
  Settings, 
  Home,
  TrendingUp,
  Database,
  Users,
  ChevronLeft,
  Upload
} from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logoLucio from '../../assets/logo-lucio.png'

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const location = useLocation()

  const menuItems = [
    { icon: Home, label: 'Dashboard', to: '/' },
    { icon: FileText, label: 'Ordens de Serviço', to: '/ordens-servico' },
    { icon: Upload, label: 'Upload Excel', to: '/upload-excel' },
    { icon: BarChart3, label: 'Análises', to: '/analises' },
    { icon: Database, label: 'Defeitos', to: '/defeitos' },
    { icon: Users, label: 'Mecânicos', to: '/mecanicos' },
    { icon: TrendingUp, label: 'Relatórios', to: '/relatorios' },
    { icon: Settings, label: 'Configurações', to: '/configuracoes' }
  ]

  return (
    <nav
      className={`bg-sidebar border-r border-sidebar-border transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      } h-screen flex flex-col`}
      aria-label="Menu lateral"
      role="navigation"
    >
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        {!isCollapsed && (
          <img src={logoLucio} alt="Retífica de Motores Lúcio" className="h-10" />
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-md hover:bg-sidebar-accent text-sidebar-foreground transition-colors"
          aria-label={isCollapsed ? 'Expandir menu' : 'Colapsar menu'}
        >
          <ChevronLeft className={`h-4 w-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Navigation */}
      <ul className="flex-1 p-4 space-y-2" role="menu">
        {menuItems.map((item, index) => {
          const Icon = item.icon
          const isActive = location.pathname === item.to
          return (
            <li key={index} role="none">
              <Link
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
                aria-label={item.label}
                role="menuitem"
                tabIndex={0}
              >
                <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                {!isCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default Sidebar

