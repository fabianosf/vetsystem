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
  Button,
  Paper,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowBack, Pets } from '@mui/icons-material';
import api from '../../services/api';
import { AnimalPDFActions } from '../../components/PDF/AnimalPDFActions';

interface Animal {
  id: number;
  name: string;
  species: string;
  breed: string;
  age: number;
  weight: number;
  sex: string;
  color: string;
  microchip_number: string;
  observacoes: string;
  tutor: {
    name: string;
    phone: string;
    email: string;
    cpf: string;
  };
}

export const AnimalDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnimal();
  }, [id]);

  const loadAnimal = async () => {
    try {
      const response = await api.get(`/animais/${id}/`);
      setAnimal(response.data);
    } catch (err: any) {
      if (err.response?.status !== 404) {
        setError(err.response?.data?.message || 'Erro ao carregar animal');
      } else {
        setError('Animal não encontrado');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !animal) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/animais')}
          sx={{ mb: 3 }}
        >
          Voltar
        </Button>
        <Alert severity="error">{error || 'Animal não encontrado'}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/animais')}
            sx={{ mb: 2 }}
          >
            Voltar
          </Button>
          <Box display="flex" alignItems="center" gap={2}>
            <Pets sx={{ fontSize: 40, color: 'primary.main' }} />
            <Box>
              <Typography variant="h4" fontWeight={700}>
                {animal.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {animal.species} - {animal.breed}
              </Typography>
            </Box>
          </Box>
        </Box>
        <AnimalPDFActions animalId={animal.id} />
      </Box>

      {/* Cards Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
          gap: 3,
        }}
      >
        {/* Informações do Animal */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Informações do Animal
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box display="flex" flexDirection="column" gap={2}>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Nome Completo
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {animal.name}
                </Typography>
              </Box>

              <Box display="flex" gap={2}>
                <Box flex={1}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Espécie
                  </Typography>
                  <Typography variant="body1">{animal.species}</Typography>
                </Box>
                <Box flex={1}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Raça
                  </Typography>
                  <Typography variant="body1">{animal.breed}</Typography>
                </Box>
              </Box>

              <Box display="flex" gap={2}>
                <Box flex={1}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Sexo
                  </Typography>
                  <Chip 
                    label={animal.sex === 'M' ? 'Macho' : 'Fêmea'} 
                    size="small" 
                    color="primary"
                    variant="outlined"
                  />
                </Box>
                <Box flex={1}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Idade
                  </Typography>
                  <Typography variant="body1">{animal.age} anos</Typography>
                </Box>
              </Box>

              <Box display="flex" gap={2}>
                <Box flex={1}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Peso
                  </Typography>
                  <Typography variant="body1">{animal.weight} kg</Typography>
                </Box>
                <Box flex={1}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Cor
                  </Typography>
                  <Typography variant="body1">{animal.color || '-'}</Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Microchip
                </Typography>
                <Typography variant="body1" fontFamily="monospace">
                  {animal.microchip_number || 'Não cadastrado'}
                </Typography>
              </Box>

              {animal.observacoes && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                      Observações
                    </Typography>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 2, 
                        bgcolor: 'grey.50',
                        border: '1px solid',
                        borderColor: 'grey.200'
                      }}
                    >
                      <Typography variant="body2">{animal.observacoes}</Typography>
                    </Paper>
                  </Box>
                </>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Tutor Responsável */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Tutor Responsável
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box display="flex" flexDirection="column" gap={2}>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Nome Completo
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {animal.tutor.name}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  CPF
                </Typography>
                <Typography variant="body1" fontFamily="monospace">
                  {animal.tutor.cpf || 'Não cadastrado'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Telefone
                </Typography>
                <Typography variant="body1">{animal.tutor.phone}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Email
                </Typography>
                <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                  {animal.tutor.email || 'Não cadastrado'}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};
