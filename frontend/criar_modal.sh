#!/bin/bash
# Script para criar TODOS os modais CRUD do VetSystem
# Execute: bash criar_modais.sh

cd ~/Desktop/vetsystem/frontend

echo "🚀 Criando TODOS os Modais CRUD do VetSystem..."
echo ""

# ============================================================
# 1. MODAL DE TUTORES
# ============================================================
echo "📝 1/5 - Criando Modal de Tutores..."
cat > src/pages/Tutores/Tutores.tsx << 'TUTORES_EOF'
import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import type { Tutor, PaginatedResponse } from '../../types';
import {
  Box, Card, CardContent, Typography, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Grid, IconButton, InputAdornment,
  Avatar, Stack, Chip, Alert, CircularProgress
} from '@mui/material';
import {
  Add, Edit, Delete, Search, Person, Email, Phone, LocationOn,
  Pets, Close
} from '@mui/icons-material';

export default function Tutores() {
  const [tutores, setTutores] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTutor, setEditingTutor] = useState<Tutor | null>(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    address: '',
    city: '',
    state: '',
    cep: '',
  });

  useEffect(() => {
    loadTutores();
  }, []);

  const loadTutores = async () => {
    try {
      const response = await api.get<PaginatedResponse<Tutor>>('/tutores/');
      setTutores(response.data.results || response.data);
    } catch (error) {
      setError('Erro ao carregar tutores');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (editingTutor) {
        await api.put(`/tutores/${editingTutor.id}/`, formData);
        setSuccess('Tutor atualizado com sucesso!');
      } else {
        await api.post('/tutores/', formData);
        setSuccess('Tutor cadastrado com sucesso!');
      }
      loadTutores();
      closeModal();
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Erro ao salvar tutor');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja realmente excluir este tutor?')) return;
    
    try {
      await api.delete(`/tutores/${id}/`);
      setSuccess('Tutor excluído com sucesso!');
      loadTutores();
    } catch (error) {
      setError('Erro ao excluir tutor');
    }
  };

  const openModal = (tutor?: Tutor) => {
    if (tutor) {
      setEditingTutor(tutor);
      setFormData({
        name: tutor.name,
        email: tutor.email,
        phone: tutor.phone,
        cpf: tutor.cpf,
        address: tutor.address || '',
        city: tutor.city || '',
        state: tutor.state || '',
        cep: tutor.cep || '',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTutor(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      cpf: '',
      address: '',
      city: '',
      state: '',
      cep: '',
    });
    setError('');
  };

  const filteredTutores = tutores.filter(tutor =>
    tutor.name.toLowerCase().includes(search.toLowerCase()) ||
    tutor.email.toLowerCase().includes(search.toLowerCase()) ||
    tutor.cpf.includes(search)
  );

  if (loading && tutores.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>Tutores</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => openModal()}>
          Novo Tutor
        </Button>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Buscar por nome, email ou CPF..."
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
        {filteredTutores.map((tutor) => (
          <Grid item xs={12} sm={6} md={4} key={tutor.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                    {tutor.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>{tutor.name}</Typography>
                    <Chip
                      label={`${tutor.total_animais || 0} animais`}
                      size="small"
                      icon={<Pets fontSize="small" />}
                      color="primary"
                    />
                  </Box>
                </Box>

                <Stack spacing={1}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Email fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">{tutor.email}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Phone fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">{tutor.phone}</Typography>
                  </Box>
                  {tutor.city && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <LocationOn fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {tutor.city}/{tutor.state}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>

              <Box sx={{ p: 2, pt: 0 }}>
                <Stack direction="row" spacing={1}>
                  <Button fullWidth variant="outlined" startIcon={<Edit />} onClick={() => openModal(tutor)}>
                    Editar
                  </Button>
                  <IconButton color="error" onClick={() => handleDelete(tutor.id)}>
                    <Delete />
                  </IconButton>
                </Stack>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredTutores.length === 0 && (
        <Box textAlign="center" py={8}>
          <Person sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">Nenhum tutor encontrado</Typography>
        </Box>
      )}

      <Dialog open={showModal} onClose={closeModal} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">{editingTutor ? 'Editar Tutor' : 'Novo Tutor'}</Typography>
              <IconButton onClick={closeModal} size="small"><Close /></IconButton>
            </Box>
          </DialogTitle>

          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nome Completo"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start"><Person /></InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="CPF"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  required
                  placeholder="000.000.000-00"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start"><Email /></InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Telefone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  placeholder="(11) 98765-4321"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start"><Phone /></InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Endereço"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="CEP"
                  value={formData.cep}
                  onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                  placeholder="00000-000"
                />
              </Grid>

              <Grid item xs={12} md={9}>
                <TextField
                  fullWidth
                  label="Cidade"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Estado (UF)"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  inputProps={{ maxLength: 2 }}
                  placeholder="SP"
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button onClick={closeModal}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {editingTutor ? 'Salvar' : 'Cadastrar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
TUTORES_EOF

echo "✅ Modal de Tutores criado!"
echo ""

# ============================================================
# 2. MODAL DE ANIMAIS
# ============================================================
echo "📝 2/5 - Criando Modal de Animais..."
cat > src/pages/Animais/Animais.tsx << 'ANIMAIS_EOF'
import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import type { Animal, Tutor, PaginatedResponse } from '../../types';
import {
  Box, Card, CardContent, Typography, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Grid, IconButton, InputAdornment,
  Avatar, Stack, Chip, Alert, CircularProgress, MenuItem
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
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
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
    try {
      const [animaisRes, tutoresRes] = await Promise.all([
        api.get<PaginatedResponse<Animal>>('/animais/'),
        api.get<PaginatedResponse<Tutor>>('/tutores/'),
      ]);
      setAnimais(animaisRes.data.results || animaisRes.data);
      setTutores(tutoresRes.data.results || tutoresRes.data);
    } catch (error) {
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const data = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
      };

      if (editingAnimal) {
        await api.put(`/animais/${editingAnimal.id}/`, data);
        setSuccess('Animal atualizado com sucesso!');
      } else {
        await api.post('/animais/', data);
        setSuccess('Animal cadastrado com sucesso!');
      }
      loadData();
      closeModal();
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Erro ao salvar animal');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja realmente excluir este animal?')) return;
    
    try {
      await api.delete(`/animais/${id}/`);
      setSuccess('Animal excluído com sucesso!');
      loadData();
    } catch (error) {
      setError('Erro ao excluir animal');
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
    setError('');
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

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

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
          <Grid item xs={12} sm={6} md={4} key={animal.id}>
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
              <Grid item xs={12}>
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

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nome do Animal"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
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

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Raça"
                  value={formData.breed}
                  onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} md={6}>
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

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Idade (anos)"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  inputProps={{ min: 0 }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
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

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Cor"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </Grid>

              <Grid item xs={12}>
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
            <Button type="submit" variant="contained" disabled={loading}>
              {editingAnimal ? 'Salvar' : 'Cadastrar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
ANIMAIS_EOF

echo "✅ Modal de Animais criado!"
echo ""

# ============================================================
# 3. MODAL DE VETERINÁRIOS
# ============================================================
echo "📝 3/5 - Criando Modal de Veterinários..."
cat > src/pages/Veterinarios/Veterinarios.tsx << 'VETS_EOF'
import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import type { Veterinario, PaginatedResponse } from '../../types';
import {
  Box, Card, CardContent, Typography, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Grid, IconButton, InputAdornment,
  Avatar, Stack, Chip, Alert, CircularProgress, MenuItem
} from '@mui/material';
import {
  Add, Edit, Delete, Search, MedicalServices, Email, Phone, Close, Badge
} from '@mui/icons-material';

export default function Veterinarios() {
  const [veterinarios, setVeterinarios] = useState<Veterinario[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingVet, setEditingVet] = useState<Veterinario | null>(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    crmv: '',
    especialidades: '',
    status: 'ATIVO',
  });

  useEffect(() => {
    loadVeterinarios();
  }, []);

  const loadVeterinarios = async () => {
    try {
      const response = await api.get<PaginatedResponse<Veterinario>>('/veterinarios/');
      setVeterinarios(response.data.results || response.data);
    } catch (error) {
      setError('Erro ao carregar veterinários');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (editingVet) {
        await api.put(`/veterinarios/${editingVet.id}/`, formData);
        setSuccess('Veterinário atualizado com sucesso!');
      } else {
        await api.post('/veterinarios/', formData);
        setSuccess('Veterinário cadastrado com sucesso!');
      }
      loadVeterinarios();
      closeModal();
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Erro ao salvar veterinário');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja realmente excluir este veterinário?')) return;
    
    try {
      await api.delete(`/veterinarios/${id}/`);
      setSuccess('Veterinário excluído com sucesso!');
      loadVeterinarios();
    } catch (error) {
      setError('Erro ao excluir veterinário');
    }
  };

  const openModal = (vet?: Veterinario) => {
    if (vet) {
      setEditingVet(vet);
      setFormData({
        name: vet.name,
        email: vet.email,
        phone: vet.phone,
        crmv: vet.crmv,
        especialidades: vet.especialidades || '',
        status: vet.status,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingVet(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      crmv: '',
      especialidades: '',
      status: 'ATIVO',
    });
    setError('');
  };

  const filteredVeterinarios = veterinarios.filter(vet =>
    vet.name.toLowerCase().includes(search.toLowerCase()) ||
    vet.crmv.includes(search)
  );

  if (loading && veterinarios.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>Veterinários</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => openModal()}>
          Novo Veterinário
        </Button>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Buscar por nome ou CRMV..."
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
        {filteredVeterinarios.map((vet) => (
          <Grid item xs={12} sm={6} md={4} key={vet.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar sx={{ bgcolor: 'secondary.main', width: 56, height: 56 }}>
                    <MedicalServices />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>{vet.name}</Typography>
                    <Chip
                      label={vet.status === 'ATIVO' ? 'Ativo' : 'Inativo'}
                      size="small"
                      color={vet.status === 'ATIVO' ? 'success' : 'default'}
                    />
                  </Box>
                </Box>

                <Stack spacing={1}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Badge fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      CRMV: {vet.crmv}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Email fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">{vet.email}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Phone fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">{vet.phone}</Typography>
                  </Box>
                  {vet.especialidades && (
                    <Box mt={1}>
                      <Typography variant="caption" color="text.secondary">
                        Especialidades: {vet.especialidades}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>

              <Box sx={{ p: 2, pt: 0 }}>
                <Stack direction="row" spacing={1}>
                  <Button fullWidth variant="outlined" startIcon={<Edit />} onClick={() => openModal(vet)}>
                    Editar
                  </Button>
                  <IconButton color="error" onClick={() => handleDelete(vet.id)}>
                    <Delete />
                  </IconButton>
                </Stack>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredVeterinarios.length === 0 && (
        <Box textAlign="center" py={8}>
          <MedicalServices sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">Nenhum veterinário encontrado</Typography>
        </Box>
      )}

      <Dialog open={showModal} onClose={closeModal} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">{editingVet ? 'Editar Veterinário' : 'Novo Veterinário'}</Typography>
              <IconButton onClick={closeModal} size="small"><Close /></IconButton>
            </Box>
          </DialogTitle>

          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nome Completo"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="CRMV"
                  value={formData.crmv}
                  onChange={(e) => setFormData({ ...formData, crmv: e.target.value })}
                  required
                  placeholder="12345-SP"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  required
                >
                  <MenuItem value="ATIVO">Ativo</MenuItem>
                  <MenuItem value="INATIVO">Inativo</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Telefone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  placeholder="(11) 98765-4321"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Especialidades"
                  value={formData.especialidades}
                  onChange={(e) => setFormData({ ...formData, especialidades: e.target.value })}
                  placeholder="Ex: Cirurgia, Dermatologia, Ortopedia"
                  helperText="Separe as especialidades por vírgula"
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button onClick={closeModal}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {editingVet ? 'Salvar' : 'Cadastrar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
VETS_EOF

echo "✅ Modal de Veterinários criado!"
echo ""

# ============================================================
# 4. MODAL DE PLANOS DE SAÚDE
# ============================================================
echo "📝 4/5 - Criando Modal de Planos de Saúde..."
cat > src/pages/Planos/Planos.tsx << 'PLANOS_EOF'
import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import type { PlanoSaude, PaginatedResponse } from '../../types';
import {
  Box, Card, CardContent, Typography, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Grid, IconButton, InputAdornment,
  Stack, Chip, Alert, CircularProgress, MenuItem, Switch, FormControlLabel
} from '@mui/material';
import {
  Add, Edit, Delete, Search, HealthAndSafety, Close, AttachMoney
} from '@mui/icons-material';

export default function Planos() {
  const [planos, setPlanos] = useState<PlanoSaude[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPlano, setEditingPlano] = useState<PlanoSaude | null>(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco_mensal: '',
    consultas_mes: '',
    exames_mes: '',
    vacinas_ano: '',
    consultas_ilimitadas: false,
    exames_ilimitados: false,
    vacinas_ilimitadas: false,
    is_active: true,
  });

  useEffect(() => {
    loadPlanos();
  }, []);

  const loadPlanos = async () => {
    try {
      const response = await api.get<PaginatedResponse<PlanoSaude>>('/planos/');
      setPlanos(response.data.results || response.data);
    } catch (error) {
      setError('Erro ao carregar planos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const data = {
        ...formData,
        preco_mensal: parseFloat(formData.preco_mensal),
        consultas_mes: formData.consultas_ilimitadas ? null : parseInt(formData.consultas_mes),
        exames_mes: formData.exames_ilimitados ? null : parseInt(formData.exames_mes),
        vacinas_ano: formData.vacinas_ilimitadas ? null : parseInt(formData.vacinas_ano),
      };

      if (editingPlano) {
        await api.put(`/planos/${editingPlano.id}/`, data);
        setSuccess('Plano atualizado com sucesso!');
      } else {
        await api.post('/planos/', data);
        setSuccess('Plano cadastrado com sucesso!');
      }
      loadPlanos();
      closeModal();
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Erro ao salvar plano');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja realmente excluir este plano?')) return;
    
    try {
      await api.delete(`/planos/${id}/`);
      setSuccess('Plano excluído com sucesso!');
      loadPlanos();
    } catch (error) {
      setError('Erro ao excluir plano');
    }
  };

  const openModal = (plano?: PlanoSaude) => {
    if (plano) {
      setEditingPlano(plano);
      setFormData({
        nome: plano.nome,
        descricao: plano.descricao || '',
        preco_mensal: plano.preco_mensal.toString(),
        consultas_mes: plano.consultas_mes?.toString() || '',
        exames_mes: plano.exames_mes?.toString() || '',
        vacinas_ano: plano.vacinas_ano?.toString() || '',
        consultas_ilimitadas: plano.consultas_ilimitadas || false,
        exames_ilimitados: plano.exames_ilimitados || false,
        vacinas_ilimitadas: plano.vacinas_ilimitadas || false,
        is_active: plano.is_active,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPlano(null);
    setFormData({
      nome: '',
      descricao: '',
      preco_mensal: '',
      consultas_mes: '',
      exames_mes: '',
      vacinas_ano: '',
      consultas_ilimitadas: false,
      exames_ilimitados: false,
      vacinas_ilimitadas: false,
      is_active: true,
    });
    setError('');
  };

  const filteredPlanos = planos.filter(plano =>
    plano.nome.toLowerCase().includes(search.toLowerCase())
  );

  if (loading && planos.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>Planos de Saúde</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => openModal()}>
          Novo Plano
        </Button>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Buscar planos..."
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
        {filteredPlanos.map((plano) => (
          <Grid item xs={12} sm={6} md={4} key={plano.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <HealthAndSafety color="primary" />
                    <Typography variant="h6" fontWeight={600}>{plano.nome}</Typography>
                  </Box>
                  <Chip
                    label={plano.is_active ? 'Ativo' : 'Inativo'}
                    size="small"
                    color={plano.is_active ? 'success' : 'default'}
                  />
                </Box>

                {plano.descricao && (
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {plano.descricao}
                  </Typography>
                )}

                <Box sx={{ bgcolor: 'primary.light', p: 2, borderRadius: 2, mb: 2 }}>
                  <Typography variant="h4" fontWeight={700} color="primary.main">
                    R$ {parseFloat(plano.preco_mensal).toFixed(2)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    por mês
                  </Typography>
                </Box>

                <Stack spacing={1}>
                  <Chip
                    label={plano.consultas_ilimitadas ? '∞ Consultas' : `${plano.consultas_mes} consultas/mês`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={plano.exames_ilimitados ? '∞ Exames' : `${plano.exames_mes} exames/mês`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={plano.vacinas_ilimitadas ? '∞ Vacinas' : `${plano.vacinas_ano} vacinas/ano`}
                    size="small"
                    variant="outlined"
                  />
                </Stack>
              </CardContent>

              <Box sx={{ p: 2, pt: 0 }}>
                <Stack direction="row" spacing={1}>
                  <Button fullWidth variant="outlined" startIcon={<Edit />} onClick={() => openModal(plano)}>
                    Editar
                  </Button>
                  <IconButton color="error" onClick={() => handleDelete(plano.id)}>
                    <Delete />
                  </IconButton>
                </Stack>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredPlanos.length === 0 && (
        <Box textAlign="center" py={8}>
          <HealthAndSafety sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">Nenhum plano encontrado</Typography>
        </Box>
      )}

      <Dialog open={showModal} onClose={closeModal} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">{editingPlano ? 'Editar Plano' : 'Novo Plano'}</Typography>
              <IconButton onClick={closeModal} size="small"><Close /></IconButton>
            </Box>
          </DialogTitle>

          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nome do Plano"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                  placeholder="Ex: Plano Básico, Plano Premium"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descrição"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  multiline
                  rows={2}
                  placeholder="Breve descrição do plano"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Preço Mensal (R$)"
                  type="number"
                  step="0.01"
                  value={formData.preco_mensal}
                  onChange={(e) => setFormData({ ...formData, preco_mensal: e.target.value })}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoney />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                  }
                  label="Plano Ativo"
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Benefícios do Plano</Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Consultas por Mês"
                  type="number"
                  value={formData.consultas_mes}
                  onChange={(e) => setFormData({ ...formData, consultas_mes: e.target.value })}
                  disabled={formData.consultas_ilimitadas}
                  inputProps={{ min: 0 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.consultas_ilimitadas}
                      onChange={(e) => setFormData({ ...formData, consultas_ilimitadas: e.target.checked })}
                    />
                  }
                  label="Consultas Ilimitadas"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Exames por Mês"
                  type="number"
                  value={formData.exames_mes}
                  onChange={(e) => setFormData({ ...formData, exames_mes: e.target.value })}
                  disabled={formData.exames_ilimitados}
                  inputProps={{ min: 0 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.exames_ilimitados}
                      onChange={(e) => setFormData({ ...formData, exames_ilimitados: e.target.checked })}
                    />
                  }
                  label="Exames Ilimitados"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Vacinas por Ano"
                  type="number"
                  value={formData.vacinas_ano}
                  onChange={(e) => setFormData({ ...formData, vacinas_ano: e.target.value })}
                  disabled={formData.vacinas_ilimitadas}
                  inputProps={{ min: 0 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.vacinas_ilimitadas}
                      onChange={(e) => setFormData({ ...formData, vacinas_ilimitadas: e.target.checked })}
                    />
                  }
                  label="Vacinas Ilimitadas"
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button onClick={closeModal}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {editingPlano ? 'Salvar' : 'Cadastrar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
PLANOS_EOF

echo "✅ Modal de Planos criado!"
echo ""

# ============================================================
# 5. MODAL DE CLÍNICAS
# ============================================================
echo "📝 5/5 - Criando Modal de Clínicas..."
cat > src/pages/Clinicas/Clinicas.tsx << 'CLINICAS_EOF'
import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import type { Clinica, PaginatedResponse } from '../../types';
import {
  Box, Card, CardContent, Typography, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Grid, IconButton, InputAdornment,
  Stack, Chip, Alert, CircularProgress, MenuItem
} from '@mui/material';
import {
  Add, Edit, Delete, Search, Business, Phone, Email, LocationOn, Close
} from '@mui/icons-material';

export default function Clinicas() {
  const [clinicas, setClinicas] = useState<Clinica[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClinica, setEditingClinica] = useState<Clinica | null>(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    telefone: '',
    email: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    horario_funcionamento: '',
    especialidades: '',
  });

  useEffect(() => {
    loadClinicas();
  }, []);

  const loadClinicas = async () => {
    try {
      const response = await api.get<PaginatedResponse<Clinica>>('/clinicas/');
      setClinicas(response.data.results || response.data);
    } catch (error) {
      setError('Erro ao carregar clínicas');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (editingClinica) {
        await api.put(`/clinicas/${editingClinica.id}/`, formData);
        setSuccess('Clínica atualizada com sucesso!');
      } else {
        await api.post('/clinicas/', formData);
        setSuccess('Clínica cadastrada com sucesso!');
      }
      loadClinicas();
      closeModal();
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Erro ao salvar clínica');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja realmente excluir esta clínica?')) return;
    
    try {
      await api.delete(`/clinicas/${id}/`);
      setSuccess('Clínica excluída com sucesso!');
      loadClinicas();
    } catch (error) {
      setError('Erro ao excluir clínica');
    }
  };

  const openModal = (clinica?: Clinica) => {
    if (clinica) {
      setEditingClinica(clinica);
      setFormData({
        nome: clinica.nome,
        cnpj: clinica.cnpj || '',
        telefone: clinica.telefone,
        email: clinica.email || '',
        endereco: clinica.endereco || '',
        cidade: clinica.cidade || '',
        estado: clinica.estado || '',
        cep: clinica.cep || '',
        horario_funcionamento: clinica.horario_funcionamento || '',
        especialidades: clinica.especialidades || '',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingClinica(null);
    setFormData({
      nome: '',
      cnpj: '',
      telefone: '',
      email: '',
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
      horario_funcionamento: '',
      especialidades: '',
    });
    setError('');
  };

  const filteredClinicas = clinicas.filter(clinica =>
    clinica.nome.toLowerCase().includes(search.toLowerCase()) ||
    clinica.cidade?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading && clinicas.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>Clínicas</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => openModal()}>
          Nova Clínica
        </Button>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Buscar por nome ou cidade..."
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
        {filteredClinicas.map((clinica) => (
          <Grid item xs={12} sm={6} md={4} key={clinica.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      bgcolor: 'info.light',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Business fontSize="large" color="info" />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>{clinica.nome}</Typography>
                  </Box>
                </Box>

                <Stack spacing={1}>
                  {clinica.telefone && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Phone fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {clinica.telefone}
                      </Typography>
                    </Box>
                  )}
                  {clinica.email && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Email fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {clinica.email}
                      </Typography>
                    </Box>
                  )}
                  {clinica.endereco && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <LocationOn fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {clinica.endereco}
                      </Typography>
                    </Box>
                  )}
                  {clinica.cidade && (
                    <Chip
                      label={`${clinica.cidade}/${clinica.estado}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                  {clinica.horario_funcionamento && (
                    <Typography variant="caption" color="text.secondary">
                      🕐 {clinica.horario_funcionamento}
                    </Typography>
                  )}
                </Stack>
              </CardContent>

              <Box sx={{ p: 2, pt: 0 }}>
                <Stack direction="row" spacing={1}>
                  <Button fullWidth variant="outlined" startIcon={<Edit />} onClick={() => openModal(clinica)}>
                    Editar
                  </Button>
                  <IconButton color="error" onClick={() => handleDelete(clinica.id)}>
                    <Delete />
                  </IconButton>
                </Stack>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredClinicas.length === 0 && (
        <Box textAlign="center" py={8}>
          <Business sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">Nenhuma clínica encontrada</Typography>
        </Box>
      )}

      <Dialog open={showModal} onClose={closeModal} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">{editingClinica ? 'Editar Clínica' : 'Nova Clínica'}</Typography>
              <IconButton onClick={closeModal} size="small"><Close /></IconButton>
            </Box>
          </DialogTitle>

          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Nome da Clínica"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="CNPJ"
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  placeholder="00.000.000/0000-00"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  required
                  placeholder="(11) 3456-7890"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start"><Phone /></InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start"><Email /></InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Endereço"
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start"><LocationOn /></InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="CEP"
                  value={formData.cep}
                  onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                  placeholder="00000-000"
                />
              </Grid>

              <Grid item xs={12} md={9}>
                <TextField
                  fullWidth
                  label="Cidade"
                  value={formData.cidade}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Estado (UF)"
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  inputProps={{ maxLength: 2 }}
                  placeholder="SP"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Horário de Funcionamento"
                  value={formData.horario_funcionamento}
                  onChange={(e) => setFormData({ ...formData, horario_funcionamento: e.target.value })}
                  placeholder="Seg-Sex: 8h-18h"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Especialidades"
                  value={formData.especialidades}
                  onChange={(e) => setFormData({ ...formData, especialidades: e.target.value })}
                  placeholder="Ex: Cirurgia, Dermatologia"
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button onClick={closeModal}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {editingClinica ? 'Salvar' : 'Cadastrar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
CLINICAS_EOF

echo "✅ Modal de Clínicas criado!"
echo ""

# ============================================================
# FINALIZAÇÃO
# ============================================================
echo "============================================"
echo "✅ TODOS OS MODAIS FORAM CRIADOS!"
echo "============================================"
echo ""
echo "📦 Arquivos criados:"
echo "  ✓ src/pages/Tutores/Tutores.tsx"
echo "  ✓ src/pages/Animais/Animais.tsx"
echo "  ✓ src/pages/Veterinarios/Veterinarios.tsx"
echo "  ✓ src/pages/Planos/Planos.tsx"
echo "  ✓ src/pages/Clinicas/Clinicas.tsx"
echo ""
echo "🚀 Executando o frontend..."
npm run dev

echo ""
echo "✨ VetSystem está PRONTO com todos os modais CRUD funcionais!"
