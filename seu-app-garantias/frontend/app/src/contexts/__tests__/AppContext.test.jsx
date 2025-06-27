import { render, screen, waitFor } from '@testing-library/react'
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
      <button 
        data-testid="load-button" 
        onClick={() => actions.carregarOrdensServico()}
      >
        Load Data
      </button>
    </div>
  )
}

describe('AppContext', () => {
  beforeEach(() => {
    ApiService.getOrdensServico.mockClear()
  })

  it('deve renderizar com estado inicial', () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    )

    expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
    expect(screen.getByTestId('error')).toHaveTextContent('No Error')
    expect(screen.getByTestId('data-count')).toHaveTextContent('0')
  })

  it('deve carregar dados com sucesso', async () => {
    const mockData = [
      { id: 1, numero_os: 'OS001' },
      { id: 2, numero_os: 'OS002' }
    ]
    
    ApiService.getOrdensServico.mockResolvedValue({ data: mockData })

    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    )

    screen.getByTestId('load-button').click()

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
      expect(screen.getByTestId('data-count')).toHaveTextContent('2')
    })

    expect(ApiService.getOrdensServico).toHaveBeenCalled()
  })

  it('deve tratar erro ao carregar dados', async () => {
    ApiService.getOrdensServico.mockRejectedValue(new Error('API Error'))

    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    )

    screen.getByTestId('load-button').click()

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
      expect(screen.getByTestId('error')).toHaveTextContent('API Error')
    })
  })

  it('deve aplicar filtros corretamente', async () => {
    const mockData = [{ id: 1, numero_os: 'OS001' }]
    ApiService.getOrdensServico.mockResolvedValue({ data: mockData })

    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    )

    // Simular aplicação de filtros
    const { actions } = useApp()
    actions.aplicarFiltros({ data_inicio: '2025-01-01' })

    await waitFor(() => {
      expect(ApiService.getOrdensServico).toHaveBeenCalledWith(
        expect.objectContaining({ data_inicio: '2025-01-01' })
      )
    })
  })
}) 