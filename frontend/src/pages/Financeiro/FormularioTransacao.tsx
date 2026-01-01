import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Stack,
  IconButton,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/pt-br';
import { toast } from 'react-toastify';
import financeiroApi, { Transacao, CategoriaFinanceira, FormaPagamento } from '../../services/financeiroApi';

interface FormularioTransacaoProps {
  open: boolean;
  onClose: () => void;
  transacao: Transacao | null;
  onSuccess: () => void;
  categorias: CategoriaFinanceira[];
  formasPagamento: FormaPagamento[];
}

const FormularioTransacao: React.FC<FormularioTransacaoProps> = ({
  open,
  onClose,
  transacao,
  onSuccess,
  categorias,
  formasPagamento,
}) => {
  const [formData, setFormData] = useState<{
    tipo: 'receita' | 'despesa';
    categoria: string;
    descricao: string;
    valor: string;
    data_vencimento: Dayjs;
    forma_pagamento: string;
    observacoes: string;
  }>({
    tipo: 'receita',
    categoria: '',
    descricao: '',
    valor: '',
    data_vencimento: dayjs(),
    forma_pagamento: '',
    observacoes: '',
  });

  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (transacao) {
      setFormData({
        tipo: transacao.tipo,
        categoria: transacao.categoria.toString(),
        descricao: transacao.descricao,
        valor: transacao.valor,
        data_vencimento: dayjs(transacao.data_vencimento),
        forma_pagamento: transacao.forma_pagamento?.toString() || '',
        observacoes: transacao.observacoes || '',
      });
    } else {
      resetForm();
    }
  }, [transacao, open]);

  const resetForm = () => {
    setFormData({
      tipo: 'receita',
      categoria: '',
      descricao: '',
      valor: '',
      data_vencimento: dayjs(),
      forma_pagamento: '',
      observacoes: '',
    });
    setErrors({});
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors: any = {};

    if (!formData.tipo) newErrors.tipo = 'Tipo é obrigatório';
    if (!formData.categoria) newErrors.categoria = 'Categoria é obrigatória';
    if (!formData.descricao) newErrors.descricao = 'Descrição é obrigatória';
    if (!formData.valor || parseFloat(formData.valor) <= 0) {
      newErrors.valor = 'Valor deve ser maior que zero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setLoading(true);

      const data: any = {
        tipo: formData.tipo,
        categoria: parseInt(formData.categoria),
        descricao: formData.descricao,
        valor: formData.valor,
        data_vencimento: formData.data_vencimento.format('YYYY-MM-DD'),
        forma_pagamento: formData.forma_pagamento ? parseInt(formData.forma_pagamento) : undefined,
        observacoes: formData.observacoes,
      };

      if (transacao) {
        await financeiroApi.updateTransacao(transacao.id, data);
        toast.success('Transação atualizada com sucesso!');
      } else {
        await financeiroApi.createTransacao(data);
        toast.success('Transação criada com sucesso!');
      }

      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      console.error('Erro ao salvar transação:', error);
      toast.error(error.response?.data?.detail || 'Erro ao salvar transação');
    } finally {
      setLoading(false);
    }
  };

  const categoriasFiltradas = categorias.filter((cat) => cat.tipo === formData.tipo && cat.ativo);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          {transacao ? 'Editar Transação' : 'Nova Transação'}
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          {/* Tipo e Categoria */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              select
              fullWidth
              label="Tipo *"
              value={formData.tipo}
              onChange={(e) => {
                handleChange('tipo', e.target.value as 'receita' | 'despesa');
                handleChange('categoria', '');
              }}
              error={!!errors.tipo}
              helperText={errors.tipo}
            >
              <MenuItem value="receita">Receita</MenuItem>
              <MenuItem value="despesa">Despesa</MenuItem>
            </TextField>

            <TextField
              select
              fullWidth
              label="Categoria *"
              value={formData.categoria}
              onChange={(e) => handleChange('categoria', e.target.value)}
              error={!!errors.categoria}
              helperText={errors.categoria}
            >
              {categoriasFiltradas.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.nome}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          {/* Descrição */}
          <TextField
            fullWidth
            label="Descrição *"
            value={formData.descricao}
            onChange={(e) => handleChange('descricao', e.target.value)}
            error={!!errors.descricao}
            helperText={errors.descricao}
          />

          {/* Valor e Data */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              type="number"
              label="Valor *"
              value={formData.valor}
              onChange={(e) => handleChange('valor', e.target.value)}
              error={!!errors.valor}
              helperText={errors.valor}
              InputProps={{
                startAdornment: <Box mr={1}>R$</Box>,
              }}
            />

            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
              <DatePicker
                label="Data de Vencimento *"
                value={formData.data_vencimento}
                onChange={(newValue) => handleChange('data_vencimento', newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
            </LocalizationProvider>
          </Stack>

          {/* Forma de Pagamento */}
          <TextField
            select
            fullWidth
            label="Forma de Pagamento"
            value={formData.forma_pagamento}
            onChange={(e) => handleChange('forma_pagamento', e.target.value)}
          >
            <MenuItem value="">Nenhuma</MenuItem>
            {formasPagamento.map((forma) => (
              <MenuItem key={forma.id} value={forma.id}>
                {forma.nome}
              </MenuItem>
            ))}
          </TextField>

          {/* Observações */}
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Observações"
            value={formData.observacoes}
            onChange={(e) => handleChange('observacoes', e.target.value)}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? 'Salvando...' : transacao ? 'Atualizar' : 'Criar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FormularioTransacao;
