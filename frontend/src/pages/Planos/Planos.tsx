import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
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
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  HealthAndSafety,
  CheckCircle,
  AttachMoney,
  Schedule,
  Star,
  LocalOffer,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';

interface Plano {
  id: number;
  name: string;
  description: string;
  price: number;
  duration_months: number;
  benefits: string[];
  is_active: boolean;
  popular?: boolean;
}

const PLANOS_MOCK: Plano[] = [
  {
    id: 1,
    name: 'Básico',
    description: 'Ideal para pets saudáveis',
    price: 79.90,
    duration_months: 12,
    benefits: ['2 consultas por ano', 'Vacinas básicas', 'Desconto de 10% em exames'],
    is_active: true,
  },
  {
    id: 2,
    name: 'Plus',
    description: 'Proteção completa para seu pet',
    price: 149.90,
    duration_months: 12,
    benefits: ['4 consultas por ano', 'Todas as vacinas', 'Desconto de 20% em exames', 'Emergências 24h'],
    is_active: true,
    popular: true,
  },
  {
    id: 3,
    name: 'Premium',
    description: 'Cuidado total e exclusivo',
    price: 249.90,
    duration_months: 12,
    benefits: ['Consultas ilimitadas', 'Todas as vacinas', 'Exames com 30% de desconto', 'Emergências 24h', 'Pet sitter'],
    is_active: true,
  },
];

