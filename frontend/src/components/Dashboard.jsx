import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Alert, AlertDescription } from '@/components/ui/alert.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { AlertTriangle, RefreshCw, FileText, DollarSign, Users, Target, Clock, BarChart3, Calendar, AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [availableDates, setAvailableDates] = useState({ years: [], monthsByYear: {} });
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  
  const [dashboardData, setDashboardData] = useState(null);

  const apiUrl = useMemo(() => import.meta.env.VITE_API_URL || 'http://localhost:3000', []);

  // Efeito 1: Buscar as datas disponíveis (anos e meses) ao montar o componente
  useEffect(() => {
    const fetchAvailableDates = async () => {
      try {
        console.log('Buscando datas disponíveis...');
        const response = await fetch(`${apiUrl}/api/dashboard/available-dates`);
        if (!response.ok) throw new Error('Falha ao buscar datas disponíveis.');
        
        const dates = await response.json();
        console.log('Datas recebidas:', dates);

        if (dates.years.length > 0) {
          setAvailableDates(dates);
          // Define o ano e mês mais recente como padrão
          const latestYear = dates.years[0];
          const latestMonth = dates.monthsByYear[latestYear][0];
          setSelectedYear(latestYear);
          setSelectedMonth(latestMonth);
        } else {
          throw new Error('Nenhuma data com dados foi encontrada no banco de dados.');
        }
      } catch (err) {
        console.error('Erro ao buscar datas:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    fetchAvailableDates();
  }, [apiUrl]);

  // Efeito 2: Buscar os dados do dashboard sempre que o mês ou ano selecionado mudar
  useEffect(() => {
    if (!selectedYear || !selectedMonth) return;

    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log(`Buscando dados para ${selectedMonth}/${selectedYear}...`);
        const response = await fetch(`${apiUrl}/api/dashboard/data?ano=${selectedYear}&mes=${selectedMonth}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
        }
        const data = await response.json();
        console.log('Dados do dashboard recebidos:', data);
        setDashboardData(data);
      } catch (err) {
        console.error('Erro ao buscar dados do dashboard:', err);
        setError(err.message);
        setDashboardData(null); // Limpa dados antigos em caso de erro
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedYear, selectedMonth, apiUrl]);

  const handleRetry = () => {
    if (!selectedYear || !selectedMonth) {
      // Tenta recarregar as datas se a seleção inicial falhou
      window.location.reload();
    } else {
      // Tenta recarregar os dados do dashboard
      const fetchDashboardData = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await fetch(`${apiUrl}/api/dashboard/data?ano=${selectedYear}&mes=${selectedMonth}`);
          if (!response.ok) throw new Error('Falha ao recarregar dados.');
          const data = await response.json();
          setDashboardData(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchDashboardData();
    }
  };

  const getMonthName = (monthNumber) => {
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return months[monthNumber - 1] || 'Desconhecido';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getConfiancaColor = (confianca) => {
    if (confianca >= 0.9) return 'text-green-600';
    if (confianca >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const stats = dashboardData?.stats;
  const tableData = dashboardData?.tableData;

  const metrics = useMemo(() => {
    if (!stats) return {};
    const custoMedioOS = stats.totalOS > 0 ? stats.totalGeral / stats.totalOS : 0;
    const percentualPecas = stats.totalGeral > 0 ? (stats.totalPecas / stats.totalGeral) * 100 : 0;
    const percentualServicos = stats.totalGeral > 0 ? (stats.totalServicos / stats.totalGeral) * 100 : 0;
    const osClassificadas = stats.totalOS - (stats.osNaoClassificadas || 0);
    const taxaClassificacao = stats.totalOS > 0 ? (osClassificadas / stats.totalOS) * 100 : 0;
    return { custoMedioOS, percentualPecas, percentualServicos, taxaClassificacao, osClassificadas };
  }, [stats]);

  if (loading && !dashboardData) {
    return <div className="text-center p-10">Carregando dados iniciais...</div>;
  }

  if (error && !dashboardData) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Erro Crítico:</strong> {error}
            <Button onClick={handleRetry} className="ml-4">Tentar Novamente</Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Dashboard de Análise de Garantias</h2>
          {selectedMonth && selectedYear && (
            <p className="text-sm text-gray-600">
              {`Análise detalhada de ${getMonthName(selectedMonth)} de ${selectedYear}`}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Select
            value={selectedYear ? String(selectedYear) : ''}
            onValueChange={v => {
              const newYear = Number(v);
              setSelectedYear(newYear);
              // Ao mudar o ano, seleciona o primeiro mês disponível para aquele ano
              const firstMonthForYear = availableDates.monthsByYear[newYear]?.[0];
              setSelectedMonth(firstMonthForYear || null);
            }}
            disabled={availableDates.years.length === 0}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {availableDates.years.map(y => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={selectedMonth ? String(selectedMonth) : ''}
            onValueChange={v => setSelectedMonth(Number(v))}
            disabled={!selectedYear}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {selectedYear && availableDates.monthsByYear[selectedYear]?.map(m => (
                <SelectItem key={m} value={String(m)}>{getMonthName(m)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Erro ao carregar dados:</strong> {error}
            <Button onClick={handleRetry} className="ml-4">Tentar Novamente</Button>
          </AlertDescription>
        </Alert>
      )}

      {/* KPI Cards */}
      <div className={`grid gap-6 md:grid-cols-2 lg:grid-cols-6 ${loading ? 'opacity-50' : ''}`}>
        <Card><CardContent className="p-6"><p className="text-sm font-medium">Volume de OS</p><p className="text-2xl font-bold">{stats ? stats.totalOS.toLocaleString() : '...'}</p></CardContent></Card>
        <Card><CardContent className="p-6"><p className="text-sm font-medium">Custo Médio/OS</p><p className="text-2xl font-bold">{stats ? `R$ ${metrics.custoMedioOS?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '...'}</p></CardContent></Card>
        <Card><CardContent className="p-6"><p className="text-sm font-medium">Taxa Classificação</p><p className="text-2xl font-bold">{stats ? `${metrics.taxaClassificacao?.toFixed(1)}%` : '...'}</p></CardContent></Card>
        <Card><CardContent className="p-6"><p className="text-sm font-medium">Peças vs Serviços</p><p className="text-lg font-bold">{stats ? `${metrics.percentualPecas?.toFixed(0)}% / ${metrics.percentualServicos?.toFixed(0)}%` : '...'}</p></CardContent></Card>
        <Card><CardContent className="p-6"><p className="text-sm font-medium">Mecânicos Ativos</p><p className="text-2xl font-bold">{stats ? stats.totalMecanicos : '...'}</p></CardContent></Card>
        <Card><CardContent className="p-6"><p className="text-sm font-medium">Impacto Financeiro</p><p className="text-2xl font-bold">{stats ? `R$ ${stats.totalGeral?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '...'}</p></CardContent></Card>
      </div>

      {/* Tabela do Mês */}
      <Card>
        <CardHeader>
          <CardTitle>Ordens de Serviço - {selectedMonth && selectedYear ? `${getMonthName(selectedMonth)} de ${selectedYear}` : 'Selecione o período'}</CardTitle>
          <CardDescription>Detalhamento das ordens de serviço processadas no período selecionado</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center p-10">Carregando dados da tabela...</div>
          ) : tableData && tableData.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>OS</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Fabricante</TableHead>
                    <TableHead>Defeitos Classificados</TableHead>
                    <TableHead>Mecânico</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.numero_ordem}</TableCell>
                      <TableCell>{formatDate(item.data_ordem)}</TableCell>
                      <TableCell><Badge>{item.status}</Badge></TableCell>
                      <TableCell>{item.fabricante_motor}</TableCell>
                      <TableCell className="max-w-xs truncate" title={item.classificacao}>{item.classificacao}</TableCell>
                      <TableCell>{item.mecanico}</TableCell>
                      <TableCell>R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center p-10">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium">Nenhuma ordem encontrada</h3>
              <p className="text-sm text-gray-600">Não há dados para o período selecionado.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;