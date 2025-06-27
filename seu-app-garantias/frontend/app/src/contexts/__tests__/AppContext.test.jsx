import { render, screen, act, waitFor } from '@testing-library/react'
import { AppProvider, useApp } from '../AppContext'
import ApiService from '../../services/api'

// Mock do ApiService
jest.mock('../../services/api')

const TestComponent = () => {
  const { state, actions } = useApp()
  
  return (
    <div>
      <div data-testid="loading">{state.loading.ordensServico ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="error">{state.errors.ordensServico || 'No Error'}</div>
      <div data-testid="data-count">{state.ordensServico.length}</div>
      <button onClick={() => actions.carregarOrdensServico()}>Load Data</button>
      <button onClick={() => actions.aplicarFiltros({ dataInicio: '2024-01-01' })}>Apply Filter</button>
      <button onClick={() => actions.verificarConexao()}>Check Connection</button>
    </div>
  )
}

// Mock das funções do ApiService
const mockApiService = {
  getOrdensServico: jest.fn(),
  getGruposDefeito: jest.fn(),
  getMapeamentoDefeitos: jest.fn(),
  getEstatisticasGerais: jest.fn(),
  testarConexao: jest.fn()
}

ApiService.getOrdensServico = mockApiService.getOrdensServico
ApiService.getGruposDefeito = mockApiService.getGruposDefeito
ApiService.getMapeamentoDefeitos = mockApiService.getMapeamentoDefeitos
ApiService.getEstatisticasGerais = mockApiService.getEstatisticasGerais
ApiService.testarConexao = mockApiService.testarConexao

describe('AppContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock das chamadas automáticas do useEffect
    mockApiService.getOrdensServico.mockResolvedValue({ data: [] })
    mockApiService.getGruposDefeito.mockResolvedValue([])
    mockApiService.getMapeamentoDefeitos.mockResolvedValue([])
    mockApiService.getEstatisticasGerais.mockResolvedValue({})
    mockApiService.testarConexao.mockResolvedValue({ success: true })
  })

  it('deve renderizar com estado inicial', async () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    )

    // Aguardar as chamadas automáticas terminarem
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
    })

    expect(screen.getByTestId('error')).toHaveTextContent('No Error')
    expect(screen.getByTestId('data-count')).toHaveTextContent('0')
  })

  it('deve carregar ordens de serviço com sucesso', async () => {
    const mockData = [
      { id: 1, numero_os: 'OS001' },
      { id: 2, numero_os: 'OS002' }
    ]
    
    mockApiService.getOrdensServico.mockResolvedValue({ data: mockData })

    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    )

    // Aguardar carregamento inicial
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
    })

    // Clicar no botão para carregar dados
    await act(async () => {
      screen.getByText('Load Data').click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('data-count')).toHaveTextContent('2')
    })

    expect(mockApiService.getOrdensServico).toHaveBeenCalled()
  })

  it('deve lidar com erro ao carregar dados', async () => {
    mockApiService.getOrdensServico.mockRejectedValue(new Error('API Error'))

    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    )

    // Aguardar carregamento inicial
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
    })

    // Clicar no botão para carregar dados
    await act(async () => {
      screen.getByText('Load Data').click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('API Error')
    })

    expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
  })

  it('deve aplicar filtros corretamente', async () => {
    mockApiService.getOrdensServico.mockResolvedValue({ data: [] })

    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    )

    // Aguardar carregamento inicial
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
    })

    await act(async () => {
      screen.getByText('Apply Filter').click()
    })

    await waitFor(() => {
      expect(mockApiService.getOrdensServico).toHaveBeenCalledWith(
        expect.objectContaining({ dataInicio: '2024-01-01' })
      )
    })
  })

  it('deve verificar conexão', async () => {
    mockApiService.testarConexao.mockResolvedValue({ success: true })

    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    )

    // Aguardar carregamento inicial
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
    })

    await act(async () => {
      screen.getByText('Check Connection').click()
    })

    expect(mockApiService.testarConexao).toHaveBeenCalled()
  })
}) 