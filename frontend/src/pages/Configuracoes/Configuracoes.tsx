import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Avatar,
  Divider,
  Stack,
  Switch,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Alert,
  Card,
  CardContent,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Settings,
  Person,
  Lock,
  Notifications,
  Palette,
  Email,
  Phone,
  PhotoCamera,
  Visibility,
  VisibilityOff,
  Save,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';


interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}


const Configuracoes: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Dados do Perfil
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: '',
  });

  // Dados de Senha
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  // Preferências
  const [preferences, setPreferences] = useState({
    dark_mode: false,
    email_notifications: true,
    push_notifications: true,
    sound_notifications: false,
    language: 'pt-BR',
  });


  useEffect(() => {
    loadUserData();
  }, []);


  const loadUserData = () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setProfileData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          avatar: user.avatar || '',
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };


  const handleProfileSave = async () => {
    try {
      setLoading(true);
      await api.put('/auth/profile/', profileData);
      
      // Atualiza localStorage
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        localStorage.setItem('user', JSON.stringify({ ...user, ...profileData }));
      }
      
      toast.success('Perfil atualizado com sucesso!');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };


  const handlePasswordChange = async () => {
    if (!passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password) {
      toast.error('Preencha todos os campos');
      return;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (passwordData.new_password.length < 6) {
      toast.error('A nova senha deve ter no mínimo 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      await api.post('/auth/change-password/', {
        old_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      
      toast.success('Senha alterada com sucesso!');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };


  const handlePreferencesSave = () => {
    try {
      localStorage.setItem('preferences', JSON.stringify(preferences));
      
      // Aplicar dark mode
      if (preferences.dark_mode) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
      
      toast.success('Preferências salvas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar preferências');
    }
  };


  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Avatar sx={{ bgcolor: 'secondary.main', width: 48, height: 48 }}>
          <Settings />
        </Avatar>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Configurações
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie suas preferências e informações pessoais
          </Typography>
        </Box>
      </Box>


      <Paper sx={{ borderRadius: 2 }}>
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
            <Tab icon={<Person />} label="Perfil" iconPosition="start" />
            <Tab icon={<Lock />} label="Senha" iconPosition="start" />
            <Tab icon={<Notifications />} label="Notificações" iconPosition="start" />
            <Tab icon={<Palette />} label="Aparência" iconPosition="start" />
          </Tabs>
        </Box>


        {/* TAB 1 - Perfil */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 3 }}>
            {/* Avatar */}
            <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
              <Box position="relative">
                <Avatar
                  src={profileData.avatar}
                  sx={{ width: 120, height: 120, mb: 2 }}
                >
                  {profileData.name.charAt(0).toUpperCase()}
                </Avatar>
                <IconButton
                  sx={{
                    position: 'absolute',
                    bottom: 10,
                    right: -10,
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' },
                  }}
                  size="small"
                >
                  <PhotoCamera fontSize="small" />
                </IconButton>
              </Box>
              <Typography variant="h6" fontWeight={600}>
                {profileData.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {profileData.email}
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Formulário */}
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Nome Completo"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Telefone"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                variant="contained"
                size="large"
                startIcon={<Save />}
                onClick={handleProfileSave}
                disabled={loading}
                sx={{ alignSelf: 'flex-start' }}
              >
                Salvar Alterações
              </Button>
            </Stack>
          </Box>
        </TabPanel>


        {/* TAB 2 - Senha */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3, maxWidth: 500 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              Sua senha deve ter no mínimo 6 caracteres
            </Alert>

            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Senha Atual"
                type={showPassword ? 'text' : 'password'}
                value={passwordData.current_password}
                onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Nova Senha"
                type={showPassword ? 'text' : 'password'}
                value={passwordData.new_password}
                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Confirmar Nova Senha"
                type={showPassword ? 'text' : 'password'}
                value={passwordData.confirm_password}
                onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                variant="contained"
                size="large"
                startIcon={<Save />}
                onClick={handlePasswordChange}
                disabled={loading}
                sx={{ alignSelf: 'flex-start' }}
              >
                Alterar Senha
              </Button>
            </Stack>
          </Box>
        </TabPanel>


        {/* TAB 3 - Notificações */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Preferências de Notificação
            </Typography>

            <Stack spacing={2}>
              <Card variant="outlined">
                <CardContent>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.email_notifications}
                        onChange={(e) => setPreferences({ ...preferences, email_notifications: e.target.checked })}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1" fontWeight={500}>
                          Notificações por Email
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Receba atualizações importantes por email
                        </Typography>
                      </Box>
                    }
                  />
                </CardContent>
              </Card>

              <Card variant="outlined">
                <CardContent>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.push_notifications}
                        onChange={(e) => setPreferences({ ...preferences, push_notifications: e.target.checked })}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1" fontWeight={500}>
                          Notificações Push
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Receba notificações no navegador
                        </Typography>
                      </Box>
                    }
                  />
                </CardContent>
              </Card>

              <Card variant="outlined">
                <CardContent>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.sound_notifications}
                        onChange={(e) => setPreferences({ ...preferences, sound_notifications: e.target.checked })}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1" fontWeight={500}>
                          Sons de Notificação
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Reproduzir sons para novas notificações
                        </Typography>
                      </Box>
                    }
                  />
                </CardContent>
              </Card>

              <Button
                variant="contained"
                size="large"
                startIcon={<Save />}
                onClick={handlePreferencesSave}
                sx={{ alignSelf: 'flex-start', mt: 2 }}
              >
                Salvar Preferências
              </Button>
            </Stack>
          </Box>
        </TabPanel>


        {/* TAB 4 - Aparência */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Personalização
            </Typography>

            <Stack spacing={2}>
              <Card variant="outlined">
                <CardContent>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.dark_mode}
                        onChange={(e) => setPreferences({ ...preferences, dark_mode: e.target.checked })}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1" fontWeight={500}>
                          Modo Escuro
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Ativar tema escuro para reduzir cansaço visual
                        </Typography>
                      </Box>
                    }
                  />
                </CardContent>
              </Card>

              <Alert severity="info">
                Mais opções de personalização em breve!
              </Alert>

              <Button
                variant="contained"
                size="large"
                startIcon={<Save />}
                onClick={handlePreferencesSave}
                sx={{ alignSelf: 'flex-start', mt: 2 }}
              >
                Salvar Preferências
              </Button>
            </Stack>
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
};


export default Configuracoes;
