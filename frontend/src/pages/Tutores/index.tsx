import { useEffect, useState, useCallback } from 'react';
import { api } from '../../services/api';
import { showToast } from '../../utils/toast';
import type { Tutor, PaginatedResponse } from '../../types';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  InputAdornment,
  Stack,
  Chip,
  Avatar,
  Pagination,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  Person,
  Close,
  Phone,
  Email,
  LocationOn,
  Badge as BadgeIcon,
} from '@mui/icons-material';

export default function Tutores() {
  const [tutores, setTutores] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTutor, setEditingTutor] = useState<Tutor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState(''); // Estado local para o input
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Debounced search function
  const debouncedSearch = useCallback(
    ((value: string) => {
      const timeoutId = setTimeout(() => {
        setSearchTerm(value);
        setPage(1);
      }, 500); // 500ms de delay

      return () => clearTimeout(timeoutId);
    }),
    []
  );

  // Trigger search quando searchInput muda
  useEffect(() => {
    const cleanup = debouncedSearch(searchInput);
    return cleanup;
  }, [searchInput, debouncedSearch]);

  useEffect(() => {
    loadTutores();
  }, [page, searchTerm]);

  const loadTutores = async () => {
    try {
      setLoading(true);
      const response = await api.get<PaginatedResponse<Tutor>>('/tutores/', {
        params: { page, search: searchTerm },
      });

      if (response.data.results) {
        setTutores(response.data.results);
        setTotalPages(Math.ceil(response.data.count / 10));
      } else {
        setTutores(response.data as any);
      }
    } catch (error) {
      showToast.error('❌ Erro ao carregar tutores');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Telefone é obrigatório';
    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(formData.cpf)) {
      newErrors.cpf = 'CPF inválido (formato: 000.000.000-00)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast.warning('⚠️ Por favor, corrija os erros no formulário');
      return;
    }

    try {
      if (editingTutor) {
        await showToast.promise(
          api.put(`/tutores/${editingTutor.id}/`, formData),
          {
            pending: 'Atualizando tutor...',
            success: '✅ Tutor atualizado com sucesso!',
            error: '❌ Erro ao atualizar tutor',
          }
        );
      } else {
        await showToast.promise(
          api.post('/tutores/', formData),
          {
            pending: 'Criando tutor...',
            success: '✅ Tutor criado com sucesso!',
            error: '❌ Erro ao criar tutor',
          }
        );
      }

      handleCloseModal();
      loadTutores();
    } catch (error: any) {
      if (error.response?.data) {
        const errorMessages = Object.values(error.response.data).flat().join(', ');
        showToast.error(`❌ Erro: ${errorMessages}`);
      }
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o tutor "${name}"?`)) return;

    try {
      await showToast.promise(api.delete(`/tutores/${id}/`), {
        pending: 'Excluindo tutor...',
        success: '✅ Tutor excluído com sucesso!',
        error: '❌ Erro ao excluir tutor',
      });
      loadTutores();
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpenCreateModal = () => {
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
    setErrors({});
    setShowModal(true);
  };

  const handleOpenEditModal = (tutor: Tutor) => {
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
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
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
    setErrors({});
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return value;
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
    return value;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cpf') formattedValue = formatCPF(value);
    else if (name === 'phone') formattedValue = formatPhone(value);
    else if (name === 'state') formattedValue = value.toUpperCase().slice(0, 2);

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Tutores
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpenCreateModal} size="large">
          Novo Tutor
        </Button>
      </Box>

      {/* Busca com Debounce */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Buscar por nome, email ou CPF..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: searchInput && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSearchInput('');
                      setSearchTerm('');
                      setPage(1);
                    }}
                  >
                    <Close />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {searchInput && searchInput !== searchTerm && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Buscando...
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Loading */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : tutores.length === 0 ? (
        <Card>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Person sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Nenhum tutor encontrado
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                {searchTerm ? 'Tente buscar com outros termos' : 'Comece adicionando um novo tutor'}
              </Typography>
              {!searchTerm && (
                <Button variant="contained" startIcon={<Add />} onClick={handleOpenCreateModal}>
                  Adicionar Primeiro Tutor
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Lista */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
              gap: 3,
            }}
          >
            {tutores.map((tutor) => (
              <Card
                key={tutor.id}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', mr: 2 }}>
                      {tutor.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="h6" fontWeight="bold" noWrap title={tutor.name}>
                        {tutor.name}
                      </Typography>
                      <Chip
                        label={`${tutor.animais_count || 0} ${
                          tutor.animais_count === 1 ? 'animal' : 'animais'
                        }`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  </Box>

                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Email sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary" noWrap title={tutor.email}>
                        {tutor.email}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Phone sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {tutor.phone}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <BadgeIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {tutor.cpf}
                      </Typography>
                    </Box>

                    {(tutor.city || tutor.state) && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocationOn sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {tutor.city}
                          {tutor.city && tutor.state && ' - '}
                          {tutor.state}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </CardContent>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, p: 2, pt: 0 }}>
                  <IconButton color="primary" onClick={() => handleOpenEditModal(tutor)} title="Editar">
                    <Edit />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(tutor.id, tutor.name)} title="Excluir">
                    <Delete />
                  </IconButton>
                </Box>
              </Card>
            ))}
          </Box>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}

      {/* Modal */}
      <Dialog open={showModal} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h5" fontWeight="bold">
                {editingTutor ? 'Editar Tutor' : 'Novo Tutor'}
              </Typography>
              <IconButton onClick={handleCloseModal}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>

          <DialogContent dividers>
            <Stack spacing={3}>
              <TextField
                fullWidth
                required
                label="Nome Completo"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person />
                    </InputAdornment>
                  ),
                }}
              />

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                <TextField
                  fullWidth
                  required
                  type="email"
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
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
                  required
                  label="Telefone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  error={!!errors.phone}
                  helperText={errors.phone || '(00) 00000-0000'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                <TextField
                  fullWidth
                  required
                  label="CPF"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleChange}
                  error={!!errors.cpf}
                  helperText={errors.cpf || '000.000.000-00'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeIcon />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="CEP"
                  name="cep"
                  value={formData.cep}
                  onChange={handleChange}
                  placeholder="00000-000"
                />
              </Box>

              <TextField
                fullWidth
                label="Endereço"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Rua, número, bairro"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn />
                    </InputAdornment>
                  ),
                }}
              />

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
                <TextField
                  fullWidth
                  label="Cidade"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                />

                <TextField
                  fullWidth
                  label="Estado"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="UF"
                  inputProps={{ maxLength: 2 }}
                />
              </Box>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={handleCloseModal} size="large">
              Cancelar
            </Button>
            <Button type="submit" variant="contained" size="large">
              {editingTutor ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
