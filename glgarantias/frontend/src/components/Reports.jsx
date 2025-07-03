import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { DatePickerWithRange } from '@/components/ui/date-picker.jsx'
import { Checkbox } from '@/components/ui/checkbox.jsx'
import { FileText, Download, Calendar, Filter, BarChart3 } from 'lucide-react'

const Reports = () => {
  const [reportType, setReportType] = useState('')
  const [dateRange, setDateRange] = useState(null)
  const [selectedFilters, setSelectedFilters] = useState({
    includeCharts: true,
    includeDetails: true,
    groupByMechanic: false,
    groupByDefect: false,
    groupByManufacturer: false
  })
  const [generating, setGenerating] = useState(false)

  const reportTypes = [
    {
      id: 'monthly',
      name: 'Relatório Mensal',
      description: 'Análise completa das garantias do mês',
      icon: Calendar
    },
    {
      id: 'defects',
      name: 'Relatório de Defeitos',
      description: 'Classificação e análise dos tipos de defeitos',
      icon: BarChart3
    },
    {
      id: 'mechanics',
      name: 'Performance dos Mecânicos',
      description: 'Análise da performance individual dos mecânicos',
      icon: FileText
    },
    {
      id: 'financial',
      name: 'Relatório Financeiro',
      description: 'Análise de custos e valores das garantias',
      icon: Download
    }
  ]

  const handleGenerateReport = async () => {
    if (!reportType) return

    setGenerating(true)
    
    // Simular geração de relatório
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Aqui seria feita a chamada para a API de geração de relatórios
    console.log('Generating report:', {
      type: reportType,
      dateRange,
      filters: selectedFilters
    })
    
    setGenerating(false)
    
    // Simular download do arquivo
    const link = document.createElement('a')
    link.href = '#'
    link.download = `relatorio-${reportType}-${new Date().toISOString().split('T')[0]}.pdf`
    link.click()
  }

  const handleFilterChange = (filterId, checked) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterId]: checked
    }))
  }

  return (
    <div className="space-y-6">
      {/* Seleção de Tipo de Relatório */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Geração de Relatórios
          </CardTitle>
          <CardDescription>
            Selecione o tipo de relatório e configure os filtros desejados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tipos de Relatório */}
          <div>
            <label className="text-sm font-medium mb-3 block">Tipo de Relatório</label>
            <div className="grid gap-3 md:grid-cols-2">
              {reportTypes.map((type) => {
                const Icon = type.icon
                return (
                  <Card 
                    key={type.id}
                    className={`cursor-pointer transition-colors ${
                      reportType === type.id 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setReportType(type.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Icon className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <h3 className="font-medium">{type.name}</h3>
                          <p className="text-sm text-muted-foreground">{type.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Filtros de Data */}
          <div>
            <label className="text-sm font-medium mb-3 block">Período</label>
            <Select defaultValue="current-month">
              <SelectTrigger>
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current-month">Mês Atual</SelectItem>
                <SelectItem value="last-month">Mês Anterior</SelectItem>
                <SelectItem value="current-quarter">Trimestre Atual</SelectItem>
                <SelectItem value="last-quarter">Trimestre Anterior</SelectItem>
                <SelectItem value="current-year">Ano Atual</SelectItem>
                <SelectItem value="custom">Período Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Opções de Conteúdo */}
          <div>
            <label className="text-sm font-medium mb-3 block">Conteúdo do Relatório</label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="include-charts"
                  checked={selectedFilters.includeCharts}
                  onCheckedChange={(checked) => handleFilterChange('includeCharts', checked)}
                />
                <label htmlFor="include-charts" className="text-sm">
                  Incluir gráficos e visualizações
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="include-details"
                  checked={selectedFilters.includeDetails}
                  onCheckedChange={(checked) => handleFilterChange('includeDetails', checked)}
                />
                <label htmlFor="include-details" className="text-sm">
                  Incluir tabela detalhada de dados
                </label>
              </div>
            </div>
          </div>

          {/* Agrupamentos */}
          <div>
            <label className="text-sm font-medium mb-3 block">Agrupamentos</label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="group-mechanic"
                  checked={selectedFilters.groupByMechanic}
                  onCheckedChange={(checked) => handleFilterChange('groupByMechanic', checked)}
                />
                <label htmlFor="group-mechanic" className="text-sm">
                  Agrupar por mecânico responsável
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="group-defect"
                  checked={selectedFilters.groupByDefect}
                  onCheckedChange={(checked) => handleFilterChange('groupByDefect', checked)}
                />
                <label htmlFor="group-defect" className="text-sm">
                  Agrupar por tipo de defeito
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="group-manufacturer"
                  checked={selectedFilters.groupByManufacturer}
                  onCheckedChange={(checked) => handleFilterChange('groupByManufacturer', checked)}
                />
                <label htmlFor="group-manufacturer" className="text-sm">
                  Agrupar por fabricante do motor
                </label>
              </div>
            </div>
          </div>

          {/* Botão de Geração */}
          <div className="pt-4">
            <Button 
              onClick={handleGenerateReport}
              disabled={!reportType || generating}
              className="w-full sm:w-auto"
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Gerando Relatório...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Gerar Relatório
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Relatórios Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Relatórios Recentes</CardTitle>
          <CardDescription>
            Histórico dos últimos relatórios gerados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                name: 'Relatório Mensal - Junho 2024',
                type: 'monthly',
                date: '2024-06-30',
                size: '2.3 MB'
              },
              {
                name: 'Performance dos Mecânicos - Maio 2024',
                type: 'mechanics',
                date: '2024-05-31',
                size: '1.8 MB'
              },
              {
                name: 'Relatório de Defeitos - Q2 2024',
                type: 'defects',
                date: '2024-06-30',
                size: '3.1 MB'
              }
            ].map((report, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{report.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Gerado em {new Date(report.date).toLocaleDateString('pt-BR')} • {report.size}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Informações sobre Relatórios */}
      <Card>
        <CardHeader>
          <CardTitle>Sobre os Relatórios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Formatos Disponíveis</h4>
            <p className="text-sm text-muted-foreground">
              Os relatórios são gerados em formato PDF com gráficos e tabelas interativas. 
              Para dados brutos, também é possível exportar em formato Excel.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Conteúdo dos Relatórios</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Análises estatísticas dos defeitos classificados</li>
              <li>• Performance individual dos mecânicos</li>
              <li>• Distribuição por fabricante e modelo de motor</li>
              <li>• Análise financeira dos custos de garantia</li>
              <li>• Tendências e insights baseados em dados históricos</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Atualização dos Dados</h4>
            <p className="text-sm text-muted-foreground">
              Os relatórios são baseados nos dados mais recentes processados pelo sistema. 
              Certifique-se de que as planilhas mais atuais foram enviadas antes de gerar relatórios.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Reports

