import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { 
  BarChart3, 
  Upload, 
  Database, 
  FileText, 
  Settings, 
  Home,
  Users,
  Wrench,
  AlertTriangle,
  RefreshCw,
  Calendar
} from 'lucide-react'
import Dashboard from './components/Dashboard'
import UploadPage from './components/UploadPage'
import DataTable from './components/DataTable'
import AnalysisPage from './components/AnalysisPage'
import DefectsPage from './components/DefectsPage'
import MechanicsPage from './components/MechanicsPage'
import Reports from './components/Reports'
import SettingsComponent from './components/Settings'
import './App.css'

function App() {
  const [activeSection, setActiveSection] = useState('dashboard')

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'orders', label: 'Ordens de Serviço', icon: Wrench },
    { id: 'upload', label: 'Upload Excel', icon: Upload },
    { id: 'analysis', label: 'Análises', icon: BarChart3 },
    { id: 'defects', label: 'Defeitos', icon: AlertTriangle },
    { id: 'mechanics', label: 'Mecânicos', icon: Users },
    { id: 'reports', label: 'Relatórios', icon: FileText },
    { id: 'settings', label: 'Configurações', icon: Settings }
  ]

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />
      case 'upload':
        return <UploadPage />
      case 'orders':
        return <DataTable />
      case 'analysis':
        return <AnalysisPage />
      case 'defects':
        return <DefectsPage />
      case 'mechanics':
        return <MechanicsPage />
      case 'reports':
        return <Reports />
      case 'settings':
        return <SettingsComponent />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <img 
            src="/logo.png" 
            alt="Logo Retífica de Motores" 
            className="h-12 w-auto"
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.id
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    isActive 
                      ? 'bg-gray-900 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Análise de Garantias</h1>
              <p className="text-sm text-gray-600 mt-1">
                Análise de ordens de serviço - junho de 2025
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Atualizado agora
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}

export default App

