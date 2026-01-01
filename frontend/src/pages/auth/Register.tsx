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
  Stepper,
  Step,
  StepLabel,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  EmailOutlined,
  Pets,
  Person,
  Phone,
  Business,
  CheckCircle,
  ArrowBack,
  ArrowForward,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { motion } from 'framer-motion';


export const Register: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    // Step 1 - Dados Pessoais
    name: '',
    email: '',
    phone: '',
    
    // Step 2 - Clínica
    clinic_name: '',
    cnpj: '',
    
    // Step 3 - Senha
    password: '',
    confirm_password: '',
  });

  const steps = ['Dados Pessoais', 'Dados da Clínica', 'Criar Senha'];


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };


  const handleNext = () => {
    // Validações por step
    if (activeStep === 0) {
      if (!formData.name || !formData.email || !formData.phone) {
        setError('Preencha todos os campos obrigatórios');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Email inválido');
        return;
      }
    }

    if (activeStep === 1) {
      if (!formData.clinic_name || !formData.cnpj) {
        setError('Preencha todos os campos obrigatórios');
        return;
      }
    }

    if (activeStep === 2) {
      if (!formData.password || !formData.confirm_password) {
        setError('Preencha todos os campos de senha');
        return;
      }
      if (formData.password.length < 6) {
        setError('A senha deve ter no mínimo 6 caracteres');
        return;
      }
      if (formData.password !== formData.confirm_password) {
        setError('As senhas não coincidem');
        return;
      }
      // Se chegou aqui, submete o formulário
      handleSubmit();
      return;
    }

    setActiveStep((prev) => prev + 1);
  };


  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setError('');
  };


  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/register/', {
        name: formData.name,
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone,
        clinic_name: formData.clinic_name,
        cnpj: formData.cnpj,
        password: formData.password,
      });

      console.log('✅ Registro bem-sucedido:', response.data);

      toast.success('Cadastro realizado com sucesso!');
      
      // Redireciona para login
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      
    } catch (error: any) {
      console.error('❌ Erro no registro:', error);
      
      const errorMsg = error.response?.data?.detail || 
                       error.response?.data?.email?.[0] ||
                       error.response?.data?.error || 
                       'Erro ao realizar cadastro';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };


  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <TextField
              fullWidth
              required
              label="Nome Completo"
              name="name"
              value={formData.name}
              onChange={handleChange}
              autoFocus
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2.5 }}
            />

            <TextField
              fullWidth
              required
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlined color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2.5 }}
            />

            <TextField
              fullWidth
              required
              label="Telefone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="(00) 00000-0000"
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <TextField
              fullWidth
              required
              label="Nome da Clínica"
              name="clinic_name"
              value={formData.clinic_name}
              onChange={handleChange}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Business color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2.5 }}
            />

            <TextField
              fullWidth
              required
              label="CNPJ"
              name="cnpj"
              value={formData.cnpj}
              onChange={handleChange}
              placeholder="00.000.000/0000-00"
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Business color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <TextField
              fullWidth
              required
              label="Senha"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              helperText="Mínimo de 6 caracteres"
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
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2.5 }}
            />

            <TextField
              fullWidth
              required
              label="Confirmar Senha"
              name="confirm_password"
              type={showPassword ? 'text' : 'password'}
              value={formData.confirm_password}
              onChange={handleChange}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Pets color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </motion.div>
        );

      default:
        return null;
    }
  };


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
          flex: isMobile ? 1 : '0 0 50%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 4,
          background: isMobile ? 'transparent' : '#ffffff',
          position: 'relative',
          zIndex: 2,
          overflowY: 'auto',
        }}
      >
        <Container maxWidth="sm">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Logo */}
            <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                <Avatar
                  sx={{
                    width: 70,
                    height: 70,
                    bgcolor: 'primary.main',
                    mb: 2,
                    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                  }}
                >
                  <Pets sx={{ fontSize: 36 }} />
                </Avatar>
              </motion.div>
              
              <Typography 
                variant="h4" 
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
              {/* Título */}
              <Typography variant="h5" fontWeight={700} mb={1}>
                Criar Nova Conta
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Preencha os dados para começar a usar o VetSystem
              </Typography>


              {/* Stepper */}
              <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>


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


              {/* Conteúdo do Step */}
              <Box sx={{ minHeight: 200 }}>
                {renderStepContent(activeStep)}
              </Box>


              {/* Botões de Navegação */}
              <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleBack}
                  disabled={activeStep === 0 || loading}
                  startIcon={<ArrowBack />}
                >
                  Voltar
                </Button>

                <motion.div style={{ width: '100%' }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleNext}
                    disabled={loading}
                    endIcon={activeStep === 2 ? <CheckCircle /> : <ArrowForward />}
                    sx={{
                      py: 1.8,
                      fontWeight: 600,
                      textTransform: 'none',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                        boxShadow: '0 12px 32px rgba(102, 126, 234, 0.5)',
                      },
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : activeStep === 2 ? (
                      'Criar Conta'
                    ) : (
                      'Próximo'
                    )}
                  </Button>
                </motion.div>
              </Box>


              {/* Divider */}
              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  OU
                </Typography>
              </Divider>


              {/* Link Login */}
              <Box textAlign="center">
                <Typography variant="body2" color="text.secondary">
                  Já tem uma conta?{' '}
                  <Link
                    component="button"
                    type="button"
                    variant="body2"
                    onClick={() => navigate('/login')}
                    underline="hover"
                    sx={{ 
                      fontWeight: 700, 
                      cursor: 'pointer', 
                      color: 'primary.main',
                    }}
                  >
                    Fazer Login
                  </Link>
                </Typography>
              </Box>
            </Paper>


            {/* Footer */}
            <Box textAlign="center" mt={3}>
              <Typography variant="caption" color="text.secondary">
                © 2025 VetSystem. Todos os direitos reservados.
              </Typography>
            </Box>
          </motion.div>
        </Container>
      </Box>


      {/* LADO DIREITO - Ilustração (apenas desktop) */}
      {!isMobile && (
        <Box
          sx={{
            flex: '0 0 50%',
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
          {/* Elementos decorativos */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.1, scale: 1 }}
            transition={{ duration: 1 }}
            style={{
              position: 'absolute',
              top: '15%',
              right: '15%',
              width: 180,
              height: 180,
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
              bottom: '20%',
              left: '10%',
              width: 120,
              height: 120,
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
            <Typography variant="h3" fontWeight={800} gutterBottom>
              Junte-se a nós!
            </Typography>
            <Typography variant="h6" fontWeight={300} mb={5} sx={{ opacity: 0.9 }}>
              Milhares de veterinários já confiam no VetSystem
            </Typography>


            {/* Checklist de Benefícios */}
            <Box sx={{ textAlign: 'left', maxWidth: 400, mx: 'auto' }}>
              {[
                'Gestão completa de pacientes',
                'Diagnóstico com IA',
                'Agenda inteligente',
                'Prontuários digitais',
                'Relatórios automáticos',
                'Suporte 24/7',
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <Box display="flex" alignItems="center" gap={2} mb={2.5}>
                    <CheckCircle sx={{ fontSize: 28 }} />
                    <Typography variant="h6" fontWeight={500}>
                      {benefit}
                    </Typography>
                  </Box>
                </motion.div>
              ))}
            </Box>
          </motion.div>
        </Box>
      )}
    </Box>
  );
};
