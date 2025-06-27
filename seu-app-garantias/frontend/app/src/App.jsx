import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppProvider } from './contexts/AppContext'
import ErrorBoundary from './components/common/ErrorBoundary'
import Layout from './components/layout/Layout'
import DashboardPage from './pages/DashboardPage'
import OrdensServicoPage from './pages/OrdensServicoPage'
import UploadExcelPage from './pages/UploadExcelPage'
import AnalisesPage from './pages/AnalisesPage'
import DefeitosPage from './pages/DefeitosPage'
import MecanicosPage from './pages/MecanicosPage'
import RelatoriosPage from './pages/RelatoriosPage'
import ConfiguracoesPage from './pages/ConfiguracoesPage'
import './App.css'

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/ordens-servico" element={<OrdensServicoPage />} />
              <Route path="/upload-excel" element={<UploadExcelPage />} />
              <Route path="/analises" element={<AnalisesPage />} />
              <Route path="/defeitos" element={<DefeitosPage />} />
              <Route path="/mecanicos" element={<MecanicosPage />} />
              <Route path="/relatorios" element={<RelatoriosPage />} />
              <Route path="/configuracoes" element={<ConfiguracoesPage />} />
            </Routes>
          </Layout>
        </Router>
      </AppProvider>
    </ErrorBoundary>
  )
}

export default App
