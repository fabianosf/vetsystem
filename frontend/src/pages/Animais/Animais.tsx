import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  InputAdornment,
  CircularProgress,
  Stack,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  Pets,
  Cake,
  Male,
  Female,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';

interface Animal {
  id: number;
  name: string;
  species: string;
  breed: string;
  birth_date: string;
  gender: string;
  weight: number;
  tutor: number;
  tutor_name?: string;
  is_active: boolean;
}

const Animais: React.FC = () => {
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    species: 'Cachorro',
    breed: '',
    birth_date: '',
    gender: 'M',
    weight: '',
    tutor: '',
  });

  useEffect(() => {<Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth disableEnforceFocus></Dialog>
    fetchAnimais();
  }, []);

  const fetchAnimais = async () => {
  try {
    setLoading(true);
    const response = await api.get('/animais/');
    setAnimais(response.data.results || response.data || []);
  } catch (error: any) {
    if (error.response?.status !== 404) {
      console.error('Erro ao carregar animais:', error);
      toast.error('Erro ao carregar animais');
    }
    setAnimais([]);
  } finally {
    setLoading(false);
  }
};


  const handleOpenDialog = (animal?: Animal) => {
    if (animal) {
      setEditingAnimal(animal);
      setFormData({
        name: animal.name,
        species: animal.species,
        breed: animal.breed,
        birth_date: animal.birth_date,
        gender: animal.gender,
        weight: animal.weight.toString(),
        tutor: animal.tutor.toString(),
      });
    } else {
      setEditingAnimal(null);
      setFormData({
        name: '',
        species: 'Cachorro',
        breed: '',
        birth_date: '',
        gender: 'M',
        weight: '',
        tutor: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAnimal(null);
  };

  const handleSave = async () => {
    try {
      const data = {
        ...formData,
        weight: parseFloat(formData.weight),
        tutor: parseInt(formData.tutor),
      };

      if (editingAnimal) {
        await api.put(`/animais/${editingAnimal.id}/`, data);
        toast.success('Animal atualizado com sucesso!');
      } else {
        await api.post('/animais/', data);
        toast.success('Animal cadastrado com sucesso!');
      }
      handleCloseDialog();
      fetchAnimais();
    } catch (error: any) {
      console.error('Erro ao salvar animal:', error);
      toast.error(error.response?.data?.detail || 'Erro ao salvar animal');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Deseja realmente excluir este animal?')) {
      try {
        await api.delete(`/animais/${id}/`);
        toast.success('Animal excluído com sucesso!');
        fetchAnimais();
      } catch (error) {
        toast.error('Erro ao excluir animal');
      }
    }
  };

  const filteredAnimais = animais.filter(
    (animal) =>
      animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.breed.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAnimalIcon = (species: string) => {
    return species.toLowerCase() === 'gato' ? '🐱' : '🐶';
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Animais
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie os animais cadastrados no sistema
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{ borderRadius: 2 }}
        >
          Novo Animal
        </Button>
      </Box>

      {/* Search Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Buscar por nome, espécie ou raça..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Cards Grid */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : filteredAnimais.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Pets sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Nenhum animal encontrado
          </Typography>
        </Paper>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
            gap: 3,
          }}
        >
          {filteredAnimais.map((animal) => (
            <Card key={animal.id} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      bgcolor: 'primary.main',
                      fontSize: '2rem',
                    }}
                  >
                    {getAnimalIcon(animal.species)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {animal.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {animal.breed}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" gap={1} mb={2}>
                  <Chip
                    label={animal.species}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    icon={animal.gender === 'M' ? <Male /> : <Female />}
                    label={animal.gender === 'M' ? 'Macho' : 'Fêmea'}
                    size="small"
                  />
                </Box>

                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Cake fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {new Date(animal.birth_date).toLocaleDateString('pt-BR')}
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary">
                  Peso: {animal.weight} kg
                </Typography>

                {animal.tutor_name && (
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    Tutor: {animal.tutor_name}
                  </Typography>
                )}
              </CardContent>

              <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => handleOpenDialog(animal)}
                >
                  <Edit />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDelete(animal.id)}
                >
                  <Delete />
                </IconButton>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}

      {/* Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingAnimal ? 'Editar Animal' : 'Novo Animal'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Nome"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            
            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                select
                label="Espécie"
                value={formData.species}
                onChange={(e) => setFormData({ ...formData, species: e.target.value })}
              >
                <MenuItem value="Cachorro">Cachorro</MenuItem>
                <MenuItem value="Gato">Gato</MenuItem>
                <MenuItem value="Pássaro">Pássaro</MenuItem>
                <MenuItem value="Outros">Outros</MenuItem>
              </TextField>
              
              <TextField
                fullWidth
                label="Raça"
                value={formData.breed}
                onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
              />
            </Box>

            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                type="date"
                label="Data de Nascimento"
                value={formData.birth_date}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
              
              <TextField
                fullWidth
                select
                label="Sexo"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <MenuItem value="M">Macho</MenuItem>
                <MenuItem value="F">Fêmea</MenuItem>
              </TextField>
            </Box>

            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                type="number"
                label="Peso (kg)"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              />
              
              <TextField
                fullWidth
                type="number"
                label="ID do Tutor"
                value={formData.tutor}
                onChange={(e) => setFormData({ ...formData, tutor: e.target.value })}
                helperText="Informe o ID do tutor"
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Animais;
