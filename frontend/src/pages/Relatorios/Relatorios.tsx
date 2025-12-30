import { useState } from 'react';
import {
  Box,
  Card,
  Grid,
  Typography,
  Stack,
  Avatar,
  MenuItem,
  TextField,
  Divider,
  Paper,
} from '@mui/material';
import {
  Assessment,
  TrendingUp,
  TrendingDown,
  Pets,
  EventNote,
  AttachMoney,
  People,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function Relatorios() {
  const [periodo, setPeriodo] = useState('30');

  // Dados mockados para os gráficos
  const consultasData = [
    { mes: 'Jan', consultas: 45, receita: 6750 },
    { mes: 'Fev', consultas: 52, receita: 7800 },
    { mes: 'Mar', consultas: 48, receita: 7200 },
    { mes: 'Abr', consultas: 61, receita: 9150 },
    { mes: 'Mai', consultas: 55, receita: 8250 },
    { mes: 'Jun', consultas: 67, receita: 10050 },
  ];

  const especiesData = [
    { name: 'Caninos', value: 58, color: '#0ea5e9' },
    { name: 'Felinos', value: 32, color: '#8b5cf6' },
    { name: 'Aves', value: 7, color: '#10b981' },
    { name: 'Outros', value: 3, color: '#f59e0b' },
  ];

  const servicosData = [
    { servico: 'Consultas', quantidade: 328 },
    { servico: 'Vacinas', quantidade: 156 },
    { servico: 'Exames', quantidade: 89 },
    { servico: 'Cirurgias', quantidade: 23 },
  ];

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ bgcolor: 'secondary.main', width: 48, height: 48 }}>
              <Assessment />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight={700}>
                Relatórios e Análises
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Visualize métricas e indicadores da clínica
              </Typography>
            </Box>
          </Stack>
        </Box>
        
        <TextField
          select
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
          size="small"
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="7">Últimos 7 dias</MenuItem>
          <MenuItem value="30">Últimos 30 dias</MenuItem>
          <MenuItem value="90">Últimos 90 dias</MenuItem>
          <MenuItem value="365">Último ano</MenuItem>
        </TextField>
      </Box>

      {/* Cards de KPIs */}
      <Grid container spacing={3} mb={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <Box sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Consultas
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    328
                  </Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center" mt={1}>
                    <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
                    <Typography variant="caption" color="success.main" fontWeight={600}>
                      +12.5%
                    </Typography>
                  </Stack>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main' }}>
                  <EventNote />
                </Avatar>
              </Stack>
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <Box sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Receita
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    R$ 49,2K
                  </Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center" mt={1}>
                    <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
                    <Typography variant="caption" color="success.main" fontWeight={600}>
                      +18.2%
                    </Typography>
                  </Stack>
                </Box>
                <Avatar sx={{ bgcolor: 'success.light', color: 'success.main' }}>
                  <AttachMoney />
                </Avatar>
              </Stack>
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <Box sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Novos Pacientes
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    47
                  </Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center" mt={1}>
                    <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
                    <Typography variant="caption" color="success.main" fontWeight={600}>
                      +8.1%
                    </Typography>
                  </Stack>
                </Box>
                <Avatar sx={{ bgcolor: 'secondary.light', color: 'secondary.main' }}>
                  <Pets />
                </Avatar>
              </Stack>
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <Box sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Novos Tutores
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    23
                  </Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center" mt={1}>
                    <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />
                    <Typography variant="caption" color="error.main" fontWeight={600}>
                      -3.4%
                    </Typography>
                  </Stack>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.light', color: 'warning.main' }}>
                  <People />
                </Avatar>
              </Stack>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={3}>
        {/* Gráfico de Consultas e Receita */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Consultas e Receita Mensal
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={consultasData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="consultas"
                    stroke="#0ea5e9"
                    strokeWidth={3}
                    name="Consultas"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="receita"
                    stroke="#10b981"
                    strokeWidth={3}
                    name="Receita (R$)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        {/* Gráfico de Pizza - Espécies */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Distribuição por Espécie
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={especiesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {especiesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        {/* Gráfico de Barras - Serviços */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Serviços Mais Solicitados
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={servicosData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="servico" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="quantidade" fill="#8b5cf6" name="Quantidade" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
