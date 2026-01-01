import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
  InputAdornment,
  CircularProgress,
  Stack,
  Card,
  Divider,
  MenuItem,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  Pets,
  FilterList,
  Visibility,
  Cake,
  MonitorWeight,
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
  weight: number;
  gender: string;
  color: string;
  tutor: number;
  tutor_nome?: string;
  is_active: boolean;
}

const Animais: React.FC = () => {
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('TODOS');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    birth_date: '',
    weight: '',
    gender: '',
    color: '',
    tutor: '',
  });

  useEffect(() => {
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
        weight: String(animal.weight),
        gender: animal.gender,
        color: animal.color,
        tutor: String(animal.tutor),
      });
    } else {
      setEditingAnimal(null);
      setFormData({
        name: '',
        species: '',
        breed: '',
        birth_date: '',
        weight: '',
        gender: '',
        color: '',
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
      if (editingAnimal) {
        await api.put(`/animais/${editingAnimal.id}/`, formData);
        toast.success('Animal atualizado com sucesso!');
      } else {
        await api.post('/animais/', formData);
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

  const calcularIdade = (birthDate: string) => {
    const hoje = new Date();
    const nascimento = new Date(birthDate);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  const getSpeciesIcon = (species: string) => {
    return species === 'Canino' ? '🐕' : species === 'Felino' ? '🐈' : '🐾';
  };

  const filteredAnimais = animais.filter(
    (animal) => {
      const matchesSearch = 
        animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        animal.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
        animal.tutor_nome?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSpecies = speciesFilter === 'TODOS' || animal.species === speciesFilter;
      
      return matchesSearch && matchesSpecies;
    }
  );

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ bgcolor: 'warning.main', width: 48, height: 48 }}>
              <Pets />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight={700}>
                Animais
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gerencie os pacientes cadastrados no sistema
              </Typography>
            </Box>
          </Stack>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          size="large"
          color="warning"
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1.5,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
          }}
        >
          Novo Animal
        </Button>
      </Box>

      {/* Stats Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        <Card sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" fontWeight={700}>
                {animais.length}
              </Typography>
              <Typography variant="body2">Total</Typography>
            </Box>
            <Pets sx={{ fontSize: 40, opacity: 0.8 }} />
          </Stack>
        </Card>

        <Card sx={{ p: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" fontWeight={700}>
                {animais.filter(a => a.species === 'Canino').length}
              </Typography>
              <Typography variant="body2">Caninos</Typography>
            </Box>
            <Typography sx={{ fontSize: 40 }}>🐕</Typography>
          </Stack>
        </Card>

        <Card sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" fontWeight={700}>
                {animais.filter(a => a.species === 'Felino').length}
              </Typography>
              <Typography variant="body2">Felinos</Typography>
            </Box>
            <Typography sx={{ fontSize: 40 }}>🐈</Typography>
          </Stack>
        </Card>

        <Card sx={{ p: 2, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" fontWeight={700}>
                {animais.filter(a => a.is_active).length}
              </Typography>
              <Typography variant="body2">Ativos</Typography>
            </Box>
            <Pets sx={{ fontSize: 40, opacity: 0.8 }} />
          </Stack>
        </Card>
      </Box>

      {/* Filtros */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr auto' },
            gap: 2,
          }}
        >
          <TextField
            fullWidth
            placeholder="Buscar por nome, raça ou tutor..."
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

          <TextField
            select
            label="Espécie"
            value={speciesFilter}
            onChange={(e) => setSpeciesFilter(e.target.value)}
            sx={{ minWidth: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FilterList />
                </InputAdornment>
              ),
            }}
          >
            <MenuItem value="TODOS">Todas</MenuItem>
            <MenuItem value="Canino">Canino</MenuItem>
            <MenuItem value="Felino">Felino</MenuItem>
            <MenuItem value="Outro">Outro</MenuItem>
          </TextField>
        </Box>
      </Card>

      {/* Table */}
      <Card>
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Animal
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Espécie / Raça
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Idade
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Peso
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Tutor
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Status
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle2" fontWeight={700}>
                    Ações
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredAnimais.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Pets sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography color="text.secondary">
                      Nenhum animal encontrado
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAnimais.map((animal) => (
                  <TableRow
                    key={animal.id}
                    hover
                    sx={{
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: 'warning.main' }}>
                          {getSpeciesIcon(animal.species)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {animal.name}
                          </Typography>
                          <Chip
                            icon={animal.gender === 'Macho' ? <Male /> : <Female />}
                            label={animal.gender}
                            size="small"
                            color={animal.gender === 'Macho' ? 'info' : 'secondary'}
                            sx={{ height: 20, fontSize: 10, mt: 0.5 }}
                          />
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {animal.species}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {animal.breed}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Cake sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {calcularIdade(animal.birth_date)} anos
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <MonitorWeight sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">{animal.weight} kg</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{animal.tutor_nome || `Tutor #${animal.tutor}`}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={animal.is_active ? 'Ativo' : 'Inativo'}
                        color={animal.is_active ? 'success' : 'default'}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <IconButton size="small" color="primary">
                          <Visibility fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenDialog(animal)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(animal.id)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth disableEnforceFocus>
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            {editingAnimal ? <Edit /> : <Add />}
            <Typography variant="h6" fontWeight={600}>
              {editingAnimal ? 'Editar Animal' : 'Novo Animal'}
            </Typography>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: 2,
              mt: 2,
            }}
          >
            <TextField
              fullWidth
              label="Nome do Animal"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Pets />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              select
              fullWidth
              label="Espécie"
              value={formData.species}
              onChange={(e) => setFormData({ ...formData, species: e.target.value })}
            >
              <MenuItem value="Canino">Canino</MenuItem>
              <MenuItem value="Felino">Felino</MenuItem>
              <MenuItem value="Outro">Outro</MenuItem>
            </TextField>

            <TextField
              fullWidth
              label="Raça"
              value={formData.breed}
              onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
            />

            <TextField
              fullWidth
              type="date"
              label="Data de Nascimento"
              value={formData.birth_date}
              onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Cake />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              type="number"
              label="Peso (kg)"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MonitorWeight />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              select
              fullWidth
              label="Sexo"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            >
              <MenuItem value="Macho">Macho</MenuItem>
              <MenuItem value="Fêmea">Fêmea</MenuItem>
            </TextField>

            <TextField
              fullWidth
              label="Cor"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            />

            <TextField
              select
              fullWidth
              label="Tutor"
              value={formData.tutor}
              onChange={(e) => setFormData({ ...formData, tutor: e.target.value })}
            >
              <MenuItem value="1">João Silva</MenuItem>
              <MenuItem value="2">Maria Oliveira</MenuItem>
              <MenuItem value="3">Ana Paula</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} variant="outlined">
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleSave}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Animais;
