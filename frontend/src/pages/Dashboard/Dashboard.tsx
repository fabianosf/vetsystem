import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box, Grid, Card, CardContent, Typography, Avatar, Stack,
  LinearProgress, Chip, Paper, List, ListItem, ListItemText,
  ListItemAvatar, Divider, IconButton, Tooltip
} from '@mui/material';
import {
  Pets, Person, MedicalServices, LocalHospital, TrendingUp,
  CalendarToday, Vaccines, Science,AttachMoney, PictureAsPdf
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

interface DashboardStats {
  total_tutores: number;
  total_animais: number;
  total_veterinarios: number;
  total_consultas: number;
  consultas_hoje: number;
  consultas_mes: number;
  animais_por_especie: { especie: string; total: number }[];
  consultas_por_mes: { mes: string; total: number }[];
  veterinarios_ativos: number;
  planos_ativos: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Carregar dados em paralelo
      const [tutoresRes, animaisRes, veterinariosRes, consultasRes, planosRes] = await Promise.all([
        api.get('/tutores/'),
        api.get('/animais/'),
        api.get('/veterinarios/'),
        api.get('/consultas/'),
        api.get('/planos/'),
      ]);

      const tutores = tutoresRes.data.results || tutoresRes.data;
      const animais = animaisRes.data.results || animaisRes.data;
      const veterinarios = veterinariosRes.data.results || veterinariosRes.data;
      const consultas = consultasRes.data.results || consultasRes.data;
      const planos = planosRes.data.results || planosRes.data;

      // Processar estatísticas
      const hoje = new Date().toISOString().split('T')[0];
      const mesAtual = new Date().getMonth();

      const consultasHoje = consultas.filter((c: any) => 
        c.data?.startsWith(hoje) || c.data_consulta?.startsWith(hoje)
      ).length;

      const consultasMes = consultas.filter((c: any) => {
        const dataConsulta = c.data || c.data_consulta;
        if (!dataConsulta) return false;
        return new Date(dataConsulta).getMonth() === mesAtual;
      }).length;

      // Animais por espécie
      const especiesCount: any = {};
      animais.forEach((animal: any) => {
        const especie = animal.species || 'Outro';
        especiesCount[especie] = (especiesCount[especie] || 0) + 1;
      });

      const animaisPorEspecie = Object.entries(especiesCount).map(([especie, total]) => ({
        especie,
        total: total as number,
      }));

      // Consultas por mês (últimos 6 meses)
      const consultasPorMes = Array.from({ length: 6 }, (_, i) => {
        const mes = new Date();
        mes.setMonth(mes.getMonth() - (5 - i));
        const mesNum = mes.getMonth();
        const ano = mes.getFullYear();
        
        const consultasDoMes = consultas.filter((c: any) => {
          const dataConsulta = c.data || c.data_consulta;
          if (!dataConsulta) return false;
          const d = new Date(dataConsulta);
          return d.getMonth() === mesNum && d.getFullYear() === ano;
        }).length;

        return {
          mes: mes.toLocaleDateString('pt-BR', { month: 'short' }),
          total: consultasDoMes,
        };
      });

      const veterinariosAtivos = veterinarios.filter((v: any) => v.status === 'ATIVO').length;
      const planosAtivos = planos.filter((p: any) => p.is_active).length;

      setStats({
        total_tutores: tutores.length,
        total_animais: animais.length,
        total_veterinarios: veterinarios.length,
        total_consultas: consultas.length,
        consultas_hoje: consultasHoje,
        consultas_mes: consultasMes,
        animais_por_especie: animaisPorEspecie,
        consultas_por_mes: consultasPorMes,
        veterinarios_ativos: veterinariosAtivos,
        planos_ativos: planosAtivos,
      });
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Stack spacing={2} alignItems="center">
          <Typography variant="h5">Carregando dashboard...</Typography>
          <LinearProgress sx={{ width: 200 }} />
        </Stack>
      </Box>
    );
  }

  // Dados para gráfico de linha (Consultas por mês)
  const lineChartData = {
    labels: stats.consultas_por_mes.map(m => m.mes),
    datasets: [
      {
        label: 'Consultas',
        data: stats.consultas_por_mes.map(m => m.total),
        borderColor: 'rgb(14, 165, 233)',
        backgroundColor: 'rgba(14, 165, 233, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Dados para gráfico de rosca (Animais por espécie)
  const especiesLabels: any = {
    'CACHORRO': 'Cachorros',
    'GATO': 'Gatos',
    'PASSARO': 'Pássaros',
    'OUTRO': 'Outros',
  };

  const doughnutChartData = {
    labels: stats.animais_por_especie.map(e => especiesLabels[e.especie] || e.especie),
    datasets: [
      {
        data: stats.animais_por_especie.map(e => e.total),
        backgroundColor: [
          'rgba(14, 165, 233, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
        ],
        borderColor: [
          'rgb(14, 165, 233)',
          'rgb(139, 92, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Dados para gráfico de barras (Estatísticas gerais)
  const barChartData = {
    labels: ['Tutores', 'Animais', 'Veterinários', 'Consultas'],
    datasets: [
      {
        label: 'Total',
        data: [
          stats.total_tutores,
          stats.total_animais,
          stats.total_veterinarios,
          stats.total_consultas,
        ],
        backgroundColor: [
          'rgba(14, 165, 233, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  return (
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Bem-vindo(a), {user?.first_name || user?.username}! 👋
        </Typography>
      </Box>

      {/* Cards de Estatísticas Rápidas */}
      <Grid container spacing={3} mb={4}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" color="white" fontWeight={700}>
                    {stats.total_tutores}
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.8)">
                    Tutores
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <Person sx={{ color: 'white', fontSize: 32 }} />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" color="white" fontWeight={700}>
                    {stats.total_animais}
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.8)">
                    Animais
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <Pets sx={{ color: 'white', fontSize: 32 }} />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" color="white" fontWeight={700}>
                    {stats.veterinarios_ativos}
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.8)">
                    Veterinários
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <MedicalServices sx={{ color: 'white', fontSize: 32 }} />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" color="white" fontWeight={700}>
                    {stats.consultas_mes}
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.8)">
                    Consultas/Mês
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <CalendarToday sx={{ color: 'white', fontSize: 32 }} />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={3} mb={4}>
        {/* Gráfico de Linha - Consultas por Mês */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>
                📈 Consultas nos Últimos 6 Meses
              </Typography>
              <Box sx={{ height: 300 }}>
                <Line data={lineChartData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Gráfico de Rosca - Animais por Espécie */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>
                �� Animais por Espécie
              </Typography>
              <Box sx={{ height: 300 }}>
                <Doughnut data={doughnutChartData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Gráfico de Barras - Estatísticas Gerais */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>
                📊 Visão Geral do Sistema
              </Typography>
              <Box sx={{ height: 300 }}>
                <Bar data={barChartData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Cards de Informações Adicionais */}
      <Grid container spacing={3}>
        {/* Resumo Rápido */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>
                📋 Resumo de Hoje
              </Typography>
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <CalendarToday />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Consultas Hoje"
                    secondary={`${stats.consultas_hoje} agendadas`}
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'success.main' }}>
                      <MedicalServices />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Veterinários Ativos"
                    secondary={`${stats.veterinarios_ativos} disponíveis`}
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                      <LocalHospital />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Planos Ativos"
                    secondary={`${stats.planos_ativos} planos disponíveis`}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Ações Rápidas */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>
                ⚡ Ações Rápidas
              </Typography>
              <Stack spacing={2}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                  onClick={() => window.location.href = '/tutores'}
                >
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <Person />
                  </Avatar>
                  <Box flexGrow={1}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Novo Tutor
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Cadastrar novo cliente
                    </Typography>
                  </Box>
                </Paper>

                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                  onClick={() => window.location.href = '/animais'}
                >
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <Pets />
                  </Avatar>
                  <Box flexGrow={1}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Novo Animal
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Cadastrar novo pet
                    </Typography>
                  </Box>
                </Paper>

                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                  onClick={() => window.location.href = '/veterinarios'}
                >
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    <MedicalServices />
                  </Avatar>
                  <Box flexGrow={1}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Novo Veterinário
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Cadastrar profissional
                    </Typography>
                  </Box>
                </Paper>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
