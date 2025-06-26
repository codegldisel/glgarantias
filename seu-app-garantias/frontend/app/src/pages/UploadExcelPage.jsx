import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertTriangle,
  Download,
  Info
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

const UploadExcelPage = () => {
  const { t } = useTranslation()
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadResult, setUploadResult] = useState(null)
  const [error, setError] = useState(null)

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile) {
      if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
          selectedFile.name.endsWith('.xlsx')) {
        setFile(selectedFile)
        setError(null)
        setUploadResult(null)
      } else {
        setError('Por favor, selecione um arquivo Excel (.xlsx)')
        setFile(null)
      }
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setUploadProgress(0)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Simular progresso de upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch('/upload-excel', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (response.ok) {
        const result = await response.json()
        setUploadResult(result)
        
        // Processar dados automaticamente
        setTimeout(() => {
          handleProcessData()
        }, 1000)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro no upload')
      }
    } catch (err) {
      console.error('Erro no upload:', err)
      setError(err.message || 'Erro ao fazer upload do arquivo')
      setUploadProgress(0)
    } finally {
      setUploading(false)
    }
  }

  const handleProcessData = async () => {
    setProcessing(true)
    
    try {
      const response = await fetch('/process-data', {
        method: 'POST'
      })

      if (response.ok) {
        const result = await response.json()
        setUploadResult(prev => ({
          ...prev,
          processed: true,
          processResult: result
        }))
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro no processamento')
      }
    } catch (err) {
      console.error('Erro no processamento:', err)
      setError(err.message || 'Erro ao processar dados')
    } finally {
      setProcessing(false)
    }
  }

  const resetUpload = () => {
    setFile(null)
    setUploading(false)
    setProcessing(false)
    setUploadProgress(0)
    setUploadResult(null)
    setError(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Upload de Arquivo Excel</h1>
          <p className="text-muted-foreground">
            Importar ordens de serviço a partir de planilhas Excel
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Modelo Excel
        </Button>
      </div>

      {/* Instructions */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Instruções:</strong> O arquivo deve estar no formato .xlsx e conter as colunas: 
          DATA_OS, NUMERO_OS, FABRICANTE, MOTOR, MODELO, OBSERVACOES, DEFEITO, MECANICO_MONTADOR, 
          CLIENTE, TOTAL_PECAS, TOTAL_SERVICOS, TOTAL_GERAL, TIPO_OS.
        </AlertDescription>
      </Alert>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Selecionar Arquivo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!file && !uploadResult && (
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <FileSpreadsheet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Selecione um arquivo Excel</h3>
              <p className="text-muted-foreground mb-4">
                Arraste e solte ou clique para selecionar um arquivo .xlsx
              </p>
              <input
                type="file"
                accept=".xlsx"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button variant="outline" className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Selecionar Arquivo
                </Button>
              </label>
            </div>
          )}

          {file && !uploadResult && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileSpreadsheet className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={resetUpload} 
                  variant="ghost" 
                  size="sm"
                  disabled={uploading}
                >
                  Remover
                </Button>
              </div>

              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Fazendo upload...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}

              {!uploading && (
                <Button onClick={handleUpload} className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Fazer Upload
                </Button>
              )}
            </div>
          )}

          {uploadResult && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Upload realizado com sucesso!</span>
              </div>

              {processing && (
                <div className="flex items-center space-x-2 text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>Processando dados...</span>
                </div>
              )}

              {uploadResult.processed && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Dados processados com sucesso!</span>
                  </div>
                  
                  {uploadResult.processResult && (
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Resultado do Processamento:</h4>
                      <ul className="text-sm space-y-1">
                        <li>• {uploadResult.processResult.count} ordens de serviço processadas</li>
                        {uploadResult.processResult.unmappedDefects?.length > 0 && (
                          <li>• {uploadResult.processResult.unmappedDefects.length} defeitos não mapeados encontrados</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <Button onClick={resetUpload} variant="outline" className="w-full">
                Fazer Novo Upload
              </Button>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default UploadExcelPage