const Planos: React.FC = () => {
  const [planos, setPlanos] = useState<Plano[]>(PLANOS_MOCK);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPlano, setEditingPlano] = useState<Plano | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration_months: '',
    benefits: '',
  });

  useEffect(() => {
    fetchPlanos();
  }, []);

  const fetchPlanos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/planos/');
      const data = response.data.results || response.data;
      
      // Validar se os dados têm a estrutura correta
      if (Array.isArray(data) && data.length > 0) {
        setPlanos(data);
      } else {
        setPlanos(PLANOS_MOCK);
      }
    } catch (error: any) {
      console.error('Erro ao carregar planos:', error);
      // Sempre usar dados mockados em caso de erro
      setPlanos(PLANOS_MOCK);
      
      if (error.response?.status !== 404) {
        toast.error('Usando dados de demonstração');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (plano?: Plano) => {
    if (plano) {
      setEditingPlano(plano);
      setFormData({
        name: plano.name || '',
        description: plano.description || '',
        price: String(plano.price || 0),
        duration_months: String(plano.duration_months || 12),
        benefits: (plano.benefits || []).join('\n'),
      });
    } else {
      setEditingPlano(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        duration_months: '12',
        benefits: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPlano(null);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        duration_months: parseInt(formData.duration_months) || 12,
        benefits: formData.benefits.split('\n').filter(b => b.trim()),
      };

      if (editingPlano) {
        await api.put(`/planos/${editingPlano.id}/`, payload);
        toast.success('Plano atualizado com sucesso!');
      } else {
        await api.post('/planos/', payload);
        toast.success('Plano cadastrado com sucesso!');
      }
      handleCloseDialog();
      fetchPlanos();
    } catch (error: any) {
      console.error('Erro ao salvar plano:', error);
      toast.error(error.response?.data?.detail || 'Erro ao salvar plano');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Deseja realmente excluir este plano?')) {
      try {
        await api.delete(`/planos/${id}/`);
        toast.success('Plano excluído com sucesso!');
        fetchPlanos();
      } catch (error) {
        toast.error('Erro ao excluir plano');
      }
    }
  };

  const formatPrice = (price: number | undefined | null): string => {
    const validPrice = price || 0;
    return validPrice.toFixed(2);
  };

  if (loading) {
    return (
      <Box>
        <LinearProgress />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ bgcolor: 'info.main', width: 48, height: 48 }}>
              <HealthAndSafety />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight={700}>
                Planos de Saúde
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gerencie os planos oferecidos pela clínica
              </Typography>
            </Box>
          </Stack>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          size="large"
          color="info"
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1.5,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(14, 165, 233, 0.4)',
          }}
        >
          Novo Plano
        </Button>
      </Box>

      {/* Stats Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        <Card sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" fontWeight={700}>
                {planos.length}
              </Typography>
              <Typography variant="body2">Planos Ativos</Typography>
            </Box>
            <HealthAndSafety sx={{ fontSize: 40, opacity: 0.8 }} />
          </Stack>
        </Card>

        <Card sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" fontWeight={700}>
                234
              </Typography>
              <Typography variant="body2">Assinantes</Typography>
            </Box>
            <CheckCircle sx={{ fontSize: 40, opacity: 0.8 }} />
          </Stack>
        </Card>

        <Card sx={{ p: 2, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" fontWeight={700}>
                R$ 32.5k
              </Typography>
              <Typography variant="body2">Receita Mensal</Typography>
            </Box>
            <AttachMoney sx={{ fontSize: 40, opacity: 0.8 }} />
          </Stack>
        </Card>
      </Box>

      {/* Planos Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 3,
        }}
      >
        {planos.map((plano) => {
          // Validações defensivas
          const planoBenefits = plano.benefits || [];
          const planoPrice = plano.price || 0;
          const planoDuration = plano.duration_months || 12;
          
          return (
            <Card
              key={plano.id}
              sx={{
                position: 'relative',
                transition: 'all 0.3s',
                border: plano.popular ? '3px solid' : '1px solid',
                borderColor: plano.popular ? 'primary.main' : 'grey.300',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 6,
                },
              }}
            >
              {plano.popular && (
                <Chip
                  icon={<Star />}
                  label="MAIS POPULAR"
                  color="primary"
                  sx={{
                    position: 'absolute',
                    top: -12,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontWeight: 700,
                  }}
                />
              )}

              <CardContent sx={{ pt: plano.popular ? 4 : 2 }}>
                <Stack spacing={2}>
                  <Box textAlign="center">
                    <Avatar
                      sx={{
                        bgcolor: plano.popular ? 'primary.main' : 'info.light',
                        width: 64,
                        height: 64,
                        mx: 'auto',
                        mb: 2,
                      }}
                    >
                      <HealthAndSafety sx={{ fontSize: 32 }} />
                    </Avatar>

                    <Typography variant="h5" fontWeight={700} gutterBottom>
                      {plano.name}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {plano.description}
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <Stack direction="row" justifyContent="center" alignItems="baseline" spacing={0.5}>
                      <Typography variant="h3" fontWeight={700} color="primary.main">
                        R$ {formatPrice(planoPrice)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        /mês
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center" mt={1}>
                      <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        Contrato de {planoDuration} meses
                      </Typography>
                    </Stack>
                  </Box>

                  <Divider />

                  <List dense>
                    {planoBenefits.map((benefit, index) => (
                      <ListItem key={index} disablePadding>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <CheckCircle sx={{ fontSize: 18, color: 'success.main' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={benefit}
                          primaryTypographyProps={{
                            variant: 'body2',
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Stack>
              </CardContent>

              <Divider />

              <CardActions sx={{ p: 2, justifyContent: 'space-between' }}>
                <Chip
                  label={plano.is_active ? 'Ativo' : 'Inativo'}
                  color={plano.is_active ? 'success' : 'default'}
                  size="small"
                />
                <Stack direction="row" spacing={0.5}>
                  <IconButton size="small" color="primary" onClick={() => handleOpenDialog(plano)}>
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(plano.id)}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Stack>
              </CardActions>
            </Card>
          );
        })}
      </Box>

      {/* Dialog */}
      <Dialog 
  open={openDialog} 
  onClose={handleCloseDialog} 
  maxWidth="sm" 
  fullWidth
  disableEnforceFocus
>
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            {editingPlano ? <Edit /> : <Add />}
            <Typography variant="h6" fontWeight={600}>
              {editingPlano ? 'Editar Plano' : 'Novo Plano'}
            </Typography>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Nome do Plano"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocalOffer />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Descrição"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={2}
            />

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 2,
              }}
            >
              <TextField
                fullWidth
                type="number"
                label="Preço Mensal"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoney />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                type="number"
                label="Duração (meses)"
                value={formData.duration_months}
                onChange={(e) => setFormData({ ...formData, duration_months: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Schedule />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <TextField
              fullWidth
              label="Benefícios (um por linha)"
              value={formData.benefits}
              onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
              multiline
              rows={5}
              helperText="Digite cada benefício em uma linha separada"
            />
          </Stack>
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

export default Planos;

