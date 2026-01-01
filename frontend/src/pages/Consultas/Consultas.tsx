import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Avatar,
  Stack,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Search,
  LocalHospital,
  CalendarToday,
  Pets,
  FilterList,
  Clear,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';


interface Consulta {
  id: number;
  animal: {
    id: number;
    name: string;
    species?: string;
  } | null;
  veterinario: {
    id: number;
    name: string;
  } | null;
  tutor?: {
    id: number;
    name: string;
  } | null;
  data: string;
  hora: string;
  motivo: string;
  status: string;
  observacoes?: string;
}


const Consultas: React.FC = () => {
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [dataFilter, setDataFilter] = useState('todos');
  const [veterinarioFilter, setVeterinarioFilter] = useState('todos');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  
  // Dialog de detalhes
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedConsulta, setSelectedConsulta] = useState<Consulta | null>(null);

  // Lista de veterinários (para filtro)
  const [veterinarios, setVeterinarios] = useState<Array<{ id: number; name: string }>>([]);


  useEffect(() => {
    fetchConsultas();
    fetchVeterinarios();
  }, []);


  const fetchConsultas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/consultas/');
      setConsultas(response.data.results || response.data || []);
    } catch (error: any) {
      if (error.response?.status !== 404) {
        console.error('Erro ao carregar consultas:', error);
        toast.error('Erro ao carregar consultas');
      }
      setConsultas([]);
    } finally {
      setLoading(false);
    }
  };


  const fetchVeterinarios = async () => {
    try {
      const response = await api.get('/veterinarios/');
      setVeterinarios(response.data.results || response.data || []);
    } catch (error) {
      console.error('Erro ao carregar veterinários:', error);
    }
  };


  const handleDelete = async (id: number) => {
    if (window.confirm('Deseja realmente excluir esta consulta?')) {
      try {
        await api.delete(`/consultas/${id}/`);
        toast.success('Consulta excluída com sucesso!');
        fetchConsultas();
      } catch (error) {
        toast.error('Erro ao excluir consulta');
      }
    }
  };


  const handleViewDetails = (consulta: Consulta) => {
    setSelectedConsulta(consulta);
    setOpenDialog(true);
  };


  const limparFiltros = () => {
    setSearchTerm('');
    setStatusFilter('todos');
    setDataFilter('todos');
    setVeterinarioFilter('todos');
    setDataInicio('');
    setDataFim('');
  };


  // Aplicar filtros
  const filteredConsultas = consultas.filter((consulta) => {
    // Filtro de busca (animal ou tutor)
    const searchLower = searchTerm.toLowerCase();
    const matchSearch = searchTerm === '' ||
      (consulta.animal?.name || '').toLowerCase().includes(searchLower) ||
      (consulta.tutor?.name || '').toLowerCase().includes(searchLower) ||
      (consulta.motivo || '').toLowerCase().includes(searchLower);

    // Filtro de status
    const matchStatus = statusFilter === 'todos' || consulta.status === statusFilter;

    // Filtro de veterinário
    const matchVeterinario = veterinarioFilter === 'todos' || 
      consulta.veterinario?.id === parseInt(veterinarioFilter);

    // Filtro de data
    let matchData = true;
    const consultaData = new Date(consulta.data);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (dataFilter === 'hoje') {
      matchData = consultaData.toDateString() === hoje.toDateString();
    } else if (dataFilter === 'proximos7dias') {
      const seteDiasDepois = new Date(hoje);
      seteDiasDepois.setDate(seteDiasDepois.getDate() + 7);
      matchData = consultaData >= hoje && consultaData <= seteDiasDepois;
    } else if (dataFilter === 'customizado') {
      if (dataInicio) {
        const inicio = new Date(dataInicio);
        matchData = consultaData >= inicio;
      }
      if (dataFim) {
        const fim = new Date(dataFim);
        matchData = matchData && consultaData <= fim;
      }
    }

    return matchSearch && matchStatus && matchVeterinario && matchData;
  });


  // Estatísticas
  const stats = {
    total: filteredConsultas.length,
    agendadas: filteredConsultas.filter(c => c.status === 'agendada').length,
    concluidas: filteredConsultas.filter(c => c.status === 'concluida').length,
    canceladas: filteredConsultas.filter(c => c.status === 'cancelada').length,
  };


  // Função para cor do status
  const getStatusColor = (status: string) => {
    const colors: { [key: string]: any } = {
      'agendada': 'primary',
      'em_andamento': 'warning',
      'concluida': 'success',
      'cancelada': 'error',
    };
    return colors[status] || 'default';
  };


  // Função para traduzir status
  const translateStatus = (status: string) => {
    const translations: { [key: string]: string } = {
      'agendada': 'Agendada',
      'em_andamento': 'Em Andamento',
      'concluida': 'Concluída',
      'cancelada': 'Cancelada',
    };
    return translations[status] || status;
  };


  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };


  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
            <LocalHospital />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight={700}>
              Consultas
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gerencie as consultas veterinárias
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => window.location.href = '/agendamento'}
          size="large"
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1.5,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
          }}
        >
          Nova Consulta
        </Button>
      </Box>


      {/* Cards de Estatísticas */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {stats.total}
                </Typography>
              </Box>
              <LocalHospital sx={{ fontSize: 40, color: 'primary.main', opacity: 0.3 }} />
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Agendadas
                </Typography>
                <Typography variant="h4" fontWeight={700} color="primary.main">
                  {stats.agendadas}
                </Typography>
              </Box>
              <CalendarToday sx={{ fontSize: 40, color: 'primary.main', opacity: 0.3 }} />
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Concluídas
                </Typography>
                <Typography variant="h4" fontWeight={700} color="success.main">
                  {stats.concluidas}
                </Typography>
              </Box>
              <Pets sx={{ fontSize: 40, color: 'success.main', opacity: 0.3 }} />
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Canceladas
                </Typography>
                <Typography variant="h4" fontWeight={700} color="error.main">
                  {stats.canceladas}
                </Typography>
              </Box>
              <Delete sx={{ fontSize: 40, color: 'error.main', opacity: 0.3 }} />
            </Stack>
          </CardContent>
        </Card>
      </Box>


      {/* Filtros */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
          <FilterList color="primary" />
          <Typography variant="h6" fontWeight={600}>
            Filtros
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            variant="outlined"
            size="small"
            startIcon={<Clear />}
            onClick={limparFiltros}
          >
            Limpar Filtros
          </Button>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
            gap: 2,
          }}
        >
          {/* Busca */}
          <TextField
            fullWidth
            placeholder="Buscar por animal, tutor ou motivo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />

          {/* Filtro de Status */}
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status"
            >
              <MenuItem value="todos">Todos os Status</MenuItem>
              <MenuItem value="agendada">Agendada</MenuItem>
              <MenuItem value="em_andamento">Em Andamento</MenuItem>
              <MenuItem value="concluida">Concluída</MenuItem>
              <MenuItem value="cancelada">Cancelada</MenuItem>
            </Select>
          </FormControl>

          {/* Filtro de Data */}
          <FormControl fullWidth>
            <InputLabel>Período</InputLabel>
            <Select
              value={dataFilter}
              onChange={(e) => setDataFilter(e.target.value)}
              label="Período"
            >
              <MenuItem value="todos">Todas as Datas</MenuItem>
              <MenuItem value="hoje">Hoje</MenuItem>
              <MenuItem value="proximos7dias">Próximos 7 dias</MenuItem>
              <MenuItem value="customizado">Personalizado</MenuItem>
            </Select>
          </FormControl>

          {/* Filtro de Veterinário */}
          <FormControl fullWidth>
            <InputLabel>Veterinário</InputLabel>
            <Select
              value={veterinarioFilter}
              onChange={(e) => setVeterinarioFilter(e.target.value)}
              label="Veterinário"
            >
              <MenuItem value="todos">Todos os Veterinários</MenuItem>
              {veterinarios.map((vet) => (
                <MenuItem key={vet.id} value={vet.id.toString()}>
                  {vet.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Filtro de Data Customizado */}
        {dataFilter === 'customizado' && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: 2,
              mt: 2,
            }}
          >
            <TextField
              fullWidth
              type="date"
              label="Data Início"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              type="date"
              label="Data Fim"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        )}
      </Card>


      {/* Tabela de Consultas */}
      <Card>
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Animal
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Tutor
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Veterinário
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Data/Hora
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Motivo
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Status
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle2" fontWeight={700}>
                    Ações
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredConsultas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <LocalHospital sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography color="text.secondary">
                      {searchTerm || statusFilter !== 'todos' || dataFilter !== 'todos' || veterinarioFilter !== 'todos'
                        ? 'Nenhuma consulta encontrada com os filtros aplicados'
                        : 'Nenhuma consulta cadastrada'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredConsultas.map((consulta) => (
                  <TableRow key={consulta.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <Pets />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {consulta.animal?.name || 'Animal não especificado'}
                          </Typography>
                          {consulta.animal?.species && (
                            <Typography variant="caption" color="text.secondary">
                              {consulta.animal.species}
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {consulta.tutor?.name || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {consulta.veterinario?.name || 'Não especificado'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {formatDate(consulta.data)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {consulta.hora || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {consulta.motivo || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={translateStatus(consulta.status)}
                        color={getStatusColor(consulta.status)}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="Visualizar">
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => handleViewDetails(consulta)}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton size="small" color="primary">
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(consulta.id)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>


      {/* Dialog de Detalhes */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <Visibility />
            <Typography variant="h6" fontWeight={600}>
              Detalhes da Consulta
            </Typography>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent>
          {selectedConsulta && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Animal
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {selectedConsulta.animal?.name || 'Não especificado'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Tutor
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {selectedConsulta.tutor?.name || '-'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Veterinário
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {selectedConsulta.veterinario?.name || 'Não especificado'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Data e Hora
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {formatDate(selectedConsulta.data)} às {selectedConsulta.hora || '-'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Motivo
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {selectedConsulta.motivo || '-'}
                </Typography>
              </Box>

              {selectedConsulta.observacoes && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Observações
                  </Typography>
                  <Typography variant="body1">
                    {selectedConsulta.observacoes}
                  </Typography>
                </Box>
              )}

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Status
                </Typography>
                <Box mt={1}>
                  <Chip
                    label={translateStatus(selectedConsulta.status)}
                    color={getStatusColor(selectedConsulta.status)}
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)} variant="outlined">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};


export default Consultas;
