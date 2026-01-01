// frontend/src/components/Consultas/ConsultasList.tsx
import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import { usePermissions } from '../../hooks/usePermissions';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Paper,
  Typography,
  Skeleton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
} from '@mui/material';
import { toast } from 'react-toastify';

interface Consulta {
  id: number;
  animal_name: string;
  veterinario_name: string;
  data: string;
  horario: string;
  status: string;
}

type DateFilter = 'all' | 'today' | 'next7';

const ConsultasList: React.FC = () => {
  const permissions = usePermissions();
  
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelMotivo, setCancelMotivo] = useState('');
  const [selectedConsulta, setSelectedConsulta] = useState<Consulta | null>(null);
  const [loadingCancel, setLoadingCancel] = useState(false);

  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');

  useEffect(() => {
    const fetchConsultas = async () => {
      setLoadingList(true);
      try {
        const response = await api.get<Consulta[]>('/consultas/');
        setConsultas(response.data);
      } catch (error) {
        console.error('Erro ao carregar consultas:', error);
        toast.error('Não foi possível carregar as consultas.');
      } finally {
        setLoadingList(false);
      }
    };

    fetchConsultas();
  }, []);

  const handleOpenCancelDialog = (consulta: Consulta) => {
    if (!permissions.canCancelConsulta) {
      toast.warning('Você não tem permissão para cancelar consultas.');
      return;
    }
    setSelectedConsulta(consulta);
    setCancelMotivo('');
    setCancelDialogOpen(true);
  };

  const handleCloseCancelDialog = () => {
    setCancelDialogOpen(false);
    setSelectedConsulta(null);
    setCancelMotivo('');
  };

  const handleConfirmCancel = async () => {
    if (!selectedConsulta) return;
    setLoadingCancel(true);
    try {
      await api.post(`/consultas/${selectedConsulta.id}/cancelar/`, {
        motivo: cancelMotivo,
      });

      setConsultas((prev) =>
        prev.map((c) =>
          c.id === selectedConsulta.id
            ? { ...c, status: 'CANCELADA' }
            : c
        )
      );

      toast.success('Consulta cancelada com sucesso!');
      handleCloseCancelDialog();
    } catch (error) {
      console.error('Erro ao cancelar consulta:', error);
      toast.error('Não foi possível cancelar a consulta.');
    } finally {
      setLoadingCancel(false);
    }
  };

  const hojeStr = useMemo(() => {
    const hoje = new Date();
    return hoje.toISOString().slice(0, 10);
  }, []);

  const proximos7LimiteStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  }, []);

  const filteredConsultas = useMemo(() => {
    return consultas.filter((c) => {
      if (statusFilter && c.status !== statusFilter) {
        return false;
      }

      if (dateFilter !== 'all') {
        const dataConsulta = c.data;
        if (dateFilter === 'today') {
          if (dataConsulta !== hojeStr) return false;
        }
        if (dateFilter === 'next7') {
          if (dataConsulta < hojeStr || dataConsulta > proximos7LimiteStr) {
            return false;
          }
        }
      }

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const animal = c.animal_name?.toLowerCase() || '';
        const vet = c.veterinario_name?.toLowerCase() || '';
        if (!animal.includes(term) && !vet.includes(term)) {
          return false;
        }
      }

      return true;
    });
  }, [consultas, statusFilter, dateFilter, searchTerm, hojeStr, proximos7LimiteStr]);

  return (
    <>
      <Stack spacing={2} mb={2}>
        <Typography variant="h5" fontWeight={600}>
          Consultas
        </Typography>

        {!permissions.canViewAllConsultas && (
          <Alert severity="info">
            Você tem acesso limitado às consultas.
          </Alert>
        )}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Buscar por animal ou veterinário"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
          />

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="AGENDADA">Agendada</MenuItem>
              <MenuItem value="REALIZADA">Realizada</MenuItem>
              <MenuItem value="CANCELADA">Cancelada</MenuItem>
            </Select>
          </FormControl>

          <ToggleButtonGroup
            value={dateFilter}
            exclusive
            onChange={(_, value: DateFilter | null) => {
              if (value) setDateFilter(value);
            }}
            size="small"
          >
            <ToggleButton value="all">Todas</ToggleButton>
            <ToggleButton value="today">Hoje</ToggleButton>
            <ToggleButton value="next7">Próx. 7 dias</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Stack>

      <Box display="flex" flexDirection="column" gap={2}>
        {loadingList ? (
          <>
            {[1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                height={72}
                animation="wave"
              />
            ))}
          </>
        ) : filteredConsultas.length > 0 ? (
          filteredConsultas.map((consulta) => (
            <Paper
              key={consulta.id}
              sx={{
                p: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box>
                <Typography variant="subtitle1">
                  {consulta.animal_name} - {consulta.veterinario_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {consulta.data} às {consulta.horario} • Status: {consulta.status}
                </Typography>
              </Box>

              {consulta.status !== 'CANCELADA' && permissions.canCancelConsulta && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleOpenCancelDialog(consulta)}
                  disabled={loadingCancel && selectedConsulta?.id === consulta.id}
                >
                  {loadingCancel && selectedConsulta?.id === consulta.id
                    ? 'Cancelando...'
                    : 'Cancelar consulta'}
                </Button>
              )}
            </Paper>
          ))
        ) : (
          <Typography variant="body1">
            Nenhuma consulta encontrada com os filtros atuais.
          </Typography>
        )}
      </Box>

      <Dialog
        open={cancelDialogOpen}
        onClose={handleCloseCancelDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Cancelar consulta</DialogTitle>
        <DialogContent>
          {selectedConsulta && (
            <>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Deseja realmente cancelar a consulta de{' '}
                <strong>{selectedConsulta.animal_name}</strong> com{' '}
                <strong>{selectedConsulta.veterinario_name}</strong> em{' '}
                <strong>
                  {selectedConsulta.data} às {selectedConsulta.horario}
                </strong>
                ?
              </Typography>
              <TextField
                label="Motivo do cancelamento (opcional)"
                fullWidth
                multiline
                minRows={3}
                value={cancelMotivo}
                onChange={(e) => setCancelMotivo(e.target.value)}
                sx={{ mt: 2 }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelDialog}>
            Voltar
          </Button>
          <Button
            onClick={handleConfirmCancel}
            color="error"
            variant="contained"
            disabled={loadingCancel}
          >
            {loadingCancel ? 'Cancelando...' : 'Cancelar consulta'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ConsultasList;
