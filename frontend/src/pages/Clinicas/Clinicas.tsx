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
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={clinica.id}>
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
              <Grid size={{ xs: 12, md: 8 }}>
                <TextField
                  fullWidth
                  label="Nome da Clínica"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="CNPJ"
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  placeholder="00.000.000/0000-00"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
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

              <Grid size={{ xs: 12, md: 6 }}>
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

              <Grid size={{ xs: 12, md: 8 }}>
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
                  value={formData.cidade}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  label="Estado (UF)"
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  inputProps={{ maxLength: 2 }}
                  placeholder="SP"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Horário de Funcionamento"
                  value={formData.horario_funcionamento}
                  onChange={(e) => setFormData({ ...formData, horario_funcionamento: e.target.value })}
                  placeholder="Seg-Sex: 8h-18h"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
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
