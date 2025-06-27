import { createContext, useContext, useReducer, useEffect } from 'react'
import ApiService from '../services/api'

// Estado inicial
const initialState = {
  // Dados
  ordensServico: [],
  gruposDefeito: [],
  subgruposDefeito: [],
  mapeamentoDefeitos: [],
  estatisticasGerais: null,
  
  // Estados de loading
  loading: {
    ordensServico: false,
    gruposDefeito: false,
    subgruposDefeito: false,
    mapeamentoDefeitos: false,
    estatisticasGerais: false,
    upload: false
  },
  
  // Estados de erro
  errors: {
    ordensServico: null,
    gruposDefeito: null,
    subgruposDefeito: null,
    mapeamentoDefeitos: null,
    estatisticasGerais: null,
    upload: null
  },
  
  // Filtros ativos
  filtros: {
    dataInicio: null,
    dataFim: null,
    mecanico: null,
    cliente: null,
    defeito: null
  },
  
  // Estado da conexão
  conexao: {
    status: 'unknown', // 'connected', 'disconnected', 'unknown'
    ultimaVerificacao: null
  },
  
  // Estado do upload
  upload: {
    progresso: 0,
    status: null, // 'uploading', 'processing', 'success', 'error'
    resultado: null,
    erro: null
  }
}

// Actions
const ACTIONS = {
  // Loading actions
  SET_LOADING: 'SET_LOADING',
  
  // Data actions
  SET_ORDENS_SERVICO: 'SET_ORDENS_SERVICO',
  SET_GRUPOS_DEFEITO: 'SET_GRUPOS_DEFEITO',
  SET_SUBGRUPOS_DEFEITO: 'SET_SUBGRUPOS_DEFEITO',
  SET_MAPEAMENTO_DEFEITOS: 'SET_MAPEAMENTO_DEFEITOS',
  SET_ESTATISTICAS_GERAIS: 'SET_ESTATISTICAS_GERAIS',
  
  // Error actions
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  
  // Filter actions
  SET_FILTROS: 'SET_FILTROS',
  CLEAR_FILTROS: 'CLEAR_FILTROS',
  
  // Connection actions
  SET_CONEXAO_STATUS: 'SET_CONEXAO_STATUS',
  
  // Upload actions
  SET_UPLOAD_PROGRESSO: 'SET_UPLOAD_PROGRESSO',
  SET_UPLOAD_STATUS: 'SET_UPLOAD_STATUS',
  SET_UPLOAD_RESULTADO: 'SET_UPLOAD_RESULTADO',
  SET_UPLOAD_ERRO: 'SET_UPLOAD_ERRO',
  RESET_UPLOAD: 'RESET_UPLOAD'
}

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.value
        }
      }
    
    case ACTIONS.SET_ORDENS_SERVICO:
      return {
        ...state,
        ordensServico: action.payload,
        loading: { ...state.loading, ordensServico: false },
        errors: { ...state.errors, ordensServico: null }
      }
    
    case ACTIONS.SET_GRUPOS_DEFEITO:
      return {
        ...state,
        gruposDefeito: action.payload,
        loading: { ...state.loading, gruposDefeito: false },
        errors: { ...state.errors, gruposDefeito: null }
      }
    
    case ACTIONS.SET_SUBGRUPOS_DEFEITO:
      return {
        ...state,
        subgruposDefeito: action.payload,
        loading: { ...state.loading, subgruposDefeito: false },
        errors: { ...state.errors, subgruposDefeito: null }
      }
    
    case ACTIONS.SET_MAPEAMENTO_DEFEITOS:
      return {
        ...state,
        mapeamentoDefeitos: action.payload,
        loading: { ...state.loading, mapeamentoDefeitos: false },
        errors: { ...state.errors, mapeamentoDefeitos: null }
      }
    
    case ACTIONS.SET_ESTATISTICAS_GERAIS:
      return {
        ...state,
        estatisticasGerais: action.payload,
        loading: { ...state.loading, estatisticasGerais: false },
        errors: { ...state.errors, estatisticasGerais: null }
      }
    
    case ACTIONS.SET_ERROR:
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.key]: action.payload.error
        },
        loading: {
          ...state.loading,
          [action.payload.key]: false
        }
      }
    
    case ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload]: null
        }
      }
    
    case ACTIONS.SET_FILTROS:
      return {
        ...state,
        filtros: {
          ...state.filtros,
          ...action.payload
        }
      }
    
    case ACTIONS.CLEAR_FILTROS:
      return {
        ...state,
        filtros: initialState.filtros
      }
    
    case ACTIONS.SET_CONEXAO_STATUS:
      return {
        ...state,
        conexao: {
          status: action.payload,
          ultimaVerificacao: new Date()
        }
      }
    
    case ACTIONS.SET_UPLOAD_PROGRESSO:
      return {
        ...state,
        upload: {
          ...state.upload,
          progresso: action.payload
        }
      }
    
    case ACTIONS.SET_UPLOAD_STATUS:
      return {
        ...state,
        upload: {
          ...state.upload,
          status: action.payload
        }
      }
    
    case ACTIONS.SET_UPLOAD_RESULTADO:
      return {
        ...state,
        upload: {
          ...state.upload,
          resultado: action.payload,
          erro: null
        }
      }
    
    case ACTIONS.SET_UPLOAD_ERRO:
      return {
        ...state,
        upload: {
          ...state.upload,
          erro: action.payload,
          status: 'error'
        }
      }
    
    case ACTIONS.RESET_UPLOAD:
      return {
        ...state,
        upload: initialState.upload
      }
    
    default:
      return state
  }
}

