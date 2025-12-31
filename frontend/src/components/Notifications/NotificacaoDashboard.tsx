// src/components/Notifications/NotificacaoDashboard.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Stack,
} from '@mui/material';
import {
  Assessment as StatsIcon,
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
  ErrorOutline,
  CheckCircle,
} from '@mui/icons-material';
import api from '../../services/api';

interface NotificacaoStats {
  total: number;
  enviadas: number;
  pendentes: number;
  erros: number;
  por_tipo: {
    email: number;
    whatsapp: number;
    sms: number;
  };
}

export const NotificacaoDashboard: React.FC = () => {
  const [stats, setStats] = useState<NotificacaoStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await api.get('/notificacoes/'); // últimas 50
      const data = response.data as any[];

      const base: NotificacaoStats = {
        total: data.length,
        enviadas: 0,
        pendentes: 0,
        erros: 0,
        por_tipo: {
          email: 0,
          whatsapp: 0,
          sms: 0,
        },
      };

      data.forEach((n) => {
        if (n.status === 'enviada') base.enviadas += 1;
        if (n.status === 'pendente') base.pendentes += 1;
        if (n.status === 'erro') base.erros += 1;
        if (n.tipo === 'email') base.por_tipo.email += 1;
        if (n.tipo === 'whatsapp') base.por_tipo.whatsapp += 1;
        if (n.tipo === 'sms') base.por_tipo.sms += 1;
      });

      setStats(base);
    } catch (error) {
      console.error('Erro ao carregar estatísticas de notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) return <LinearProgress />;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Dashboard de Notificações
      </Typography>

      {/* Linha 1: totais */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        mb={3}
      >
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={1}>
              <StatsIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="subtitle2" color="text.secondary">
                Total (últimas 50)
              </Typography>
            </Box>
            <Typography variant="h4" color="primary">
              {stats.total}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={1}>
              <CheckCircle color="success" sx={{ mr: 1 }} />
              <Typography variant="subtitle2" color="text.secondary">
                Enviadas
              </Typography>
            </Box>
            <Typography variant="h4" color="success.main">
              {stats.enviadas}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={1}>
              <ErrorOutline color="error" sx={{ mr: 1 }} />
              <Typography variant="subtitle2" color="text.secondary">
                Erros
              </Typography>
            </Box>
            <Typography variant="h4" color="error.main">
              {stats.erros}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={1}>
              <StatsIcon color="warning" sx={{ mr: 1 }} />
              <Typography variant="subtitle2" color="text.secondary">
                Pendentes
              </Typography>
            </Box>
            <Typography variant="h4" color="warning.main">
              {stats.pendentes}
            </Typography>
          </CardContent>
        </Card>
      </Stack>

      {/* Linha 2: por tipo */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
      >
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={1}>
              <EmailIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="subtitle2" color="text.secondary">
                Emails
              </Typography>
            </Box>
            <Typography variant="h4">
              {stats.por_tipo.email}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={1}>
              <WhatsAppIcon color="success" sx={{ mr: 1 }} />
              <Typography variant="subtitle2" color="text.secondary">
                WhatsApp
              </Typography>
            </Box>
            <Typography variant="h4">
              {stats.por_tipo.whatsapp}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={1}>
              <ErrorOutline color="disabled" sx={{ mr: 1 }} />
              <Typography variant="subtitle2" color="text.secondary">
                SMS
              </Typography>
            </Box>
            <Typography variant="h4">
              {stats.por_tipo.sms}
            </Typography>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};
