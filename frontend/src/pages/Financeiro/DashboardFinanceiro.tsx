import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  Avatar,
  Stack,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  AttachMoney,
  Warning,
} from '@mui/icons-material';
import {
  AreaChart,
  Area,
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
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import financeiroApi, { DashboardFinanceiro } from '../../services/financeiroApi';

const COLORS = ['#4caf50', '#f44336', '#2196f3', '#ff9800', '#9c27b0', '#00bcd4'];

const DashboardFinanceiroPage: React.FC = () => {
  const [data, setData] = useState<DashboardFinanceiro | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      console.log('🔍 Carregando dashboard financeiro...');
      const response = await financeiroApi.getDashboard();
      console.log('✅ Dashboard carregado:', response.data);
      
      // Validar dados
      if (!response.data || !response.data.resumo) {
        throw new Error('Dados inválidos retornados do servidor');
      }
      
      setData(response.data);
    } catch (error: any) {
      console.error('❌ Erro ao carregar dashboard:', error);
      console.error('Response:', error.response?.data);
      toast.error('Erro ao carregar dados financeiros');
      
      // Dados de fallback para não quebrar a tela
      setData({
        resumo: {
          receitas_mes: 0,
          despesas_mes: 0,
          saldo_mes: 0,
          contas_receber: 0,
          contas_pagar: 0,
          contas_atrasadas: 0,
        },
        fluxo_mensal: [],
        receitas_por_categoria: [],
        despesas_por_categoria: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!data) {
    return (
      <Box textAlign="center" py={8}>
        <Typography variant="h6" color="text.secondary">
          Erro ao carregar dados financeiros
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
          <AttachMoney fontSize="large" />
        </Avatar>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Dashboard Financeiro
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Visão geral das finanças da clínica
          </Typography>
        </Box>
      </Box>

      {/* Cards KPI */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mb: 3 }} flexWrap="wrap">
        {/* Receitas do Mês */}
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card sx={{ background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)', color: 'white', height: '100%' }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Receitas do Mês
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {formatCurrency(data.resumo.receitas_mes)}
                    </Typography>
                    <Chip
                      icon={<TrendingUp />}
                      label="Receitas"
                      size="small"
                      sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                    />
                  </Box>
                  <TrendingUp sx={{ fontSize: 50, opacity: 0.8 }} />
                </Stack>
              </CardContent>
            </Card>
          </motion.div>
        </Box>

        {/* Despesas do Mês */}
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card sx={{ background: 'linear-gradient(135deg, #f44336 0%, #ef5350 100%)', color: 'white', height: '100%' }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Despesas do Mês
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {formatCurrency(data.resumo.despesas_mes)}
                    </Typography>
                    <Chip
                      icon={<TrendingDown />}
                      label="Despesas"
                      size="small"
                      sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                    />
                  </Box>
                  <TrendingDown sx={{ fontSize: 50, opacity: 0.8 }} />
                </Stack>
              </CardContent>
            </Card>
          </motion.div>
        </Box>

        {/* Saldo do Mês */}
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card
              sx={{
                background:
                  data.resumo.saldo_mes >= 0
                    ? 'linear-gradient(135deg, #2196f3 0%, #42a5f5 100%)'
                    : 'linear-gradient(135deg, #ff9800 0%, #ffa726 100%)',
                color: 'white',
                height: '100%',
              }}
            >
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Saldo do Mês
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {formatCurrency(data.resumo.saldo_mes)}
                    </Typography>
                    <Chip
                      label={data.resumo.saldo_mes >= 0 ? 'Positivo' : 'Negativo'}
                      size="small"
                      sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                    />
                  </Box>
                  <AccountBalance sx={{ fontSize: 50, opacity: 0.8 }} />
                </Stack>
              </CardContent>
            </Card>
          </motion.div>
        </Box>

        {/* Contas Atrasadas */}
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card sx={{ background: 'linear-gradient(135deg, #ff5722 0%, #ff7043 100%)', color: 'white', height: '100%' }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Contas Atrasadas
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {data.resumo.contas_atrasadas}
                    </Typography>
                    <Chip
                      icon={<Warning />}
                      label="Atenção"
                      size="small"
                      sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                    />
                  </Box>
                  <Warning sx={{ fontSize: 50, opacity: 0.8 }} />
                </Stack>
              </CardContent>
            </Card>
          </motion.div>
        </Box>
      </Stack>

      {/* Contas a Receber e Pagar */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 3 }}>
        <Paper sx={{ flex: 1, p: 3, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight={600} mb={2} color="success.main">
            💰 Contas a Receber
          </Typography>
          <Typography variant="h3" fontWeight={700}>
            {formatCurrency(data.resumo.contas_receber)}
          </Typography>
        </Paper>
        <Paper sx={{ flex: 1, p: 3, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight={600} mb={2} color="error.main">
            💸 Contas a Pagar
          </Typography>
          <Typography variant="h3" fontWeight={700}>
            {formatCurrency(data.resumo.contas_pagar)}
          </Typography>
        </Paper>
      </Stack>

      {/* Gráficos */}
      <Stack spacing={3}>
        {/* Fluxo Mensal e Receitas por Categoria */}
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
          {/* Fluxo Mensal */}
          <Paper sx={{ flex: 2, p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>
              📈 Fluxo de Caixa Mensal
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={data.fluxo_mensal}>
                <defs>
                  <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4caf50" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#4caf50" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f44336" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f44336" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(value: any) => formatCurrency(Number(value) || 0)} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="receitas"
                  name="Receitas"
                  stroke="#4caf50"
                  fillOpacity={1}
                  fill="url(#colorReceitas)"
                />
                <Area
                  type="monotone"
                  dataKey="despesas"
                  name="Despesas"
                  stroke="#f44336"
                  fillOpacity={1}
                  fill="url(#colorDespesas)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>

          {/* Receitas por Categoria */}
          <Paper sx={{ flex: 1, p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>
              💚 Receitas por Categoria
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={data.receitas_por_categoria.filter((item) => item.total > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => entry.nome}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="total"
                >
                  {data.receitas_por_categoria.map((_item, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => formatCurrency(Number(value) || 0)} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Stack>

        {/* Despesas por Categoria */}
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight={600} mb={2}>
            📊 Despesas por Categoria
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.despesas_por_categoria.filter((item) => item.total > 0)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nome" />
              <YAxis />
              <Tooltip formatter={(value: any) => formatCurrency(Number(value) || 0)} />
              <Bar dataKey="total" fill="#f44336" name="Despesas" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Stack>
    </Box>
  );
};

export default DashboardFinanceiroPage;
