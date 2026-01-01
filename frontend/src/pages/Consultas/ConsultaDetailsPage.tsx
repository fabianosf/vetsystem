import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Stack,
  Button,
  Paper,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowBack,
  MedicalServices,
  Cancel as CancelIcon,
  CheckCircle,
  Pets,
  Person,
} from '@mui/icons-material';
import api from '../../services/api';
import { ConsultaPDFActions } from '../../components/PDF/ConsultaPDFActions';
import { toast } from 'react-toastify';

interface Consulta {
  id: number;
  animal: {
    name: string;
    species: string;
    breed: string;
  };
  veterinario: {
    nome: string;
    crmv: string;
    especialidade: string;
  };
  data_consulta: string;
  horario: string;
  motivo: string;
  diagnostico: string;
  tratamento: string;
  observacoes: string;
  status: string;
}

export const ConsultaDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [consulta, setConsulta] = useState<Consulta | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConsulta = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/consultas/${id}/`);
      setConsulta(response.data);
    } catch (err: any) {
      if (err.response?.status !== 404) {
        setError(err?.response?.data?.message || 'Erro ao carregar consulta');
      } else {
        setError('Consulta não encontrada');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConsulta();
  }, [id]);

  const handleCancelar = async () => {
    if (!consulta) return;
    setLoadingAction(true);
    try {
      await api.post(`/consultas/${consulta.id}/cancelar/`, {
        motivo: 'Cancelada via tela de detalhes',
      });
      setConsulta((prev) =>
        prev ? { ...prev, status: 'CANCELADA' } : prev
      );
      toast.success('Consulta cancelada com sucesso.');
    } catch (err: any) {
      console.error('Erro ao cancelar consulta:', err);
      toast.error(
        err?.response?.data?.detail ||
          'Não foi possível cancelar a consulta.'
      );
    } finally {
      setLoadingAction(false);
    }
  };

  const handleMarcarRealizada = async () => {
    if (!consulta) return;
    setLoadingAction(true);
    try {
      await api.post(`/consultas/${consulta.id}/marcar-realizada/`);
      setConsulta((prev) =>
        prev ? { ...prev, status: 'REALIZADA' } : prev
      );
      toast.success('Consulta marcada como realizada.');
    } catch (err: any) {
      console.error('Erro ao marcar como realizada:', err);
      toast.error(
        err?.response?.data?.detail ||
          'Não foi possível marcar a consulta como realizada.'
      );
    } finally {
      setLoadingAction(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !consulta) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/consultas')}
          sx={{ mb: 3 }}
        >
          Voltar
        </Button>
        <Alert severity="error">{error || 'Consulta não encontrada'}</Alert>
      </Box>
    );
  }

  const isCancelada = consulta.status === 'CANCELADA';
  const isRealizada = consulta.status === 'REALIZADA';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CANCELADA':
        return 'error';
      case 'REALIZADA':
        return 'success';
      case 'AGENDADA':
        return 'info';
      default:
        return 'primary';
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box mb={3}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/consultas')}
          sx={{ mb: 2 }}
        >
          Voltar
        </Button>

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          flexDirection={{ xs: 'column', sm: 'row' }}
          gap={2}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <MedicalServices sx={{ fontSize: 40, color: 'primary.main' }} />
            <Box>
              <Typography variant="h4" fontWeight={700}>
                Detalhes da Consulta
              </Typography>
              <Chip
                label={consulta.status}
                color={getStatusColor(consulta.status)}
                size="small"
                sx={{ mt: 0.5 }}
              />
            </Box>
          </Box>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <ConsultaPDFActions consultaId={consulta.id} />

            {!isCancelada && (
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<CancelIcon />}
                onClick={handleCancelar}
                disabled={loadingAction}
              >
                {loadingAction ? 'Processando...' : 'Cancelar'}
              </Button>
            )}

            {!isRealizada && !isCancelada && (
              <Button
                variant="contained"
                color="success"
                size="small"
                startIcon={<CheckCircle />}
                onClick={handleMarcarRealizada}
                disabled={loadingAction}
              >
                {loadingAction ? 'Processando...' : 'Marcar realizada'}
              </Button>
            )}
          </Stack>
        </Box>
      </Box>

      {/* Cards Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
          gap: 3,
          mb: 3,
        }}
      >
        {/* Informações Gerais */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Informações Gerais
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box display="flex" flexDirection="column" gap={2}>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Data da Consulta
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {new Date(consulta.data_consulta).toLocaleDateString('pt-BR')}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Horário
                </Typography>
                <Typography variant="body1">{consulta.horario}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Status
                </Typography>
                <Chip
                  label={consulta.status}
                  color={getStatusColor(consulta.status)}
                  size="small"
                />
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Paciente */}
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Pets color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Paciente
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <Box display="flex" flexDirection="column" gap={2}>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Nome
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {consulta.animal.name}
                </Typography>
              </Box>

              <Box display="flex" gap={2}>
                <Box flex={1}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Espécie
                  </Typography>
                  <Typography variant="body1">{consulta.animal.species}</Typography>
                </Box>
                <Box flex={1}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Raça
                  </Typography>
                  <Typography variant="body1">{consulta.animal.breed}</Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Veterinário */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <Person color="secondary" />
            <Typography variant="h6" fontWeight={600}>
              Veterinário Responsável
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Nome
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {consulta.veterinario.nome}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                CRMV
              </Typography>
              <Typography variant="body1" fontFamily="monospace">
                {consulta.veterinario.crmv}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Especialidade
              </Typography>
              <Typography variant="body1">
                {consulta.veterinario.especialidade}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Motivo */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Motivo da Consulta
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              bgcolor: 'grey.50',
              border: '1px solid',
              borderColor: 'grey.200'
            }}
          >
            <Typography variant="body1">{consulta.motivo}</Typography>
          </Paper>
        </CardContent>
      </Card>

      {/* Diagnóstico */}
      {consulta.diagnostico && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Diagnóstico
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                bgcolor: 'info.50',
                border: '1px solid',
                borderColor: 'info.200'
              }}
            >
              <Typography variant="body1">{consulta.diagnostico}</Typography>
            </Paper>
          </CardContent>
        </Card>
      )}

      {/* Tratamento */}
      {consulta.tratamento && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Tratamento Prescrito
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                bgcolor: 'success.50',
                border: '1px solid',
                borderColor: 'success.200'
              }}
            >
              <Typography variant="body1">{consulta.tratamento}</Typography>
            </Paper>
          </CardContent>
        </Card>
      )}

      {/* Observações */}
      {consulta.observacoes && (
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Observações Adicionais
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                bgcolor: 'warning.50',
                border: '1px solid',
                borderColor: 'warning.200'
              }}
            >
              <Typography variant="body1">{consulta.observacoes}</Typography>
            </Paper>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};
