import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import type { Animal, Tutor, PaginatedResponse } from '../../types';
import {
  Box, Card, CardContent, Typography, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Grid, IconButton, InputAdornment,
  Avatar, Stack, Chip, CircularProgress, MenuItem
} from '@mui/material';
import {
  Add, Edit, Delete, Search, Pets, Close, Cake, FitnessCenter, Colorize
} from '@mui/icons-material';

export default function Animais() {
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [tutores, setTutores] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);
  const toast = useToast();
  
  const [formData, setFormData] = useState({
    tutor: '',
    name: '',
    species: 'CACHORRO',
    breed: '',
    gender: 'M',
    age: '',
    weight: '',
    color: '',
    microchip: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const loadingToast = toast.loading('Carregando animais...');
    try {
      const [animaisRes, tutoresRes] = await Promise.all([
        api.get<PaginatedResponse<Animal>>('/animais/'),
        api.get<PaginatedResponse<Tutor>>('/tutores/'),
      ]);
      setAnimais(animaisRes.data.results || animaisRes.data);
      setTutores(tutoresRes.data.results || tutoresRes.data);
      toast.dismiss(loadingToast);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('❌ Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading(editingAnimal ? 'Atualizando animal...' : 'Cadastrando animal...');
    
    try {
      const data = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
      };

      if (editingAnimal) {
        await api.put(`/animais/${editingAnimal.id}/`, data);
        toast.dismiss(loadingToast);
        toast.success('✅ Animal atualizado com sucesso!');
      } else {
        await api.post('/animais/', data);
        toast.dismiss(loadingToast);
        toast.success('🐾 Animal cadastrado com sucesso!');
      }
      loadData();
      closeModal();
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.detail || '❌ Erro ao salvar animal');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja realmente excluir este animal?')) return;
    
    const loadingToast = toast.loading('Excluindo animal...');
    try {
      await api.delete(`/animais/${id}/`);
      toast.dismiss(loadingToast);
      toast.success('🗑️ Animal excluído com sucesso!');
      loadData();
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('❌ Erro ao excluir animal');
    }
  };

  const openModal = (animal?: Animal) => {
    if (animal) {
      setEditingAnimal(animal);
      setFormData({
        tutor: animal.tutor.toString(),
        name: animal.name,
        species: animal.species,
        breed: animal.breed || '',
        gender: animal.gender,
        age: animal.age?.toString() || '',
        weight: animal.weight?.toString() || '',
        color: animal.color || '',
        microchip: animal.microchip || '',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAnimal(null);
    setFormData({
      tutor: '',
      name: '',
      species: 'CACHORRO',
      breed: '',
      gender: 'M',
      age: '',
      weight: '',
      color: '',
      microchip: '',
    });
  };

  const getTutorName = (tutorId: number) => {
    const tutor = tutores.find(t => t.id === tutorId);
    return tutor?.name || 'N/A';
  };

  const getSpeciesIcon = (species: string) => {
    return <Pets />;
  };

  const getSpeciesLabel = (species: string) => {
    const labels: any = {
      'CACHORRO': 'Cachorro',
      'GATO': 'Gato',
      'PASSARO': 'Pássaro',
      'OUTRO': 'Outro',
    };
    return labels[species] || species;
  };

  const filteredAnimais = animais.filter(animal =>
    animal.name.toLowerCase().includes(search.toLowerCase()) ||
    getTutorName(animal.tutor).toLowerCase().includes(search.toLowerCase())
  );

  if (loading && animais.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>Animais</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => openModal()}>
          Novo Animal
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Buscar por nome do animal ou tutor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {filteredAnimais.map((animal) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={animal.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                    {getSpeciesIcon(animal.species)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>{animal.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Tutor: {getTutorName(animal.tutor)}
                    </Typography>
                  </Box>
                </Box>

                <Stack spacing={1}>
                  <Chip
                    label={getSpeciesLabel(animal.species)}
                    size="small"
                    color="primary"
                  />
                  {animal.breed && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" color="text.secondary">
                        Raça: {animal.breed}
                      </Typography>
                    </Box>
                  )}
                  {animal.age && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Cake fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {animal.age} {animal.age === 1 ? 'ano' : 'anos'}
                      </Typography>
                    </Box>
                  )}
                  {animal.weight && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <FitnessCenter fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {animal.weight} kg
                      </Typography>
                    </Box>
                  )}
                  {animal.color && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Colorize fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {animal.color}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>

              <Box sx={{ p: 2, pt: 0 }}>
                <Stack direction="row" spacing={1}>
                  <Button fullWidth variant="outlined" startIcon={<Edit />} onClick={() => openModal(animal)}>
                    Editar
                  </Button>
                  <IconButton color="error" onClick={() => handleDelete(animal.id)}>
                    <Delete />
                  </IconButton>
                </Stack>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredAnimais.length === 0 && (
        <Box textAlign="center" py={8}>
          <Pets sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">Nenhum animal encontrado</Typography>
        </Box>
      )}

      <Dialog open={showModal} onClose={closeModal} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">{editingAnimal ? 'Editar Animal' : 'Novo Animal'}</Typography>
              <IconButton onClick={closeModal} size="small"><Close /></IconButton>
            </Box>
          </DialogTitle>

          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  select
                  label="Tutor"
                  value={formData.tutor}
                  onChange={(e) => setFormData({ ...formData, tutor: e.target.value })}
                  required
                >
                  <MenuItem value="">Selecione um tutor</MenuItem>
                  {tutores.map((tutor) => (
                    <MenuItem key={tutor.id} value={tutor.id}>
                      {tutor.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Nome do Animal"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Espécie"
                  value={formData.species}
                  onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                  required
                >
                  <MenuItem value="CACHORRO">Cachorro</MenuItem>
                  <MenuItem value="GATO">Gato</MenuItem>
                  <MenuItem value="PASSARO">Pássaro</MenuItem>
                  <MenuItem value="OUTRO">Outro</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Raça"
                  value={formData.breed}
                  onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Sexo"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  required
                >
                  <MenuItem value="M">Macho</MenuItem>
                  <MenuItem value="F">Fêmea</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Idade (anos)"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  inputProps={{ min: 0 }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Peso (kg)"
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  inputProps={{ min: 0 }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Cor"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Microchip"
                  value={formData.microchip}
                  onChange={(e) => setFormData({ ...formData, microchip: e.target.value })}
                  placeholder="Número do microchip (opcional)"
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button onClick={closeModal}>Cancelar</Button>
            <Button type="submit" variant="contained">
              {editingAnimal ? 'Salvar' : 'Cadastrar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
