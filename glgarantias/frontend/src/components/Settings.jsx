import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Switch } from '@/components/ui/switch.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Settings as SettingsIcon, Users, Brain, Database, Save, Trash2, Plus, AlertCircle } from 'lucide-react'

const Settings = () => {
  const [mechanics, setMechanics] = useState([
    { id: 1, name: 'João Silva', active: true },
    { id: 2, name: 'Carlos Eduardo', active: true },
    { id: 3, name: 'Paulo Roberto', active: true },
    { id: 4, name: 'Alexandre Cunha', active: false },
    { id: 5, name: 'Wilson Santos', active: true }
  ])
  
  const [newMechanic, setNewMechanic] = useState('')
  const [nlpSettings, setNlpSettings] = useState({
    confidenceThreshold: 0.7,
    autoClassification: true,
    customKeywords: ''
  })
  
  const [systemSettings, setSystemSettings] = useState({
    maxFileSize: 100,
    autoBackup: true,
    emailNotifications: false
  })

  const handleAddMechanic = () => {
    if (newMechanic.trim()) {
      const newId = Math.max(...mechanics.map(m => m.id)) + 1
      setMechanics([...mechanics, { id: newId, name: newMechanic.trim(), active: true }])
      setNewMechanic('')
    }
  }

  const handleToggleMechanic = (id) => {
    setMechanics(mechanics.map(m => 
      m.id === id ? { ...m, active: !m.active } : m
    ))
  }

  const handleRemoveMechanic = (id) => {
    setMechanics(mechanics.filter(m => m.id !== id))
  }

  const handleSaveSettings = () => {
    // Aqui seria feita a chamada para salvar as configurações
    console.log('Saving settings:', { nlpSettings, systemSettings, mechanics })
    alert('Configurações salvas com sucesso!')
  }

  return (
    <div className="space-y-6">
      {/* Gerenciamento de Mecânicos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gerenciamento de Mecânicos
          </CardTitle>
          <CardDescription>
            Adicione, remova ou desative mecânicos do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Adicionar Novo Mecânico */}
          <div className="flex gap-2">
            <Input
              placeholder="Nome do mecânico"
              value={newMechanic}
              onChange={(e) => setNewMechanic(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddMechanic()}
            />
            <Button onClick={handleAddMechanic} disabled={!newMechanic.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>

          {/* Lista de Mecânicos */}
          <div className="space-y-2">
            {mechanics.map((mechanic) => (
              <div key={mechanic.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{mechanic.name}</span>
                  <Badge variant={mechanic.active ? "default" : "secondary"}>
                    {mechanic.active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={mechanic.active}
                    onCheckedChange={() => handleToggleMechanic(mechanic.id)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMechanic(mechanic.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configurações de PLN */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Configurações de PLN
          </CardTitle>
          <CardDescription>
            Ajuste os parâmetros de classificação automática de defeitos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="confidence-threshold">
                Limite de Confiança ({(nlpSettings.confidenceThreshold * 100).toFixed(0)}%)
              </Label>
              <Input
                id="confidence-threshold"
                type="range"
                min="0.5"
                max="1"
                step="0.05"
                value={nlpSettings.confidenceThreshold}
                onChange={(e) => setNlpSettings({
                  ...nlpSettings,
                  confidenceThreshold: parseFloat(e.target.value)
                })}
              />
              <p className="text-xs text-muted-foreground">
                Classificações abaixo deste limite serão marcadas para revisão manual
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-classification">Classificação Automática</Label>
                <Switch
                  id="auto-classification"
                  checked={nlpSettings.autoClassification}
                  onCheckedChange={(checked) => setNlpSettings({
                    ...nlpSettings,
                    autoClassification: checked
                  })}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Ativar classificação automática de defeitos durante o upload
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-keywords">Palavras-chave Personalizadas</Label>
            <Textarea
              id="custom-keywords"
              placeholder="Adicione palavras-chave personalizadas, uma por linha..."
              value={nlpSettings.customKeywords}
              onChange={(e) => setNlpSettings({
                ...nlpSettings,
                customKeywords: e.target.value
              })}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Palavras-chave adicionais para melhorar a classificação de defeitos específicos
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Configurações do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Configurações do Sistema
          </CardTitle>
          <CardDescription>
            Configurações gerais do sistema e banco de dados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="max-file-size">Tamanho Máximo de Arquivo (MB)</Label>
              <Input
                id="max-file-size"
                type="number"
                min="10"
                max="500"
                value={systemSettings.maxFileSize}
                onChange={(e) => setSystemSettings({
                  ...systemSettings,
                  maxFileSize: parseInt(e.target.value)
                })}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-backup">Backup Automático</Label>
                <Switch
                  id="auto-backup"
                  checked={systemSettings.autoBackup}
                  onCheckedChange={(checked) => setSystemSettings({
                    ...systemSettings,
                    autoBackup: checked
                  })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifications">Notificações por Email</Label>
                <Switch
                  id="email-notifications"
                  checked={systemSettings.emailNotifications}
                  onCheckedChange={(checked) => setSystemSettings({
                    ...systemSettings,
                    emailNotifications: checked
                  })}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-sm font-medium">Versão do Sistema</Label>
              <p className="text-sm text-muted-foreground">v1.0.0</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Último Backup</Label>
              <p className="text-sm text-muted-foreground">01/07/2024 às 03:00</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Total de Registros</Label>
              <p className="text-sm text-muted-foreground">1.248 ordens de serviço</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Espaço Utilizado</Label>
              <p className="text-sm text-muted-foreground">45.2 MB de 1 GB</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Zona de Perigo */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
          <CardDescription>
            Ações irreversíveis que afetam todos os dados do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              As ações abaixo são irreversíveis e podem causar perda de dados. Use com extrema cautela.
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button variant="destructive" size="sm">
              Limpar Todos os Dados
            </Button>
            <Button variant="outline" size="sm">
              Resetar Configurações
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Botão de Salvar */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} className="min-w-[120px]">
          <Save className="h-4 w-4 mr-2" />
          Salvar Configurações
        </Button>
      </div>
    </div>
  )
}

export default Settings

