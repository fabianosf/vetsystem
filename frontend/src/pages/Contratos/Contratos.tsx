import { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  Box,
  Button,
  Card,
  Grid,
  Typography,
  TextField,
  MenuItem,
  Stack,
  Chip,
  IconButton,
  InputAdornment,
  LinearProgress,
  Avatar,
  Divider,
  Paper,
} from '@mui/material';
import {
  Add,
  Search,
  Edit,
  Delete,
  Visibility,
  FilterList,
  Assignment,
  CheckCircle,
  Warning,
  Cancel,
  Schedule,
  CalendarMonth,
  AttachMoney,
} from '@mui/icons-material';
import { useToast } from '../../contexts/ToastContext';

interface Contrato {
  id: number;
  animal: number;
  animal_nome?: string;
  plano: number;
  plano_nome?: string;
  data_inicio: string;
  data_fim: string;
  valor_mensal: number;
  status: string;
  forma_pagamento?: string;
}

export default function Contratos() {
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const toast = useToast();

  useEffect(() => {
    loadContratos();
  }, []);

  const loadContratos = async () => {
    try {
      const response = await api.get('/contratos/');
      setContratos(response.data.results || response.data);
    } catch (error) {
      toast.error('Erro ao carregar contratos');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      ATIVO: 'success',
      PENDENTE: 'warning',
      CANCELADO: 'error',
      EXPIRADO: 'default',
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status: string) => {
    const icons: any = {
      ATIVO: <CheckCircle />,
      PENDENTE: <Schedule />,
      CANCELADO: <Cancel />,
      EXPIRADO: <Warning />,
    };
    return icons[status] || null;
  };

  const calcularDiasRestantes = (dataFim: string) => {
    const hoje = new Date();
    const fim = new Date(dataFim);
    const diff = fim.getTime() - hoje.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const filteredContratos = contratos.filter((contrato) => {
    const matchesSearch = 
      contrato.animal_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contrato.plano_nome?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'TODOS' || contrato.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Box>
        <LinearProgress />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography>Carregando contratos...</Typography>
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
            <Avatar sx={{ bgcolor: 'warning.main', width: 48, height: 48 }}>
              <Assignment />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight={700}>
                Contratos
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gerencie os contratos de planos de saúde
              </Typography>
            </Box>
          </Stack>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          size="large"
          color="warning"
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1.5,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
          }}
        >
          Novo Contrato
        </Button>
      </Box>

      {/* Cards de Estatísticas */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={3}>
        <Card sx={{ flex: 1, p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" fontWeight={700}>
                {contratos.filter(c => c.status === 'ATIVO').length}
              </Typography>
              <Typography variant="body2">Contratos Ativos</Typography>
            </Box>
            <CheckCircle sx={{ fontSize: 40, opacity: 0.8 }} />
          </Stack>
        </Card>

        <Card sx={{ flex: 1, p: 2, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" fontWeight={700}>
                {contratos.filter(c => c.status === 'PENDENTE').length}
              </Typography>
              <Typography variant="body2">Pendentes</Typography>
            </Box>
            <Schedule sx={{ fontSize: 40, opacity: 0.8 }} />
          </Stack>
        </Card>

        <Card sx={{ flex: 1, p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" fontWeight={700}>
                R$ {contratos.filter(c => c.status === 'ATIVO').reduce((acc, c) => acc + c.valor_mensal, 0).toFixed(2)}
              </Typography>
              <Typography variant="body2">Receita Mensal</Typography>
            </Box>
            <AttachMoney sx={{ fontSize: 40, opacity: 0.8 }} />
          </Stack>
        </Card>
      </Stack>

      {/* Filtros */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            placeholder="Buscar por animal ou plano..."
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
            <MenuItem value="ATIVO">Ativo</MenuItem>
            <MenuItem value="PENDENTE">Pendente</MenuItem>
            <MenuItem value="CANCELADO">Cancelado</MenuItem>
            <MenuItem value="EXPIRADO">Expirado</MenuItem>
          </TextField>
        </Stack>
      </Card>

      {/* Lista de Contratos */}
      {filteredContratos.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            Nenhum contrato encontrado
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredContratos.map((contrato) => {
            const diasRestantes = calcularDiasRestantes(contrato.data_fim);
            return (
              <Grid size={{ xs: 12 }} key={contrato.id}>
                <Card
                  sx={{
                    transition: 'all 0.3s',
                    '&:hover': {
                      boxShadow: 4,
                      transform: 'translateX(8px)',
                    },
                  }}
                >
                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={3} alignItems="center">
                      {/* Coluna 1: Avatar e Info */}
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar
                            sx={{
                              width: 56,
                              height: 56,
                              bgcolor: 'primary.light',
                              fontSize: 28,
                            }}
                          >
                            🐾
                          </Avatar>
                          <Box>
                            <Typography variant="h6" fontWeight={700}>
                              {contrato.animal_nome || `Animal #${contrato.animal}`}
                            </Typography>
                            <Typography variant="body2" color="primary" fontWeight={600}>
                              {contrato.plano_nome || `Plano #${contrato.plano}`}
                            </Typography>
                          </Box>
                        </Stack>
                      </Grid>

                      {/* Coluna 2: Datas */}
                      <Grid size={{ xs: 12, md: 3 }}>
                        <Stack spacing={1}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <CalendarMonth sx={{ fontSize: 18, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              Início: {new Date(contrato.data_inicio).toLocaleDateString('pt-BR')}
                            </Typography>
                          </Stack>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <CalendarMonth sx={{ fontSize: 18, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              Fim: {new Date(contrato.data_fim).toLocaleDateString('pt-BR')}
                            </Typography>
                          </Stack>
                          {contrato.status === 'ATIVO' && diasRestantes > 0 && (
                            <Chip
                              label={`${diasRestantes} dias restantes`}
                              size="small"
                              color={diasRestantes < 30 ? 'warning' : 'info'}
                              variant="outlined"
                            />
                          )}
                        </Stack>
                      </Grid>

                      {/* Coluna 3: Valor */}
                      <Grid size={{ xs: 12, md: 2 }}>
                        <Paper sx={{ p: 2, bgcolor: 'success.light', textAlign: 'center' }}>
                          <Typography variant="caption" color="success.dark">
                            Valor Mensal
                          </Typography>
                          <Typography variant="h6" fontWeight={700} color="success.dark">
                            R$ {contrato.valor_mensal.toFixed(2)}
                          </Typography>
                        </Paper>
                      </Grid>

                      {/* Coluna 4: Status e Ações */}
                      <Grid size={{ xs: 12, md: 3 }}>
                        <Stack spacing={1.5} alignItems="flex-end">
                          <Chip
                            icon={getStatusIcon(contrato.status)}
                            label={contrato.status}
                            color={getStatusColor(contrato.status) as any}
                            sx={{ fontWeight: 600 }}
                          />
                          
                          <Stack direction="row" spacing={1}>
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
                        </Stack>
                      </Grid>
                    </Grid>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}
