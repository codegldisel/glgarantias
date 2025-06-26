// Configuração da API para conectar com o backend
const API_BASE_URL = 'http://localhost:3000';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
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
    
    return this.request(endpoint);
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
    return this.request('/api/grupos-defeito');
  }

  // Buscar subgrupos de defeito
  async getSubgruposDefeito(grupoId = null) {
    const endpoint = grupoId 
      ? `/api/subgrupos-defeito?grupo_id=${grupoId}`
      : '/api/subgrupos-defeito';
    return this.request(endpoint);
  }

  // Buscar mapeamento de defeitos
  async getMapeamentoDefeitos() {
    return this.request('/api/mapeamento-defeitos');
  }

  // Upload de arquivo Excel
  async uploadExcel(file) {
    const formData = new FormData();
    formData.append('file', file);

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
}

export default new ApiService();

