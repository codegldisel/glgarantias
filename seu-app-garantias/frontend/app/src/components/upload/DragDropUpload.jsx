import { useState, useRef } from 'react'
import { Upload, FileSpreadsheet, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'

const DragDropUpload = ({ onFileSelect, disabled = false, acceptedTypes = '.xlsx,.xls' }) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState(null)
  const [uploadError, setUploadError] = useState(null)
  const fileInputRef = useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragOver(true)
    }
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    
    if (disabled) return

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelection(files[0])
    }
  }

  const handleFileInputChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleFileSelection(file)
    }
  }

  const handleFileSelection = (file) => {
    // Validar tipo de arquivo
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ]
    
    if (!file.name.toLowerCase().endsWith('.xlsx') && 
        !file.name.toLowerCase().endsWith('.xls') &&
        !allowedTypes.includes(file.type)) {
      alert('Por favor, selecione apenas arquivos Excel (.xlsx, .xls).\nTipos aceitos: .xlsx, .xls')
      return
    }

    // Validar tamanho (máximo 1GB - conforme backend)
    const maxSize = 1024 * 1024 * 1024 // 1GB em bytes
    if (file.size > maxSize) {
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(2)
      alert(`O arquivo deve ter no máximo 1GB.\nTamanho atual: ${fileSizeMB}MB`)
      return
    }

    setSelectedFile(file)
    setUploadResult(null)
    setUploadError(null)
    onFileSelect(file)
  }

  const uploadFile = async (file) => {
    setIsUploading(true)
    setUploadProgress(0)
    setUploadResult(null)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('excel', file)

      const response = await fetch('/api/upload-excel', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Erro no upload')
      }

      setUploadResult(result)
      setUploadProgress(100)
      
      // Chamar callback de sucesso
      if (onFileSelect) {
        onFileSelect(result)
      }
      
    } catch (error) {
      console.error('Erro no upload:', error)
      setUploadError(error.message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setUploadProgress(0)
    setIsUploading(false)
    setUploadResult(null)
    setUploadError(null)
    onFileSelect(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    if (!disabled && !isUploading && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleUpload = () => {
    if (selectedFile && !isUploading) {
      uploadFile(selectedFile)
    }
  }

  if (selectedFile) {
    return (
      <div className="border rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileSpreadsheet className="h-8 w-8 text-green-600" />
            <div>
              <p className="font-medium">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <Button 
            onClick={handleRemoveFile} 
            variant="ghost" 
            size="sm"
            disabled={disabled || isUploading}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Processando arquivo...</span>
              <span>Aguarde...</span>
            </div>
            <Progress value={50} className="w-full animate-pulse" />
          </div>
        )}

        {uploadResult && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <div className="space-y-1">
                <p className="font-medium">Upload concluído com sucesso!</p>
                <p className="text-sm">
                  {uploadResult.count} ordens de serviço de garantia foram processadas.
                </p>
                {uploadResult.detalhes && (
                  <div className="text-xs space-y-1 mt-2">
                    <p>• Total de linhas no Excel: {uploadResult.detalhes.total_linhas_excel}</p>
                    <p>• OSs de garantia encontradas: {uploadResult.detalhes.oss_garantia_encontradas}</p>
                    <p>• OSs inseridas no banco: {uploadResult.detalhes.oss_inseridas}</p>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {uploadError && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <div className="space-y-1">
                <p className="font-medium">Erro no upload</p>
                <p className="text-sm">{uploadError}</p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={handleUpload}
            disabled={disabled || isUploading || uploadResult}
            className="flex-1"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : uploadResult ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Concluído
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Processar Arquivo
              </>
            )}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`
        border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer
        ${isDragOver 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
          : 'border-muted-foreground/25 hover:border-muted-foreground/50'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />
      
      <div className="space-y-4">
        <div className={`mx-auto transition-colors duration-200 ${
          isDragOver ? 'text-blue-600' : 'text-muted-foreground'
        }`}>
          <FileSpreadsheet className="h-12 w-12 mx-auto mb-2" />
          <Upload className="h-6 w-6 mx-auto" />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">
            {isDragOver ? 'Solte o arquivo aqui' : 'Selecione um arquivo Excel'}
          </h3>
          <p className="text-muted-foreground mb-4">
            Arraste e solte ou clique para selecionar um arquivo .xlsx com dados de garantia
          </p>
          <p className="text-xs text-muted-foreground">
            Tamanho máximo: 1GB • Procure pela aba "Tabela" no arquivo
          </p>
        </div>
        
        <Button 
          variant="outline" 
          disabled={disabled}
          className="pointer-events-none"
        >
          <Upload className="h-4 w-4 mr-2" />
          Selecionar Arquivo
        </Button>
      </div>
    </div>
  )
}

export default DragDropUpload

