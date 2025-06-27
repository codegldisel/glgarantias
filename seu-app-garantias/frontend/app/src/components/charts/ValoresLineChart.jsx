import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import ApiService from '../../services/api'

const ValoresLineChart = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadValoresData()
  }, [])

  const loadValoresData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await ApiService.getOrdensServico()
      
      if (response && response.data) {
        const ordens = response.data
        
        // Agrupar por mês
        const valoresPorMes = {}
        ordens.forEach(os => {
          if (os.data_os) {
            const data = new Date(os.data_os)
            const mesAno = `${String(data.getMonth() + 1).padStart(2, '0')}/${data.getFullYear()}`
            
            if (!valoresPorMes[mesAno]) {
              valoresPorMes[mesAno] = {
                mes: mesAno,
                totalPecas: 0,
                totalServicos: 0,
                totalGeral: 0,
                quantidade: 0
              }
            }
            
            valoresPorMes[mesAno].totalPecas += parseFloat(os.total_pecas) || 0
            valoresPorMes[mesAno].totalServicos += parseFloat(os.total_servicos) || 0
            valoresPorMes[mesAno].totalGeral += parseFloat(os.total_geral) || 0
            valoresPorMes[mesAno].quantidade += 1
          }
        })
        
        // Converter para array e ordenar por data
        const valoresArray = Object.values(valoresPorMes)
          .sort((a, b) => {
            const [mesA, anoA] = a.mes.split('/')
            const [mesB, anoB] = b.mes.split('/')
            return new Date(anoA, mesA - 1) - new Date(anoB, mesB - 1)
          })
        
        setData(valoresArray)
      } else {
        setError('Nenhum dado encontrado')
      }
    } catch (err) {
      console.error('Erro ao carregar dados de valores:', err)
      setError('Erro ao carregar dados de valores. Verifique sua conexão.')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: <span className="font-semibold">{formatCurrency(entry.value)}</span>
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="w-full h-80 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-80 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">{error}</p>
          <button 
            onClick={loadValoresData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Evolução dos Valores por Mês</h3>
        <p className="text-sm text-gray-600">Valores totais de peças, serviços e geral ao longo do tempo</p>
      </div>
      
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mes" />
          <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="totalPecas" 
            stroke="#EF4444" 
            strokeWidth={2}
            name="Total Peças"
            dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="totalServicos" 
            stroke="#10B981" 
            strokeWidth={2}
            name="Total Serviços"
            dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="totalGeral" 
            stroke="#3B82F6" 
            strokeWidth={2}
            name="Total Geral"
            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default ValoresLineChart

