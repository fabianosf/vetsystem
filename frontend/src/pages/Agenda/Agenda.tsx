import { useEffect, useState, useRef } from 'react';
import api from '../../services/api';
import type { Consulta, Animal, Veterinario, PaginatedResponse } from '../../types';
import {
  Box,
  Card,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  IconButton,
  Stack,
  MenuItem,
} from '@mui/material';
import {
  Add,
  Close,
  CalendarMonth,
  Schedule,
  Person,
  Pets,
  MedicalServices,
} from '@mui/icons-material';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';

export default function Agenda() {
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [veterinarios, setVeterinarios] = useState<Veterinario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedConsulta, setSelectedConsulta] = useState<Consulta | null>(null);
  const [formData, setFormData] = useState({
    animal: '',
    veterinario: '',
    data: '',
    hora: '09:00',
    status: 'AGENDADA',
    tipo: 'ROTINA',
    motivo: '',
    observacoes: '',
  });

  const calendarRef = useRef<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [consultasRes, animaisRes, veterinariosRes] = await Promise.all([
        api.get<PaginatedResponse<Consulta>>('/consultas/'),
        api.get<PaginatedResponse<Animal>>('/animais/'),
        api.get<PaginatedResponse<Veterinario>>('/veterinarios/'),
      ]);
      setConsultas(consultasRes.data.results || consultasRes.data);
      setAnimais(animaisRes.data.results || animaisRes.data);
      setVeterinarios(veterinariosRes.data.results || veterinariosRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedConsulta) {
        await api.put(`/consultas/${selectedConsulta.id}/`, formData);
      } else {
        await api.post('/consultas/', formData);
      }
      loadData();
      closeModal();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Erro ao salvar consulta');
    }
  };

  const handleDateSelect = (selectInfo: any) => {
    const date = selectInfo.start.toISOString().split('T')[0];
    const hour = selectInfo.start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    setFormData({
      ...formData,
      data: date,
      hora: hour,
    });
    setShowModal(true);
  };

  const handleEventClick = (clickInfo: any) => {
    const consulta = consultas.find(c => c.id === parseInt(clickInfo.event.id));
    if (consulta) {
      setSelectedConsulta(consulta);
      setFormData({
        animal: consulta.animal.toString(),
        veterinario: consulta.veterinario.toString(),
        data: consulta.data,
        hora: consulta.hora,
        status: consulta.status,
        tipo: consulta.tipo,
        motivo: consulta.motivo || '',
        observacoes: consulta.observacoes || '',
      });
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedConsulta(null);
    setFormData({
      animal: '',
      veterinario: '',
      data: '',
      hora: '09:00',
      status: 'AGENDADA',
      tipo: 'ROTINA',
      motivo: '',
      observacoes: '',
    });
  };

  const getAnimalName = (animalId: number) => {
    const animal = animais.find(a => a.id === animalId);
    return animal?.name || 'N/A';
  };

  const getVeterinarioName = (vetId: number) => {
    const vet = veterinarios.find(v => v.id === vetId);
    return vet?.name || 'N/A';
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      AGENDADA: '#3b82f6',
      CONFIRMADA: '#10b981',
      EM_ATENDIMENTO: '#f59e0b',
      CONCLUIDA: '#6366f1',
      CANCELADA: '#ef4444',
      FALTOU: '#dc2626',
    };
    return colors[status] || '#6b7280';
  };

  const events = consultas.map(consulta => ({
    id: consulta.id.toString(),
    title: `${getAnimalName(consulta.animal)} - ${getVeterinarioName(consulta.veterinario)}`,
    start: `${consulta.data}T${consulta.hora}`,
    backgroundColor: getStatusColor(consulta.status),
    borderColor: getStatusColor(consulta.status),
    extendedProps: {
      status: consulta.status,
      tipo: consulta.tipo,
      animal: getAnimalName(consulta.animal),
      veterinario: getVeterinarioName(consulta.veterinario),
    },
  }));

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <Typography>Carregando agenda...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Agenda de Consultas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie os agendamentos de forma visual
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setShowModal(true)}
        >
          Nova Consulta
        </Button>
      </Box>

      {/* Legenda */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Chip label="Agendada" sx={{ bgcolor: '#3b82f6', color: 'white' }} size="small" />
          <Chip label="Confirmada" sx={{ bgcolor: '#10b981', color: 'white' }} size="small" />
          <Chip label="Em Atendimento" sx={{ bgcolor: '#f59e0b', color: 'white' }} size="small" />
          <Chip label="Concluída" sx={{ bgcolor: '#6366f1', color: 'white' }} size="small" />
          <Chip label="Cancelada" sx={{ bgcolor: '#ef4444', color: 'white' }} size="small" />
          <Chip label="Faltou" sx={{ bgcolor: '#dc2626', color: 'white' }} size="small" />
        </Stack>
      </Card>

      {/* Calendário */}
      <Card>
        <Box p={2}>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            initialView="timeGridWeek"
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
            slotMinTime="07:00:00"
            slotMaxTime="20:00:00"
            allDaySlot={false}
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            events={events}
            select={handleDateSelect}
            eventClick={handleEventClick}
            eventContent={(eventInfo) => (
              <Box p={0.5}>
                <Typography variant="caption" fontWeight={600} display="block">
                  {eventInfo.timeText}
                </Typography>
                <Typography variant="caption" display="block" noWrap>
                  {eventInfo.event.extendedProps.animal}
                </Typography>
                <Typography variant="caption" display="block" fontSize="0.65rem" noWrap>
                  {eventInfo.event.extendedProps.veterinario}
                </Typography>
              </Box>
            )}
            height="auto"
            contentHeight={650}
          />
        </Box>
      </Card>

      {/* Modal */}
      <Dialog open={showModal} onClose={closeModal} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">
                {selectedConsulta ? 'Editar Consulta' : 'Nova Consulta'}
              </Typography>
              <IconButton onClick={closeModal} size="small">
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Animal *"
                  value={formData.animal}
                  onChange={(e) => setFormData({ ...formData, animal: e.target.value })}
                  required
                >
                  <MenuItem value="">Selecione um animal</MenuItem>
                  {animais.map((animal) => (
                    <MenuItem key={animal.id} value={animal.id}>
                      {animal.name} - {animal.tutor_name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Veterinário *"
                  value={formData.veterinario}
                  onChange={(e) => setFormData({ ...formData, veterinario: e.target.value })}
                  required
                >
                  <MenuItem value="">Selecione um veterinário</MenuItem>
                  {veterinarios.filter(v => v.status === 'ATIVO').map((vet) => (
                    <MenuItem key={vet.id} value={vet.id}>
                      {vet.name} - {vet.especialidade}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Data *"
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Horário *"
                  type="time"
                  value={formData.hora}
                  onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Status *"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  required
                >
                  <MenuItem value="AGENDADA">Agendada</MenuItem>
                  <MenuItem value="CONFIRMADA">Confirmada</MenuItem>
                  <MenuItem value="EM_ATENDIMENTO">Em Atendimento</MenuItem>
                  <MenuItem value="CONCLUIDA">Concluída</MenuItem>
                  <MenuItem value="CANCELADA">Cancelada</MenuItem>
                  <MenuItem value="FALTOU">Faltou</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Tipo *"
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  required
                >
                  <MenuItem value="ROTINA">Rotina</MenuItem>
                  <MenuItem value="RETORNO">Retorno</MenuItem>
                  <MenuItem value="EMERGENCIA">Emergência</MenuItem>
                  <MenuItem value="CIRURGIA">Cirurgia</MenuItem>
                  <MenuItem value="VACINA">Vacina</MenuItem>
                  <MenuItem value="EXAME">Exame</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Motivo"
                  value={formData.motivo}
                  onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                  multiline
                  rows={2}
                  placeholder="Descreva o motivo da consulta..."
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Observações"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  multiline
                  rows={2}
                  placeholder="Observações adicionais..."
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button onClick={closeModal}>Cancelar</Button>
            <Button type="submit" variant="contained">
              {selectedConsulta ? 'Salvar' : 'Agendar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
