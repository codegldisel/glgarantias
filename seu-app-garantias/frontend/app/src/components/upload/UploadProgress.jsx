import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'

const UploadProgress = ({ 
  status, 
  progress = 0, 
  message = '', 
  result = null, 
  error = null 
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'uploading':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
      case 'processing':
        return <Loader2 className="h-5 w-5 animate-spin text-orange-600" />
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      default:
        return null
    }
  }

  const getStatusMessage = () => {
    switch (status) {
      case 'uploading':
        return message || 'Fazendo upload do arquivo...'
      case 'processing':
        return message || 'Processando dados...'
      case 'success':
        return message || 'Upload e processamento concluídos com sucesso!'
      case 'error':
        return error || 'Ocorreu um erro durante o processo'
      default:
        return message
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'uploading':
        return 'text-blue-600'
      case 'processing':
        return 'text-orange-600'
      case 'success':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-muted-foreground'
    }
  }

  if (!status) return null

  return (
    <div className="space-y-4">
      {/* Status Header */}
      <div className={`flex items-center space-x-2 ${getStatusColor()}`}>
        {getStatusIcon()}
        <span className="font-medium">{getStatusMessage()}</span>
      </div>

      {/* Progress Bar */}
      {(status === 'uploading' || status === 'processing') && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      )}

      {/* Success Result */}
      {status === 'success' && result && (
        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
            Resultado do Processamento:
          </h4>
          <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
            {result.uploadCount && (
              <li>• {result.uploadCount} registros importados do arquivo</li>
            )}
            {result.processedCount && (
              <li>• {result.processedCount} ordens de serviço processadas</li>
            )}
            {result.unmappedDefects && result.unmappedDefects.length > 0 && (
              <li>• {result.unmappedDefects.length} defeitos não mapeados encontrados</li>
            )}
            {result.duplicates && result.duplicates > 0 && (
              <li>• {result.duplicates} registros duplicados ignorados</li>
            )}
          </ul>
          
          {result.unmappedDefects && result.unmappedDefects.length > 0 && (
            <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
              <p className="text-xs text-green-600 dark:text-green-400 mb-2">
                Defeitos não mapeados (primeiros 5):
              </p>
              <ul className="text-xs text-green-600 dark:text-green-400 space-y-1">
                {result.unmappedDefects.slice(0, 5).map((defeito, index) => (
                  <li key={index}>• {defeito}</li>
                ))}
                {result.unmappedDefects.length > 5 && (
                  <li>• ... e mais {result.unmappedDefects.length - 5} defeitos</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Error Alert */}
      {status === 'error' && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error || 'Ocorreu um erro durante o upload ou processamento do arquivo.'}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

export default UploadProgress

