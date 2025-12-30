import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import type { PlanoSaude, PaginatedResponse } from '../../types';
import {
  Box, Card, CardContent, Typography, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Grid, IconButton, InputAdornment,
  Stack, Chip, Alert, Switch, FormControlLabel
} from '@mui/material';
import {
  Add, Edit, Delete, HealthAndSafety, Close, AttachMoney
} from '@mui/icons-material';


export default function Planos() {
  const [planos, setPlanos] = useState<PlanoSaude[]>([]);
  const [loading, setLoading] = useState(true);
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


  const formatBenefit = (value: number | null | undefined, unlimited: boolean | undefined, unit: string) => {
    if (unlimited === true) return '∞ ilimitado';
    if (value === null || value === undefined || value === 0) return 'Não incluído';
    return `${value} ${unit}`;
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
        consultas_ilimitadas: plano.consultas_ilimitadas ?? false,
        exames_ilimitados: plano.exames_ilimitados ?? false,
        vacinas_ilimitadas: plano.vacinas_ilimitadas ?? false,
        is_active: plano.is_active ?? true,
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


      <Grid container spacing={3}>
        {planos.map((plano) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={plano.id}>
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
                    label={formatBenefit(plano.consultas_mes, plano.consultas_ilimitadas, 'consultas/mês')}
                    size="small"
                    variant="outlined"
                  />
                  <Chip 
                    label={formatBenefit(plano.exames_mes, plano.exames_ilimitados, 'exames/mês')}
                    size="small"
                    variant="outlined"
                  />
                  <Chip 
                    label={formatBenefit(plano.vacinas_ano, plano.vacinas_ilimitadas, 'vacinas/ano')}
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

      {planos.length === 0 && !loading && (
        <Box textAlign="center" py={8}>
          <HealthAndSafety sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Nenhum plano encontrado
          </Typography>
        </Box>
      )}

      {/* MODAL DE CRIAR/EDITAR PLANO */}
      <Dialog open={showModal} onClose={closeModal} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">
                {editingPlano ? 'Editar Plano' : 'Novo Plano'}
              </Typography>
              <IconButton onClick={closeModal} size="small">
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>

          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Nome do Plano"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                  placeholder="Ex: Plano Básico, Plano Premium"
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
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

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Preço Mensal (R$)"
                  type="number"
                  value={formData.preco_mensal}
                  onChange={(e) => setFormData({ ...formData, preco_mensal: e.target.value })}
                  required
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <AttachMoney />
                        </InputAdornment>
                      ),
                    },
                    htmlInput: {
                      step: "0.01"
                    }
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Box display="flex" alignItems="center" height="100%">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      />
                    }
                    label="Plano Ativo"
                  />
                </Box>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                  Benefícios do Plano
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Consultas por Mês"
                  type="number"
                  value={formData.consultas_mes}
                  onChange={(e) => setFormData({ ...formData, consultas_mes: e.target.value })}
                  disabled={formData.consultas_ilimitadas}
                  slotProps={{
                    htmlInput: {
                      min: 0
                    }
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Box display="flex" alignItems="center" height="100%">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.consultas_ilimitadas}
                        onChange={(e) => setFormData({ ...formData, consultas_ilimitadas: e.target.checked })}
                      />
                    }
                    label="Consultas Ilimitadas"
                  />
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Exames por Mês"
                  type="number"
                  value={formData.exames_mes}
                  onChange={(e) => setFormData({ ...formData, exames_mes: e.target.value })}
                  disabled={formData.exames_ilimitados}
                  slotProps={{
                    htmlInput: {
                      min: 0
                    }
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Box display="flex" alignItems="center" height="100%">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.exames_ilimitados}
                        onChange={(e) => setFormData({ ...formData, exames_ilimitados: e.target.checked })}
                      />
                    }
                    label="Exames Ilimitados"
                  />
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Vacinas por Ano"
                  type="number"
                  value={formData.vacinas_ano}
                  onChange={(e) => setFormData({ ...formData, vacinas_ano: e.target.value })}
                  disabled={formData.vacinas_ilimitadas}
                  slotProps={{
                    htmlInput: {
                      min: 0
                    }
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Box display="flex" alignItems="center" height="100%">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.vacinas_ilimitadas}
                        onChange={(e) => setFormData({ ...formData, vacinas_ilimitadas: e.target.checked })}
                      />
                    }
                    label="Vacinas Ilimitadas"
                  />
                </Box>
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
