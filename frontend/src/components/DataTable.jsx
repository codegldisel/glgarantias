import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog.jsx';
import { DatePickerWithRange } from '@/components/ui/date-picker.jsx';
import { Search, Edit, X, AlertTriangle } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

const DataTable = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 30, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    mecanico: 'all',
    dateRange: { from: null, to: null },
  });
  const debouncedSearch = useDebounce(filters.search, 500);

  const [filterOptions, setFilterOptions] = useState({ status: [], mecanicos: [], defeito_grupos: [] });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newClassification, setNewClassification] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
      });
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.mecanico !== 'all') params.append('mecanico', filters.mecanico);
      if (filters.dateRange.from) params.append('startDate', filters.dateRange.from.toISOString().split('T')[0]);
      if (filters.dateRange.to) params.append('endDate', filters.dateRange.to.toISOString().split('T')[0]);

      const res = await fetch(`${apiUrl}/api/ordens?${params.toString()}`);
      if (!res.ok) throw new Error('Falha ao carregar os dados.');
      const json = await res.json();
      
      setOrders(json.data || []);
      setPagination(json.pagination);
    } catch (e) {
      setError(e.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearch, filters, apiUrl]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/ordens/filters/options`);
        const json = await res.json();
        setFilterOptions(json);
      } catch (e) {
        console.error("Falha ao buscar opções de filtro:", e);
      }
    };
    fetchOptions();
  }, [apiUrl]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ search: '', status: 'all', mecanico: 'all', dateRange: { from: null, to: null } });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleClassifyClick = (order) => {
    setSelectedOrder(order);
    setNewClassification(order.defeito_grupo || '');
    setIsModalOpen(true);
  };

  const handleSaveClassification = async () => {
    if (!selectedOrder || !newClassification) return;
    try {
      const res = await fetch(`${apiUrl}/api/ordens/${selectedOrder.id}/classificar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ defeito_grupo: newClassification }),
      });
      if (!res.ok) throw new Error('Falha ao salvar a classificação.');
      
      fetchOrders();
      setIsModalOpen(false);
      setSelectedOrder(null);
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="h-full flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Ordens de Serviço</CardTitle>
          <CardDescription>Visualize, filtre e classifique todas as ordens de serviço.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              placeholder="Buscar por OS ou defeito..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="lg:col-span-2"
            />
            <Select value={filters.status} onValueChange={(v) => handleFilterChange('status', v)}>
              <SelectTrigger><SelectValue placeholder="Filtrar por status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                {filterOptions.status.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filters.mecanico} onValueChange={(v) => handleFilterChange('mecanico', v)}>
              <SelectTrigger><SelectValue placeholder="Filtrar por mecânico" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Mecânicos</SelectItem>
                {filterOptions.mecanicos.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
            <DatePickerWithRange
              date={filters.dateRange}
              onDateChange={(range) => handleFilterChange('dateRange', range)}
              className="lg:col-span-2"
            />
            <Button onClick={clearFilters} variant="outline" className="lg:col-span-2">
              <X className="mr-2 h-4 w-4" /> Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardContent className="flex-1 overflow-y-auto p-0">
          {loading ? (
            <div className="flex items-center justify-center h-full">Carregando...</div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-red-600"><AlertTriangle className="mr-2" />{error}</div>
          ) : (
            <div style={{ maxHeight: '500px', overflowY: 'auto', overflowX: 'auto', width: '100%' }}>
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead className="w-[100px]">OS</TableHead>
                    <TableHead className="w-[120px]">Data</TableHead>
                    <TableHead>Fabricante</TableHead>
                    <TableHead className="w-[150px]">Modelo Motor</TableHead>
                    <TableHead>Defeito (Classificado)</TableHead>
                    <TableHead>Mecânico</TableHead>
                    <TableHead className="w-[130px]">Total Peças</TableHead>
                    <TableHead className="w-[130px]">Total Serviços</TableHead>
                    <TableHead className="w-[130px]">Total Geral</TableHead>
                    <TableHead className="w-[80px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.numero_ordem}</TableCell>
                      <TableCell>{new Date(order.data_ordem).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>{order.fabricante_motor}</TableCell>
                      <TableCell className="truncate" title={order.modelo_motor}>{order.modelo_motor}</TableCell>
                      <TableCell className="truncate" title={order.defeito_grupo}>{order.defeito_grupo || 'Não Classificado'}</TableCell>
                      <TableCell className="truncate" title={order.mecanico_responsavel}>{order.mecanico_responsavel}</TableCell>
                      <TableCell>R$ {order.total_pecas?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell>R$ {order.total_servico?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell>R$ {order.total_geral?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleClassifyClick(order)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {!loading && !error && (
        <div className="flex-shrink-0 flex items-center justify-between text-sm text-muted-foreground">
          <span>Página {pagination.page} de {pagination.totalPages}</span>
          <div className="flex gap-2">
            <Button onClick={() => setPagination(p => ({...p, page: p.page - 1}))} disabled={pagination.page <= 1} size="sm">Anterior</Button>
            <Button onClick={() => setPagination(p => ({...p, page: p.page + 1}))} disabled={pagination.page >= pagination.totalPages} size="sm">Próximo</Button>
          </div>
          <span>Total de {pagination.total} registros</span>
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Classificar Ordem de Serviço</DialogTitle>
            <DialogDescription>OS: {selectedOrder?.numero_ordem}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <h4 className="font-semibold mb-2">Defeito Reportado:</h4>
              <p className="text-sm p-3 bg-muted rounded-md">{selectedOrder?.defeito_texto_bruto}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Nova Classificação:</h4>
              <Select value={newClassification} onValueChange={setNewClassification}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um grupo de defeito" />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.defeito_grupos.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveClassification}>Salvar Classificação</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DataTable;
