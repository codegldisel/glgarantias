import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import ApiService from '../../services/api'

const MecanicosPieChart = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Cores para o gráfico de pizza com melhor contraste
  const COLORS = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
    '#A855F7', '#F43F5E', '#14B8A6', '#EAB308', '#7C3AED'
  ]

  useEffect(() => {
    loadMecanicosData()
  }, [])

  const loadMecanicosData = async () => {
    try {
      setLoading(true)
      const response = await ApiService.getOrdensServico()
      
      if (response && response.data) {
        const ordens = response.data
        
        // Contar OS por mecânico
        const mecanicoCount = {}
        ordens.forEach(os => {
          if (os.mecanico_montador && os.mecanico_montador.trim() !== '') {
            const mecanico = os.mecanico_montador.trim()
            mecanicoCount[mecanico] = (mecanicoCount[mecanico] || 0) + 1
          }
        })
        
        // Converter para array e ordenar
        const mecanicosArray = Object.entries(mecanicoCount)
          .map(([mecanico, quantidade]) => ({
            mecanico,
            quantidade,
            porcentagem: ((quantidade / ordens.length) * 100).toFixed(1)
          }))
          .sort((a, b) => b.quantidade - a.quantidade)
          .slice(0, 10) // Top 10 mecânicos
        
        setData(mecanicosArray)
      }
    } catch (err) {
      console.error('Erro ao carregar dados de mecânicos:', err)
      setError('Erro ao carregar dados de mecânicos')
    } finally {
      setLoading(false)
    }
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{data.mecanico}</p>
          <p className="text-blue-600">
            Quantidade: <span className="font-semibold">{data.quantidade}</span>
          </p>
          <p className="text-green-600">
            Porcentagem: <span className="font-semibold">{data.porcentagem}%</span>
          </p>
        </div>
      )
    }
    return null
  }

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null // Não mostrar label se for menor que 5%
    
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
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
            onClick={loadMecanicosData}
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
        <h3 className="text-lg font-semibold text-gray-800">Distribuição de OS por Mecânico</h3>
        <p className="text-sm text-gray-600">Porcentagem de ordens de serviço por mecânico</p>
      </div>
      
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={120}
            fill="#8884d8"
            dataKey="quantidade"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry) => (
              <span style={{ color: entry.color }}>
                {entry.payload.mecanico} ({entry.payload.quantidade})
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export default MecanicosPieChart

