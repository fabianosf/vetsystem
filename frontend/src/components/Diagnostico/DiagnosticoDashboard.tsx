import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import {
  Assessment as StatsIcon,
  CheckCircle as ValidadoIcon,
  TrendingUp as TrendIcon,
  Pets as PetsIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';

interface Stats {
  total_diagnosticos: number;
  diagnosticos_validados: number;
  taxa_validacao: number;
  confianca_media: number;
  diagnosticos_por_classe: Array<{
    classe_predita: string;
    total: number;
  }>;
}

export const DiagnosticoDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await api.get('/diagnosticos/stats/');
      setStats(response.data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      setError(true);
      toast.error('Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !stats) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Erro ao carregar estatísticas. Tente novamente mais tarde.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight={600}>
        📊 Dashboard de Diagnósticos IA
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
          mb: 3,
          mt: 2,
        }}
      >
        {/* Card 1: Total de Diagnósticos */}
        <Card elevation={2}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <StatsIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="subtitle2" color="text.secondary">
                Total de Diagnósticos
              </Typography>
            </Box>
            <Typography variant="h3" color="primary" fontWeight={700}>
              {stats.total_diagnosticos}
            </Typography>
          </CardContent>
        </Card>

        {/* Card 2: Validados */}
        <Card elevation={2}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <ValidadoIcon color="success" sx={{ mr: 1 }} />
              <Typography variant="subtitle2" color="text.secondary">
                Diagnósticos Validados
              </Typography>
            </Box>
            <Typography variant="h3" color="success.main" fontWeight={700}>
              {stats.diagnosticos_validados}
            </Typography>
          </CardContent>
        </Card>

        {/* Card 3: Taxa de Validação */}
        <Card elevation={2}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <TrendIcon color="info" sx={{ mr: 1 }} />
              <Typography variant="subtitle2" color="text.secondary">
                Taxa de Validação
              </Typography>
            </Box>
            <Typography variant="h3" color="info.main" fontWeight={700}>
              {stats.taxa_validacao.toFixed(1)}%
            </Typography>
          </CardContent>
        </Card>

        {/* Card 4: Confiança Média */}
        <Card elevation={2}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <PetsIcon color="warning" sx={{ mr: 1 }} />
              <Typography variant="subtitle2" color="text.secondary">
                Confiança Média
              </Typography>
            </Box>
            <Typography variant="h3" color="warning.main" fontWeight={700}>
              {stats.confianca_media.toFixed(1)}%
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Diagnósticos por Classe */}
      <Card elevation={2}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Diagnósticos por Classe
          </Typography>
          {stats.diagnosticos_por_classe.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              Nenhum diagnóstico por classe disponível
            </Alert>
          ) : (
            <Box mt={2}>
              {stats.diagnosticos_por_classe.map((item, idx) => (
                <Box key={idx} mb={3}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body1" fontWeight={600}>
                        {item.classe_predita}
                      </Typography>
                      <Chip
                        label={`${((item.total / stats.total_diagnosticos) * 100).toFixed(1)}%`}
                        size="small"
                        color="primary"
                      />
                    </Box>
                    <Typography variant="body2" fontWeight="bold" color="text.secondary">
                      {item.total} diagnósticos
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(item.total / stats.total_diagnosticos) * 100}
                    sx={{ height: 10, borderRadius: 5 }}
                    color="primary"
                  />
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
