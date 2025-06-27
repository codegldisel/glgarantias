import { useState, useRef } from 'react'
import { Upload, FileSpreadsheet, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const DragDropUpload = ({ onFileSelect, disabled = false, acceptedTypes = '.xlsx' }) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
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
        !allowedTypes.includes(file.type)) {
      alert('Por favor, selecione apenas arquivos Excel (.xlsx).\nTipos aceitos: .xlsx')
      return
    }

    // Validar tamanho (máximo 5MB)
    const maxSize = 50 * 1024 * 1024 // 50MB em bytes
    if (file.size > maxSize) {
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(2)
      alert(`O arquivo deve ter no máximo 50MB.\nTamanho atual: ${fileSizeMB}MB`)
      return
    }

    setSelectedFile(file)
    onFileSelect(file)
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    onFileSelect(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  if (selectedFile) {
    return (
      <div className="border rounded-lg p-4">
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
            disabled={disabled}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <X className="h-4 w-4" />
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
            Tamanho máximo: 5MB
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

