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
import { useApp } from '../contexts/AppContext'

const UploadExcelPage = () => {
  const { state, actions } = useApp()
  const { upload } = state
  const [file, setFile] = useState(null)

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile)
  }

  const handleUpload = async () => {
    if (!file) return
    await actions.uploadArquivo(file)
  }

  const resetUpload = () => {
    setFile(null)
    // Reset do estado de upload será feito pelo contexto
  }

  const isUploading = upload.status === 'uploading' || upload.status === 'processing'

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
          {upload.status === 'success' && (
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
          <strong>Instruções:</strong> O arquivo deve estar no formato .xlsx ou .xls e conter as colunas: 
          DATA_OS, NUMERO_OS, FABRICANTE, MOTOR, MODELO, OBSERVACOES, DEFEITO, MECANICO_MONTADOR, 
          CLIENTE, TOTAL_PECAS, TOTAL_SERVICOS, TOTAL_GERAL, TIPO_OS. Tamanho máximo: 15MB.
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
          {upload.status !== 'success' && (
            <DragDropUpload 
              onFileSelect={handleFileSelect}
              disabled={isUploading}
            />
          )}

          {file && upload.status !== 'success' && (
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
            status={upload.status}
            progress={upload.progresso}
            result={upload.resultado}
            error={upload.erro}
          />
        </CardContent>
      </Card>

      {/* Upload Statistics */}
      {upload.status === 'success' && upload.resultado && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {upload.resultado.count || 0}
                </p>
                <p className="text-sm text-muted-foreground">Registros Importados</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {upload.resultado.processResult?.count || 0}
                </p>
                <p className="text-sm text-muted-foreground">OS Processadas</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {upload.resultado.processResult?.unmappedDefects?.length || 0}
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

