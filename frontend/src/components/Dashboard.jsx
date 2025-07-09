import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Alert, AlertDescription } from '@/components/ui/alert.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { AlertTriangle, Calendar, Download, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import * as XLSX from 'xlsx';

// Componente para os Cards de Estatísticas com comparação
const StatCard = ({ title, value, previousValue, format = 'number', direction = 'higher-is-better' }) => {
  const diff = useMemo(() => {
    if (previousValue === null || previousValue === undefined || value === null || value === undefined) return null;
    if (previousValue === 0) {
      return value > 0 ? Infinity : 0; // Crescimento infinito se partiu de 0
    }
    return ((value - previousValue) / previousValue) * 100;
  }, [value, previousValue]);

  const getDiffColor = () => {
    if (diff === null || diff === 0 || !isFinite(diff)) return 'text-gray-500';
    if (direction === 'higher-is-better') {
      return diff > 0 ? 'text-green-600' : 'text-red-600';
    }
    // lower-is-better
    return diff < 0 ? 'text-green-600' : 'text-red-600';
  };

  const DiffIcon = () => {
    if (diff === null || !isFinite(diff) || diff === 0) return <Minus className="h-4 w-4" />;
    return diff > 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  const formatValue = (val) => {
    if (val === null || val === undefined) return '...';
    switch (format) {
      case 'currency':
        return `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      case 'percent':
        return `${val.toFixed(1)}%`;
      default:
        return val.toLocaleString('pt-BR');
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <div className="flex items-baseline gap-2 mt-1">
          <p className="text-2xl font-bold whitespace-nowrap">{formatValue(value)}</p>
          {diff !== null && (
            <div className={`flex items-center text-xs font-semibold ${getDiffColor()}`}>
              <DiffIcon />
              <span>
                {isFinite(diff) ? `${diff.toFixed(1)}%` : '∞'}
              </span>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {previousValue !== null ? `vs ${formatValue(previousValue)} mês anterior` : 'Sem dados do mês anterior'}
        </p>
      </CardContent>
    </Card>
  );
};


const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [availableDates, setAvailableDates] = useState({ years: [], monthsByYear: {} });
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  
  const [dashboardData, setDashboardData] = useState(null);

  const apiUrl = useMemo(() => import.meta.env.VITE_API_URL || 'http://localhost:3000', []);

  useEffect(() => {
    const fetchAvailableDates = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/dashboard/available-dates`);
        if (!response.ok) throw new Error('Falha ao buscar datas disponíveis.');
        const dates = await response.json();
        if (dates.years.length > 0) {
          setAvailableDates(dates);
          const latestYear = dates.years[0];
          const latestMonth = dates.monthsByYear[latestYear][0];
          setSelectedYear(latestYear);
          setSelectedMonth(latestMonth);
        } else {
          throw new Error('Nenhuma data com dados foi encontrada.');
        }
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchAvailableDates();
  }, [apiUrl]);

  useEffect(() => {
    if (!selectedYear || !selectedMonth) return;

    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${apiUrl}/api/dashboard/data?ano=${selectedYear}&mes=${selectedMonth}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
        }
        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        setError(err.message);
        setDashboardData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedYear, selectedMonth, apiUrl]);

  const getMonthName = (monthNumber) => {
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return months[monthNumber - 1] || 'Desconhecido';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const handleExport = () => {
    if (!dashboardData?.tableData || dashboardData.tableData.length === 0) {
      alert("Não há dados para exportar.");
      return;
    }
    const dataToExport = dashboardData.tableData.map(item => ({
      'OS': item.numero_ordem, 'Data': formatDate(item.data_ordem), 'Status': item.status,
      'Fabricante': item.fabricante_motor, 'Defeitos Classificados': item.classificacao,
      'Mecânico': item.mecanico, 'Total': item.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ordens de Serviço");
    const colWidths = Object.keys(dataToExport[0]).map(col => ({ wch: Math.max(...dataToExport.map(item => item[col]?.toString().length ?? 10), col.length) }));
    worksheet["!cols"] = colWidths;
    XLSX.writeFile(workbook, `Dashboard_Ordens_${selectedYear}_${getMonthName(selectedMonth)}.xlsx`);
  };

  const { currentMetrics, previousMetrics } = useMemo(() => {
    const calculateMetrics = (stats) => {
      if (!stats || stats.totalOS === 0) return { custoMedioOS: 0, taxaClassificacao: 0, totalOS: 0, totalGeral: 0, totalMecanicos: 0 };
      const osClassificadas = stats.totalOS - (stats.osNaoClassificadas || 0);
      return {
        custoMedioOS: stats.totalGeral / stats.totalOS,
        taxaClassificacao: (osClassificadas / stats.totalOS) * 100,
        totalOS: stats.totalOS,
        totalGeral: stats.totalGeral,
        totalMecanicos: stats.totalMecanicos,
      };
    };
    return {
      currentMetrics: calculateMetrics(dashboardData?.stats),
      previousMetrics: calculateMetrics(dashboardData?.previousMonthStats),
    };
  }, [dashboardData]);

  if (loading && !dashboardData) return <div className="text-center p-10">Carregando dados iniciais...</div>;
  if (error && !dashboardData) return (
    <div className="p-4"><Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertDescription><strong>Erro Crítico:</strong> {error}</AlertDescription></Alert></div>
  );

  return (
    <div className="space-y-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Dashboard de Análise de Garantias</h2>
          {selectedMonth && selectedYear && <p className="text-sm text-gray-600">{`Análise de ${getMonthName(selectedMonth)} de ${selectedYear}`}</p>}
        </div>
        <div className="flex gap-2">
          <Select value={selectedYear ? String(selectedYear) : ''} onValueChange={v => { const newYear = Number(v); setSelectedYear(newYear); setSelectedMonth(availableDates.monthsByYear[newYear]?.[0] || null); }} disabled={availableDates.years.length === 0}>
            <SelectTrigger className="w-32"><SelectValue placeholder="Ano" /></SelectTrigger>
            <SelectContent>{availableDates.years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={selectedMonth ? String(selectedMonth) : ''} onValueChange={v => setSelectedMonth(Number(v))} disabled={!selectedYear}>
            <SelectTrigger className="w-32"><SelectValue placeholder="Mês" /></SelectTrigger>
            <SelectContent>{selectedYear && availableDates.monthsByYear[selectedYear]?.map(m => <SelectItem key={m} value={String(m)}>{getMonthName(m)}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      {error && <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertDescription><strong>Erro ao carregar dados:</strong> {error}</AlertDescription></Alert>}

      <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-5 ${loading ? 'opacity-50' : ''}`}>
        <StatCard title="Impacto Financeiro" value={currentMetrics.totalGeral} previousValue={previousMetrics.totalGeral} format="currency" direction="lower-is-better" />
        <StatCard title="Volume de OS" value={currentMetrics.totalOS} previousValue={previousMetrics.totalOS} direction="lower-is-better" />
        <StatCard title="Custo Médio/OS" value={currentMetrics.custoMedioOS} previousValue={previousMetrics.custoMedioOS} format="currency" direction="lower-is-better" />
        <StatCard title="Taxa de Classificação" value={currentMetrics.taxaClassificacao} previousValue={previousMetrics.taxaClassificacao} format="percent" direction="higher-is-better" />
        <StatCard title="Mecânicos Ativos" value={currentMetrics.totalMecanicos} previousValue={previousMetrics.totalMecanicos} direction="neutral" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Ordens de Serviço - {selectedMonth && selectedYear ? `${getMonthName(selectedMonth)} de ${selectedYear}` : 'Selecione o período'}</CardTitle>
            <CardDescription>Detalhamento das ordens de serviço processadas no período</CardDescription>
          </div>
          <Button onClick={handleExport} variant="outline" size="sm" disabled={!dashboardData?.tableData?.length}>
            <Download className="mr-2 h-4 w-4" /> Exportar
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? <div className="text-center p-10">Carregando...</div> : dashboardData?.tableData?.length > 0 ? (
            <div className="relative h-[400px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead>OS</TableHead><TableHead>Data</TableHead><TableHead>Status</TableHead>
                    <TableHead>Fabricante</TableHead><TableHead>Defeitos Classificados</TableHead>
                    <TableHead>Mecânico</TableHead><TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboardData.tableData.map((item) => (
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
            <div className="text-center p-10"><Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" /><h3 className="text-lg font-medium">Nenhuma ordem encontrada</h3><p className="text-sm text-gray-600">Não há dados para o período selecionado.</p></div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;