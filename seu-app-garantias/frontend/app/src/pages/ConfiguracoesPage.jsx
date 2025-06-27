import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { 
  Settings, 
  Database, 
  Bell,
  Shield,
  Palette,
  Globe,
  Save,
  RefreshCw
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

const ConfiguracoesPage = () => {
  const { t, i18n } = useTranslation()
  const [saving, setSaving] = useState(false)
  const [configs, setConfigs] = useState({
    // Configurações Gerais
    nomeEmpresa: 'GarantiasPulse',
    emailContato: 'contato@garantiaspulse.com',
    telefone: '(11) 99999-9999',
    
    // Configurações do Sistema
    autoBackup: true,
    backupHorario: '02:00',
    retencaoDados: '365',
    
    // Notificações
    emailNotificacoes: true,
    notificacaoOS: true,
    notificacaoDefeitos: true,
    notificacaoRelatorios: false,
    
    // Segurança
    sessaoTimeout: '30',
    senhaComplexidade: true,
    logAuditoria: true,
    
    // Interface
    tema: 'system',
    idioma: 'pt-BR',
    densidade: 'normal'
  })

  const handleSave = async () => {
    setSaving(true)
    
    // Simular salvamento
    setTimeout(() => {
      setSaving(false)
    }, 2000)
  }

  const handleConfigChange = (key, value) => {
    setConfigs(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleLanguageChange = (newLang) => {
    handleConfigChange('idioma', newLang)
    i18n.changeLanguage(newLang)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">
            Gerenciar configurações do sistema
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Recarregar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={saving}
            size="sm"
          >
            {saving ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Salvando...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Save className="h-4 w-4" />
                <span>Salvar</span>
              </div>
            )}
          </Button>
        </div>
      </div>

      {/* Configurações Tabs */}
      <Tabs defaultValue="geral" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="sistema">Sistema</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          <TabsTrigger value="seguranca">Segurança</TabsTrigger>
          <TabsTrigger value="interface">Interface</TabsTrigger>
        </TabsList>

        {/* Configurações Gerais */}
        <TabsContent value="geral">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações Gerais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nomeEmpresa">Nome da Empresa</Label>
                  <Input
                    id="nomeEmpresa"
                    value={configs.nomeEmpresa}
                    onChange={(e) => handleConfigChange('nomeEmpresa', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="emailContato">Email de Contato</Label>
                  <Input
                    id="emailContato"
                    type="email"
                    value={configs.emailContato}
                    onChange={(e) => handleConfigChange('emailContato', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={configs.telefone}
                    onChange={(e) => handleConfigChange('telefone', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações do Sistema */}
        <TabsContent value="sistema">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Configurações do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Backup Automático</Label>
                  <p className="text-sm text-muted-foreground">
                    Realizar backup automático dos dados
                  </p>
                </div>
                <Switch
                  checked={configs.autoBackup}
                  onCheckedChange={(checked) => handleConfigChange('autoBackup', checked)}
                />
              </div>

              {configs.autoBackup && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="backupHorario">Horário do Backup</Label>
                    <Input
                      id="backupHorario"
                      type="time"
                      value={configs.backupHorario}
                      onChange={(e) => handleConfigChange('backupHorario', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="retencaoDados">Retenção de Dados (dias)</Label>
                    <Input
                      id="retencaoDados"
                      type="number"
                      value={configs.retencaoDados}
                      onChange={(e) => handleConfigChange('retencaoDados', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notificações */}
        <TabsContent value="notificacoes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Configurações de Notificações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações por Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber notificações por email
                  </p>
                </div>
                <Switch
                  checked={configs.emailNotificacoes}
                  onCheckedChange={(checked) => handleConfigChange('emailNotificacoes', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Novas Ordens de Serviço</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificar sobre novas OS criadas
                  </p>
                </div>
                <Switch
                  checked={configs.notificacaoOS}
                  onCheckedChange={(checked) => handleConfigChange('notificacaoOS', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Defeitos Não Mapeados</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificar sobre defeitos que precisam ser mapeados
                  </p>
                </div>
                <Switch
                  checked={configs.notificacaoDefeitos}
                  onCheckedChange={(checked) => handleConfigChange('notificacaoDefeitos', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Relatórios Prontos</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificar quando relatórios estiverem prontos
                  </p>
                </div>
                <Switch
                  checked={configs.notificacaoRelatorios}
                  onCheckedChange={(checked) => handleConfigChange('notificacaoRelatorios', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Segurança */}
        <TabsContent value="seguranca">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Configurações de Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="sessaoTimeout">Timeout de Sessão (minutos)</Label>
                <Input
                  id="sessaoTimeout"
                  type="number"
                  value={configs.sessaoTimeout}
                  onChange={(e) => handleConfigChange('sessaoTimeout', e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Complexidade de Senha</Label>
                  <p className="text-sm text-muted-foreground">
                    Exigir senhas complexas (maiúsculas, números, símbolos)
                  </p>
                </div>
                <Switch
                  checked={configs.senhaComplexidade}
                  onCheckedChange={(checked) => handleConfigChange('senhaComplexidade', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Log de Auditoria</Label>
                  <p className="text-sm text-muted-foreground">
                    Registrar todas as ações dos usuários
                  </p>
                </div>
                <Switch
                  checked={configs.logAuditoria}
                  onCheckedChange={(checked) => handleConfigChange('logAuditoria', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Interface */}
        <TabsContent value="interface">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Configurações de Interface
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Tema</Label>
                <div className="flex space-x-2">
                  {['light', 'dark', 'system'].map((tema) => (
                    <Button
                      key={tema}
                      variant={configs.tema === tema ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleConfigChange('tema', tema)}
                    >
                      {tema === 'light' ? 'Claro' : tema === 'dark' ? 'Escuro' : 'Sistema'}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Idioma
                </Label>
                <div className="flex space-x-2">
                  <Button
                    variant={configs.idioma === 'pt-BR' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleLanguageChange('pt-BR')}
                  >
                    Português
                  </Button>
                  <Button
                    variant={configs.idioma === 'en' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleLanguageChange('en')}
                  >
                    English
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Densidade da Interface</Label>
                <div className="flex space-x-2">
                  {['compacta', 'normal', 'espaçosa'].map((densidade) => (
                    <Button
                      key={densidade}
                      variant={configs.densidade === densidade ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleConfigChange('densidade', densidade)}
                    >
                      {densidade.charAt(0).toUpperCase() + densidade.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ConfiguracoesPage

