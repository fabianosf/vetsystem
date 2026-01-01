import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Stack,
  Avatar,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Category,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import financeiroApi, { CategoriaFinanceira } from '../../services/financeiroApi';

const GerenciarCategorias: React.FC = () => {
  const [categorias, setCategorias] = useState<CategoriaFinanceira[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<CategoriaFinanceira | null>(null);
  
  const [formData, setFormData] = useState<{
    nome: string;
    tipo: 'receita' | 'despesa';
    descricao: string;
    ativo: boolean;
  }>({
    nome: '',
    tipo: 'receita',
    descricao: '',
    ativo: true,
  });

  useEffect(() => {
    loadCategorias();
  }, []);

  const loadCategorias = async () => {
    try {
      const response = await financeiroApi.getCategorias();
      setCategorias(response.data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      toast.error('Erro ao carregar categorias');
    }
  };

  const handleOpenDialog = (categoria?: CategoriaFinanceira) => {
    if (categoria) {
      setCategoriaSelecionada(categoria);
      setFormData({
        nome: categoria.nome,
        tipo: categoria.tipo,
        descricao: categoria.descricao || '',
        ativo: categoria.ativo,
      });
    } else {
      setCategoriaSelecionada(null);
      setFormData({
        nome: '',
        tipo: 'receita',
        descricao: '',
        ativo: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCategoriaSelecionada(null);
  };

  const handleSubmit = async () => {
    if (!formData.nome.trim()) {
      toast.error('Nome da categoria é obrigatório');
      return;
    }

    try {
      if (categoriaSelecionada) {
        await financeiroApi.updateCategoria(categoriaSelecionada.id, formData);
        toast.success('Categoria atualizada com sucesso!');
      } else {
        await financeiroApi.createCategoria(formData);
        toast.success('Categoria criada com sucesso!');
      }
      loadCategorias();
      handleCloseDialog();
    } catch (error) {
      toast.error('Erro ao salvar categoria');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Deseja realmente excluir esta categoria?')) {
      try {
        await financeiroApi.deleteCategoria(id);
        toast.success('Categoria excluída com sucesso!');
        loadCategorias();
      } catch (error: any) {
        if (error.response?.status === 400) {
          toast.error('Não é possível excluir categoria com transações vinculadas');
        } else {
          toast.error('Erro ao excluir categoria');
        }
      }
    }
  };

  const categoriasReceita = categorias.filter((c) => c.tipo === 'receita');
  const categoriasDespesa = categorias.filter((c) => c.tipo === 'despesa');

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: 'secondary.main', width: 56, height: 56 }}>
            <Category fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight={700}>
              Gerenciar Categorias
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configure as categorias de receitas e despesas
            </Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          Nova Categoria
        </Button>
      </Box>

      {/* Estatísticas */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <Card sx={{ flex: 1, background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)', color: 'white' }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Categorias de Receita
                </Typography>
                <Typography variant="h3" fontWeight={700}>
                  {categoriasReceita.length}
                </Typography>
              </Box>
              <TrendingUp sx={{ fontSize: 50, opacity: 0.8 }} />
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, background: 'linear-gradient(135deg, #f44336 0%, #ef5350 100%)', color: 'white' }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Categorias de Despesa
                </Typography>
                <Typography variant="h3" fontWeight={700}>
                  {categoriasDespesa.length}
                </Typography>
              </Box>
              <TrendingDown sx={{ fontSize: 50, opacity: 0.8 }} />
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {/* Tabela de Receitas */}
      <Paper sx={{ mb: 3 }}>
        <Box p={2} bgcolor="success.light">
          <Typography variant="h6" fontWeight={600} color="success.dark">
            💚 Categorias de Receita
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell align="center">Transações</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categoriasReceita.map((categoria) => (
                <TableRow key={categoria.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {categoria.nome}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {categoria.descricao || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip label={categoria.total_transacoes || 0} size="small" color="primary" />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={categoria.ativo ? 'Ativo' : 'Inativo'}
                      color={categoria.ativo ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" color="primary" onClick={() => handleOpenDialog(categoria)}>
                      <Edit />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(categoria.id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {categoriasReceita.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="text.secondary">Nenhuma categoria de receita cadastrada</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Tabela de Despesas */}
      <Paper>
        <Box p={2} bgcolor="error.light">
          <Typography variant="h6" fontWeight={600} color="error.dark">
            ❤️ Categorias de Despesa
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell align="center">Transações</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categoriasDespesa.map((categoria) => (
                <TableRow key={categoria.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {categoria.nome}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {categoria.descricao || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip label={categoria.total_transacoes || 0} size="small" color="primary" />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={categoria.ativo ? 'Ativo' : 'Inativo'}
                      color={categoria.ativo ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" color="primary" onClick={() => handleOpenDialog(categoria)}>
                      <Edit />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(categoria.id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {categoriasDespesa.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="text.secondary">Nenhuma categoria de despesa cadastrada</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog Formulário */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {categoriaSelecionada ? 'Editar Categoria' : 'Nova Categoria'}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Nome *"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            />
            
            <TextField
              select
              fullWidth
              label="Tipo *"
              value={formData.tipo}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'receita' | 'despesa' })}
            >
              <MenuItem value="receita">Receita</MenuItem>
              <MenuItem value="despesa">Despesa</MenuItem>
            </TextField>
            
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Descrição"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={formData.ativo}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                />
              }
              label="Categoria Ativa"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {categoriaSelecionada ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GerenciarCategorias;
