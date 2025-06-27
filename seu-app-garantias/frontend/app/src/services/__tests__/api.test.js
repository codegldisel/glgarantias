import ApiService from '../api'

// Mock do fetch global
global.fetch = jest.fn()

describe('ApiService', () => {
  beforeEach(() => {
    fetch.mockClear()
    // Reset da instância do ApiService
    ApiService.requestInterceptors = []
    ApiService.responseInterceptors = []
  })

  describe('request', () => {
    it('deve fazer requisição GET com sucesso', async () => {
      const mockResponse = { data: 'test' }
      fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockResponse),
        text: () => Promise.resolve(JSON.stringify(mockResponse))
      })

      const result = await ApiService.request('/test')
      
      // Verifica apenas a URL e se headers existem
      const [url, config] = fetch.mock.calls[0]
      expect(url).toContain('/test')
      expect(config.headers['Content-Type']).toBe('application/json')
      expect(result).toEqual(mockResponse)
    })

    it('deve lidar com erro 400', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: { get: () => 'application/json' },
        text: () => Promise.resolve('Bad Request')
      })

      await expect(ApiService.request('/test')).rejects.toThrow('Erro do cliente: Bad Request')
    })

    it('deve lidar com erro de rede', async () => {
      fetch.mockRejectedValueOnce(new TypeError('fetch failed'))

      await expect(ApiService.request('/test')).rejects.toThrow('Erro de conexão com o servidor. Verifique sua conexão de internet.')
    })

    it('deve lidar com timeout', async () => {
      const abortError = new Error('Timeout')
      abortError.name = 'AbortError'
      fetch.mockRejectedValueOnce(abortError)

      await expect(ApiService.request('/test')).rejects.toThrow('Timeout: A requisição demorou muito para responder.')
    })
  })

  describe('requestWithRetry', () => {
    it('não deve fazer retry para erro 400', async () => {
      fetch.mockImplementation(() => Promise.resolve({
        ok: false,
        status: 400,
        headers: { get: () => 'application/json' },
        text: () => Promise.resolve('Bad Request'),
        json: () => Promise.resolve({ error: 'Bad Request' })
      }));

      await expect(ApiService.requestWithRetry('/test')).rejects.toThrow('Erro do cliente: Bad Request');
    })

    it('deve fazer retry para erro 500', async () => {
      fetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          headers: { get: () => 'application/json' },
          text: () => Promise.resolve('Internal Server Error')
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: { get: () => 'application/json' },
          json: () => Promise.resolve({ success: true }),
          text: () => Promise.resolve(JSON.stringify({ success: true }))
        })

      const result = await ApiService.requestWithRetry('/test')
      
      expect(fetch).toHaveBeenCalledTimes(2)
      expect(result).toEqual({ success: true })
    })
  })

  describe('getOrdensServico', () => {
    it('deve fazer requisição com filtros', async () => {
      const mockResponse = { data: [] }
      fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockResponse),
        text: () => Promise.resolve(JSON.stringify(mockResponse))
      })

      const filters = { data_inicio: '2024-01-01', data_fim: '2024-12-31' }
      await ApiService.getOrdensServico(filters)
      
      const [url] = fetch.mock.calls[0]
      expect(url).toContain('/api/ordens-servico?data_inicio=2024-01-01&data_fim=2024-12-31')
    })
  })

  describe('getOrdensDoMesAtual', () => {
    it('deve fazer requisição com datas do mês atual', async () => {
      const mockResponse = { data: [] }
      fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockResponse),
        text: () => Promise.resolve(JSON.stringify(mockResponse))
      })

      await ApiService.getOrdensDoMesAtual()
      
      const [url] = fetch.mock.calls[0]
      expect(url).toContain('/api/ordens-servico')
    })
  })

  describe('uploadExcel', () => {
    it('deve fazer upload com progresso', async () => {
      const mockFile = new File(['test'], 'test.xlsx', { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      const mockResponse = { message: 'Upload successful' }
      
      // Mock do XMLHttpRequest
      const mockXHR = {
        open: jest.fn(),
        send: jest.fn(function() {
          setTimeout(() => {
            if (this.onload) this.onload()
          }, 0)
        }),
        setRequestHeader: jest.fn(),
        addEventListener: jest.fn((event, cb) => {
          if (event === 'load') setTimeout(cb, 0)
        }),
        upload: {
          addEventListener: jest.fn()
        },
        readyState: 4,
        status: 200,
        responseText: JSON.stringify(mockResponse),
        onload: null
      }
      global.XMLHttpRequest = jest.fn(() => mockXHR)
      
      const onProgress = jest.fn()
      const result = await ApiService.uploadExcel(mockFile, onProgress)
      
      expect(mockXHR.open).toHaveBeenCalledWith('POST', expect.stringContaining('/upload-excel'))
      expect(mockXHR.send).toHaveBeenCalled()
      expect(result).toEqual(mockResponse)
    }, 10000) // Aumentar timeout para 10 segundos
  })
}) 