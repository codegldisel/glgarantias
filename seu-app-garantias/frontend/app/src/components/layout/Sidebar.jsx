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

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const menuItems = [
    { icon: Home, label: 'Dashboard', active: true },
    { icon: FileText, label: 'Ordens de Serviço' },
    { icon: Upload, label: 'Upload Excel' },
    { icon: BarChart3, label: 'Análises' },
    { icon: Database, label: 'Defeitos' },
    { icon: Users, label: 'Mecânicos' },
    { icon: TrendingUp, label: 'Relatórios' },
    { icon: Settings, label: 'Configurações' }
  ]

  return (
    <div className={`bg-sidebar border-r border-sidebar-border transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } h-screen flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        {!isCollapsed && (
          <h1 className="text-sidebar-foreground font-bold text-lg">
            GarantiasPulse
          </h1>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-md hover:bg-sidebar-accent text-sidebar-foreground transition-colors"
        >
          <ChevronLeft className={`h-4 w-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon
            return (
              <li key={index}>
                <a
                  href="#"
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    item.active 
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}

export default Sidebar

