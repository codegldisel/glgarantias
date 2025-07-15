import { useState, useCallback, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Upload, FileSpreadsheet, CheckCircle, AlertTriangle, X } from 'lucide-react'

const UploadPage = () => {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState(null) // 'success', 'error', null
  const [errorMessage, setErrorMessage] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const isExcelFile = (file) => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'application/excel',
      'application/x-excel',
      'application/x-msexcel'
    ];
    
    const validExtensions = ['.xlsx', '.xls'];
    const fileName = file.name.toLowerCase();
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
    const hasValidType = validTypes.includes(file.type);
    
    return hasValidExtension || hasValidType;
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (isExcelFile(droppedFile)) {
        setFile(droppedFile)
        setUploadStatus(null)
        setErrorMessage('')
      } else {
        setUploadStatus('error')
        setErrorMessage('Por favor, selecione apenas arquivos Excel (.xlsx ou .xls)')
      }
    }
  }, [])

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (isExcelFile(selectedFile)) {
        setFile(selectedFile)
        setUploadStatus(null)
        setErrorMessage('')
      } else {
        setUploadStatus('error')
        setErrorMessage('Por favor, selecione apenas arquivos Excel (.xlsx ou .xls)')
      }
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setUploadProgress(0)
    setUploadStatus(null)
    setErrorMessage('')

    try {
      const formData = new FormData()
      formData.append('planilha', file)

      const apiUrl = '/api'
      
      const response = await fetch(`${apiUrl}/api/upload`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro no upload')
      }

      const result = await response.json()
      setUploadProgress(100)
      setUploadStatus('success')
      console.log('Upload realizado com sucesso:', result)

    } catch (error) {
      console.error('Erro no upload:', error)
      setUploadStatus('error')
      setErrorMessage(error.message || 'Erro desconhecido no upload')
    } finally {
      setUploading(false)
    }
  }

  const removeFile = () => {
    setFile(null)
    setUploadStatus(null)
    setUploadProgress(0)
    setErrorMessage('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSelectFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Upload Excel</h2>
        <p className="text-sm text-gray-600">Enviar planilhas Excel</p>
      </div>

      {/* Upload Card */}
      <Card className="bg-white">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-gray-600" />
            <CardTitle className="text-lg font-semibold">Upload de Planilha Excel</CardTitle>
          </div>
          <CardDescription>
            Faça o upload da planilha GLú-Garantias.xlsx para processamento automático
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-400 bg-blue-50' 
                : file 
                  ? 'border-green-300 bg-green-50' 
                  : 'border-gray-300 bg-gray-50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {file ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <FileSpreadsheet className="h-12 w-12 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-600">{formatFileSize(file.size)}</p>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Button 
                    onClick={handleUpload} 
                    disabled={uploading}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {uploading ? 'Enviando...' : 'Enviar Arquivo'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={removeFile}
                    disabled={uploading}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Remover
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <FileSpreadsheet className="h-12 w-12 text-gray-400" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    Arraste e solte sua planilha aqui
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    ou clique no botão abaixo para selecionar
                  </p>
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button 
                    onClick={handleSelectFile}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Selecionar Arquivo
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Enviando arquivo...</span>
                <span className="font-medium">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {/* Upload Status */}
          {uploadStatus === 'success' && (
            <Alert className="mt-4 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Upload concluído com sucesso!</strong>
                <br />
                A planilha foi processada e os dados foram salvos no banco de dados.
              </AlertDescription>
            </Alert>
          )}

          {uploadStatus === 'error' && (
            <Alert className="mt-4 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Erro no upload</strong>
                <br />
                {errorMessage || 'Por favor, selecione apenas arquivos Excel (.xlsx ou .xls).'}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Instruções</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Prepare sua planilha</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Certifique-se de que o arquivo Excel contém a planilha oculta "Tabela" com os dados das ordens de serviço
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Faça o upload</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Selecione ou arraste o arquivo Excel. Arquivos de até 100MB são suportados
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Aguarde o processamento</h4>
                <p className="text-sm text-gray-600 mt-1">
                  O sistema irá ler os dados, classificar os defeitos automaticamente e salvar no banco de dados
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default UploadPage

