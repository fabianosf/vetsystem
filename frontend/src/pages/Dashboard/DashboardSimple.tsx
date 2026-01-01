import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Stack,
  Paper,
  Divider,
  LinearProgress,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Pets,
  CalendarMonth,
  TrendingUp,
  AttachMoney,
  People,
  MedicalServices,
  Schedule,
  ArrowForward,
  Warning,
  CheckCircle,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
//import api from '../../services/api';

interface DashboardStats {
  total_animais: number;
  consultas_hoje: number;
  consultas_mes: number;
  receita_mensal: number;
  tutores_ativos: number;
  vacinas_vencendo: number;
}

export default function DashboardSimple() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    total_animais: 0,
    consultas_hoje: 0,
    consultas_mes: 0,
    receita_mensal: 0,
    tutores_ativos: 0,
    vacinas_vencendo: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // const response = await api.get('/dashboard/stats/');
      // setStats(response.data);
      
      // Dados mockados para demonstração
      setStats({
        total_animais: 156,
        consultas_hoje: 8,
        consultas_mes: 124,
        receita_mensal: 45280.50,
        tutores_ativos: 98,
        vacinas_vencendo: 12,
      });
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const proximasConsultas = [
    { id: 1, animal: 'Rex', tutor: 'João Silva', horario: '09:00', status: 'confirmado' },
    { id: 2, animal: 'Mimi', tutor: 'Maria Santos', horario: '10:30', status: 'pendente' },
    { id: 3, animal: 'Thor', tutor: 'Ana Paula', horario: '14:00', status: 'confirmado' },
    { id: 4, animal: 'Luna', tutor: 'Carlos Souza', horario: '15:30', status: 'confirmado' },
  ];

  if (loading) {
    return (
      <Box>
        <LinearProgress />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography>Carregando dashboard...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
          <DashboardIcon />
        </Avatar>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Visão geral do sistema
          </Typography>
        </Box>
      </Box>

      {/* Cards de Estatísticas */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        {/* Total Animais */}
        <Card
          sx={{
            cursor: 'pointer',
            transition: 'all 0.3s',
            '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
          }}
          onClick={() => navigate('/animais')}
        >
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="start">
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total de Animais
                </Typography>
                <Typography variant="h3" fontWeight={700} color="primary.main">
                  {stats.total_animais}
                </Typography>
                <Chip label="+12 este mês" size="small" color="success" sx={{ mt: 1 }} />
              </Box>
              <Avatar sx={{ bgcolor: 'primary.light' }}>
                <Pets sx={{ color: 'primary.main' }} />
              </Avatar>
            </Stack>
          </CardContent>
        </Card>

        {/* Consultas Hoje */}
        <Card
          sx={{
            cursor: 'pointer',
            transition: 'all 0.3s',
            '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
          }}
          onClick={() => navigate('/agendamento')}
        >
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="start">
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Consultas Hoje
                </Typography>
                <Typography variant="h3" fontWeight={700} color="info.main">
                  {stats.consultas_hoje}
                </Typography>
                <Chip label={`${stats.consultas_mes} no mês`} size="small" color="info" sx={{ mt: 1 }} />
              </Box>
              <Avatar sx={{ bgcolor: 'info.light' }}>
                <CalendarMonth sx={{ color: 'info.main' }} />
              </Avatar>
            </Stack>
          </CardContent>
        </Card>

        {/* Receita Mensal */}
        <Card
          sx={{
            cursor: 'pointer',
            transition: 'all 0.3s',
            '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
          }}
          onClick={() => navigate('/relatorios')}
        >
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="start">
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Receita Mensal
                </Typography>
                <Typography variant="h3" fontWeight={700} color="success.main">
                  R$ {stats.receita_mensal.toLocaleString('pt-BR')}
                </Typography>
                <Chip label="+8.5% vs mês anterior" size="small" color="success" sx={{ mt: 1 }} />
              </Box>
              <Avatar sx={{ bgcolor: 'success.light' }}>
                <AttachMoney sx={{ color: 'success.main' }} />
              </Avatar>
            </Stack>
          </CardContent>
        </Card>

        {/* Tutores Ativos */}
        <Card
          sx={{
            cursor: 'pointer',
            transition: 'all 0.3s',
            '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
          }}
          onClick={() => navigate('/tutores')}
        >
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="start">
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Tutores Ativos
                </Typography>
                <Typography variant="h3" fontWeight={700} color="secondary.main">
                  {stats.tutores_ativos}
                </Typography>
                <Chip label="Cadastrados" size="small" color="secondary" sx={{ mt: 1 }} />
              </Box>
              <Avatar sx={{ bgcolor: 'secondary.light' }}>
                <People sx={{ color: 'secondary.main' }} />
              </Avatar>
            </Stack>
          </CardContent>
        </Card>

        {/* Vacinas Vencendo */}
        <Card
          sx={{
            cursor: 'pointer',
            transition: 'all 0.3s',
            '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
          }}
          onClick={() => navigate('/vacinas')}
        >
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="start">
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Vacinas Vencendo
                </Typography>
                <Typography variant="h3" fontWeight={700} color="warning.main">
                  {stats.vacinas_vencendo}
                </Typography>
                <Chip label="Próximos 7 dias" size="small" color="warning" sx={{ mt: 1 }} />
              </Box>
              <Avatar sx={{ bgcolor: 'warning.light' }}>
                <Warning sx={{ color: 'warning.main' }} />
              </Avatar>
            </Stack>
          </CardContent>
        </Card>

        {/* Taxa de Ocupação */}
        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="start">
              <Box flex={1}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Taxa de Ocupação
                </Typography>
                <Typography variant="h3" fontWeight={700} color="primary.main" gutterBottom>
                  78%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={78}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <Avatar sx={{ bgcolor: 'primary.light' }}>
                <TrendingUp sx={{ color: 'primary.main' }} />
              </Avatar>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
          gap: 3,
        }}
      >
        {/* Próximas Consultas */}
        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={600}>
                Próximas Consultas
              </Typography>
              <IconButton size="small" color="primary" onClick={() => navigate('/agendamento')}>
                <ArrowForward />
              </IconButton>
            </Stack>
            <Divider sx={{ mb: 2 }} />

            <List>
              {proximasConsultas.map((consulta) => (
                <ListItem
                  key={consulta.id}
                  sx={{
                    bgcolor: 'grey.50',
                    borderRadius: 2,
                    mb: 1,
                    '&:hover': { bgcolor: 'grey.100' },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <Pets />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight={600}>
                        {consulta.animal} - {consulta.tutor}
                      </Typography>
                    }
                    secondary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Schedule sx={{ fontSize: 14 }} />
                        <Typography variant="caption">{consulta.horario}</Typography>
                        <Chip
                          label={consulta.status}
                          size="small"
                          color={consulta.status === 'confirmado' ? 'success' : 'warning'}
                          sx={{ height: 20, fontSize: 10 }}
                        />
                      </Stack>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>

        {/* Alertas e Notificações */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Alertas e Notificações
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Stack spacing={2}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: 'warning.50',
                  border: '1px solid',
                  borderColor: 'warning.200',
                }}
              >
                <Stack direction="row" spacing={2} alignItems="start">
                  <Warning color="warning" />
                  <Box>
                    <Typography variant="body2" fontWeight={600} gutterBottom>
                      12 vacinas vencendo
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Verifique a carteira de vacinação dos animais
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: 'info.50',
                  border: '1px solid',
                  borderColor: 'info.200',
                }}
              >
                <Stack direction="row" spacing={2} alignItems="start">
                  <MedicalServices color="info" />
                  <Box>
                    <Typography variant="body2" fontWeight={600} gutterBottom>
                      8 consultas agendadas hoje
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Prepare-se para atender os pacientes
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: 'success.50',
                  border: '1px solid',
                  borderColor: 'success.200',
                }}
              >
                <Stack direction="row" spacing={2} alignItems="start">
                  <CheckCircle color="success" />
                  <Box>
                    <Typography variant="body2" fontWeight={600} gutterBottom>
                      Sistema atualizado
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Todas as funcionalidades estão operando normalmente
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
