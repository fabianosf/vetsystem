import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Tabs,
  Tab,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import { Pets as PetsIcon } from '@mui/icons-material';
import { DiagnosticoUpload } from '../../components/Diagnostico/DiagnosticoUpload';
import { DiagnosticoList } from '../../components/Diagnostico/DiagnosticoList';
import { DiagnosticoDashboard } from '../../components/Diagnostico/DiagnosticoDashboard';
import api from '../../services/api';

interface Animal {
  id: number;
  name: string;
  species: string;
  breed: string;
  age: number;
  tutor_name: string;
}

export const DiagnosticoPage: React.FC = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);

  useEffect(() => {
    loadAnimais();
  }, []);

  const loadAnimais = async () => {
    try {
      const response = await api.get('/animais/');
      setAnimais(response.data.results || []);
    } catch (error) {
      console.error('Erro ao carregar animais:', error);
    }
  };

  const handleAnimalChange = (animalId: number) => {
    const animal = animais.find((a) => a.id === animalId);
    setSelectedAnimal(animal || null);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Diagnóstico por Inteligência Artificial
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabIndex}
          onChange={(_, newValue) => setTabIndex(newValue)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Novo Diagnóstico" />
          <Tab label="Histórico" />
          <Tab label="Dashboard" />
        </Tabs>
      </Paper>

      <Box>
        {/* Tab 1: Novo Diagnóstico */}
        {tabIndex === 0 && (
          <>
            {/* Seletor de Animal */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  1. Selecione o Animal
                </Typography>
                <FormControl fullWidth>
                  <InputLabel>Selecione um animal</InputLabel>
                  <Select
                    value={selectedAnimal?.id || ''}
                    onChange={(e) => handleAnimalChange(Number(e.target.value))}
                    label="Selecione um animal"
                  >
                    {animais.map((animal) => (
                      <MenuItem key={animal.id} value={animal.id}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <PetsIcon fontSize="small" />
                          <Typography>
                            {animal.name} - {animal.species} ({animal.breed})
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Informações do Animal Selecionado */}
                {selectedAnimal && (
                  <Box
                    sx={{
                      mt: 3,
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, 1fr)',
                        md: 'repeat(4, 1fr)',
                      },
                      gap: 2,
                    }}
                  >
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Nome:
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {selectedAnimal.name}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Espécie:
                      </Typography>
                      <Typography variant="body1">
                        {selectedAnimal.species}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Raça:
                      </Typography>
                      <Typography variant="body1">
                        {selectedAnimal.breed}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Tutor:
                      </Typography>
                      <Typography variant="body1">
                        {selectedAnimal.tutor_name}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Upload de Imagem */}
            {selectedAnimal ? (
              <Box>
                <Typography variant="h6" gutterBottom>
                  2. Envie uma Foto para Diagnóstico
                </Typography>
                <DiagnosticoUpload
                  animal={selectedAnimal}
                  onSuccess={() => {
                    // Atualizar a aba de histórico
                    setTabIndex(1);
                  }}
                />
              </Box>
            ) : (
              <Alert severity="info">
                Selecione um animal para fazer o diagnóstico
              </Alert>
            )}
          </>
        )}

        {/* Tab 2: Histórico */}
        {tabIndex === 1 && <DiagnosticoList />}

        {/* Tab 3: Dashboard */}
        {tabIndex === 2 && <DiagnosticoDashboard />}
      </Box>
    </Container>
  );
};
