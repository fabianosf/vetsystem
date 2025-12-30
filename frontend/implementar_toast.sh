#!/bin/bash
# Script para implementar Sistema de Notificações Toast

cd ~/Desktop/vetsystem/frontend

echo "🔔 Instalando react-hot-toast..."
npm install react-hot-toast

echo ""
echo "📝 Criando sistema de notificações..."

# ============================================================
# 1. CRIAR CONTEXTO DE NOTIFICAÇÕES
# ============================================================
cat > src/contexts/ToastContext.tsx << 'EOF'
import { createContext, useContext, ReactNode } from 'react';
import toast, { Toaster } from 'react-hot-toast';

interface ToastContextData {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
  loading: (message: string) => string;
  dismiss: (toastId: string) => void;
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser usado dentro de ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const success = (message: string) => {
    toast.success(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#10B981',
        color: '#fff',
        fontWeight: 500,
        padding: '16px',
        borderRadius: '8px',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#10B981',
      },
    });
  };

  const error = (message: string) => {
    toast.error(message, {
      duration: 5000,
      position: 'top-right',
      style: {
        background: '#EF4444',
        color: '#fff',
        fontWeight: 500,
        padding: '16px',
        borderRadius: '8px',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#EF4444',
      },
    });
  };

  const info = (message: string) => {
    toast(message, {
      duration: 4000,
      position: 'top-right',
      icon: 'ℹ️',
      style: {
        background: '#3B82F6',
        color: '#fff',
        fontWeight: 500,
        padding: '16px',
        borderRadius: '8px',
      },
    });
  };

  const warning = (message: string) => {
    toast(message, {
      duration: 4000,
      position: 'top-right',
      icon: '⚠️',
      style: {
        background: '#F59E0B',
        color: '#fff',
        fontWeight: 500,
        padding: '16px',
        borderRadius: '8px',
      },
    });
  };

  const loading = (message: string) => {
    return toast.loading(message, {
      position: 'top-right',
      style: {
        background: '#6366F1',
        color: '#fff',
        fontWeight: 500,
        padding: '16px',
        borderRadius: '8px',
      },
    });
  };

  const dismiss = (toastId: string) => {
    toast.dismiss(toastId);
  };

  return (
    <ToastContext.Provider value={{ success, error, info, warning, loading, dismiss }}>
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      {children}
    </ToastContext.Provider>
  );
}
EOF

echo "✅ Contexto de Toast criado!"

