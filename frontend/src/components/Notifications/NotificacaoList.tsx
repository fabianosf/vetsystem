// src/components/Notificacoes/NotificacaoList.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Alert,
} from '@mui/material';
import { Email, WhatsApp, ErrorOutline, CheckCircle } from '@mui/icons-material';
import api from '../../services/api';

interface NotificacaoExterna {
  id: number;
  tutor: number;
  tutor_nome: string;
  tipo: 'email' | 'whatsapp' | 'sms';
  evento: string;
  evento_display: string;
  tipo_display: string;
  status: 'pendente' | 'enviada' | 'erro';
  status_display: string;
  destinatario: string;
  assunto: string;
  mensagem: string;
  enviada_em: string | null;
  created_at: string;
}

export const NotificacaoList: React.FC = () => {
  const [notificacoes, setNotificacoes] = useState<NotificacaoExterna[]>([]);
  const [loading, setLoading] = useState(true);
  const [tipoFilter, setTipoFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNotificacoes();
  }, [tipoFilter, statusFilter]);

  const loadNotificacoes = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (tipoFilter) params.tipo = tipoFilter;
      if (statusFilter) params.status = statusFilter;

      const response = await api.get('/notificacoes/', { params });
      setNotificacoes(response.data);
    } catch (err) {
      console.error('Erro ao carregar notificações:', err);
      setError('Erro ao carregar notificações');
    } finally {
      setLoading(false);
    }
  };

  const getTipoIcon = (tipo: string) => {
    if (tipo === 'email') return <Email fontSize="small" />;
    if (tipo === 'whatsapp') return <WhatsApp fontSize="small" />;
    return null;
  };

  const getStatusColor = (status: string) => {
    if (status === 'enviada') return 'success';
    if (status === 'erro') return 'error';
    return 'warning';
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Histórico de Notificações
      </Typography>

      {/* Filtros */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
        <FormControl fullWidth>
          <InputLabel>Tipo</InputLabel>
          <Select
            value={tipoFilter}
            label="Tipo"
            onChange={(e) => setTipoFilter(e.target.value)}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="email">Email</MenuItem>
            <MenuItem value="whatsapp">WhatsApp</MenuItem>
            <MenuItem value="sms">SMS</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="enviada">Enviada</MenuItem>
            <MenuItem value="pendente">Pendente</MenuItem>
            <MenuItem value="erro">Erro</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {error && <Alert severity="error">{error}</Alert>}

      {!loading && notificacoes.length === 0 && !error && (
        <Alert severity="info">Nenhuma notificação encontrada.</Alert>
      )}

      <Stack spacing={2}>
        {notificacoes.map((n) => (
          <Card key={n.id}>
            <CardContent>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={1}
                mb={1}
              >
                <Typography variant="subtitle1">{n.tutor_nome}</Typography>
                <Stack direction="row" spacing={1}>
                  <Chip
                    icon={getTipoIcon(n.tipo)}
                    label={n.tipo_display}
                    size="small"
                    color="primary"
                  />
                  <Chip
                    icon={
                      n.status === 'enviada' ? (
                        <CheckCircle fontSize="small" />
                      ) : n.status === 'erro' ? (
                        <ErrorOutline fontSize="small" />
                      ) : undefined
                    }
                    label={n.status_display}
                    size="small"
                    color={getStatusColor(n.status) as any}
                  />
                </Stack>
              </Stack>

              <Typography variant="body2" color="text.secondary">
                {n.evento_display}
              </Typography>

              {n.assunto && (
                <Typography variant="subtitle2" sx={{ mt: 1 }}>
                  Assunto: {n.assunto}
                </Typography>
              )}

              <Typography
                variant="body2"
                sx={{ mt: 1, whiteSpace: 'pre-line' }}
              >
                {n.mensagem}
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1, display: 'block' }}
              >
                Enviada em:{' '}
                {n.enviada_em
                  ? new Date(n.enviada_em).toLocaleString('pt-BR')
                  : '—'}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};
