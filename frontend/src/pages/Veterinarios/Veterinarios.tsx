import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import type { Veterinario, PaginatedResponse } from '../../types';
import {
  Box, Card, CardContent, Typography, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Grid, IconButton, InputAdornment,
  Avatar, Stack, Chip, CircularProgress, MenuItem
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
  const toast = useToast();
  
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
    const loadingToast = toast.loading('Carregando veterinários...');
    try {
      const response = await api.get<PaginatedResponse<Veterinario>>('/veterinarios/');
      setVeterinarios(response.data.results || response.data);
      toast.dismiss(loadingToast);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('❌ Erro ao carregar veterinários');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading(editingVet ? 'Atualizando veterinário...' : 'Cadastrando veterinário...');
    
    try {
      if (editingVet) {
        await api.put(`/veterinarios/${editingVet.id}/`, formData);
        toast.dismiss(loadingToast);
        toast.success('✅ Veterinário atualizado com sucesso!');
      } else {
        await api.post('/veterinarios/', formData);
        toast.dismiss(loadingToast);
        toast.success('👨‍⚕️ Veterinário cadastrado com sucesso!');
      }
      loadVeterinarios();
      closeModal();
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.detail || '❌ Erro ao salvar veterinário');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja realmente excluir este veterinário?')) return;
    
    const loadingToast = toast.loading('Excluindo veterinário...');
    try {
      await api.delete(`/veterinarios/${id}/`);
      toast.dismiss(loadingToast);
      toast.success('🗑️ Veterinário excluído com sucesso!');
      loadVeterinarios();
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('❌ Erro ao excluir veterinário');
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
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={vet.id}>
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
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Nome Completo"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="CRMV"
                  value={formData.crmv}
                  onChange={(e) => setFormData({ ...formData, crmv: e.target.value })}
                  required
                  placeholder="12345-SP"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
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

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
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
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
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
            <Button type="submit" variant="contained">
              {editingVet ? 'Salvar' : 'Cadastrar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
