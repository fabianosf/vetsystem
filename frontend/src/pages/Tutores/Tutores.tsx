import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { usePDF } from '../../hooks/usePDF';
import type { Tutor, PaginatedResponse } from '../../types';
import {
  Box, Card, CardContent, Typography, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Grid, IconButton, InputAdornment,
  Avatar, Stack, Chip, CircularProgress
} from '@mui/material';
import {
  Add, Edit, Delete, Search, Person, Email, Phone, LocationOn,
  Pets, Close, PictureAsPdf
} from '@mui/icons-material';

export default function Tutores() {
  const [tutores, setTutores] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTutor, setEditingTutor] = useState<Tutor | null>(null);
  const toast = useToast();
  const { gerarRelatorioTutores } = usePDF();
  
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
    const loadingToast = toast.loading('Carregando tutores...');
    try {
      const response = await api.get<PaginatedResponse<Tutor>>('/tutores/');
      setTutores(response.data.results || response.data);
      toast.dismiss(loadingToast);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Erro ao carregar tutores');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading(editingTutor ? 'Atualizando tutor...' : 'Cadastrando tutor...');
    
    try {
      if (editingTutor) {
        await api.put(`/tutores/${editingTutor.id}/`, formData);
        toast.dismiss(loadingToast);
        toast.success('✅ Tutor atualizado com sucesso!');
      } else {
        await api.post('/tutores/', formData);
        toast.dismiss(loadingToast);
        toast.success('✅ Tutor cadastrado com sucesso!');
      }
      loadTutores();
      closeModal();
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.detail || '❌ Erro ao salvar tutor');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja realmente excluir este tutor?')) return;
    
    const loadingToast = toast.loading('Excluindo tutor...');
    try {
      await api.delete(`/tutores/${id}/`);
      toast.dismiss(loadingToast);
      toast.success('🗑️ Tutor excluído com sucesso!');
      loadTutores();
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('❌ Erro ao excluir tutor');
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
  };

  const filteredTutores = tutores.filter(tutor =>
    tutor.name.toLowerCase().includes(search.toLowerCase()) ||
    tutor.email.toLowerCase().includes(search.toLowerCase()) ||
    tutor.cpf.includes(search)
  );

  const handleGerarPDF = () => {
    gerarRelatorioTutores(filteredTutores);
  };

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
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<PictureAsPdf />}
            onClick={handleGerarPDF}
            disabled={filteredTutores.length === 0}
          >
            Gerar PDF
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => openModal()}>
            Novo Tutor
          </Button>
        </Stack>
      </Box>

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
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={tutor.id}>
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
              <Grid size={{ xs: 12, md: 6 }}>
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

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="CPF"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  required
                  placeholder="000.000.000-00"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
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

              <Grid size={{ xs: 12, md: 6 }}>
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

              <Grid size={{ xs: 12, md: 8 }}>
                <TextField
                  fullWidth
                  label="Endereço"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="CEP"
                  value={formData.cep}
                  onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                  placeholder="00000-000"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 9 }}>
                <TextField
                  fullWidth
                  label="Cidade"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
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
            <Button type="submit" variant="contained">
              {editingTutor ? 'Salvar' : 'Cadastrar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
