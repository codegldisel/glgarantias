import { useState, useRef } from 'react'
import { Upload, FileSpreadsheet, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

const DragDropUpload = ({ onFileSelect, disabled = false, acceptedTypes = '.xlsx,.xls' }) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
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

    // Validar tamanho (máximo 100MB)
    const maxSize = 100 * 1024 * 1024 // 100MB em bytes
    if (file.size > maxSize) {
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(2)
      alert(`O arquivo deve ter no máximo 100MB.\nTamanho atual: ${fileSizeMB}MB`)
      return
    }

    setSelectedFile(file)
    onFileSelect(file)
  }

  const uploadFileInChunks = async (file) => {
    const CHUNK_SIZE = 1024 * 1024 // 1MB por chunk
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE)
    const uploadId = Date.now().toString() + Math.random().toString(36).substr(2, 9)

    setIsUploading(true)
    setUploadProgress(0)

    try {
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * CHUNK_SIZE
        const end = Math.min(start + CHUNK_SIZE, file.size)
        const chunk = file.slice(start, end)

        const formData = new FormData()
        formData.append('chunk', chunk)
        formData.append('chunkIndex', chunkIndex.toString())
        formData.append('totalChunks', totalChunks.toString())
        formData.append('uploadId', uploadId)
        formData.append('fileName', file.name)
        formData.append('fileSize', file.size.toString())

        const response = await fetch('https://3000-i4zobsqjb96cawbu6o03s-58323dc2.manusvm.computer/api/upload-chunk', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`Erro no upload do chunk ${chunkIndex + 1}`)
        }

        const progress = ((chunkIndex + 1) / totalChunks) * 100
        setUploadProgress(progress)
      }

      // Finalizar upload - montar arquivo completo
      const finalizeResponse = await fetch('https://3000-i4zobsqjb96cawbu6o03s-58323dc2.manusvm.computer/api/finalize-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uploadId,
          fileName: file.name,
          totalChunks,
        }),
      })

      if (!finalizeResponse.ok) {
        throw new Error('Erro ao finalizar upload')
      }

      const result = await finalizeResponse.json()
      
      // Chamar callback de sucesso
      if (onFileSelect) {
        onFileSelect(result)
      }

      alert('Upload concluído com sucesso!')
      
    } catch (error) {
      console.error('Erro no upload:', error)
      alert(`Erro no upload: ${error.message}`)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setUploadProgress(0)
    setIsUploading(false)
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
      uploadFileInChunks(selectedFile)
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
              <span>Enviando arquivo...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={handleUpload}
            disabled={disabled || isUploading}
            className="flex-1"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Fazer Upload
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
            Arraste e solte ou clique para selecionar um arquivo .xlsx
          </p>
          <p className="text-xs text-muted-foreground">
            Tamanho máximo: 100MB
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



