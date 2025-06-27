import '@testing-library/jest-dom';
import i18n from './i18n';

// Mock do fetch global
global.fetch = jest.fn();

// Mock do ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock do IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock do matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock do URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mocked-url');

// Mock do XMLHttpRequest
global.XMLHttpRequest = jest.fn().mockImplementation(() => ({
  open: jest.fn(),
  send: jest.fn(),
  setRequestHeader: jest.fn(),
  addEventListener: jest.fn(),
  upload: {
    addEventListener: jest.fn(),
  },
  readyState: 4,
  status: 200,
  responseText: JSON.stringify({ success: true }),
}));

// Configuração do i18next para testes
beforeAll(() => {
  i18n.init({
    lng: 'pt-BR',
    fallbackLng: 'pt-BR',
    resources: {
      'pt-BR': {
        translation: {
          'Dashboard de Garantias': 'Dashboard de Garantias',
          'Análise de ordens de serviço': 'Análise de ordens de serviço',
          'Total de OS': 'Total de OS',
          'Total Peças': 'Total Peças',
          'Total Serviços': 'Total Serviços',
          'Total Geral': 'Total Geral',
          'Mecânicos Ativos': 'Mecânicos Ativos',
          'Tipos de Defeitos': 'Tipos de Defeitos',
          'Dados indisponíveis': 'Dados indisponíveis',
          'Descrição': 'Descrição',
          'Buscar ordens, defeitos...': 'Buscar ordens, defeitos...'
        }
      }
    }
  });
});

// Limpar mocks após cada teste
afterEach(() => {
  jest.clearAllMocks();
  fetch.mockClear();
}); 