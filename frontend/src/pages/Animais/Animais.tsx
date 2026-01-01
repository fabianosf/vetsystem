import React, { useState, useEffect } from 'react';
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
  Avatar,
  Stack,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Search,
  Pets,
  FilterList,
  Clear,
  Person,
  Cake,
  Scale,
  ColorLens,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';
import ImageUpload from '../../components/ImageUpload/ImageUpload';


interface Animal {
  id?: number;
  name: string;
  species: string;
  breed: string;
  birth_date: string;
  weight: string;
  color: string;
  tutor: number | null;
  photo?: string;
  photo_url?: string;
  observations: string;
}


const Animais: React.FC = () => {
  const [animais, setAnimais] = useState<any[]>([]);
  const [tutores, setTutores] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('todos');

  // Dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Form
  const [formData, setFormData] = useState<Animal>({
    name: '',
    species: '',
    breed: '',
    birth_date: '',
    weight: '',
    color: '',
    tutor: null,
    observations: '',
  });


  useEffect(() => {
    fetchAnimais();
    fetchTutores();
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


  const fetchTutores = async () => {
    try {
      const response = await api.get('/tutores/');
      setTutores(response.data.results || response.data || []);
    } catch (error) {
      console.error('Erro ao carregar tutores:', error);
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


  const handleViewDetails = (animal: any) => {
    setSelectedAnimal(animal);
    setOpenDetailsDialog(true);
  };


  const handleEdit = (animal: any) => {
    setSelectedAnimal(animal);
    setFormData({
      name: animal.name || '',
      species: animal.species || '',
      breed: animal.breed || '',
      birth_date: animal.birth_date || '',
      weight: animal.weight || '',
      color: animal.color || '',
      tutor: animal.tutor?.id || animal.tutor || null,
      observations: animal.observations || '',
    });
    setIsEditing(true);
    setOpenDialog(true);
  };


  const handleSave = async () => {
    if (!formData.name || !formData.species || !formData.tutor) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const formDataToSend = new FormData();

      // Adicionar campos do formulário
      formDataToSend.append('name', formData.name);
      formDataToSend.append('species', formData.species);
      formDataToSend.append('tutor', formData.tutor.toString());

      if (formData.breed) formDataToSend.append('breed', formData.breed);
      if (formData.birth_date) formDataToSend.append('birth_date', formData.birth_date);
      if (formData.weight) formDataToSend.append('weight', formData.weight);
      if (formData.color) formDataToSend.append('color', formData.color);
      if (formData.observations) formDataToSend.append('observations', formData.observations);

      // Adicionar foto se houver
      if (selectedFile) {
        formDataToSend.append('photo', selectedFile);
      }

      if (isEditing && selectedAnimal) {
        await api.put(`/animais/${selectedAnimal.id}/`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('Animal atualizado com sucesso!');
      } else {
        await api.post('/animais/', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('Animal cadastrado com sucesso!');
      }

      handleCloseDialog();
      fetchAnimais();
      setSelectedFile(null);
    } catch (error: any) {
      console.error('Erro ao salvar animal:', error);
      toast.error(error.response?.data?.detail || 'Erro ao salvar animal');
    }
  };


  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAnimal(null);
    setIsEditing(false);
    setSelectedFile(null);
    setFormData({
      name: '',
      species: '',
      breed: '',
      birth_date: '',
      weight: '',
      color: '',
      tutor: null,
      observations: '',
    });
  };


  const limparFiltros = () => {
    setSearchTerm('');
    setSpeciesFilter('todos');
  };


  // Aplicar filtros
  const filteredAnimais = animais.filter((animal) => {
    const searchLower = searchTerm.toLowerCase();
    const matchSearch = searchTerm === '' ||
      (animal.name || '').toLowerCase().includes(searchLower) ||
      (animal.tutor?.name || '').toLowerCase().includes(searchLower);

    const matchSpecies = speciesFilter === 'todos' || animal.species === speciesFilter;

    return matchSearch && matchSpecies;
  });


  // Estatísticas
  const stats = {
    total: filteredAnimais.length,
    especies: [...new Set(animais.map(a => a.species))].length,
  };


  // Formatar data
  //const formatDate = (dateString: string) => {
  //  if (!dateString) return '-';
  //  const date = new Date(dateString);
  //  return date.toLocaleDateString('pt-BR');
  //};


  // Calcular idade
  const calculateAge = (birthDate: string) => {
    if (!birthDate) return '-';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age > 0 ? `${age} ano${age > 1 ? 's' : ''}` : 'Menos de 1 ano';
  };


  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: 'secondary.main', width: 48, height: 48 }}>
            <Pets />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight={700}>
              Animais
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gerencie o cadastro de animais
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setIsEditing(false);
            setOpenDialog(true);
          }}
          size="large"
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1.5,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
          }}
        >
          Novo Animal
        </Button>
      </Box>


      {/* Cards de Estatísticas */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total de Animais
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {stats.total}
                </Typography>
              </Box>
              <Pets sx={{ fontSize: 40, color: 'secondary.main', opacity: 0.3 }} />
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Espécies Diferentes
                </Typography>
                <Typography variant="h4" fontWeight={700} color="primary.main">
                  {stats.especies}
                </Typography>
              </Box>
              <FilterList sx={{ fontSize: 40, color: 'primary.main', opacity: 0.3 }} />
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Tutores Ativos
                </Typography>
                <Typography variant="h4" fontWeight={700} color="success.main">
                  {tutores.length}
                </Typography>
              </Box>
              <Person sx={{ fontSize: 40, color: 'success.main', opacity: 0.3 }} />
            </Stack>
          </CardContent>
        </Card>
      </Box>


      {/* Filtros */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
          <FilterList color="primary" />
          <Typography variant="h6" fontWeight={600}>
            Filtros
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            variant="outlined"
            size="small"
            startIcon={<Clear />}
            onClick={limparFiltros}
          >
            Limpar Filtros
          </Button>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 2,
          }}
        >
          {/* Busca */}
          <TextField
            fullWidth
            placeholder="Buscar por nome ou tutor..."
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

          {/* Filtro de Espécie */}
          <FormControl fullWidth>
            <InputLabel>Espécie</InputLabel>
            <Select
              value={speciesFilter}
              onChange={(e) => setSpeciesFilter(e.target.value)}
              label="Espécie"
            >
              <MenuItem value="todos">Todas as Espécies</MenuItem>
              {[...new Set(animais.map(a => a.species))].map((species) => (
                <MenuItem key={species} value={species}>
                  {species}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Card>


      {/* Tabela de Animais */}
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
                    Espécie/Raça
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Tutor
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
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredAnimais.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Pets sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography color="text.secondary">
                      {searchTerm || speciesFilter !== 'todos'
                        ? 'Nenhum animal encontrado com os filtros aplicados'
                        : 'Nenhum animal cadastrado'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAnimais.map((animal) => (
                  <TableRow key={animal.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                          src={animal.photo_url || undefined}
                          sx={{
                            bgcolor: 'secondary.main',
                            width: 48,
                            height: 48,
                          }}
                        >
                          {!animal.photo_url && <Pets />}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {animal.name}
                          </Typography>
                          {animal.color && (
                            <Typography variant="caption" color="text.secondary">
                              {animal.color}
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {animal.species}
                      </Typography>
                      {animal.breed && (
                        <Typography variant="caption" color="text.secondary">
                          {animal.breed}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {animal.tutor?.name || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {calculateAge(animal.birth_date)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {animal.weight ? `${animal.weight} kg` : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="Visualizar">
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => handleViewDetails(animal)}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEdit(animal)}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(animal.id)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>


      {/* Dialog de Cadastro/Edição */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            {isEditing ? <Edit /> : <Add />}
            <Typography variant="h6" fontWeight={600}>
              {isEditing ? 'Editar Animal' : 'Novo Animal'}
            </Typography>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {/* Upload de Foto */}
            <ImageUpload
              currentImage={selectedAnimal?.photo_url || null}
              onImageChange={(file) => setSelectedFile(file)}
              label="Foto do Animal"
              maxSize={5}
            />

            <Divider />

            {/* Nome */}
            <TextField
              fullWidth
              required
              label="Nome"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              InputProps={{
                startAdornment: <Pets sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />

            {/* Espécie e Raça */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                gap: 2,
              }}
            >
              <TextField
                fullWidth
                required
                label="Espécie"
                value={formData.species}
                onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                placeholder="Ex: Cachorro, Gato, Pássaro"
              />

              <TextField
                fullWidth
                label="Raça"
                value={formData.breed}
                onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                placeholder="Ex: Labrador, Persa"
              />
            </Box>

            {/* Tutor */}
            <FormControl fullWidth required>
              <InputLabel>Tutor</InputLabel>
              <Select
                value={formData.tutor || ''}
                onChange={(e) => setFormData({ ...formData, tutor: Number(e.target.value) })}
                label="Tutor"
                startAdornment={<Person sx={{ mr: 1, color: 'action.active' }} />}
              >
                <MenuItem value="">
                  <em>Selecione um tutor</em>
                </MenuItem>
                {tutores.map((tutor) => (
                  <MenuItem key={tutor.id} value={tutor.id}>
                    {tutor.name} - {tutor.email || tutor.phone}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Data de Nascimento, Peso e Cor */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                gap: 2,
              }}
            >
              <TextField
                fullWidth
                type="date"
                label="Data de Nascimento"
                value={formData.birth_date}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: <Cake sx={{ mr: 1, color: 'action.active' }} />,
                }}
              />

              <TextField
                fullWidth
                type="number"
                label="Peso (kg)"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                InputProps={{
                  startAdornment: <Scale sx={{ mr: 1, color: 'action.active' }} />,
                }}
              />

              <TextField
                fullWidth
                label="Cor"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                InputProps={{
                  startAdornment: <ColorLens sx={{ mr: 1, color: 'action.active' }} />,
                }}
              />
            </Box>

            {/* Observações */}
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Observações"
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
              placeholder="Informações adicionais sobre o animal..."
            />
          </Stack>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} variant="outlined">
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleSave}>
            {isEditing ? 'Atualizar' : 'Cadastrar'}
          </Button>
        </DialogActions>
      </Dialog>


      {/* Dialog de Detalhes */}
      <Dialog open={openDetailsDialog} onClose={() => setOpenDetailsDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <Visibility />
            <Typography variant="h6" fontWeight={600}>
              Detalhes do Animal
            </Typography>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent>
          {selectedAnimal && (
            <Stack spacing={3}>
              {/* Foto */}
              {selectedAnimal.photo_url && (
                <Box textAlign="center">
                  <Avatar
                    src={selectedAnimal.photo_url}
                    sx={{
                      width: 150,
                      height: 150,
                      margin: '0 auto',
                      border: '4px solid',
                      borderColor: 'primary.main',
                    }}
                  />
                </Box>
              )}

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Nome
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {selectedAnimal.name}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Espécie
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {selectedAnimal.species}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Raça
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {selectedAnimal.breed || '-'}
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Tutor
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {selectedAnimal.tutor?.name || '-'}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Idade
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {calculateAge(selectedAnimal.birth_date)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Peso
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {selectedAnimal.weight ? `${selectedAnimal.weight} kg` : '-'}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Cor
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {selectedAnimal.color || '-'}
                  </Typography>
                </Box>
              </Box>

              {selectedAnimal.observations && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Observações
                  </Typography>
                  <Typography variant="body1">
                    {selectedAnimal.observations}
                  </Typography>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDetailsDialog(false)} variant="outlined">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};


export default Animais;
