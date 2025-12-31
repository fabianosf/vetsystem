import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  CircularProgress,
  Alert,
  Typography,
} from '@mui/material';
import {
  Pets as PetsIcon,
  Person as PersonIcon,
  Event as EventIcon,
  Biotech as DiagnosticoIcon,
} from '@mui/icons-material';
import api from '../../services/api';
import { StatsCard } from '../../components/Dashboard/StatsCard';
import { ConsultasChart } from '../../components/Dashboard/ConsultasChart';
import { SpeciesChart } from '../../components/Dashboard/SpeciesChart';
import { VeterinariosChart } from '../../components/Dashboard/VeterinariosChart';
import { StatusChart } from '../../components/Dashboard/StatusChart';
import { DiagnosticosChart } from '../../components/Dashboard/DiagnosticosChart';

export const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [consultasTimeline, setConsultasTimeline] = useState<any[]>([]);
  const [consultasStatus, setConsultasStatus] = useState<any[]>([]);
  const [veterinarios, setVeterinarios] = useState<any[]>([]);
  const [diagnosticosTimeline, setDiagnosticosTimeline] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        statsRes,
        timelineRes,
        statusRes,
        vetsRes,
        diagRes,
      ] = await Promise.all([
        api.get('/dashboard/stats/'),
        api.get('/dashboard/consultas-timeline/'),
        api.get('/dashboard/consultas-status/'),
        api.get('/dashboard/veterinarios-performance/'),
        api.get('/dashboard/diagnosticos-timeline/'),
      ]);

      setStats(statsRes.data);
      setConsultasTimeline(timelineRes.data);
      setConsultasStatus(statusRes.data);
      setVeterinarios(vetsRes.data);
      setDiagnosticosTimeline(diagRes.data);
    } catch (err: any) {
      console.error('Erro ao carregar dashboard:', err);
      setError(err.response?.data?.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Visão geral do sistema veterinário
      </Typography>

      {/* Cards de Estatísticas */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          gap: 3,
          mb: 4,
        }}
      >
        <StatsCard
          title="Total de Animais"
          value={stats?.totais?.animais || 0}
          icon={<PetsIcon sx={{ fontSize: 40, color: 'primary.main' }} />}
          color="primary.main"
        />
        <StatsCard
          title="Tutores Cadastrados"
          value={stats?.totais?.tutores || 0}
          icon={<PersonIcon sx={{ fontSize: 40, color: 'success.main' }} />}
          color="success.main"
        />
        <StatsCard
          title="Consultas Este Mês"
          value={stats?.consultas?.mes_atual || 0}
          icon={<EventIcon sx={{ fontSize: 40, color: 'info.main' }} />}
          trend={stats?.consultas?.crescimento}
          color="info.main"
        />
        <StatsCard
          title="Diagnósticos IA"
          value={stats?.diagnosticos?.total || 0}
          icon={<DiagnosticoIcon sx={{ fontSize: 40, color: 'warning.main' }} />}
          color="warning.main"
        />
      </Box>

      {/* Gráficos - Linha 1 */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
          gap: 3,
          mb: 3,
        }}
      >
        <ConsultasChart data={consultasTimeline} />
        <SpeciesChart data={stats?.animais_por_especie || []} />
      </Box>

      {/* Gráficos - Linha 2 */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' },
          gap: 3,
          mb: 3,
        }}
      >
        <StatusChart data={consultasStatus} />
        <DiagnosticosChart data={diagnosticosTimeline} />
      </Box>

      {/* Gráficos - Linha 3 */}
      <Box sx={{ mb: 3 }}>
        <VeterinariosChart data={veterinarios} />
      </Box>
    </Container>
  );
};
