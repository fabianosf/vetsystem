import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Chip,
  Divider,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  CalendarToday,
  Add,
  Close,
  Edit,
  Delete,
  Pets,
  Person,
  LocalHospital,
  AccessTime,
  Description,
} from '@mui/icons-material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { toast } from 'react-toastify';
import api from '../../services/api';


interface Consulta {
  id?: number;
  animal: number | null;
  veterinario: number | null;
  data: string;
  hora: string;
  motivo: string;
  status: string;
  observacoes?: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
  borderColor: string;
  extendedProps: {
    consulta: any;
  };
}


const Agendamento: React.FC = () => {
  const calendarRef = useRef<any>(null);
  const [consultas, setConsultas] = useState<any[]>([]);
  const [animais, setAnimais] = useState<any[]>([]);
  const [veterinarios, setVeterinarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedConsulta, setSelectedConsulta] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form
  const [formData, setFormData] = useState<Consulta>({
    animal: null,
    veterinario: null,
    data: '',
    hora: '',
    motivo: '',
    status: 'agendada',
    observacoes: '',
  });


  useEffect(() => {
    fetchConsultas();
    fetchAnimais();
    fetchVeterinarios();
  }, []);


  const fetchConsultas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/consultas/');
      setConsultas(response.data.results || response.data || []);
    } catch (error) {
      console.error('Erro ao carregar consultas:', error);
      toast.error('Erro ao carregar consultas');
    } finally {
      setLoading(false);
    }
  };


  const fetchAnimais = async () => {
    try {
      const response = await api.get('/animais/');
      setAnimais(response.data.results || response.data || []);
    } catch (error) {
      console.error('Erro ao carregar animais:', error);
    }
  };


  const fetchVeterinarios = async () => {
    try {
      const response = await api.get('/veterinarios/');
      setVeterinarios(response.data.results || response.data || []);
    } catch (error) {
      console.error('Erro ao carregar veterinários:', error);
    }
  };


  // Converter consultas para eventos do calendário
  const convertToCalendarEvents = (): CalendarEvent[] => {
    return consultas.map((consulta) => {
      const startDateTime = `${consulta.data}T${consulta.hora || '00:00'}`;
      const endDateTime = new Date(startDateTime);
      endDateTime.setHours(endDateTime.getHours() + 1); // 1 hora de duração padrão

      const colors = {
        agendada: { bg: '#2196f3', border: '#1976d2' },
        em_andamento: { bg: '#ff9800', border: '#f57c00' },
        concluida: { bg: '#4caf50', border: '#388e3c' },
        cancelada: { bg: '#f44336', border: '#d32f2f' },
      };

      const color = colors[consulta.status as keyof typeof colors] || colors.agendada;

      return {
        id: consulta.id?.toString() || '',
        title: `${consulta.animal?.name || 'Animal'} - ${consulta.veterinario?.name || 'Veterinário'}`,
        start: startDateTime,
        end: endDateTime.toISOString(),
        backgroundColor: color.bg,
        borderColor: color.border,
        extendedProps: {
          consulta,
        },
      };
    });
  };


  // Handlers
  const handleDateClick = (arg: any) => {
    const selectedDate = arg.dateStr.split('T')[0];
    const selectedTime = arg.dateStr.split('T')[1]?.substring(0, 5) || '09:00';

    setFormData({
      animal: null,
      veterinario: null,
      data: selectedDate,
      hora: selectedTime,
      motivo: '',
      status: 'agendada',
      observacoes: '',
    });
    setSelectedConsulta(null);
    setIsEditing(false);
    setOpenDialog(true);
  };


  const handleEventClick = (info: any) => {
    const consulta = info.event.extendedProps.consulta;
    setSelectedConsulta(consulta);
    setFormData({
      animal: consulta.animal?.id || null,
      veterinario: consulta.veterinario?.id || null,
      data: consulta.data,
      hora: consulta.hora,
      motivo: consulta.motivo || '',
      status: consulta.status,
      observacoes: consulta.observacoes || '',
    });
    setIsEditing(true);
    setOpenDialog(true);
  };


  const handleSave = async () => {
    if (!formData.animal || !formData.veterinario || !formData.data || !formData.hora) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      if (isEditing && selectedConsulta) {
        await api.put(`/consultas/${selectedConsulta.id}/`, formData);
        toast.success('Consulta atualizada com sucesso!');
      } else {
        await api.post('/consultas/', formData);
        toast.success('Consulta agendada com sucesso!');
      }
      handleCloseDialog();
      fetchConsultas();
    } catch (error: any) {
      console.error('Erro ao salvar consulta:', error);
      toast.error(error.response?.data?.detail || 'Erro ao salvar consulta');
    }
  };


  const handleDelete = async () => {
    if (!selectedConsulta?.id) return;

    if (window.confirm('Deseja realmente excluir esta consulta?')) {
      try {
        await api.delete(`/consultas/${selectedConsulta.id}/`);
        toast.success('Consulta excluída com sucesso!');
        handleCloseDialog();
        fetchConsultas();
      } catch (error) {
        toast.error('Erro ao excluir consulta');
      }
    }
  };


  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedConsulta(null);
    setIsEditing(false);
    setFormData({
      animal: null,
      veterinario: null,
      data: '',
      hora: '',
      motivo: '',
      status: 'agendada',
      observacoes: '',
    });
  };


  const getStatusColor = (status: string) => {
    const colors: { [key: string]: any } = {
      'agendada': 'primary',
      'em_andamento': 'warning',
      'concluida': 'success',
      'cancelada': 'error',
    };
    return colors[status] || 'default';
  };


  const translateStatus = (status: string) => {
    const translations: { [key: string]: string } = {
      'agendada': 'Agendada',
      'em_andamento': 'Em Andamento',
      'concluida': 'Concluída',
      'cancelada': 'Cancelada',
    };
    return translations[status] || status;
  };


  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
            <CalendarToday />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight={700}>
              Agendamento
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gerencie consultas com calendário interativo
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            const today = new Date().toISOString().split('T')[0];
            setFormData({
              animal: null,
              veterinario: null,
              data: today,
              hora: '09:00',
              motivo: '',
              status: 'agendada',
              observacoes: '',
            });
            setIsEditing(false);
            setOpenDialog(true);
          }}
          size="large"
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1.5,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
          }}
        >
          Nova Consulta
        </Button>
      </Box>


      {/* Legenda */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap">
          <Typography variant="subtitle2" fontWeight={600}>
            Legenda:
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 16, height: 16, bgcolor: '#2196f3', borderRadius: 1 }} />
            <Typography variant="body2">Agendada</Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 16, height: 16, bgcolor: '#ff9800', borderRadius: 1 }} />
            <Typography variant="body2">Em Andamento</Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 16, height: 16, bgcolor: '#4caf50', borderRadius: 1 }} />
            <Typography variant="body2">Concluída</Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 16, height: 16, bgcolor: '#f44336', borderRadius: 1 }} />
            <Typography variant="body2">Cancelada</Typography>
          </Stack>
        </Stack>
      </Card>


      {/* Calendário */}
      <Card sx={{ p: 3 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress />
          </Box>
        ) : (
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            initialView="dayGridMonth"
            locale={ptBrLocale}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
            }}
            buttonText={{
              today: 'Hoje',
              month: 'Mês',
              week: 'Semana',
              day: 'Dia',
              list: 'Lista',
            }}
            events={convertToCalendarEvents()}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            slotMinTime="07:00:00"
            slotMaxTime="20:00:00"
            slotDuration="00:30:00"
            height="auto"
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            }}
            slotLabelFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            }}
          />
        )}
      </Card>


      {/* Dialog de Agendamento */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              {isEditing ? <Edit /> : <Add />}
              <Typography variant="h6" fontWeight={600}>
                {isEditing ? 'Editar Consulta' : 'Nova Consulta'}
              </Typography>
            </Stack>
            <IconButton onClick={handleCloseDialog} size="small">
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {/* Animal */}
            <FormControl fullWidth required>
              <InputLabel>Animal</InputLabel>
              <Select
                value={formData.animal || ''}
                onChange={(e) => setFormData({ ...formData, animal: Number(e.target.value) })}
                label="Animal"
                startAdornment={<Pets sx={{ mr: 1, color: 'action.active' }} />}
              >
                <MenuItem value="">
                  <em>Selecione um animal</em>
                </MenuItem>
                {animais.map((animal) => (
                  <MenuItem key={animal.id} value={animal.id}>
                    {animal.name} - {animal.species || 'Não especificado'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Veterinário */}
            <FormControl fullWidth required>
              <InputLabel>Veterinário</InputLabel>
              <Select
                value={formData.veterinario || ''}
                onChange={(e) => setFormData({ ...formData, veterinario: Number(e.target.value) })}
                label="Veterinário"
                startAdornment={<Person sx={{ mr: 1, color: 'action.active' }} />}
              >
                <MenuItem value="">
                  <em>Selecione um veterinário</em>
                </MenuItem>
                {veterinarios.map((vet) => (
                  <MenuItem key={vet.id} value={vet.id}>
                    {vet.name} - {vet.crmv || 'CRMV não informado'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Data e Hora */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                gap: 2,
              }}
            >
              <TextField
                fullWidth
                required
                type="date"
                label="Data"
                value={formData.data}
                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: <CalendarToday sx={{ mr: 1, color: 'action.active' }} />,
                }}
              />

              <TextField
                fullWidth
                required
                type="time"
                label="Hora"
                value={formData.hora}
                onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: <AccessTime sx={{ mr: 1, color: 'action.active' }} />,
                }}
              />
            </Box>

            {/* Motivo */}
            <TextField
              fullWidth
              required
              label="Motivo da Consulta"
              value={formData.motivo}
              onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
              multiline
              rows={2}
              InputProps={{
                startAdornment: <Description sx={{ mr: 1, color: 'action.active', alignSelf: 'flex-start', mt: 1 }} />,
              }}
            />

            {/* Status */}
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                label="Status"
                startAdornment={<LocalHospital sx={{ mr: 1, color: 'action.active' }} />}
              >
                <MenuItem value="agendada">Agendada</MenuItem>
                <MenuItem value="em_andamento">Em Andamento</MenuItem>
                <MenuItem value="concluida">Concluída</MenuItem>
                <MenuItem value="cancelada">Cancelada</MenuItem>
              </Select>
            </FormControl>

            {/* Observações */}
            <TextField
              fullWidth
              label="Observações (opcional)"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              multiline
              rows={3}
              placeholder="Informações adicionais sobre a consulta..."
            />

            {/* Preview do Status */}
            {formData.status && (
              <Alert severity="info" icon={false}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2">Status da consulta:</Typography>
                  <Chip
                    label={translateStatus(formData.status)}
                    color={getStatusColor(formData.status)}
                    size="small"
                  />
                </Stack>
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Box>
            {isEditing && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={handleDelete}
              >
                Excluir
              </Button>
            )}
          </Box>
          <Stack direction="row" spacing={2}>
            <Button onClick={handleCloseDialog} variant="outlined">
              Cancelar
            </Button>
            <Button variant="contained" onClick={handleSave}>
              {isEditing ? 'Atualizar' : 'Agendar'}
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </Box>
  );
};


export default Agendamento;
