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
  Person,
  Phone,
  Email,
  Home,
  People,
  Badge,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';

interface Tutor {
  id: number;
  name: string;
  cpf: string;
  phone: string;
  email: string;
  address: string;
  is_active: boolean;
}

const Tutores: React.FC = () => {
  const [tutores, setTutores] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTutor, setEditingTutor] = useState<Tutor | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    phone: '',
    email: '',
    address: '',
  });

  useEffect(() => {
    fetchTutores();
  }, []);

  const fetchTutores = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tutores/');
      setTutores(response.data.results || response.data || []);
    } catch (error: any) {
      if (error.response?.status !== 404) {
        console.error('Erro ao carregar tutores:', error);
        toast.error('Erro ao carregar tutores');
      }
      setTutores([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (tutor?: Tutor) => {
    if (tutor) {
      setEditingTutor(tutor);
      setFormData({
        name: tutor.name,
        cpf: tutor.cpf,
        phone: tutor.phone,
        email: tutor.email,
        address: tutor.address,
      });
    } else {
      setEditingTutor(null);
      setFormData({
        name: '',
        cpf: '',
        phone: '',
        email: '',
        address: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTutor(null);
  };

  const handleSave = async () => {
    try {
      if (editingTutor) {
        await api.put(`/tutores/${editingTutor.id}/`, formData);
        toast.success('Tutor atualizado com sucesso!');
      } else {
        await api.post('/tutores/', formData);
        toast.success('Tutor cadastrado com sucesso!');
      }
      handleCloseDialog();
      fetchTutores();
    } catch (error: any) {
      console.error('Erro ao salvar tutor:', error);
      toast.error(error.response?.data?.detail || 'Erro ao salvar tutor');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Deseja realmente excluir este tutor?')) {
      try {
        await api.delete(`/tutores/${id}/`);
        toast.success('Tutor excluído com sucesso!');
        fetchTutores();
      } catch (error) {
        toast.error('Erro ao excluir tutor');
      }
    }
  };

  const filteredTutores = tutores.filter(
    (tutor) =>
      tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tutor.cpf.includes(searchTerm) ||
      tutor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ bgcolor: 'secondary.main', width: 48, height: 48 }}>
              <People />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight={700}>
                Tutores
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gerencie os tutores cadastrados no sistema
              </Typography>
            </Box>
          </Stack>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          size="large"
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1.5,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(118, 75, 162, 0.4)',
          }}
        >
          Novo Tutor
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
                {tutores.length}
              </Typography>
              <Typography variant="body2">Total de Tutores</Typography>
            </Box>
            <People sx={{ fontSize: 40, opacity: 0.8 }} />
          </Stack>
        </Card>

        <Card sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" fontWeight={700}>
                {tutores.filter(t => t.is_active).length}
              </Typography>
              <Typography variant="body2">Ativos</Typography>
            </Box>
            <Person sx={{ fontSize: 40, opacity: 0.8 }} />
          </Stack>
        </Card>

        <Card sx={{ p: 2, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" fontWeight={700}>
                {tutores.filter(t => !t.is_active).length}
              </Typography>
              <Typography variant="body2">Inativos</Typography>
            </Box>
            <Person sx={{ fontSize: 40, opacity: 0.8 }} />
          </Stack>
        </Card>
      </Box>

      {/* Search Bar */}
      <Card sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Buscar por nome, CPF ou email..."
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
                    Tutor
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={700}>
                    CPF
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Telefone
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Email
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
              ) : filteredTutores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Person sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography color="text.secondary">
                      Nenhum tutor encontrado
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTutores.map((tutor) => (
                  <TableRow
                    key={tutor.id}
                    hover
                    sx={{
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {tutor.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {tutor.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {tutor.address}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {tutor.cpf}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{tutor.phone}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{tutor.email}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={tutor.is_active ? 'Ativo' : 'Inativo'}
                        color={tutor.is_active ? 'success' : 'default'}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenDialog(tutor)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(tutor.id)}
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
            {editingTutor ? <Edit /> : <Add />}
            <Typography variant="h6" fontWeight={600}>
              {editingTutor ? 'Editar Tutor' : 'Novo Tutor'}
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
                    <Person />
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
                label="CPF"
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
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
            </Box>

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

            <TextField
              fullWidth
              label="Endereço"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              multiline
              rows={2}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Home />
                  </InputAdornment>
                ),
              }}
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

export default Tutores;
