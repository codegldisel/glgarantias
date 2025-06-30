// Configuração da API para conectar com o backend
const API_BASE_URL = process.env.VITE_API_BASE_URL || '';

class ApiService {
  constructor() {
    this.API_BASE_URL = API_BASE_URL;
    this.requestInterceptors = [];
    this.responseInterceptors = [];
  }

  // Adicionar interceptor de requisição
  addRequestInterceptor(interceptor) {
    this.requestInterceptors.push(interceptor);
  }

  // Adicionar interceptor de resposta
  addResponseInterceptor(interceptor) {
    this.responseInterceptors.push(interceptor);
  }

  // Método principal de requisição com interceptors
  async request(endpoint, options = {}) {
    const url = `${this.API_BASE_URL}${endpoint}`;
    let config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
      // Adicionar timeout de 5 minutos para uploads grandes
      signal: AbortSignal.timeout(300000),
    };

    // Aplicar interceptors de requisição
    for (const interceptor of this.requestInterceptors) {
      config = await interceptor(config);
    }

    try {
      const response = await fetch(url, config);
      
      // Aplicar interceptors de resposta
      let processedResponse = response;
      for (const interceptor of this.responseInterceptors) {
        processedResponse = await interceptor(processedResponse);
      }
      
      if (!processedResponse.ok) {
        const errorData = await processedResponse.text();
        let errorMessage;
        
        try {
          const parsedError = JSON.parse(errorData);
          errorMessage = parsedError.error || parsedError.message || 'Erro desconhecido';
        } catch {
          errorMessage = errorData || `Erro HTTP ${processedResponse.status}`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await processedResponse.json();
      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Timeout: A requisição demorou muito para responder');
      }
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Erro de conexão: Verifique sua internet ou se o servidor está funcionando');
      }
      
      throw error;
    }
  }

  // Métodos HTTP específicos
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Upload de arquivos
  async uploadFile(endpoint, file, additionalData = {}) {
    const formData = new FormData();
    formData.append('excel', file);
    
    // Adicionar dados adicionais ao FormData
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    return this.request(endpoint, {
      method: 'POST',
      body: formData,
      headers: {}, // Remover Content-Type para FormData
    });
  }

  // === MÉTODOS ESPECÍFICOS DA APLICAÇÃO ===

  // Upload de Excel - usando nova rota
  async uploadExcel(file) {
    return this.uploadFile('/api/upload-excel', file);
  }

  // Estatísticas
  async getEstatisticas() {
    return this.get('/api/estatisticas');
  }

  // Defeitos não mapeados
  async getDefeitosNaoMapeados() {
    return this.get('/api/defeitos-nao-mapeados');
  }

  // Ordens de Serviço
  async getOrdensServico(params = {}) {
    return this.get('/api/ordens-servico', params);
  }

  // Teste de conexão
  async testarConexao() {
    return this.get('/api/test');
  }

  // === MÉTODOS DE VALIDAÇÃO ===

  // Verificar conexão com o backend
  async verificarConexao() {
    try {
      const response = await this.testarConexao();
      return { status: 'ok', data: response };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }
}

// Criar instância singleton
const apiService = new ApiService();

// Adicionar interceptors padrão
apiService.addRequestInterceptor(async (config) => {
  // Log de requisições em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    console.log('API Request:', config.method, config.url || config);
  }
  return config;
});

apiService.addResponseInterceptor(async (response) => {
  // Log de respostas em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    console.log('API Response:', response.status, response.url);
  }
  return response;
});

export default apiService;

