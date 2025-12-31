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
      setError(err.response?.data?.message || 'Erro ao carregar animal');
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

  if (error || !animal) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error || 'Animal não encontrado'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          {animal.name}
        </Typography>
        <AnimalPDFActions animalId={animal.id} />
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Informações do Animal
          </Typography>
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
                Nome:
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {animal.name}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Espécie:
              </Typography>
              <Typography variant="body1">{animal.species}</Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Raça:
              </Typography>
              <Typography variant="body1">{animal.breed}</Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Sexo:
              </Typography>
              <Chip label={animal.sex} size="small" />
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Idade:
              </Typography>
              <Typography variant="body1">{animal.age} anos</Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Peso:
              </Typography>
              <Typography variant="body1">{animal.weight} kg</Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Cor:
              </Typography>
              <Typography variant="body1">{animal.color || '-'}</Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Microchip:
              </Typography>
              <Typography variant="body1">{animal.microchip_number || '-'}</Typography>
            </Box>
          </Box>

          {animal.observacoes && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="caption" color="text.secondary">
                Observações:
              </Typography>
              <Typography variant="body2">{animal.observacoes}</Typography>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Tutor Responsável
          </Typography>
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
                Nome:
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {animal.tutor.name}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                CPF:
              </Typography>
              <Typography variant="body1">{animal.tutor.cpf || '-'}</Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Telefone:
              </Typography>
              <Typography variant="body1">{animal.tutor.phone}</Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Email:
              </Typography>
              <Typography variant="body1">{animal.tutor.email || '-'}</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

