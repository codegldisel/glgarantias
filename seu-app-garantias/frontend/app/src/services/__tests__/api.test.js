import ApiService from '../api'

// Mock do fetch global
global.fetch = jest.fn()

describe('ApiService', () => {
  beforeEach(() => {
    fetch.mockClear()
  })

  describe('request', () => {
    it('deve fazer requisição GET com sucesso', async () => {
      const mockResponse = { data: 'test' }
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        headers: new Map([['content-type', 'application/json']])
      })

      const result = await ApiService.request('/test')
      
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('deve tratar erro de rede', async () => {
      fetch.mockRejectedValueOnce(new TypeError('fetch failed'))

      await expect(ApiService.request('/test')).rejects.toThrow(
        'Erro de conexão com o servidor. Verifique sua conexão de internet.'
      )
    })

    it('deve tratar erro HTTP 400', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => JSON.stringify({ error: 'Bad Request' })
      })

      await expect(ApiService.request('/test')).rejects.toThrow('Bad Request')
    })
  })

  describe('requestWithRetry', () => {
    it('deve fazer retry em caso de falha temporária', async () => {
      const mockResponse = { data: 'success' }
      
      // Primeira tentativa falha, segunda sucesso
      fetch.mockRejectedValueOnce(new Error('Network error'))
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        headers: new Map([['content-type', 'application/json']])
      })

      const result = await ApiService.requestWithRetry('/test')
      
      expect(fetch).toHaveBeenCalledTimes(2)
      expect(result).toEqual(mockResponse)
    })

    it('não deve fazer retry para erro 400', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => JSON.stringify({ error: 'Bad Request' })
      })

      await expect(ApiService.requestWithRetry('/test')).rejects.toThrow('Bad Request')
      expect(fetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('getOrdensServico', () => {
    it('deve fazer requisição com filtros', async () => {
      const mockResponse = { data: [] }
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        headers: new Map([['content-type', 'application/json']])
      })

      const filters = { data_inicio: '2025-01-01', data_fim: '2025-01-31' }
      await ApiService.getOrdensServico(filters)
      
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('data_inicio=2025-01-01&data_fim=2025-01-31'),
        expect.any(Object)
      )
    })
  })

  describe('uploadExcel', () => {
    it('deve fazer upload com progresso', async () => {
      const mockFile = new File(['test'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const mockResponse = { message: 'Upload successful' }
      
      // Mock XMLHttpRequest
      const mockXHR = {
        upload: { addEventListener: jest.fn() },
        addEventListener: jest.fn(),
        open: jest.fn(),
        send: jest.fn(),
        status: 200,
        responseText: JSON.stringify(mockResponse)
      }
      
      global.XMLHttpRequest = jest.fn(() => mockXHR)
      
      const onProgress = jest.fn()
      const result = await ApiService.uploadExcel(mockFile, onProgress)
      
      expect(mockXHR.open).toHaveBeenCalledWith('POST', expect.stringContaining('/upload-excel'))
      expect(mockXHR.send).toHaveBeenCalled()
      expect(result).toEqual(mockResponse)
    })
  })
}) 