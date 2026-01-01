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
  LocalHospital,
  Phone,
  Email,
  LocationOn,
  Business,
  CheckCircle,  
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';


interface Clinica {
  id: number;
  name: string;
  cnpj: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  is_active: boolean;
  created_at?: string;
}


const Clinicas: React.FC = () => {
  const [clinicas, setClinicas] = useState<Clinica[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingClinica, setEditingClinica] = useState<Clinica | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    cnpj: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
  });


  useEffect(() => {
    fetchClinicas();
  }, []);


  const fetchClinicas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/clinicas/');
      setClinicas(response.data.results || response.data || []);
    } catch (error: any) {
      if (error.response?.status !== 404) {
        console.error('Erro ao carregar clínicas:', error);
        toast.error('Erro ao carregar clínicas');
      }
      setClinicas([]);
    } finally {
      setLoading(false);
    }
  };


  const handleOpenDialog = (clinica?: Clinica) => {
    if (clinica) {
      setEditingClinica(clinica);
      setFormData({
        name: clinica.name,
        cnpj: clinica.cnpj,
        phone: clinica.phone,
        email: clinica.email,
        address: clinica.address,
        city: clinica.city,
        state: clinica.state,
      });
    } else {
      setEditingClinica(null);
      setFormData({
        name: '',
        cnpj: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        state: '',
      });
    }
    setOpenDialog(true);
  };


  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingClinica(null);
  };


  const handleSave = async () => {
    try {
      if (editingClinica) {
        await api.put(`/clinicas/${editingClinica.id}/`, formData);
        toast.success('Clínica atualizada com sucesso!');
      } else {
        await api.post('/clinicas/', formData);
        toast.success('Clínica cadastrada com sucesso!');
      }
      handleCloseDialog();
      fetchClinicas();
    } catch (error: any) {
      console.error('Erro ao salvar clínica:', error);
      toast.error(error.response?.data?.detail || 'Erro ao salvar clínica');
    }
  };


  const handleDelete = async (id: number) => {
    if (window.confirm('Deseja realmente excluir esta clínica?')) {
      try {
        await api.delete(`/clinicas/${id}/`);
        toast.success('Clínica excluída com sucesso!');
        fetchClinicas();
      } catch (error) {
        toast.error('Erro ao excluir clínica');
      }
    }
  };


  // ✅ CORRIGIDO: Proteção contra campos undefined
  const filteredClinicas = clinicas.filter(
    (clinica) =>
      (clinica.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (clinica.cnpj || '').includes(searchTerm) ||
      (clinica.city || '').toLowerCase().includes(searchTerm.toLowerCase())
  );


  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ bgcolor: 'success.main', width: 48, height: 48 }}>
              <LocalHospital />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight={700}>
                Clínicas
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gerencie as unidades da rede
              </Typography>
            </Box>
          </Stack>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          size="large"
          color="success"
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1.5,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
          }}
        >
          Nova Clínica
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
                {clinicas.length}
              </Typography>
              <Typography variant="body2">Total de Clínicas</Typography>
            </Box>
            <Business sx={{ fontSize: 40, opacity: 0.8 }} />
          </Stack>
        </Card>


        <Card sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" fontWeight={700}>
                {clinicas.filter(c => c.is_active).length}
              </Typography>
              <Typography variant="body2">Ativas</Typography>
            </Box>
            <CheckCircle sx={{ fontSize: 40, opacity: 0.8 }} />
          </Stack>
        </Card>


        <Card sx={{ p: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" fontWeight={700}>
                {new Set(clinicas.map(c => c.city).filter(Boolean)).size}
              </Typography>
              <Typography variant="body2">Cidades</Typography>
            </Box>
            <LocationOn sx={{ fontSize: 40, opacity: 0.8 }} />
          </Stack>
        </Card>
      </Box>


      {/* Search Bar */}
      <Card sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Buscar por nome, CNPJ ou cidade..."
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
                    Clínica
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={700}>
                    CNPJ
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Localização
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Contato
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
              ) : filteredClinicas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <LocalHospital sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography color="text.secondary">
                      Nenhuma clínica encontrada
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredClinicas.map((clinica) => (
                  <TableRow
                    key={clinica.id}
                    hover
                    sx={{
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: 'success.main' }}>
                          <LocalHospital />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {clinica.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {clinica.address}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {clinica.cnpj}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {clinica.city} - {clinica.state}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" display="block">
                        <Phone sx={{ fontSize: 12, verticalAlign: 'middle', mr: 0.5 }} />
                        {clinica.phone}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        <Email sx={{ fontSize: 12, verticalAlign: 'middle', mr: 0.5 }} />
                        {clinica.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={clinica.is_active ? 'Ativa' : 'Inativa'}
                        color={clinica.is_active ? 'success' : 'default'}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenDialog(clinica)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(clinica.id)}
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
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            {editingClinica ? <Edit /> : <Add />}
            <Typography variant="h6" fontWeight={600}>
              {editingClinica ? 'Editar Clínica' : 'Nova Clínica'}
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
              label="Nome da Clínica"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              sx={{ gridColumn: { sm: 'span 2' } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Business />
                  </InputAdornment>
                ),
              }}
            />


            <TextField
              fullWidth
              label="CNPJ"
              value={formData.cnpj}
              onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
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


            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              sx={{ gridColumn: { sm: 'span 2' } }}
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
              sx={{ gridColumn: { sm: 'span 2' } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOn />
                  </InputAdornment>
                ),
              }}
            />


            <TextField
              fullWidth
              label="Cidade"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />


            <TextField
              fullWidth
              label="Estado (UF)"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              inputProps={{ maxLength: 2, style: { textTransform: 'uppercase' } }}
            />
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


export default Clinicas;
