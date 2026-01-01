import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  TextField,
  Stack,
  Divider,
  IconButton,
  Paper,
  Chip,
  Alert,
  InputAdornment,
} from '@mui/material';
import {
  Person,
  Edit,
  Save,
  Cancel,
  PhotoCamera,
  Email,
  Phone,
  Badge,
  LocationOn,
  CalendarMonth,
  CheckCircle,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  role?: string;
  avatar?: string;
  date_joined: string;
}

export default function Perfil() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      // Ajuste a rota conforme seu backend
      const response = await api.get('/auth/profile/');
      setProfile(response.data);
      setFormData({
        first_name: response.data.first_name || '',
        last_name: response.data.last_name || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        address: response.data.address || '',
        city: response.data.city || '',
        state: response.data.state || '',
      });
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      // Dados mockados para demonstração
      const mockProfile: UserProfile = {
        id: 1,
        username: 'admin',
        email: 'admin@vetsystem.com',
        first_name: 'Administrador',
        last_name: 'Sistema',
        phone: '(11) 98765-4321',
        address: 'Rua Exemplo, 123',
        city: 'São Paulo',
        state: 'SP',
        role: 'Veterinário',
        date_joined: '2024-01-15T10:30:00Z',
      };
      setProfile(mockProfile);
      setFormData({
        first_name: mockProfile.first_name,
        last_name: mockProfile.last_name,
        email: mockProfile.email,
        phone: mockProfile.phone || '',
        address: mockProfile.address || '',
        city: mockProfile.city || '',
        state: mockProfile.state || '',
      });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.patch('/auth/profile/', formData);
      toast.success('Perfil atualizado com sucesso!');
      setEditMode(false);
      loadProfile();
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error('Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
      });
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!profile) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Carregando perfil...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Person sx={{ fontSize: 40, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Meu Perfil
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie suas informações pessoais
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '300px 1fr' },
          gap: 3,
        }}
      >
        {/* Sidebar - Avatar e Info Básica */}
        <Card>
          <CardContent>
            <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
              {/* Avatar */}
              <Box position="relative">
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    fontSize: 48,
                    bgcolor: 'primary.main',
                    mb: 2,
                  }}
                >
                  {profile.first_name?.[0] || 'U'}
                </Avatar>
                <IconButton
                  sx={{
                    position: 'absolute',
                    bottom: 16,
                    right: -8,
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' },
                  }}
                  size="small"
                >
                  <PhotoCamera fontSize="small" />
                </IconButton>
              </Box>

              {/* Nome e Username */}
              <Typography variant="h6" fontWeight={700} gutterBottom>
                {profile.first_name} {profile.last_name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                @{profile.username}
              </Typography>

              {/* Role Badge */}
              <Chip
                icon={<Badge />}
                label={profile.role || 'Usuário'}
                color="primary"
                sx={{ mt: 1, fontWeight: 600 }}
              />

              <Divider sx={{ width: '100%', my: 2 }} />

              {/* Info Rápida */}
              <Stack spacing={1.5} width="100%" alignItems="flex-start">
                <Box display="flex" alignItems="center" gap={1}>
                  <Email sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {profile.email}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1}>
                  <CalendarMonth sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    Desde {new Date(profile.date_joined).toLocaleDateString('pt-BR')}
                  </Typography>
                </Box>
              </Stack>

              <Divider sx={{ width: '100%', my: 2 }} />

              {/* Estatísticas */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 2,
                  width: '100%',
                }}
              >
                <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'primary.50', textAlign: 'center' }}>
                  <Typography variant="h6" fontWeight={700} color="primary.main">
                    48
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Consultas
                  </Typography>
                </Paper>
                <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'success.50', textAlign: 'center' }}>
                  <Typography variant="h6" fontWeight={700} color="success.main">
                    32
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Pacientes
                  </Typography>
                </Paper>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Formulário de Edição */}
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" fontWeight={600}>
                Informações Pessoais
              </Typography>
              {!editMode ? (
                <Button
                  variant="contained"
                  startIcon={<Edit />}
                  onClick={() => setEditMode(true)}
                >
                  Editar Perfil
                </Button>
              ) : (
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? 'Salvando...' : 'Salvar'}
                  </Button>
                </Stack>
              )}
            </Box>

            <Divider sx={{ mb: 3 }} />

            {editMode && (
              <Alert severity="info" sx={{ mb: 3 }} icon={<CheckCircle />}>
                Modo de edição ativado. Faça as alterações e clique em Salvar.
              </Alert>
            )}

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                gap: 3,
              }}
            >
              {/* Nome */}
              <TextField
                label="Nome"
                value={formData.first_name}
                onChange={(e) => handleChange('first_name', e.target.value)}
                disabled={!editMode}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Sobrenome */}
              <TextField
                label="Sobrenome"
                value={formData.last_name}
                onChange={(e) => handleChange('last_name', e.target.value)}
                disabled={!editMode}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Email */}
              <TextField
                label="E-mail"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                disabled={!editMode}
                fullWidth
                type="email"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Telefone */}
              <TextField
                label="Telefone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                disabled={!editMode}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Endereço */}
              <TextField
                label="Endereço"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                disabled={!editMode}
                fullWidth
                sx={{ gridColumn: { sm: 'span 2' } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Cidade */}
              <TextField
                label="Cidade"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                disabled={!editMode}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Estado */}
              <TextField
                label="Estado"
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
                disabled={!editMode}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Seção de Segurança */}
            <Typography variant="h6" fontWeight={600} mb={2}>
              Segurança
            </Typography>
            <Button variant="outlined" color="warning">
              Alterar Senha
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
