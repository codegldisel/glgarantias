import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Checkbox } from '@/components/ui/checkbox.jsx';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.jsx';
import { DatePickerWithRange } from '@/components/ui/date-picker.jsx';
import { 
  Search, 
  Edit, 
  X, 
  AlertTriangle, 
  Download, 
  Settings2, 
  Filter,
  ChevronUp,
  ChevronDown,
  FileText,
  Users,
  DollarSign
} from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

const OrdensServico = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'data_ordem', direction: 'desc' });

  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    fabricante: 'all',
    modelo: 'all',
    mecanico: 'all',
    defeito_grupo: 'all',
    defeito_subgrupo: 'all',
    defeito_subsubgrupo: 'all',
    dateRange: { from: null, to: null },
  });
  const debouncedSearch = useDebounce(filters.search, 500);

  const [filterOptions, setFilterOptions] = useState({ 
    status: [], 
    mecanicos: [], 
    fabricantes: [],
    modelos: [],
    defeito_grupos: [],
    defeito_subgrupos: [],
    defeito_subsubgrupos: []
  });

  const [visibleColumns, setVisibleColumns] = useState({
    numero_ordem: true,
    data_ordem: true,
    status: true,
    fabricante_motor: true,
    modelo_motor: true,
    defeito_grupo: true,
    defeito_subgrupo: false,
    defeito_subsubgrupo: false,
    defeito_texto_bruto: false,
    mecanico_responsavel: true,
    total_pecas: true,
    total_servico: true,
    total_geral: true,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newClassification, setNewClassification] = useState('');

  const apiUrl = '/api';

  // Cálculo de estatísticas resumidas
  const stats = {
    totalOrders: pagination.total,
    totalCost: orders.reduce((sum, order) => sum + (order.total_geral || 0), 0),
    avgCost: orders.length > 0 ? orders.reduce((sum, order) => sum + (order.total_geral || 0), 0) / orders.length : 0
  };

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
      if (filters.fabricante !== 'all') params.append('fabricante', filters.fabricante);
      if (filters.modelo !== 'all') params.append('modelo', filters.modelo);
      if (filters.mecanico !== 'all') params.append('mecanico', filters.mecanico);
      if (filters.defeito_grupo !== 'all') params.append('defeito_grupo', filters.defeito_grupo);
      if (filters.defeito_subgrupo !== 'all') params.append('defeito_subgrupo', filters.defeito_subgrupo);
      if (filters.defeito_subsubgrupo !== 'all') params.append('defeito_subsubgrupo', filters.defeito_subsubgrupo);
      if (filters.dateRange.from) params.append('startDate', filters.dateRange.from.toISOString().split('T')[0]);
      if (filters.dateRange.to) params.append('endDate', filters.dateRange.to.toISOString().split('T')[0]);
      if (sortConfig.key) {
        params.append('sortBy', sortConfig.key);
        params.append('sortOrder', sortConfig.direction);
      }

      const res = await fetch(`${apiUrl}/ordens?${params.toString()}`);
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
  }, [pagination.page, pagination.limit, debouncedSearch, filters, sortConfig, apiUrl]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await fetch(`${apiUrl}/ordens/filters/options`);
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
    setFilters({ 
      search: '', 
      status: 'all', 
      fabricante: 'all',
      modelo: 'all',
      mecanico: 'all', 
      defeito_grupo: 'all',
      defeito_subgrupo: 'all',
      defeito_subsubgrupo: 'all',
      dateRange: { from: null, to: null } 
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleClassifyClick = (order) => {
    setSelectedOrder(order);
    setNewClassification(order.defeito_grupo || '');
    setIsModalOpen(true);
  };

  const handleSaveClassification = async () => {
    if (!selectedOrder || !newClassification) return;
    try {
      const res = await fetch(`${apiUrl}/ordens/${selectedOrder.id}/classificar`, {
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

  const exportData = () => {
    const csvContent = [
      Object.keys(visibleColumns).filter(key => visibleColumns[key]).join(','),
      ...orders.map(order => 
        Object.keys(visibleColumns)
          .filter(key => visibleColumns[key])
          .map(key => order[key] || '')
          .join(',')
      )
    ].join('\\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ordens_servico.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getActiveFiltersCount = () => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === 'dateRange') return value.from || value.to;
      return value !== 'all' && value !== '';
    }).length;
  };

  const SortableHeader = ({ column, children }) => (
    <TableHead 
      className="cursor-pointer hover:bg-muted/50 select-none"
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortConfig.key === column && (
          sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
        )}
      </div>
    </TableHead>
  );

  return (
    <div className="h-full flex flex-col gap-6 p-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <FileText className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total de Ordens</p>
              <p className="text-2xl font-bold">{stats.totalOrders.toLocaleString('pt-BR')}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <DollarSign className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Custo Total</p>
              <p className="text-2xl font-bold">R$ {stats.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Custo Médio</p>
              <p className="text-2xl font-bold">R$ {stats.avgCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Área de Filtros */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="secondary">{getActiveFiltersCount()}</Badge>
                )}
              </CardTitle>
              <CardDescription>Filtre e pesquise as ordens de serviço</CardDescription>
            </div>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings2 className="h-4 w-4 mr-2" />
                    Colunas
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-2">
                    <h4 className="font-medium">Colunas Visíveis</h4>
                    {Object.entries(visibleColumns).map(([key, visible]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={key}
                          checked={visible}
                          onCheckedChange={(checked) => 
                            setVisibleColumns(prev => ({ ...prev, [key]: checked }))
                          }
                        />
                        <label htmlFor={key} className="text-sm capitalize">
                          {key.replace(/_/g, ' ')}
                        </label>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              <Button onClick={exportData} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            <Input
              placeholder="Buscar por OS ou defeito..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="lg:col-span-2"
              icon={<Search className="h-4 w-4" />}
            />
            
            <Select value={filters.status} onValueChange={(v) => handleFilterChange('status', v)}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                {filterOptions.status.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={filters.fabricante} onValueChange={(v) => handleFilterChange('fabricante', v)}>
              <SelectTrigger><SelectValue placeholder="Fabricante" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Fabricantes</SelectItem>
                {filterOptions.fabricantes.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={filters.modelo} onValueChange={(v) => handleFilterChange('modelo', v)}>
              <SelectTrigger><SelectValue placeholder="Modelo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Modelos</SelectItem>
                {filterOptions.modelos.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={filters.mecanico} onValueChange={(v) => handleFilterChange('mecanico', v)}>
              <SelectTrigger><SelectValue placeholder="Mecânico" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Mecânicos</SelectItem>
                {filterOptions.mecanicos.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={filters.defeito_grupo} onValueChange={(v) => handleFilterChange('defeito_grupo', v)}>
              <SelectTrigger><SelectValue placeholder="Grupo Defeito" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Grupos</SelectItem>
                {filterOptions.defeito_grupos.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
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

          {/* Tags de Filtros Ativos */}
          {getActiveFiltersCount() > 0 && (
            <div className="flex flex-wrap gap-2">
              {Object.entries(filters).map(([key, value]) => {
                if (key === 'dateRange' && (value.from || value.to)) {
                  return (
                    <Badge key={key} variant="secondary" className="flex items-center gap-1">
                      Data: {value.from?.toLocaleDateString('pt-BR')} - {value.to?.toLocaleDateString('pt-BR')}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => handleFilterChange('dateRange', { from: null, to: null })}
                      />
                    </Badge>
                  );
                }
                if (value !== 'all' && value !== '') {
                  return (
                    <Badge key={key} variant="secondary" className="flex items-center gap-1">
                      {key}: {value}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => handleFilterChange(key, key === 'search' ? '' : 'all')}
                      />
                    </Badge>
                  );
                }
                return null;
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabela de Dados */}
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle>Ordens de Serviço</CardTitle>
          <CardDescription>
            Exibindo {orders.length} de {pagination.total} registros
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p>Carregando...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64 text-red-600">
              <AlertTriangle className="mr-2" />
              {error}
            </div>
          ) : orders.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma ordem de serviço encontrada</p>
                <p className="text-sm">Tente ajustar os filtros</p>
              </div>
            </div>
          ) : (
            <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 400px)' }}>
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10 border-b">
                  <TableRow>
                    {visibleColumns.numero_ordem && (
                      <SortableHeader column="numero_ordem">OS</SortableHeader>
                    )}
                    {visibleColumns.data_ordem && (
                      <SortableHeader column="data_ordem">Data</SortableHeader>
                    )}
                    {visibleColumns.status && (
                      <SortableHeader column="status">Status</SortableHeader>
                    )}
                    {visibleColumns.fabricante_motor && (
                      <SortableHeader column="fabricante_motor">Fabricante</SortableHeader>
                    )}
                    {visibleColumns.modelo_motor && (
                      <SortableHeader column="modelo_motor">Modelo Motor</SortableHeader>
                    )}
                    {visibleColumns.defeito_grupo && (
                      <SortableHeader column="defeito_grupo">Defeito (Grupo)</SortableHeader>
                    )}
                    {visibleColumns.defeito_subgrupo && (
                      <SortableHeader column="defeito_subgrupo">Subgrupo</SortableHeader>
                    )}
                    {visibleColumns.defeito_subsubgrupo && (
                      <SortableHeader column="defeito_subsubgrupo">Subsubgrupo</SortableHeader>
                    )}
                    {visibleColumns.defeito_texto_bruto && (
                      <TableHead>Defeito (Texto)</TableHead>
                    )}
                    {visibleColumns.mecanico_responsavel && (
                      <SortableHeader column="mecanico_responsavel">Mecânico</SortableHeader>
                    )}
                    {visibleColumns.total_pecas && (
                      <SortableHeader column="total_pecas">Total Peças</SortableHeader>
                    )}
                    {visibleColumns.total_servico && (
                      <SortableHeader column="total_servico">Total Serviços</SortableHeader>
                    )}
                    {visibleColumns.total_geral && (
                      <SortableHeader column="total_geral">Total Geral</SortableHeader>
                    )}
                    <TableHead className="w-[80px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order, index) => (
                    <TableRow key={order.id} className={index % 2 === 0 ? 'bg-muted/20' : ''}>
                      {visibleColumns.numero_ordem && (
                        <TableCell className="font-medium">{order.numero_ordem}</TableCell>
                      )}
                      {visibleColumns.data_ordem && (
                        <TableCell>{new Date(order.data_ordem).toLocaleDateString('pt-BR')}</TableCell>
                      )}
                      {visibleColumns.status && (
                        <TableCell>
                          <Badge variant={order.status === 'Garantia' ? 'default' : 'secondary'}>
                            {order.status}
                          </Badge>
                        </TableCell>
                      )}
                      {visibleColumns.fabricante_motor && (
                        <TableCell>{order.fabricante_motor}</TableCell>
                      )}
                      {visibleColumns.modelo_motor && (
                        <TableCell className="max-w-[200px] truncate" title={order.modelo_motor}>
                          {order.modelo_motor}
                        </TableCell>
                      )}
                      {visibleColumns.defeito_grupo && (
                        <TableCell className="max-w-[200px] truncate" title={order.defeito_grupo}>
                          {order.defeito_grupo || (
                            <Badge variant="outline" className="text-orange-600">
                              Não Classificado
                            </Badge>
                          )}
                        </TableCell>
                      )}
                      {visibleColumns.defeito_subgrupo && (
                        <TableCell className="max-w-[150px] truncate" title={order.defeito_subgrupo}>
                          {order.defeito_subgrupo || '-'}
                        </TableCell>
                      )}
                      {visibleColumns.defeito_subsubgrupo && (
                        <TableCell className="max-w-[150px] truncate" title={order.defeito_subsubgrupo}>
                          {order.defeito_subsubgrupo || '-'}
                        </TableCell>
                      )}
                      {visibleColumns.defeito_texto_bruto && (
                        <TableCell className="max-w-[300px] truncate" title={order.defeito_texto_bruto}>
                          {order.defeito_texto_bruto}
                        </TableCell>
                      )}
                      {visibleColumns.mecanico_responsavel && (
                        <TableCell className="max-w-[150px] truncate" title={order.mecanico_responsavel}>
                          {order.mecanico_responsavel}
                        </TableCell>
                      )}
                      {visibleColumns.total_pecas && (
                        <TableCell className="text-right">
                          R$ {order.total_pecas?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                      )}
                      {visibleColumns.total_servico && (
                        <TableCell className="text-right">
                          R$ {order.total_servico?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                      )}
                      {visibleColumns.total_geral && (
                        <TableCell className="text-right font-medium">
                          R$ {order.total_geral?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                      )}
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
      
      {/* Paginação */}
      {!loading && !error && orders.length > 0 && (
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div className="text-sm text-muted-foreground">
              Página {pagination.page} de {pagination.totalPages} • {pagination.total} registros
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => setPagination(p => ({...p, page: p.page - 1}))} 
                disabled={pagination.page <= 1} 
                size="sm"
                variant="outline"
              >
                Anterior
              </Button>
              <Button 
                onClick={() => setPagination(p => ({...p, page: p.page + 1}))} 
                disabled={pagination.page >= pagination.totalPages} 
                size="sm"
                variant="outline"
              >
                Próximo
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              {pagination.limit} registros por página
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de Classificação */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Classificar Ordem de Serviço</DialogTitle>
            <DialogDescription>OS: {selectedOrder?.numero_ordem}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <h4 className="font-semibold mb-2">Defeito Reportado:</h4>
              <p className="text-sm p-3 bg-muted rounded-md max-h-32 overflow-y-auto">
                {selectedOrder?.defeito_texto_bruto}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Nova Classificação:</h4>
              <Select value={newClassification} onValueChange={setNewClassification}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um grupo de defeito" />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.defeito_grupos.map(g => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveClassification} disabled={!newClassification}>
              Salvar Classificação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdensServico;

