import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Link,
  Alert,
  CircularProgress,
  Avatar,
  Stack,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  PersonAddOutlined,
  EmailOutlined,
  LockOutlined,
  PersonOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { motion } from 'framer-motion';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const validateForm = (): boolean => {
    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      await api.post('/auth/register/', {
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        role: 'tutor',
      });

      toast.success('Cadastro realizado! Faça login para continuar.');
      navigate('/login');
      
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 
                       'Erro ao criar conta. Tente novamente.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={10}
            sx={{
              p: 4,
              borderRadius: 3,
              backdropFilter: 'blur(10px)',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
            }}
          >
            {/* Header */}
            <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: 'secondary.main',
                  mb: 2,
                }}
              >
                <PersonAddOutlined fontSize="large" />
              </Avatar>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Criar Conta
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Preencha os dados para se cadastrar
              </Typography>
            </Box>

            {/* Erro */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Formulário */}
            <Box component="form" onSubmit={handleSubmit}>
              {/* Nome e Sobrenome - Stack com direção responsiva */}
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{ mb: 2 }}
              >
                <TextField
                  fullWidth
                  required
                  label="Nome"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutlined color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  required
                  label="Sobrenome"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Stack>

              {/* Email */}
              <TextField
                fullWidth
                required
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlined color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              {/* Senha */}
              <TextField
                fullWidth
                required
                label="Senha"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                helperText="Mínimo 6 caracteres"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        tabIndex={-1}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              {/* Confirmar Senha */}
              <TextField
                fullWidth
                required
                label="Confirmar Senha"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                error={
                  formData.confirmPassword !== '' && 
                  formData.password !== formData.confirmPassword
                }
                helperText={
                  formData.confirmPassword !== '' && 
                  formData.password !== formData.confirmPassword
                    ? 'As senhas não coincidem'
                    : ''
                }
                sx={{ mb: 3 }}
              />

              {/* Botão Cadastrar */}
              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Cadastrar'
                )}
              </Button>
            </Box>

            {/* Link Login */}
            <Box textAlign="center" mt={3}>
              <Typography variant="body2" color="text.secondary">
                Já tem uma conta?{' '}
                <Link
                  component="button"
                  type="button"
                  variant="body2"
                  onClick={() => navigate('/login')}
                  underline="hover"
                  sx={{ 
                    fontWeight: 600, 
                    cursor: 'pointer',
                    color: 'primary.main',
                  }}
                >
                  Faça login
                </Link>
              </Typography>
            </Box>
          </Paper>
        </motion.div>

        {/* Footer */}
        <Box textAlign="center" mt={3}>
          <Typography variant="caption" color="rgba(255, 255, 255, 0.8)">
            © 2025 VetSystem. Todos os direitos reservados.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};
