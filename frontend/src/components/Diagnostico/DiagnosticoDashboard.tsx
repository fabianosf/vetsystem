import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import {
  Assessment as StatsIcon,
  CheckCircle as ValidadoIcon,
  TrendingUp as TrendIcon,
  Pets as PetsIcon,
} from '@mui/icons-material';
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

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await api.get('/diagnosticos/stats/');
      setStats(response.data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
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

  if (!stats) {
    return (
      <Card sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Nenhum dado disponível
        </Typography>
      </Card>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Dashboard de Diagnósticos IA
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
        }}
      >
        {/* Card 1: Total de Diagnósticos */}
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <StatsIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="subtitle2" color="text.secondary">
                Total de Diagnósticos
              </Typography>
            </Box>
            <Typography variant="h3" color="primary">
              {stats.total_diagnosticos}
            </Typography>
          </CardContent>
        </Card>

        {/* Card 2: Validados */}
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <ValidadoIcon color="success" sx={{ mr: 1 }} />
              <Typography variant="subtitle2" color="text.secondary">
                Diagnósticos Validados
              </Typography>
            </Box>
            <Typography variant="h3" color="success.main">
              {stats.diagnosticos_validados}
            </Typography>
          </CardContent>
        </Card>

        {/* Card 3: Taxa de Validação */}
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <TrendIcon color="info" sx={{ mr: 1 }} />
              <Typography variant="subtitle2" color="text.secondary">
                Taxa de Validação
              </Typography>
            </Box>
            <Typography variant="h3" color="info.main">
              {stats.taxa_validacao.toFixed(1)}%
            </Typography>
          </CardContent>
        </Card>

        {/* Card 4: Confiança Média */}
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <PetsIcon color="warning" sx={{ mr: 1 }} />
              <Typography variant="subtitle2" color="text.secondary">
                Confiança Média
              </Typography>
            </Box>
            <Typography variant="h3" color="warning.main">
              {stats.confianca_media.toFixed(1)}%
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Diagnósticos por Classe */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Diagnósticos por Classe
          </Typography>
          {stats.diagnosticos_por_classe.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Nenhum diagnóstico por classe
            </Typography>
          ) : (
            stats.diagnosticos_por_classe.map((item, idx) => (
              <Box key={idx} mb={2}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                    {item.classe_predita}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {item.total}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(item.total / stats.total_diagnosticos) * 100}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            ))
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
