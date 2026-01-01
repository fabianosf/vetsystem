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
  TextField,
  MenuItem,
  Stack,
  Tooltip,
  Avatar,
  InputAdornment,
  Card,
  CardContent,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Check,
  Close,
  Search,
  AttachMoney,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Cancel,
  Warning,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import financeiroApi, { Transacao, CategoriaFinanceira, FormaPagamento } from '../../services/financeiroApi';
import FormularioTransacao from './FormularioTransacao';

const ListaTransacoes: React.FC = () => {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [transacaoSelecionada, setTransacaoSelecionada] = useState<Transacao | null>(null);
  
  // Filtros
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [busca, setBusca] = useState('');
  
  // Dados auxiliares
  const [categorias, setCategorias] = useState<CategoriaFinanceira[]>([]);
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([]);

  useEffect(() => {
    loadTransacoes();
    loadCategorias();
    loadFormasPagamento();
  }, [filtroTipo, filtroStatus, filtroCategoria]);

  const loadTransacoes = async () => {
    try {
      const params: any = {};
      if (filtroTipo) params.tipo = filtroTipo;
      if (filtroStatus) params.status = filtroStatus;
      if (filtroCategoria) params.categoria = filtroCategoria;
      
      const response = await financeiroApi.getTransacoes(params);
      setTransacoes(response.data);
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
      toast.error('Erro ao carregar transações');
    }
  };

  const loadCategorias = async () => {
    try {
      const response = await financeiroApi.getCategorias();
      setCategorias(response.data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const loadFormasPagamento = async () => {
    try {
      const response = await financeiroApi.getFormasPagamento();
      setFormasPagamento(response.data);
    } catch (error) {
      console.error('Erro ao carregar formas de pagamento:', error);
    }
  };

  const handleConfirmarPagamento = async (id: number) => {
    try {
      await financeiroApi.confirmarPagamento(id);
      toast.success('Pagamento confirmado com sucesso!');
      loadTransacoes();
    } catch (error) {
      toast.error('Erro ao confirmar pagamento');
    }
  };

  const handleCancelar = async (id: number) => {
    if (window.confirm('Deseja realmente cancelar esta transação?')) {
      try {
        await financeiroApi.cancelarTransacao(id);
        toast.success('Transação cancelada com sucesso!');
        loadTransacoes();
      } catch (error) {
        toast.error('Erro ao cancelar transação');
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Deseja realmente excluir esta transação?')) {
      try {
        await financeiroApi.deleteTransacao(id);
        toast.success('Transação excluída com sucesso!');
        loadTransacoes();
      } catch (error) {
        toast.error('Erro ao excluir transação');
      }
    }
  };

  const getStatusChip = (status: string) => {
    const statusConfig: any = {
      pendente: { color: 'warning', icon: <Warning fontSize="small" />, label: 'Pendente' },
      pago: { color: 'success', icon: <CheckCircle fontSize="small" />, label: 'Pago' },
      cancelado: { color: 'error', icon: <Cancel fontSize="small" />, label: 'Cancelado' },
      atrasado: { color: 'error', icon: <Warning fontSize="small" />, label: 'Atrasado' },
    };

    const config = statusConfig[status] || statusConfig.pendente;
    return <Chip icon={config.icon} label={config.label} color={config.color} size="small" />;
  };

  const getTipoChip = (tipo: string) => {
    return tipo === 'receita' ? (
      <Chip icon={<TrendingUp />} label="Receita" color="success" size="small" variant="outlined" />
    ) : (
      <Chip icon={<TrendingDown />} label="Despesa" color="error" size="small" variant="outlined" />
    );
  };

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(parseFloat(value));
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
  };

  const transacoesFiltradas = transacoes.filter((transacao) =>
    transacao.descricao.toLowerCase().includes(busca.toLowerCase())
  );

  // Calcular totais
  const totais = transacoesFiltradas.reduce(
    (acc, transacao) => {
      const valor = parseFloat(transacao.valor);
      if (transacao.tipo === 'receita') {
        acc.receitas += valor;
      } else {
        acc.despesas += valor;
      }
      return acc;
    },
    { receitas: 0, despesas: 0 }
  );

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
            <AttachMoney fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight={700}>
              Transações Financeiras
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gerencie receitas e despesas da clínica
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setTransacaoSelecionada(null);
            setOpenDialog(true);
          }}
        >
          Nova Transação
        </Button>
      </Box>

      {/* Cards de Resumo */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <Card sx={{ flex: 1, background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)', color: 'white' }}>
          <CardContent>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Total Receitas
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {formatCurrency(totais.receitas.toString())}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, background: 'linear-gradient(135deg, #f44336 0%, #ef5350 100%)', color: 'white' }}>
          <CardContent>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Total Despesas
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {formatCurrency(totais.despesas.toString())}
            </Typography>
          </CardContent>
        </Card>

        <Card
          sx={{
            flex: 1,
            background:
              totais.receitas - totais.despesas >= 0
                ? 'linear-gradient(135deg, #2196f3 0%, #42a5f5 100%)'
                : 'linear-gradient(135deg, #ff9800 0%, #ffa726 100%)',
            color: 'white',
          }}
        >
          <CardContent>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Saldo
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {formatCurrency((totais.receitas - totais.despesas).toString())}
            </Typography>
          </CardContent>
        </Card>
      </Stack>

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            fullWidth
            placeholder="Buscar transação..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            select
            label="Tipo"
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="receita">Receita</MenuItem>
            <MenuItem value="despesa">Despesa</MenuItem>
          </TextField>
          <TextField
            select
            label="Status"
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="pendente">Pendente</MenuItem>
            <MenuItem value="pago">Pago</MenuItem>
            <MenuItem value="cancelado">Cancelado</MenuItem>
            <MenuItem value="atrasado">Atrasado</MenuItem>
          </TextField>
          <TextField
            select
            label="Categoria"
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">Todas</MenuItem>
            {categorias.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.nome}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Paper>

      {/* Tabela */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.100' }}>
              <TableCell>Tipo</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell>Categoria</TableCell>
              <TableCell align="right">Valor</TableCell>
              <TableCell>Vencimento</TableCell>
              <TableCell>Pagamento</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transacoesFiltradas.map((transacao) => (
              <TableRow key={transacao.id} hover>
                <TableCell>{getTipoChip(transacao.tipo)}</TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {transacao.descricao}
                  </Typography>
                  {transacao.observacoes && (
                    <Typography variant="caption" color="text.secondary">
                      {transacao.observacoes}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Chip label={transacao.categoria_nome} size="small" variant="outlined" />
                </TableCell>
                <TableCell align="right">
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    color={transacao.tipo === 'receita' ? 'success.main' : 'error.main'}
                  >
                    {formatCurrency(transacao.valor)}
                  </Typography>
                  {transacao.dias_atraso > 0 && (
                    <Typography variant="caption" color="error">
                      {transacao.dias_atraso} dias atraso
                    </Typography>
                  )}
                </TableCell>
                <TableCell>{formatDate(transacao.data_vencimento)}</TableCell>
                <TableCell>
                  {transacao.data_pagamento ? formatDate(transacao.data_pagamento) : '-'}
                </TableCell>
                <TableCell>{getStatusChip(transacao.status)}</TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    {transacao.status === 'pendente' && (
                      <Tooltip title="Confirmar Pagamento">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleConfirmarPagamento(transacao.id)}
                        >
                          <Check />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Editar">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => {
                          setTransacaoSelecionada(transacao);
                          setOpenDialog(true);
                        }}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    {transacao.status === 'pendente' && (
                      <Tooltip title="Cancelar">
                        <IconButton
                          size="small"
                          color="warning"
                          onClick={() => handleCancelar(transacao.id)}
                        >
                          <Close />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Excluir">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(transacao.id)}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {transacoesFiltradas.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography color="text.secondary" py={3}>
                    Nenhuma transação encontrada
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog Formulário */}
      <FormularioTransacao
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setTransacaoSelecionada(null);
        }}
        transacao={transacaoSelecionada}
        onSuccess={loadTransacoes}
        categorias={categorias}
        formasPagamento={formasPagamento}
      />
    </Box>
  );
};

export default ListaTransacoes;
