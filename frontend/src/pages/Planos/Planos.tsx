import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import type { PlanoSaude, PaginatedResponse } from '../../types';
import {
  Box, Card, CardContent, Typography, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Grid, IconButton, InputAdornment,
  Stack, Chip, Alert, CircularProgress, MenuItem, Switch, FormControlLabel
} from '@mui/material';
import {
  Add, Edit, Delete, Search, HealthAndSafety, Close, AttachMoney
} from '@mui/icons-material';

export default function Planos() {
  const [planos, setPlanos] = useState<PlanoSaude[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPlano, setEditingPlano] = useState<PlanoSaude | null>(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco_mensal: '',
    consultas_mes: '',
    exames_mes: '',
    vacinas_ano: '',
    consultas_ilimitadas: false,
    exames_ilimitados: false,
    vacinas_ilimitadas: false,
    is_active: true,
  });

  useEffect(() => {
    loadPlanos();
  }, []);

  const loadPlanos = async () => {
    try {
      const response = await api.get<PaginatedResponse<PlanoSaude>>('/planos/');
      setPlanos(response.data.results || response.data);
    } catch (error) {
      setError('Erro ao carregar planos');
    } finally {
      setLoading(false);
    }
  };

  const formatBenefit = (value: number | null, unlimited: boolean, unit: string) => {
    if (unlimited) return '∞ ilimitado';
    if (value === null || value === 0) return 'null';
    return `${value} ${unit}`;
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>Planos de Saúde</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setShowModal(true)}>
          Novo Plano
        </Button>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {planos.map((plano) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={plano.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <HealthAndSafety color="primary" />
                    <Typography variant="h6" fontWeight={600}>{plano.nome}</Typography>
                  </Box>
                  <Chip 
                    label={plano.is_active ? 'Ativo' : 'Inativo'}
                    size="small"
                    color={plano.is_active ? 'success' : 'default'}
                  />
                </Box>

                {plano.descricao && (
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {plano.descricao}
                  </Typography>
                )}

                <Box sx={{ bgcolor: 'primary.light', p: 2, borderRadius: 2, mb: 2 }}>
                  <Typography variant="h4" fontWeight={700} color="primary.main">
                    R$ {parseFloat(plano.preco_mensal).toFixed(2)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    por mês
                  </Typography>
                </Box>

                <Stack spacing={1}>
                  <Chip 
                    label={formatBenefit(plano.consultas_mes, plano.consultas_ilimitadas, 'consultas/mês')}
                    size="small"
                    variant="outlined"
                  />
                  <Chip 
                    label={formatBenefit(plano.exames_mes, plano.exames_ilimitados, 'exames/mês')}
                    size="small"
                    variant="outlined"
                  />
                  <Chip 
                    label={formatBenefit(plano.vacinas_ano, plano.vacinas_ilimitadas, 'vacinas/ano')}
                    size="small"
                    variant="outlined"
                  />
                </Stack>
              </CardContent>

              <Box sx={{ p: 2, pt: 0 }}>
                <Stack direction="row" spacing={1}>
                  <Button fullWidth variant="outlined" startIcon={<Edit />}>
                    Editar
                  </Button>
                  <IconButton color="error">
                    <Delete />
                  </IconButton>
                </Stack>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
