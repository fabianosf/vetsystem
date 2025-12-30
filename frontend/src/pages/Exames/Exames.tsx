import { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  Box,
  Button,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  MenuItem,
  Stack,
  Chip,
  IconButton,
  InputAdornment,
  Paper,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  Add,
  Search,
  Edit,
  Delete,
  Visibility,
  FilterList,
  PendingActions,
  CheckCircle,
  HourglassEmpty,
  Description,
} from '@mui/icons-material';
import { useToast } from '../../contexts/ToastContext';

interface Exame {
  id: number;
  animal: number;
  animal_nome?: string;
  tipo: string;
  data_solicitacao: string;
  data_resultado?: string;
  status: string;
  resultado?: string;
  veterinario?: number;
  veterinario_nome?: string;
  laboratorio?: string;
}

export default function Exames() {
  const [exames, setExames] = useState<Exame[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const toast = useToast();

  useEffect(() => {
    loadExames();
  }, []);

  const loadExames = async () => {
    try {
      const response = await api.get('/exames/');
      setExames(response.data.results || response.data);
    } catch (error) {
      toast.error('Erro ao carregar exames');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      SOLICITADO: 'warning',
      EM_ANALISE: 'info',
      CONCLUIDO: 'success',
      CANCELADO: 'error',
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status: string) => {
    const labels: any = {
      SOLICITADO: 'Solicitado',
      EM_ANALISE: 'Em Análise',
      CONCLUIDO: 'Concluído',
      CANCELADO: 'Cancelado',
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status: string) => {
    const icons: any = {
      SOLICITADO: <PendingActions fontSize="small" />,
      EM_ANALISE: <HourglassEmpty fontSize="small" />,
      CONCLUIDO: <CheckCircle fontSize="small" />,
      CANCELADO: <Delete fontSize="small" />,
    };
    return icons[status] || null;
  };

  const getTipoExameLabel = (tipo: string) => {
    const tipos: any = {
      HEMOGRAMA: 'Hemograma Completo',
      BIOQUIMICA: 'Bioquímica',
      URINA: 'Exame de Urina',
      FEZES: 'Exame de Fezes',
      ULTRASSOM: 'Ultrassom',
      RAIO_X: 'Raio-X',
      TOMOGRAFIA: 'Tomografia',
    };
    return tipos[tipo] || tipo;
  };

  const filteredExames = exames.filter((exame) => {
    const matchesSearch = 
      exame.animal_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getTipoExameLabel(exame.tipo).toLowerCase().includes(searchTerm.toLowerCase()) ||
      exame.laboratorio?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'TODOS' || exame.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Box>
        <LinearProgress />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography>Carregando exames...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ bgcolor: 'info.main', width: 48, height: 48 }}>
              🔬
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight={700}>
                Exames
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Solicitações e resultados de exames laboratoriais
              </Typography>
            </Box>
          </Stack>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          size="large"
          color="info"
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1.5,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(14, 165, 233, 0.4)',
          }}
        >
          Solicitar Exame
        </Button>
      </Box>

      {/* Cards de Resumo */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={3}>
        <Card sx={{ flex: 1, p: 2, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" fontWeight={700}>
                {exames.filter(e => e.status === 'SOLICITADO').length}
              </Typography>
              <Typography variant="body2">Solicitados</Typography>
            </Box>
            <PendingActions sx={{ fontSize: 40, opacity: 0.8 }} />
          </Stack>
        </Card>

        <Card sx={{ flex: 1, p: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" fontWeight={700}>
                {exames.filter(e => e.status === 'EM_ANALISE').length}
              </Typography>
              <Typography variant="body2">Em Análise</Typography>
            </Box>
            <HourglassEmpty sx={{ fontSize: 40, opacity: 0.8 }} />
          </Stack>
        </Card>

        <Card sx={{ flex: 1, p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" fontWeight={700}>
                {exames.filter(e => e.status === 'CONCLUIDO').length}
              </Typography>
              <Typography variant="body2">Concluídos</Typography>
            </Box>
            <CheckCircle sx={{ fontSize: 40, opacity: 0.8 }} />
          </Stack>
        </Card>
      </Stack>

      {/* Filtros */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            placeholder="Buscar por animal, tipo de exame ou laboratório..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ maxWidth: { sm: 400 } }}
          />
          
          <TextField
            select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FilterList />
                </InputAdornment>
              ),
            }}
          >
            <MenuItem value="TODOS">Todos</MenuItem>
            <MenuItem value="SOLICITADO">Solicitado</MenuItem>
            <MenuItem value="EM_ANALISE">Em Análise</MenuItem>
            <MenuItem value="CONCLUIDO">Concluído</MenuItem>
            <MenuItem value="CANCELADO">Cancelado</MenuItem>
          </TextField>
        </Stack>
      </Card>

      {/* Tabela */}
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
                    Tipo de Exame
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Data Solicitação
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Data Resultado
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Laboratório
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Status
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="subtitle2" fontWeight={700}>
                    Ações
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredExames.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      Nenhum exame encontrado
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredExames.map((exame) => (
                  <TableRow
                    key={exame.id}
                    hover
                    sx={{
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light' }}>
                          🐾
                        </Avatar>
                        <Typography variant="body2" fontWeight={600}>
                          {exame.animal_nome || `Animal #${exame.animal}`}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {getTipoExameLabel(exame.tipo)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(exame.data_solicitacao).toLocaleDateString('pt-BR')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {exame.data_resultado ? (
                        <Typography variant="body2" color="success.main" fontWeight={600}>
                          {new Date(exame.data_resultado).toLocaleDateString('pt-BR')}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Aguardando
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {exame.laboratorio || 'Não especificado'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(exame.status)}
                        label={getStatusLabel(exame.status)}
                        color={getStatusColor(exame.status) as any}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        {exame.status === 'CONCLUIDO' && (
                          <IconButton size="small" color="success">
                            <Description fontSize="small" />
                          </IconButton>
                        )}
                        <IconButton size="small" color="primary">
                          <Visibility fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="primary">
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <Delete fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
