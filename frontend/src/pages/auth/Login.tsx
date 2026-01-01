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
  Checkbox,
  FormControlLabel,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  EmailOutlined,
  Pets,
  FavoriteBorder,
  LocalHospital,
  Science,
  HealthAndSafety,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
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
      await login(formData.username.trim(), formData.password);

      // Remember Me
      if (rememberMe) {
        localStorage.setItem('remember_username', formData.username);
      } else {
        localStorage.removeItem('remember_username');
      }

      // Redireciona para dashboard
      navigate('/dashboard');
      
    } catch (error: any) {
      console.error('❌ Erro no login:', error);
      const errorMsg = 'Usuário ou senha incorretos';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Carregar username salvo
  React.useEffect(() => {
    const savedUsername = localStorage.getItem('remember_username');
    if (savedUsername) {
      setFormData(prev => ({ ...prev, username: savedUsername }));
      setRememberMe(true);
    }
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        overflow: 'hidden',
        background: isMobile 
          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
          : 'transparent',
      }}
    >
      {/* LADO ESQUERDO - Formulário */}
      <Box
        sx={{
          flex: isMobile ? 1 : '0 0 45%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 4,
          background: isMobile ? 'transparent' : '#ffffff',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <Container maxWidth="sm">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Logo e Título */}
            <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'primary.main',
                    mb: 2,
                    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                  }}
                >
                  <Pets sx={{ fontSize: 40 }} />
                </Avatar>
              </motion.div>
              
              <Typography 
                variant="h3" 
                fontWeight={800} 
                gutterBottom
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                VetSystem
              </Typography>
              <Typography variant="h6" color="text.secondary" fontWeight={300}>
                Sistema de Gestão Veterinária
              </Typography>
            </Box>

            <Paper
              elevation={isMobile ? 10 : 0}
              sx={{
                p: 4,
                borderRadius: 3,
                backgroundColor: isMobile ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
                backdropFilter: isMobile ? 'blur(10px)' : 'none',
              }}
            >
              {/* Título do Form */}
              <Typography variant="h5" fontWeight={700} mb={1}>
                Bem-vindo de volta!
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Entre com suas credenciais para acessar o sistema
              </Typography>

              {/* Erro */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                </motion.div>
              )}

              {/* Formulário */}
              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  required
                  label="Usuário"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  autoComplete="username"
                  autoFocus
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlined color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                    mb: 2.5,
                    '& .MuiOutlinedInput-root': {
                      transition: 'all 0.3s',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
                      },
                      '&.Mui-focused': {
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.25)',
                      },
                    },
                  }}
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
                        <Pets color="action" />
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
                  sx={{ 
                    mb: 1,
                    '& .MuiOutlinedInput-root': {
                      transition: 'all 0.3s',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
                      },
                      '&.Mui-focused': {
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.25)',
                      },
                    },
                  }}
                />

                {/* Remember Me + Esqueci Senha */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        color="primary"
                      />
                    }
                    label={
                      <Typography variant="body2">
                        Lembrar-me
                      </Typography>
                    }
                  />
                  <Link
                    component="button"
                    type="button"
                    variant="body2"
                    onClick={() => toast.info('Funcionalidade em desenvolvimento')}
                    underline="hover"
                    sx={{ 
                      cursor: 'pointer',
                      color: 'primary.main',
                      fontWeight: 600,
                    }}
                  >
                    Esqueceu sua senha?
                  </Link>
                </Box>

                {/* Botão Login */}
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{
                      py: 1.8,
                      fontSize: '1rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                      transition: 'all 0.3s',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                        boxShadow: '0 12px 32px rgba(102, 126, 234, 0.5)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Entrar no Sistema'}
                  </Button>
                </motion.div>
              </Box>

              {/* Divider */}
              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  Credenciais de Teste
                </Typography>
              </Divider>

              {/* Credenciais de exemplo */}
              <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 2 }}>
                <Typography variant="caption" display="block" fontWeight={600} mb={0.5}>
                  👨‍💼 Admin: admin / admin123
                </Typography>
                <Typography variant="caption" display="block" fontWeight={600}>
                  👨‍⚕️ Veterinário: veterinario / vet123
                </Typography>
              </Box>
            </Paper>

            {/* Footer */}
            <Box textAlign="center" mt={4}>
              <Typography variant="caption" color="text.secondary">
                © 2026 VetSystem. Todos os direitos reservados.
              </Typography>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* LADO DIREITO - Ilustração Veterinária (apenas desktop) */}
      {!isMobile && (
        <Box
          sx={{
            flex: '0 0 55%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            p: 6,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Elementos decorativos animados */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.1, scale: 1 }}
            transition={{ duration: 1 }}
            style={{
              position: 'absolute',
              top: '10%',
              right: '10%',
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'white',
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            style={{
              position: 'absolute',
              bottom: '15%',
              left: '15%',
              width: 150,
              height: 150,
              borderRadius: '50%',
              background: 'white',
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            style={{ zIndex: 1, textAlign: 'center' }}
          >
            {/* Ícones Veterinários */}
            <Box display="flex" justifyContent="center" gap={3} mb={4}>
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2, delay: 0 }}
              >
                <Avatar sx={{ width: 80, height: 80, bgcolor: 'rgba(255,255,255,0.2)' }}>
                  <Pets sx={{ fontSize: 40 }} />
                </Avatar>
              </motion.div>
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2, delay: 0.2 }}
              >
                <Avatar sx={{ width: 80, height: 80, bgcolor: 'rgba(255,255,255,0.2)' }}>
                  <LocalHospital sx={{ fontSize: 40 }} />
                </Avatar>
              </motion.div>
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2, delay: 0.4 }}
              >
                <Avatar sx={{ width: 80, height: 80, bgcolor: 'rgba(255,255,255,0.2)' }}>
                  <Science sx={{ fontSize: 40 }} />
                </Avatar>
              </motion.div>
            </Box>

            <Typography variant="h3" fontWeight={800} gutterBottom>
              Cuidando com Amor
            </Typography>
            <Typography variant="h6" fontWeight={300} mb={4} sx={{ opacity: 0.9 }}>
              Tecnologia de ponta para gestão veterinária
            </Typography>

            {/* Features */}
            <Box sx={{ textAlign: 'left', maxWidth: 400, mx: 'auto' }}>
              {[
                { icon: <Pets />, text: 'Gestão completa de pacientes' },
                { icon: <Science />, text: 'Diagnóstico assistido por IA' },
                { icon: <HealthAndSafety />, text: 'Prontuários digitais seguros' },
                { icon: <FavoriteBorder />, text: 'Atendimento humanizado' },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
                      {feature.icon}
                    </Avatar>
                    <Typography variant="h6" fontWeight={500}>
                      {feature.text}
                    </Typography>
                  </Box>
                </motion.div>
              ))}
            </Box>

            <Box mt={5}>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                🐾 Mais de 1.000 clínicas confiam no VetSystem
              </Typography>
            </Box>
          </motion.div>
        </Box>
      )}
    </Box>
  );
};
