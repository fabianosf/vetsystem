import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Avatar,
  Stack,
  Chip,
  CircularProgress,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Pets,
  Person,
  LocalHospital,
  TrendingUp,
  CalendarToday,
  Science,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { motion } from 'framer-motion';


interface DashboardStats {
  consultas: {
    total: number;
    hoje: number;
    mes: number;
    ano: number;
    agendadas: number;
    crescimento_mensal: number;
  };
  animais: {
    total: number;
    mes: number;
    por_especie: Array<{ species: string; total: number }>;
  };
  diagnosticos: {
    total: number;
    validados: number;
    pendentes: number;
    taxa_validacao: number;
  };
  outros: {
    veterinarios: number;
    tutores: number;
  };
}


const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('mes');

  useEffect(() => {
    fetchDashboardData();
  }, [periodo]);


  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/dashboard/?periodo=${periodo}`);
      setStats(response.data);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      toast.error('Usando dados de demonstração');
      
      // Mock data compatível com o backend
      setStats({
        consultas: {
          total: 342,
          hoje: 12,
          mes: 87,
          ano: 342,
          agendadas: 28,
          crescimento_mensal: 15.5,
        },
        animais: {
          total: 156,
          mes: 16,
          por_especie: [
            { species: 'Cachorro', total: 89 },
            { species: 'Gato', total: 54 },
            { species: 'Pássaro', total: 8 },
            { species: 'Outros', total: 5 },
          ],
        },
        diagnosticos: {
          total: 23,
          validados: 20,
          pendentes: 3,
          taxa_validacao: 87.0,
        },
        outros: {
          veterinarios: 8,
          tutores: 89,
        },
      });
    } finally {
      setLoading(false);
    }
  };


  // Dados para gráficos
  const getConsultasPorMes = () => {
    return [
      { mes: 'Jan', total: 45 },
      { mes: 'Fev', total: 52 },
      { mes: 'Mar', total: 61 },
      { mes: 'Abr', total: 48 },
      { mes: 'Mai', total: 70 },
      { mes: 'Jun', total: 87 },
    ];
  };

  const getConsultasPorStatus = () => {
    return [
      { status: 'Agendada', total: stats?.consultas.agendadas || 28 },
      { status: 'Em andamento', total: 5 },
      { status: 'Concluída', total: stats?.consultas.total ? stats.consultas.total - (stats.consultas.agendadas || 0) - 25 : 289 },
      { status: 'Cancelada', total: 20 },
    ];
  };

  const getDiagnosticosRecentes = () => {
    return [
      { doenca: 'Alergia', total: 8 },
      { doenca: 'Dermatite', total: 6 },
      { doenca: 'Otite', total: 4 },
      { doenca: 'Gastrite', total: 3 },
      { doenca: 'Outros', total: 2 },
    ];
  };


  // Cores para gráficos
  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b'];
  const STATUS_COLORS = {
    'Agendada': '#2196f3',
    'Em andamento': '#ff9800',
    'Concluída': '#4caf50',
    'Cancelada': '#f44336',
  };


  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }


  if (!stats) {
    return (
      <Box textAlign="center" py={8}>
        <Typography variant="h6" color="text.secondary">
          Erro ao carregar dados do dashboard
        </Typography>
      </Box>
    );
  }


  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
            <DashboardIcon />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight={700}>
              Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Visão geral do sistema em tempo real
            </Typography>
          </Box>
        </Box>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Período</InputLabel>
          <Select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            label="Período"
          >
            <MenuItem value="hoje">Hoje</MenuItem>
            <MenuItem value="semana">Esta Semana</MenuItem>
            <MenuItem value="mes">Este Mês</MenuItem>
            <MenuItem value="ano">Este Ano</MenuItem>
          </Select>
        </FormControl>
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
        {/* Card 1 - Consultas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total de Consultas
                  </Typography>
                  <Typography variant="h3" fontWeight={700}>
                    {stats.consultas.total}
                  </Typography>
                  <Chip
                    label={`${stats.consultas.hoje} hoje`}
                    size="small"
                    sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                </Box>
                <LocalHospital sx={{ fontSize: 50, opacity: 0.8 }} />
              </Stack>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 2 - Animais */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Animais Cadastrados
                  </Typography>
                  <Typography variant="h3" fontWeight={700}>
                    {stats.animais.total}
                  </Typography>
                  <Chip
                    label={`+${stats.animais.mes} este mês`}
                    size="small"
                    icon={<TrendingUp fontSize="small" />}
                    sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                </Box>
                <Pets sx={{ fontSize: 50, opacity: 0.8 }} />
              </Stack>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 3 - Tutores */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Tutores Ativos
                  </Typography>
                  <Typography variant="h3" fontWeight={700}>
                    {stats.outros.tutores}
                  </Typography>
                  <Chip
                    label="Base crescente"
                    size="small"
                    icon={<TrendingUp fontSize="small" />}
                    sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                </Box>
                <Person sx={{ fontSize: 50, opacity: 0.8 }} />
              </Stack>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 4 - Diagnósticos IA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Diagnósticos IA
                  </Typography>
                  <Typography variant="h3" fontWeight={700}>
                    {stats.diagnosticos.total}
                  </Typography>
                  <Chip
                    label={`${stats.diagnosticos.validados} validados`}
                    size="small"
                    sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                </Box>
                <Science sx={{ fontSize: 50, opacity: 0.8 }} />
              </Stack>
            </CardContent>
          </Card>
        </motion.div>
      </Box>


      {/* Gráficos - Linha 1 */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
          gap: 3,
          mb: 3,
        }}
      >
        {/* Gráfico de Consultas por Mês */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>
              📈 Consultas por Mês
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={getConsultasPorMes()}>
                <defs>
                  <linearGradient id="colorConsultas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#667eea" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#667eea"
                  fillOpacity={1}
                  fill="url(#colorConsultas)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </motion.div>

        {/* Gráfico de Animais por Espécie */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>
              🐾 Animais por Espécie
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.animais.por_especie}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.species} ${(entry.percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="total"
                >
                  {stats.animais.por_especie?.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </motion.div>
      </Box>


      {/* Gráficos - Linha 2 */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
          gap: 3,
        }}
      >
        {/* Gráfico de Consultas por Status */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>
              📊 Status das Consultas
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getConsultasPorStatus()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#667eea">
                  {getConsultasPorStatus().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status as keyof typeof STATUS_COLORS]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </motion.div>

        {/* Gráfico de Diagnósticos IA Recentes */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>
              🧬 Diagnósticos IA Mais Comuns
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getDiagnosticosRecentes()} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="doenca" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="total" fill="#43e97b" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </motion.div>
      </Box>


      {/* Footer com atalhos rápidos */}
      <Paper sx={{ p: 3, mt: 3, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} mb={2}>
          ⚡ Atalhos Rápidos
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button
            variant="contained"
            startIcon={<CalendarToday />}
            fullWidth
            onClick={() => window.location.href = '/agendamento'}
          >
            Nova Consulta
          </Button>
          <Button
            variant="outlined"
            startIcon={<Pets />}
            fullWidth
            onClick={() => window.location.href = '/animais'}
          >
            Cadastrar Animal
          </Button>
          <Button
            variant="outlined"
            startIcon={<Science />}
            fullWidth
            onClick={() => window.location.href = '/diagnostico'}
          >
            Diagnóstico IA
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};


export default Dashboard;
