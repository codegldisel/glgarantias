import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Upload, 
  Download,
  Info,
  RefreshCw
} from 'lucide-react'
import { DragDropUpload, UploadProgress } from '../components/upload'
import ApiService from '../services/api'

const UploadExcelPage = () => {
  const [file, setFile] = useState(null)
  const [uploadStatus, setUploadStatus] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadResult, setUploadResult] = useState(null)
  const [error, setError] = useState(null)

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile)
    setError(null)
    setUploadResult(null)
    setUploadStatus(null)
    setUploadProgress(0)
  }

  const handleUpload = async () => {
    if (!file) return

    setUploadStatus('uploading')
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

      const response = await fetch(`${ApiService.API_BASE_URL}/upload-excel`, {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (response.ok) {
        const result = await response.json()
        setUploadResult({
          uploadCount: result.count,
          message: result.message
        })
        
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
      setUploadStatus('error')
      setUploadProgress(0)
    }
  }

  const handleProcessData = async () => {
    setUploadStatus('processing')
    setUploadProgress(0)
    
    try {
      // Simular progresso de processamento
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 15
        })
      }, 300)

      const response = await fetch(`${ApiService.API_BASE_URL}/process-data`, {
        method: 'POST'
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (response.ok) {
        const result = await response.json()
        setUploadResult(prev => ({
          ...prev,
          processedCount: result.count,
          unmappedDefects: result.unmappedDefects || [],
          processMessage: result.message
        }))
        setUploadStatus('success')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro no processamento')
      }
    } catch (err) {
      console.error('Erro no processamento:', err)
      setError(err.message || 'Erro ao processar dados')
      setUploadStatus('error')
    }
  }

  const resetUpload = () => {
    setFile(null)
    setUploadStatus(null)
    setUploadProgress(0)
    setUploadResult(null)
    setError(null)
  }

  const isUploading = uploadStatus === 'uploading' || uploadStatus === 'processing'

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
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Modelo Excel
          </Button>
          {uploadStatus === 'success' && (
            <Button variant="outline" size="sm" onClick={resetUpload}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Novo Upload
            </Button>
          )}
        </div>
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
          {uploadStatus !== 'success' && (
            <DragDropUpload 
              onFileSelect={handleFileSelect}
              disabled={isUploading}
            />
          )}

          {file && uploadStatus !== 'success' && (
            <Button 
              onClick={handleUpload} 
              className="w-full"
              disabled={isUploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Processando...' : 'Fazer Upload'}
            </Button>
          )}

          <UploadProgress
            status={uploadStatus}
            progress={uploadProgress}
            result={uploadResult}
            error={error}
          />
        </CardContent>
      </Card>

      {/* Upload Statistics */}
      {uploadStatus === 'success' && uploadResult && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {uploadResult.uploadCount || 0}
                </p>
                <p className="text-sm text-muted-foreground">Registros Importados</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {uploadResult.processedCount || 0}
                </p>
                <p className="text-sm text-muted-foreground">OS Processadas</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {uploadResult.unmappedDefects?.length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Defeitos Não Mapeados</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default UploadExcelPage

