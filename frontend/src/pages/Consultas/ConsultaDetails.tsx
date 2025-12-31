import React, { useEffect, useState } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import { ConsultaPDFActions } from '../../components/PDF/ConsultaPDFActions';

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
  const [consulta, setConsulta] = useState<Consulta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConsulta();
  }, [id]);

  const loadConsulta = async () => {
    try {
      const response = await api.get(`/consultas/${id}/`);
      setConsulta(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar consulta');
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

  if (error || !consulta) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error || 'Consulta não encontrada'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Detalhes da Consulta
        </Typography>
        <ConsultaPDFActions consultaId={consulta.id} />
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Informações Gerais</Typography>
            <Chip label={consulta.status} color="primary" />
          </Box>
          <Divider sx={{ mb: 2 }} />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary">
                Data:
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {new Date(consulta.data_consulta).toLocaleDateString('pt-BR')}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Horário:
              </Typography>
              <Typography variant="body1">{consulta.horario}</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Paciente
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary">
                Nome:
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {consulta.animal.name}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Espécie:
              </Typography>
              <Typography variant="body1">{consulta.animal.species}</Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Raça:
              </Typography>
              <Typography variant="body1">{consulta.animal.breed}</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Veterinário
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary">
                Nome:
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {consulta.veterinario.nome}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                CRMV:
              </Typography>
              <Typography variant="body1">{consulta.veterinario.crmv}</Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Especialidade:
              </Typography>
              <Typography variant="body1">{consulta.veterinario.especialidade}</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Motivo da Consulta
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body1">{consulta.motivo}</Typography>
        </CardContent>
      </Card>

      {consulta.diagnostico && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Diagnóstico
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1">{consulta.diagnostico}</Typography>
          </CardContent>
        </Card>
      )}

      {consulta.tratamento && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Tratamento
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1">{consulta.tratamento}</Typography>
          </CardContent>
        </Card>
      )}

      {consulta.observacoes && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Observações
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1">{consulta.observacoes}</Typography>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};
