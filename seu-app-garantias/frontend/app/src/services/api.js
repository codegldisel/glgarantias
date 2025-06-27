// Configuração da API para conectar com o backend
const API_BASE_URL = 'https://3000-i3s2tifylj88dyhyg9j0c-a72292d1.manusvm.computer';

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
          const errorJson = JSON.parse(errorData);
          errorMessage = errorJson.error || errorJson.message || `HTTP error! status: ${processedResponse.status}`;
        } catch {
          errorMessage = errorData || `HTTP error! status: ${processedResponse.status}`;
        }
        
        throw new Error(errorMessage);
      }
      
      const contentType = processedResponse.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await processedResponse.json();
      }
      
      return await processedResponse.text();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      
      // Tratamento específico de erros de rede
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Erro de conexão com o servidor. Verifique sua conexão de internet.');
      }
      
      throw error;
    }
  }

  // Método para requisições com retry automático
  async requestWithRetry(endpoint, options = {}, maxRetries = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.request(endpoint, options);
      } catch (error) {
        lastError = error;
        
        // Não fazer retry para erros 4xx (client errors)
        if (error.message.includes('4')) {
          throw error;
        }
        
        if (attempt < maxRetries) {
          console.warn(`Tentativa ${attempt} falhou, tentando novamente...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    
    throw lastError;
  }

  // Buscar ordens de serviço com filtros
  async getOrdensServico(filters = {}) {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });

    const queryString = params.toString();
    const endpoint = `/api/ordens-servico${queryString ? `?${queryString}` : ''}`;
    
    return this.requestWithRetry(endpoint);
  }

  // Buscar ordens do mês atual
  async getOrdensDoMesAtual() {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const filters = {
      data_inicio: firstDay.toISOString().split('T')[0],
      data_fim: lastDay.toISOString().split('T')[0],
      limit: 1000 // Buscar todas as OS do mês
    };

    return this.getOrdensServico(filters);
  }

  // Buscar grupos de defeito
  async getGruposDefeito() {
    return this.requestWithRetry('/api/grupos-defeito');
  }

  // Buscar subgrupos de defeito
  async getSubgruposDefeito(grupoId = null) {
    const endpoint = grupoId 
      ? `/api/subgrupos-defeito?grupo_id=${grupoId}`
      : '/api/subgrupos-defeito';
    return this.requestWithRetry(endpoint);
  }

  // Buscar subsubgrupos de defeito
  async getSubsubgruposDefeito(subgrupoId = null) {
    const endpoint = subgrupoId 
      ? `/api/subsubgrupos-defeito?subgrupo_id=${subgrupoId}`
      : '/api/subsubgrupos-defeito';
    return this.requestWithRetry(endpoint);
  }

  // Buscar mapeamento de defeitos
  async getMapeamentoDefeitos() {
    return this.requestWithRetry('/api/mapeamento-defeitos');
  }

  // Salvar defeitos não mapeados
  async salvarDefeitosNaoMapeados(defeitos) {
    return this.request('/api/defeitos-nao-mapeados', {
      method: 'POST',
      body: JSON.stringify({ defeitos })
    });
  }

  // Upload de arquivo Excel
  async uploadExcel(file, onProgress = null) {
    const formData = new FormData();
    formData.append('file', file);

    // Se callback de progresso for fornecido, usar XMLHttpRequest
    if (onProgress) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            onProgress(percentComplete);
          }
        });
        
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch {
              resolve(xhr.responseText);
            }
          } else {
            reject(new Error(`Upload failed: ${xhr.status}`));
          }
        });
        
        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });
        
        xhr.open('POST', `${this.API_BASE_URL}/upload-excel`);
        xhr.send(formData);
      });
    }

    return this.request('/upload-excel', {
      method: 'POST',
      body: formData,
      headers: {} // Remove Content-Type para FormData
    });
  }

  // Processar dados temporários
  async processarDados() {
    return this.request('/process-data', {
      method: 'POST'
    });
  }

  // Buscar dados temporários
  async getDadosTemporarios() {
    return this.requestWithRetry('/temp-import-access');
  }

  // Testar conexão com o backend
  async testarConexao() {
    try {
      const response = await this.request('/test-supabase-connection');
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Método para buscar estatísticas gerais
  async getEstatisticasGerais() {
    try {
      const [ordensResponse, gruposResponse] = await Promise.all([
        this.getOrdensDoMesAtual(),
        this.getGruposDefeito()
      ]);

      const ordens = ordensResponse?.data || [];
      const grupos = gruposResponse || [];

      return {
        totalOS: ordens.length,
        totalPecas: ordens.reduce((sum, os) => sum + (parseFloat(os.total_pecas) || 0), 0),
        totalServicos: ordens.reduce((sum, os) => sum + (parseFloat(os.total_servicos) || 0), 0),
        totalGeral: ordens.reduce((sum, os) => sum + (parseFloat(os.total_geral) || 0), 0),
        mecanicosUnicos: new Set(ordens.map(os => os.mecanico_montador).filter(Boolean)).size,
        gruposDefeito: grupos.length,
        ordensRecentes: ordens.slice(0, 10)
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas gerais:', error);
      throw error;
    }
  }
}

// Criar instância única
const apiService = new ApiService();

// Adicionar interceptor de logging para desenvolvimento
if (process.env.NODE_ENV === 'development') {
  apiService.addRequestInterceptor(async (config) => {
    console.log('API Request:', config);
    return config;
  });

  apiService.addResponseInterceptor(async (response) => {
    console.log('API Response:', response.status, response.url);
    return response;
  });
}

export default apiService;