# ============================================================
# 2. ATUALIZAR App.tsx COM TOAST PROVIDER
# ============================================================
cat > src/App.tsx << 'EOF'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import Tutores from './pages/Tutores/Tutores';
import Animais from './pages/Animais/Animais';
import Veterinarios from './pages/Veterinarios/Veterinarios';
import Planos from './pages/Planos/Planos';
import Clinicas from './pages/Clinicas/Clinicas';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Rotas Públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Rotas Protegidas */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/tutores"
              element={
                <PrivateRoute>
                  <Layout>
                    <Tutores />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/animais"
              element={
                <PrivateRoute>
                  <Layout>
                    <Animais />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/veterinarios"
              element={
                <PrivateRoute>
                  <Layout>
                    <Veterinarios />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/planos"
              element={
                <PrivateRoute>
                  <Layout>
                    <Planos />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/clinicas"
              element={
                <PrivateRoute>
                  <Layout>
                    <Clinicas />
                  </Layout>
                </PrivateRoute>
              }
            />

            {/* Redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
EOF

echo "✅ App.tsx atualizado com ToastProvider!"

# ============================================================
# 3. ATUALIZAR PÁGINA DE TUTORES COM TOAST
# ============================================================
cat > src/pages/Tutores/Tutores.tsx << 'EOF'
import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import type { Tutor, PaginatedResponse } from '../../types';
import {
  Box, Card, CardContent, Typography, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Grid, IconButton, InputAdornment,
  Avatar, Stack, Chip, CircularProgress
} from '@mui/material';
import {
  Add, Edit, Delete, Search, Person, Email, Phone, LocationOn,
  Pets, Close
} from '@mui/icons-material';

export default function Tutores() {
  const [tutores, setTutores] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTutor, setEditingTutor] = useState<Tutor | null>(null);
  const toast = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    address: '',
    city: '',
    state: '',
    cep: '',
  });

  useEffect(() => {
    loadTutores();
  }, []);

  const loadTutores = async () => {
    const loadingToast = toast.loading('Carregando tutores...');
    try {
      const response = await api.get<PaginatedResponse<Tutor>>('/tutores/');
      setTutores(response.data.results || response.data);
      toast.dismiss(loadingToast);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Erro ao carregar tutores');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading(editingTutor ? 'Atualizando tutor...' : 'Cadastrando tutor...');
    
    try {
      if (editingTutor) {
        await api.put(`/tutores/${editingTutor.id}/`, formData);
        toast.dismiss(loadingToast);
        toast.success('✅ Tutor atualizado com sucesso!');
      } else {
        await api.post('/tutores/', formData);
        toast.dismiss(loadingToast);
        toast.success('✅ Tutor cadastrado com sucesso!');
      }
      loadTutores();
      closeModal();
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.detail || '❌ Erro ao salvar tutor');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja realmente excluir este tutor?')) return;
    
    const loadingToast = toast.loading('Excluindo tutor...');
    try {
      await api.delete(`/tutores/${id}/`);
      toast.dismiss(loadingToast);
      toast.success('🗑️ Tutor excluído com sucesso!');
      loadTutores();
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('❌ Erro ao excluir tutor');
    }
  };

  const openModal = (tutor?: Tutor) => {
    if (tutor) {
      setEditingTutor(tutor);
      setFormData({
        name: tutor.name,
        email: tutor.email,
        phone: tutor.phone,
        cpf: tutor.cpf,
        address: tutor.address || '',
        city: tutor.city || '',
        state: tutor.state || '',
        cep: tutor.cep || '',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTutor(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      cpf: '',
      address: '',
      city: '',
      state: '',
      cep: '',
    });
  };

  const filteredTutores = tutores.filter(tutor =>
    tutor.name.toLowerCase().includes(search.toLowerCase()) ||
    tutor.email.toLowerCase().includes(search.toLowerCase()) ||
    tutor.cpf.includes(search)
  );

  if (loading && tutores.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>Tutores</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => openModal()}>
          Novo Tutor
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Buscar por nome, email ou CPF..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {filteredTutores.map((tutor) => (
          <Grid item xs={12} sm={6} md={4} key={tutor.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                    {tutor.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>{tutor.name}</Typography>
                    <Chip
                      label={`${tutor.total_animais || 0} animais`}
                      size="small"
                      icon={<Pets fontSize="small" />}
                      color="primary"
                    />
                  </Box>
                </Box>

                <Stack spacing={1}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Email fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">{tutor.email}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Phone fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">{tutor.phone}</Typography>
                  </Box>
                  {tutor.city && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <LocationOn fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {tutor.city}/{tutor.state}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>

              <Box sx={{ p: 2, pt: 0 }}>
                <Stack direction="row" spacing={1}>
                  <Button fullWidth variant="outlined" startIcon={<Edit />} onClick={() => openModal(tutor)}>
                    Editar
                  </Button>
                  <IconButton color="error" onClick={() => handleDelete(tutor.id)}>
                    <Delete />
                  </IconButton>
                </Stack>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredTutores.length === 0 && (
        <Box textAlign="center" py={8}>
          <Person sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">Nenhum tutor encontrado</Typography>
        </Box>
      )}

      <Dialog open={showModal} onClose={closeModal} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">{editingTutor ? 'Editar Tutor' : 'Novo Tutor'}</Typography>
              <IconButton onClick={closeModal} size="small"><Close /></IconButton>
            </Box>
          </DialogTitle>

          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nome Completo"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start"><Person /></InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="CPF"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  required
                  placeholder="000.000.000-00"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start"><Email /></InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Telefone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  placeholder="(11) 98765-4321"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start"><Phone /></InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Endereço"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="CEP"
                  value={formData.cep}
                  onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                  placeholder="00000-000"
                />
              </Grid>

              <Grid item xs={12} md={9}>
                <TextField
                  fullWidth
                  label="Cidade"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Estado (UF)"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  inputProps={{ maxLength: 2 }}
                  placeholder="SP"
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button onClick={closeModal}>Cancelar</Button>
            <Button type="submit" variant="contained">
              {editingTutor ? 'Salvar' : 'Cadastrar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
EOF

echo "✅ Página de Tutores atualizada com Toast!"

# ============================================================
# FINALIZAÇÃO
# ============================================================
echo ""
echo "============================================"
echo "✅ SISTEMA DE NOTIFICAÇÕES IMPLEMENTADO!"
echo "============================================"
echo ""
echo "🎉 Features implementadas:"
echo "  ✓ react-hot-toast instalado"
echo "  ✓ ToastContext criado"
echo "  ✓ 5 tipos de notificações (success, error, info, warning, loading)"
echo "  ✓ Design customizado e profissional"
echo "  ✓ Página de Tutores já usando toast"
echo ""
echo "📝 Próximo passo: Aplicar toast nas outras páginas"
echo ""
echo "🚀 Rodando o servidor..."
npm run dev
