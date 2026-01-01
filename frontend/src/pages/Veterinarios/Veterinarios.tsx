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
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  MedicalServices,
  Phone,
  Email,
  Badge,
  LocalHospital,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';

interface Veterinario {
  id: number;
  name: string;
  crmv: string;
  specialty: string;
  phone: string;
  email: string;
  is_active: boolean;
}

const Veterinarios: React.FC = () => {
  const [veterinarios, setVeterinarios] = useState<Veterinario[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingVet, setEditingVet] = useState<Veterinario | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    crmv: '',
    specialty: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    fetchVeterinarios();
  }, []);

  const fetchVeterinarios = async () => {
    try {
      setLoading(true);
      const response = await api.get('/veterinarios/');
      setVeterinarios(response.data.results || response.data || []);
    } catch (error: any) {
      if (error.response?.status !== 404) {
        console.error('Erro ao carregar veterinários:', error);
        toast.error('Erro ao carregar veterinários');
      }
      setVeterinarios([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (vet?: Veterinario) => {
    if (vet) {
      setEditingVet(vet);
      setFormData({
        name: vet.name,
        crmv: vet.crmv,
        specialty: vet.specialty,
        phone: vet.phone,
        email: vet.email,
      });
    } else {
      setEditingVet(null);
      setFormData({
        name: '',
        crmv: '',
        specialty: '',
        phone: '',
        email: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingVet(null);
  };

  const handleSave = async () => {
    try {
      if (editingVet) {
        await api.put(`/veterinarios/${editingVet.id}/`, formData);
        toast.success('Veterinário atualizado com sucesso!');
      } else {
        await api.post('/veterinarios/', formData);
        toast.success('Veterinário cadastrado com sucesso!');
      }
      handleCloseDialog();
      fetchVeterinarios();
    } catch (error: any) {
      console.error('Erro ao salvar veterinário:', error);
      toast.error(error.response?.data?.detail || 'Erro ao salvar veterinário');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Deseja realmente excluir este veterinário?')) {
      try {
        await api.delete(`/veterinarios/${id}/`);
        toast.success('Veterinário excluído com sucesso!');
        fetchVeterinarios();
      } catch (error) {
        toast.error('Erro ao excluir veterinário');
      }
    }
  };

  const filteredVeterinarios = veterinarios.filter(
    (vet) =>
      vet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vet.crmv.includes(searchTerm) ||
      vet.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ bgcolor: 'info.main', width: 48, height: 48 }}>
              <LocalHospital />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight={700}>
                Veterinários
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gerencie os veterinários cadastrados no sistema
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
          Novo Veterinário
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
                {veterinarios.length}
              </Typography>
              <Typography variant="body2">Total</Typography>
            </Box>
            <LocalHospital sx={{ fontSize: 40, opacity: 0.8 }} />
          </Stack>
        </Card>

        <Card sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" fontWeight={700}>
                {veterinarios.filter(v => v.is_active).length}
              </Typography>
              <Typography variant="body2">Ativos</Typography>
            </Box>
            <MedicalServices sx={{ fontSize: 40, opacity: 0.8 }} />
          </Stack>
        </Card>

        <Card sx={{ p: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" fontWeight={700}>
                {new Set(veterinarios.map(v => v.specialty)).size}
              </Typography>
              <Typography variant="body2">Especialidades</Typography>
            </Box>
            <Badge sx={{ fontSize: 40, opacity: 0.8 }} />
          </Stack>
        </Card>
      </Box>

      {/* Search Bar */}
      <Card sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Buscar por nome, CRMV ou especialidade..."
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
      </Card>

      {/* Table */}
      <Card>
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Veterinário
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={700}>
                    CRMV
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Especialidade
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Telefone
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
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredVeterinarios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <MedicalServices sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography color="text.secondary">
                      Nenhum veterinário encontrado
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredVeterinarios.map((vet) => (
                  <TableRow
                    key={vet.id}
                    hover
                    sx={{
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: 'secondary.main' }}>
                          {vet.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {vet.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {vet.email}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace" fontWeight={600}>
                        {vet.crmv}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={vet.specialty}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{vet.phone}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={vet.is_active ? 'Ativo' : 'Inativo'}
                        color={vet.is_active ? 'success' : 'default'}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenDialog(vet)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(vet.id)}
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
            {editingVet ? <Edit /> : <Add />}
            <Typography variant="h6" fontWeight={600}>
              {editingVet ? 'Editar Veterinário' : 'Novo Veterinário'}
            </Typography>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Nome Completo"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MedicalServices />
                  </InputAdornment>
                ),
              }}
            />
            
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                gap: 2,
              }}
            >
              <TextField
                fullWidth
                label="CRMV"
                value={formData.crmv}
                onChange={(e) => setFormData({ ...formData, crmv: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Badge />
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField
                fullWidth
                label="Especialidade"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocalHospital />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                gap: 2,
              }}
            >
              <TextField
                fullWidth
                label="Telefone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone />
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
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

export default Veterinarios;
