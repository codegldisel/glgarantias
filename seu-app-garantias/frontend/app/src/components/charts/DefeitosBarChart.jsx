import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useApp } from '../../contexts/AppContext'
import LoadingSpinner from '../common/LoadingSpinner'

const DefeitosBarChart = () => {
  const { state } = useApp()
  const { ordensServico, loading, errors } = state
  const [data, setData] = useState([])

  useEffect(() => {
    if (ordensServico.length > 0) {
      processDefeitosData()
    }
  }, [ordensServico])

  const processDefeitosData = () => {
    // Contar defeitos
    const defeitosCount = {}
    ordensServico.forEach(os => {
      if (os.defeito && os.defeito.trim() !== '') {
        const defeito = os.defeito.trim()
        defeitosCount[defeito] = (defeitosCount[defeito] || 0) + 1
      }
    })
    
    // Converter para array e ordenar pelos mais comuns
    const defeitosArray = Object.entries(defeitosCount)
      .map(([defeito, quantidade]) => ({
        defeito: defeito.length > 30 ? defeito.substring(0, 30) + '...' : defeito,
        quantidade,
        defeitoCompleto: defeito
      }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 10) // Top 10 defeitos
    
    setData(defeitosArray)
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{data.defeitoCompleto}</p>
          <p className="text-blue-600">
            Quantidade: <span className="font-semibold">{payload[0].value}</span>
          </p>
        </div>
      )
    }
    return null
  }

  if (loading.ordensServico) {
    return (
      <div className="w-full h-80 flex items-center justify-center">
        <LoadingSpinner text="Carregando dados de defeitos..." />
      </div>
    )
  }

  if (errors.ordensServico) {
    return (
      <div className="w-full h-80 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">{errors.ordensServico}</p>
          <p className="text-sm text-gray-600">Erro ao carregar dados de defeitos</p>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-2">Nenhum dado de defeito encontrado</p>
          <p className="text-sm text-gray-500">Importe dados para visualizar os gráficos</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Top 10 Defeitos Mais Comuns</h3>
        <p className="text-sm text-gray-600">Quantidade de ocorrências por tipo de defeito</p>
      </div>
      
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="defeito" 
            angle={-45}
            textAnchor="end"
            height={80}
            fontSize={12}
          />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar 
            dataKey="quantidade" 
            fill="#3B82F6" 
            name="Quantidade de Ocorrências"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default DefeitosBarChart

