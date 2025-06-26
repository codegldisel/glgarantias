import { Search, Bell, User } from 'lucide-react'

const Header = () => {
  const currentMonth = new Date().toLocaleDateString('pt-BR', { 
    month: 'long', 
    year: 'numeric' 
  })

  return (
    <header className="bg-background border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard de Garantias</h1>
          <p className="text-muted-foreground">
            Análise de ordens de serviço - {currentMonth}
          </p>
        </div>

        {/* Search and Actions */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar ordens, defeitos..."
              className="pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring w-64"
            />
          </div>

          {/* Notifications */}
          <button className="p-2 hover:bg-accent rounded-lg transition-colors">
            <Bell className="h-5 w-5 text-foreground" />
          </button>

          {/* User */}
          <button className="p-2 hover:bg-accent rounded-lg transition-colors">
            <User className="h-5 w-5 text-foreground" />
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header

