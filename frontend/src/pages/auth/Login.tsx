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
  Divider,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  LockOutlined,
  EmailOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { motion } from 'framer-motion';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login/', {
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
      });

      console.log('✅ Login bem-sucedido:', response.data);

      // Salva tokens (com underscore para compatibilidade com api.ts)
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      
      // Salva dados do usuário
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      toast.success('Login realizado com sucesso!');
      
      // Redireciona para dashboard
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 500);
      
    } catch (error: any) {
      console.error('❌ Erro no login:', error);
      
      const errorMsg = error.response?.data?.detail || 
                       error.response?.data?.error || 
                       'Email ou senha incorretos';
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
            {/* Logo/Avatar */}
            <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: 'primary.main',
                  mb: 2,
                }}
              >
                <LockOutlined fontSize="large" />
              </Avatar>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                VetSystem
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Bem-vindo de volta! Faça login para continuar
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
              <TextField
                fullWidth
                required
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                autoFocus
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

              <TextField
                fullWidth
                required
                label="Senha"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                disabled={loading}
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
                sx={{ mb: 1 }}
              />

              {/* Link Esqueci Senha */}
              <Box display="flex" justifyContent="flex-end" mb={3}>
                <Link
                  component="button"
                  type="button"
                  variant="body2"
                  onClick={() => navigate('/forgot-password')}
                  underline="hover"
                  sx={{ cursor: 'pointer' }}
                >
                  Esqueceu sua senha?
                </Link>
              </Box>

              {/* Botão Login */}
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
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Entrar'}
              </Button>
            </Box>

            {/* Divider */}
            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                OU
              </Typography>
            </Divider>

            {/* Link Cadastro */}
            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary">
                Não tem uma conta?{' '}
                <Link
                  component="button"
                  type="button"
                  variant="body2"
                  onClick={() => navigate('/register')}
                  underline="hover"
                  sx={{ fontWeight: 600, cursor: 'pointer', color: 'primary.main' }}
                >
                  Cadastre-se
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