// Context
const AppContext = createContext()

// Provider
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Actions
  const actions = {
    // Carregar ordens de serviço
    async carregarOrdensServico(filtros = {}) {
      dispatch({ type: ACTIONS.SET_LOADING, payload: { key: 'ordensServico', value: true } })
      dispatch({ type: ACTIONS.CLEAR_ERROR, payload: 'ordensServico' })
      
      try {
        const response = await ApiService.getOrdensServico(filtros)
        dispatch({ type: ACTIONS.SET_ORDENS_SERVICO, payload: response.data || [] })
      } catch (error) {
        dispatch({ 
          type: ACTIONS.SET_ERROR, 
          payload: { key: 'ordensServico', error: error.message } 
        })
      }
    },

    // Carregar grupos de defeito
    async carregarGruposDefeito() {
      dispatch({ type: ACTIONS.SET_LOADING, payload: { key: 'gruposDefeito', value: true } })
      dispatch({ type: ACTIONS.CLEAR_ERROR, payload: 'gruposDefeito' })
      
      try {
        const response = await ApiService.getGruposDefeito()
        dispatch({ type: ACTIONS.SET_GRUPOS_DEFEITO, payload: response || [] })
      } catch (error) {
        dispatch({ 
          type: ACTIONS.SET_ERROR, 
          payload: { key: 'gruposDefeito', error: error.message } 
        })
      }
    },

    // Carregar subgrupos de defeito
    async carregarSubgruposDefeito(grupoId = null) {
      dispatch({ type: ACTIONS.SET_LOADING, payload: { key: 'subgruposDefeito', value: true } })
      dispatch({ type: ACTIONS.CLEAR_ERROR, payload: 'subgruposDefeito' })
      
      try {
        const response = await ApiService.getSubgruposDefeito(grupoId)
        dispatch({ type: ACTIONS.SET_SUBGRUPOS_DEFEITO, payload: response || [] })
      } catch (error) {
        dispatch({ 
          type: ACTIONS.SET_ERROR, 
          payload: { key: 'subgruposDefeito', error: error.message } 
        })
      }
    },

    // Carregar mapeamento de defeitos
    async carregarMapeamentoDefeitos() {
      dispatch({ type: ACTIONS.SET_LOADING, payload: { key: 'mapeamentoDefeitos', value: true } })
      dispatch({ type: ACTIONS.CLEAR_ERROR, payload: 'mapeamentoDefeitos' })
      
      try {
        const response = await ApiService.getMapeamentoDefeitos()
        dispatch({ type: ACTIONS.SET_MAPEAMENTO_DEFEITOS, payload: response || [] })
      } catch (error) {
        dispatch({ 
          type: ACTIONS.SET_ERROR, 
          payload: { key: 'mapeamentoDefeitos', error: error.message } 
        })
      }
    },

    // Carregar estatísticas gerais
    async carregarEstatisticasGerais() {
      dispatch({ type: ACTIONS.SET_LOADING, payload: { key: 'estatisticasGerais', value: true } })
      dispatch({ type: ACTIONS.CLEAR_ERROR, payload: 'estatisticasGerais' })
      
      try {
        const response = await ApiService.getEstatisticasGerais()
        dispatch({ type: ACTIONS.SET_ESTATISTICAS_GERAIS, payload: response })
      } catch (error) {
        dispatch({ 
          type: ACTIONS.SET_ERROR, 
          payload: { key: 'estatisticasGerais', error: error.message } 
        })
      }
    },

    // Verificar conexão
    async verificarConexao() {
      try {
        const resultado = await ApiService.testarConexao()
        dispatch({ 
          type: ACTIONS.SET_CONEXAO_STATUS, 
          payload: resultado.success ? 'connected' : 'disconnected' 
        })
        return resultado.success
      } catch (error) {
        dispatch({ type: ACTIONS.SET_CONEXAO_STATUS, payload: 'disconnected' })
        return false
      }
    },

    // Upload de arquivo
    async uploadArquivo(file) {
      dispatch({ type: ACTIONS.RESET_UPLOAD })
      dispatch({ type: ACTIONS.SET_UPLOAD_STATUS, payload: 'uploading' })
      
      try {
        const resultado = await ApiService.uploadExcel(file, (progresso) => {
          dispatch({ type: ACTIONS.SET_UPLOAD_PROGRESSO, payload: progresso })
        })
        
        dispatch({ type: ACTIONS.SET_UPLOAD_RESULTADO, payload: resultado })
        dispatch({ type: ACTIONS.SET_UPLOAD_STATUS, payload: 'processing' })
        
        // Processar dados automaticamente
        const processResult = await ApiService.processarDados()
        dispatch({ 
          type: ACTIONS.SET_UPLOAD_RESULTADO, 
          payload: { ...resultado, processResult } 
        })
        dispatch({ type: ACTIONS.SET_UPLOAD_STATUS, payload: 'success' })
        
        // Recarregar dados
        await actions.carregarOrdensServico()
        await actions.carregarEstatisticasGerais()
        
      } catch (error) {
        dispatch({ type: ACTIONS.SET_UPLOAD_ERRO, payload: error.message })
      }
    },

    // Aplicar filtros
    aplicarFiltros(novosFiltros) {
      dispatch({ type: ACTIONS.SET_FILTROS, payload: novosFiltros })
      actions.carregarOrdensServico({ ...state.filtros, ...novosFiltros })
    },

    // Limpar filtros
    limparFiltros() {
      dispatch({ type: ACTIONS.CLEAR_FILTROS })
      actions.carregarOrdensServico()
    },

    // Recarregar todos os dados
    async recarregarTudo() {
      await Promise.all([
        actions.carregarOrdensServico(state.filtros),
        actions.carregarGruposDefeito(),
        actions.carregarMapeamentoDefeitos(),
        actions.carregarEstatisticasGerais()
      ])
    }
  }

  // Verificar conexão periodicamente
  useEffect(() => {
    actions.verificarConexao()
    
    const interval = setInterval(() => {
      actions.verificarConexao()
    }, 30000) // Verificar a cada 30 segundos
    
    return () => clearInterval(interval)
  }, [])

  // Carregar dados iniciais
  useEffect(() => {
    actions.recarregarTudo()
  }, [])

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  )
}

// Hook para usar o contexto
export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp deve ser usado dentro de um AppProvider')
  }
  return context
}

export default AppContext

