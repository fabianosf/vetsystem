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
  CheckCircle,
  Warning,
  Schedule,
  Vaccines,
  Pets,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

interface Vacina {
  id: number;
  animal: number;
  animal_nome?: string;
  nome: string;
  data_aplicacao: string;
  proxima_dose?: string;
  lote?: string;
  fabricante?: string;
  veterinario?: number;
  veterinario_nome?: string;
  status?: string;
}

export default function Vacinas() {
  const [vacinas, setVacinas] = useState<Vacina[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');

  useEffect(() => {
    loadVacinas();
  }, []);

  const loadVacinas = async () => {
    try {
      const response = await api.get('/vacinas/');
      setVacinas(response.data.results || response.data);
    } catch (error) {
      toast.error('Erro ao carregar vacinas');
    } finally {
      setLoading(false);
    }
  };

  const getStatusVacina = (proximaDose?: string) => {
    if (!proximaDose) return { label: 'Única Dose', color: 'default', icon: <CheckCircle /> };
    
    const hoje = new Date();
    const dataProxima = new Date(proximaDose);
    const diasRestantes = Math.floor((dataProxima.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diasRestantes < 0) {
      return { label: 'Vencida', color: 'error', icon: <Warning /> };
    } else if (diasRestantes <= 7) {
      return { label: 'Vence em breve', color: 'warning', icon: <Warning /> };
    } else if (diasRestantes <= 30) {
      return { label: 'Próxima em breve', color: 'info', icon: <Schedule /> };
    }
    return { label: 'Em dia', color: 'success', icon: <CheckCircle /> };
  };

  const filteredVacinas = vacinas.filter((vacina) => {
    const matchesSearch = 
      vacina.animal_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vacina.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vacina.fabricante?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'TODOS') return matchesSearch;
    
    const status = getStatusVacina(vacina.proxima_dose);
    return matchesSearch && status.label.includes(statusFilter);
  });

  if (loading) {
    return (
      <Box>
        <LinearProgress />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography>Carregando vacinas...</Typography>
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
            <Avatar sx={{ bgcolor: 'success.main', width: 48, height: 48 }}>
              <Vaccines />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight={700}>
                Vacinas
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Controle de imunização e carteira de vacinação
              </Typography>
            </Box>
          </Stack>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          size="large"
          color="success"
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1.5,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
          }}
        >
          Registrar Vacina
        </Button>
      </Box>

      {/* Cards de Resumo */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        <Card sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" fontWeight={700}>
                {vacinas.filter(v => getStatusVacina(v.proxima_dose).label === 'Em dia').length}
              </Typography>
              <Typography variant="body2">Em dia</Typography>
            </Box>
            <CheckCircle sx={{ fontSize: 40, opacity: 0.8 }} />
          </Stack>
        </Card>

        <Card sx={{ p: 2, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" fontWeight={700}>
                {vacinas.filter(v => getStatusVacina(v.proxima_dose).label.includes('breve')).length}
              </Typography>
              <Typography variant="body2">Vencendo</Typography>
            </Box>
            <Warning sx={{ fontSize: 40, opacity: 0.8 }} />
          </Stack>
        </Card>

        <Card sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" fontWeight={700}>
                {vacinas.filter(v => getStatusVacina(v.proxima_dose).label === 'Vencida').length}
              </Typography>
              <Typography variant="body2">Vencidas</Typography>
            </Box>
            <Warning sx={{ fontSize: 40, opacity: 0.8 }} />
          </Stack>
        </Card>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            placeholder="Buscar por animal, vacina ou fabricante..."
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
            label="Filtrar por Status"
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
            <MenuItem value="Em dia">Em dia</MenuItem>
            <MenuItem value="breve">Vencendo</MenuItem>
            <MenuItem value="Vencida">Vencidas</MenuItem>
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
                    Vacina
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Data Aplicação
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Próxima Dose
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Lote
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
              {filteredVacinas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Vaccines sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography color="text.secondary">
                      Nenhuma vacina encontrada
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredVacinas.map((vacina) => {
                  const status = getStatusVacina(vacina.proxima_dose);
                  return (
                    <TableRow
                      key={vacina.id}
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
                            <Pets sx={{ fontSize: 18 }} />
                          </Avatar>
                          <Typography variant="body2" fontWeight={600}>
                            {vacina.animal_nome || `Animal #${vacina.animal}`}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {vacina.nome}
                        </Typography>
                        {vacina.fabricante && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {vacina.fabricante}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(vacina.data_aplicacao).toLocaleDateString('pt-BR')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {vacina.proxima_dose ? (
                          <Typography variant="body2" color="primary.main" fontWeight={600}>
                            {new Date(vacina.proxima_dose).toLocaleDateString('pt-BR')}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Dose única
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" fontFamily="monospace">
                          {vacina.lote || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={status.icon}
                          label={status.label}
                          color={status.color as any}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
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
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
