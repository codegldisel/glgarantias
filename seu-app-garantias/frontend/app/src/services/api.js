// Configuração da API para conectar com o backend
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'https://3000-i4zobsqjb96cawbu6o03s-58323dc2.manusvm.computer';

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
      // Adicionar timeout de 30 segundos
      signal: AbortSignal.timeout(30000),
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
    formData.append('file', file);
    
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

  // Ordens de Serviço
  async getOrdensServico(params = {}) {
    return this.get('/api/ordens-servico', params);
  }

  async getOrdensDoMesAtual() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return this.getOrdensServico({
      data_inicio: startOfMonth.toISOString().split('T')[0],
      data_fim: endOfMonth.toISOString().split('T')[0],
      limit: 1000 // Buscar todas do mês
    });
  }

  // Upload de Excel
  async uploadExcel(file) {
    return this.uploadFile('/upload-excel', file);
  }

  // Processamento de dados
  async processarDados() {
    return this.post('/process-data');
  }

  // Dados temporários
  async getTempImportAccess() {
    return this.get('/temp-import-access');
  }

  // Grupos de Defeito
  async getGruposDefeito() {
    return this.get('/api/grupos-defeito');
  }

  async getSubgruposDefeito(grupoId = null) {
    const params = grupoId ? { grupo_id: grupoId } : {};
    return this.get('/api/subgrupos-defeito', params);
  }

  async getSubsubgruposDefeito(subgrupoId = null) {
    const params = subgrupoId ? { subgrupo_id: subgrupoId } : {};
    return this.get('/api/subsubgrupos-defeito', params);
  }

  // Mapeamento de Defeitos
  async getMapeamentoDefeitos() {
    return this.get('/api/mapeamento-defeitos');
  }

  // Defeitos não mapeados
  async salvarDefeitosNaoMapeados(defeitos) {
    return this.post('/api/defeitos-nao-mapeados', { defeitos });
  }

  // === MÉTODOS DE ANÁLISE E RELATÓRIOS ===

  // Análises por período
  async getAnalisesPorPeriodo(dataInicio, dataFim) {
    return this.getOrdensServico({
      data_inicio: dataInicio,
      data_fim: dataFim,
      limit: 1000
    });
  }

  // Análises por fabricante
  async getAnalisesPorFabricante(fabricante, dataInicio = null, dataFim = null) {
    const params = { fabricante };
    if (dataInicio) params.data_inicio = dataInicio;
    if (dataFim) params.data_fim = dataFim;
    return this.getOrdensServico(params);
  }

  // Análises por mecânico
  async getAnalisesPorMecanico(mecanico, dataInicio = null, dataFim = null) {
    const params = { mecanico };
    if (dataInicio) params.data_inicio = dataInicio;
    if (dataFim) params.data_fim = dataFim;
    return this.getOrdensServico(params);
  }

  // Estatísticas gerais
  async getEstatisticasGerais() {
    const response = await this.getOrdensServico({ limit: 10000 });
    const ordens = response.data || [];
    
    return {
      totalOS: ordens.length,
      totalPecas: ordens.reduce((sum, os) => sum + (parseFloat(os.total_pecas) || 0), 0),
      totalServicos: ordens.reduce((sum, os) => sum + (parseFloat(os.total_servicos) || 0), 0),
      totalGeral: ordens.reduce((sum, os) => sum + (parseFloat(os.total_geral) || 0), 0),
      fabricantes: [...new Set(ordens.map(os => os.fabricante).filter(Boolean))],
      mecanicos: [...new Set(ordens.map(os => os.mecanico_montador).filter(Boolean))],
      defeitos: [...new Set(ordens.map(os => os.defeito).filter(Boolean))]
    };
  }

  // === MÉTODOS DE VALIDAÇÃO ===

  // Verificar conexão com o backend
  async verificarConexao() {
    try {
      const response = await fetch(this.API_BASE_URL);
      return response.ok;
    } catch {
      return false;
    }
  }

  // Verificar saúde da API
  async verificarSaudeAPI() {
    try {
      await this.get('/api/ordens-servico', { limit: 1 });
      return { status: 'ok', message: 'API funcionando corretamente' };
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
    console.log('API Request:', config);
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

