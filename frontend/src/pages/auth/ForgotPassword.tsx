import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  EmailOutlined,
  VpnKeyOutlined,
  LockResetOutlined,
  Visibility,
  VisibilityOff,
  ArrowBack,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { motion } from 'framer-motion';

const steps = ['Email', 'Código', 'Nova Senha'];

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    token: '',
    new_password: '',
    confirm_password: '',
  });

  // Etapa 1: Solicitar código
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/password-reset/request/', {
        email: formData.email.toLowerCase().trim(),
      });

      toast.success(response.data.message);
      
      // Em modo DEBUG, mostra o token
      if (response.data.token) {
        toast.info(`Código (DEBUG): ${response.data.token}`);
      }
      
      setActiveStep(1);
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Erro ao enviar código';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Etapa 2: Verificar código
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/password-reset/verify/', {
        email: formData.email.toLowerCase().trim(),
        token: formData.token.trim(),
      });

      toast.success('Código válido!');
      setActiveStep(2);
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Código inválido';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Etapa 3: Resetar senha
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.new_password !== formData.confirm_password) {
      setError('As senhas não coincidem');
      return;
    }

    if (formData.new_password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/password-reset/confirm/', {
        email: formData.email.toLowerCase().trim(),
        token: formData.token.trim(),
        new_password: formData.new_password,
      });

      toast.success(response.data.message);
      navigate('/login');
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Erro ao resetar senha';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
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
            <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: 'warning.main',
                  mb: 2,
                }}
              >
                <LockResetOutlined fontSize="large" />
              </Avatar>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Recuperar Senha
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Siga os passos para redefinir sua senha
              </Typography>
            </Box>

            {/* Stepper */}
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Etapa 1: Email */}
            {activeStep === 0 && (
              <Box component="form" onSubmit={handleRequestCode}>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Digite seu email cadastrado para receber o código de recuperação
                </Typography>
                <TextField
                  fullWidth
                  required
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  autoFocus
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlined color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 3 }}
                />
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ mb: 2 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Enviar Código'}
                </Button>
              </Box>
            )}

            {/* Etapa 2: Código */}
            {activeStep === 1 && (
              <Box component="form" onSubmit={handleVerifyCode}>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Digite o código de 6 dígitos enviado para <strong>{formData.email}</strong>
                </Typography>
                <TextField
                  fullWidth
                  required
                  label="Código de Verificação"
                  name="token"
                  value={formData.token}
                  onChange={handleChange}
                  autoFocus
                  disabled={loading}
                  inputProps={{ maxLength: 6 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <VpnKeyOutlined color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 3 }}
                />
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ mb: 2 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Verificar Código'}
                </Button>
                <Button
                  fullWidth
                  variant="text"
                  onClick={() => setActiveStep(0)}
                >
                  Voltar
                </Button>
              </Box>
            )}

            {/* Etapa 3: Nova Senha */}
            {activeStep === 2 && (
              <Box component="form" onSubmit={handleResetPassword}>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Digite sua nova senha
                </Typography>
                <TextField
                  fullWidth
                  required
                  label="Nova Senha"
                  name="new_password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.new_password}
                  onChange={handleChange}
                  autoFocus
                  disabled={loading}
                  helperText="Mínimo 6 caracteres"
                  InputProps={{
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
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  required
                  label="Confirmar Nova Senha"
                  name="confirm_password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirm_password}
                  onChange={handleChange}
                  disabled={loading}
                  error={formData.confirm_password !== '' && formData.new_password !== formData.confirm_password}
                  sx={{ mb: 3 }}
                />
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ mb: 2 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Redefinir Senha'}
                </Button>
              </Box>
            )}

            {/* Botão Voltar ao Login */}
            <Box textAlign="center" mt={2}>
              <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate('/login')}
                sx={{ textTransform: 'none' }}
              >
                Voltar ao Login
              </Button>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};
