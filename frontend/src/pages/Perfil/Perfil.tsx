import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Box,
  Card,
  Grid,
  Typography,
  TextField,
  Button,
  Avatar,
  Stack,
  Divider,
  IconButton,
  InputAdornment,
  Alert,
  LinearProgress,
  Paper,
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  PhotoCamera,
  Visibility,
  VisibilityOff,
  Email,
  Phone,
  Badge,
  Lock,
} from '@mui/icons-material';
import { useToast } from '../../contexts/ToastContext';

export default function Perfil() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    telefone: '',
    avatar: user?.avatar || '',
  });

  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await api.patch('/auth/me/', formData);
      updateUser(response.data);
      toast.success('Perfil atualizado com sucesso!');
      setEditMode(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (passwordData.new_password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/change-password/', {
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
      });
      toast.success('Senha alterada com sucesso!');
      setPasswordData({
        old_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          avatar: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const getRoleBadge = (role: string) => {
    const config: any = {
      ADMIN: { label: 'Administrador', color: 'secondary' },
      VETERINARIO: { label: 'Veterinário', color: 'primary' },
      TUTOR: { label: 'Tutor', color: 'success' },
    };
    return config[role] || { label: role, color: 'default' };
  };

  const roleConfig = user ? getRoleBadge(user.role) : null;

  if (loading && !editMode) {
    return (
      <Box>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Meu Perfil
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Gerencie suas informações pessoais e configurações
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Card do Perfil - Esquerda */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <Box
              sx={{
                height: 150,
                background: 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)',
                position: 'relative',
              }}
            />
            
            <Box sx={{ p: 3, mt: -8 }}>
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <Avatar
                  src={formData.avatar}
                  sx={{
                    width: 120,
                    height: 120,
                    border: '4px solid white',
                    boxShadow: 3,
                    fontSize: 48,
                    fontWeight: 700,
                    bgcolor: 'primary.main',
                  }}
                >
                  {user?.first_name?.charAt(0).toUpperCase()}
                </Avatar>
                
                {editMode && (
                  <IconButton
                    component="label"
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                    }}
                  >
                    <PhotoCamera />
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                  </IconButton>
                )}
              </Box>

              <Box mt={2}>
                <Typography variant="h5" fontWeight={700}>
                  {user?.first_name} {user?.last_name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {user?.email}
                </Typography>
                
                {roleConfig && (
                  <Box mt={1}>
                    <Button
                      variant="contained"
                      color={roleConfig.color as any}
                      size="small"
                      fullWidth
                      disabled
                      sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                      {roleConfig.label}
                    </Button>
                  </Box>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Estatísticas */}
              <Stack spacing={2}>
                <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                  <Typography variant="caption">Membro desde</Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                  </Typography>
                </Paper>

                <Paper sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
                  <Typography variant="caption">Último acesso</Typography>
                  <Typography variant="h6" fontWeight={700}>
                    Hoje
                  </Typography>
                </Paper>
              </Stack>
            </Box>
          </Card>
        </Grid>

        {/* Informações e Edição - Direita */}
        <Grid size={{ xs: 12, md: 8 }}>
          {/* Card de Informações Pessoais */}
          <Card sx={{ mb: 3 }}>
            <Box sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" fontWeight={700}>
                  Informações Pessoais
                </Typography>
                
                {!editMode ? (
                  <Button
                    startIcon={<Edit />}
                    onClick={() => setEditMode(true)}
                    variant="outlined"
                  >
                    Editar
                  </Button>
                ) : (
                  <Stack direction="row" spacing={1}>
                    <Button
                      startIcon={<Cancel />}
                      onClick={() => {
                        setEditMode(false);
                        setFormData({
                          first_name: user?.first_name || '',
                          last_name: user?.last_name || '',
                          email: user?.email || '',
                          telefone: '',
                          avatar: user?.avatar || '',
                        });
                      }}
                      color="error"
                    >
                      Cancelar
                    </Button>
                    <Button
                      startIcon={<Save />}
                      onClick={handleSave}
                      variant="contained"
                      disabled={loading}
                    >
                      Salvar
                    </Button>
                  </Stack>
                )}
              </Stack>

              {loading && <LinearProgress sx={{ mb: 2 }} />}

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Nome"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    disabled={!editMode || loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Badge />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Sobrenome"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    disabled={!editMode || loading}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="E-mail"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!editMode || loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Telefone"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    disabled={!editMode || loading}
                    placeholder="(00) 00000-0000"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Card>

          {/* Card de Alterar Senha */}
          <Card>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Alterar Senha
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Mantenha sua conta segura com uma senha forte
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Senha Atual"
                    name="old_password"
                    type={showPassword ? 'text' : 'password'}
                    value={passwordData.old_password}
                    onChange={handlePasswordChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Nova Senha"
                    name="new_password"
                    type={showPassword ? 'text' : 'password'}
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Confirmar Nova Senha"
                    name="confirm_password"
                    type={showPassword ? 'text' : 'password'}
                    value={passwordData.confirm_password}
                    onChange={handlePasswordChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  {passwordData.new_password && passwordData.confirm_password && 
                   passwordData.new_password !== passwordData.confirm_password && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      As senhas não coincidem
                    </Alert>
                  )}
                  
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handlePasswordUpdate}
                    disabled={loading || !passwordData.old_password || !passwordData.new_password}
                    sx={{ py: 1.5 }}
                  >
                    Alterar Senha
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
