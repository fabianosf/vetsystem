import { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import {
  Box, Card, CardContent, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, TextField, Grid, MenuItem, Stack,
  Typography, Chip, IconButton, Tooltip, Avatar, Paper,
  List, ListItem, ListItemText, ListItemAvatar, Divider
} from '@mui/material';
import {
  Add, Close, Edit, Delete, CalendarToday, AccessTime,
  Pets, MedicalServices, LocalHospital, CheckCircle,
  Cancel, Schedule
} from '@mui/icons-material';
import './calendar.css';

interface Consulta {
  id: number;
  animal: number;
  veterinario: number;
  clinica: number;
  data: string;
  horario: string;
  motivo: string;
  status: 'AGENDADA' | 'CONFIRMADA' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'CANCELADA';
  observacoes?: string;
  animal_nome?: string;
  veterinario_nome?: string;
  clinica_nome?: string;
}

interface Animal {
  id: number;
  name: string;
  species: string;
}

interface Veterinario {
  id: number;
  name: string;
  crmv: string;
}

interface Clinica {
  id: number;
  nome: string;
}

export default function Agendamento() {
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [veterinarios, setVeterinarios] = useState<Veterinario[]>([]);
  const [clinicas, setClinicas] = useState<Clinica[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingConsulta, setEditingConsulta] = useState<Consulta | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const toast = useToast();
  const calendarRef = useRef<any>(null);

  const [formData, setFormData] = useState({
    animal: '',
    veterinario: '',
    clinica: '',
    data: '',
    horario: '',
    motivo: '',
    status: 'AGENDADA',
    observacoes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [consultasRes, animaisRes, veterinariosRes, clinicasRes] = await Promise.all([
        api.get('/consultas/'),
        api.get('/animais/'),
        api.get('/veterinarios/'),
        api.get('/clinicas/'),
      ]);

      const consultasData = consultasRes.data.results || consultasRes.data;
      const animaisData = animaisRes.data.results || animaisRes.data;
      const veterinariosData = veterinariosRes.data.results || veterinariosRes.data;
      const clinicasData = clinicasRes.data.results || clinicasRes.data;

      // Enriquecer consultas com nomes
      const consultasEnriquecidas = consultasData.map((c: any) => ({
        ...c,
        animal_nome: animaisData.find((a: any) => a.id === c.animal)?.name || 'Desconhecido',
        veterinario_nome: veterinariosData.find((v: any) => v.id === c.veterinario)?.name || 'Desconhecido',
        clinica_nome: clinicasData.find((cl: any) => cl.id === c.clinica)?.nome || 'Desconhecida',
      }));

      setConsultas(consultasEnriquecidas);
      setAnimais(animaisData);
      setVeterinarios(veterinariosData);
      setClinicas(clinicasData);
    } catch (error) {
      toast.error('❌ Erro ao carregar dados');
    }
  };

  const handleDateClick = (arg: any) => {
    setSelectedDate(arg.date);
    const dateStr = arg.dateStr.split('T')[0];
    setFormData({ ...formData, data: dateStr, horario: '09:00' });
    openModal();
  };

  const handleEventClick = (clickInfo: any) => {
    const consulta = consultas.find(c => c.id === parseInt(clickInfo.event.id));
    if (consulta) {
      setEditingConsulta(consulta);
      setFormData({
        animal: consulta.animal.toString(),
        veterinario: consulta.veterinario.toString(),
        clinica: consulta.clinica.toString(),
        data: consulta.data,
        horario: consulta.horario || '09:00',
        motivo: consulta.motivo,
        status: consulta.status,
        observacoes: consulta.observacoes || '',
      });
      openModal();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading(editingConsulta ? 'Atualizando...' : 'Agendando...');

    try {
      const data = {
        ...formData,
        animal: parseInt(formData.animal),
        veterinario: parseInt(formData.veterinario),
        clinica: parseInt(formData.clinica),
      };

      if (editingConsulta) {
        await api.put(`/consultas/${editingConsulta.id}/`, data);
        toast.dismiss(loadingToast);
        toast.success('✅ Consulta atualizada!');
      } else {
        await api.post('/consultas/', data);
        toast.dismiss(loadingToast);
        toast.success('🗓️ Consulta agendada com sucesso!');
      }

      loadData();
      closeModal();
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.detail || '❌ Erro ao salvar');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja realmente cancelar esta consulta?')) return;

    const loadingToast = toast.loading('Cancelando...');
    try {
      await api.delete(`/consultas/${id}/`);
      toast.dismiss(loadingToast);
      toast.success('🗑️ Consulta cancelada!');
      loadData();
      closeModal();
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('❌ Erro ao cancelar');
    }
  };

  const openModal = (consulta?: Consulta) => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingConsulta(null);
    setFormData({
      animal: '',
      veterinario: '',
      clinica: '',
      data: '',
      horario: '',
      motivo: '',
      status: 'AGENDADA',
      observacoes: '',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      AGENDADA: '#3b82f6',
      CONFIRMADA: '#8b5cf6',
      EM_ANDAMENTO: '#f59e0b',
      CONCLUIDA: '#10b981',
      CANCELADA: '#ef4444',
    };
    return colors[status] || '#64748b';
  };

  const getStatusLabel = (status: string) => {
    const labels: any = {
      AGENDADA: 'Agendada',
      CONFIRMADA: 'Confirmada',
      EM_ANDAMENTO: 'Em Andamento',
      CONCLUIDA: 'Concluída',
      CANCELADA: 'Cancelada',
    };
    return labels[status] || status;
  };

  // Eventos para o calendário
  const events = consultas.map(consulta => ({
    id: consulta.id.toString(),
    title: `${consulta.animal_nome} - ${consulta.veterinario_nome}`,
    start: `${consulta.data}T${consulta.horario || '09:00'}`,
    backgroundColor: getStatusColor(consulta.status),
    borderColor: getStatusColor(consulta.status),
    extendedProps: {
      status: consulta.status,
      motivo: consulta.motivo,
      clinica: consulta.clinica_nome,
    },
  }));

  // Próximas consultas (hoje e futuras)
  const hoje = new Date().toISOString().split('T')[0];
  const proximasConsultas = consultas
    .filter(c => c.data >= hoje && c.status !== 'CANCELADA')
    .sort((a, b) => {
      const dateA = new Date(`${a.data}T${a.horario || '00:00'}`);
      const dateB = new Date(`${b.data}T${b.horario || '00:00'}`);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 5);

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>Agendamento</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => openModal()}>
          Nova Consulta
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Calendário */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardContent>
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
                events={events}
                dateClick={handleDateClick}
                eventClick={handleEventClick}
                editable={true}
                selectable={true}
                selectMirror={true}
                dayMaxEvents={true}
                weekends={true}
                height="auto"
                eventContent={(eventInfo) => (
                  <Box sx={{ p: 0.5, fontSize: '0.75rem' }}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      {eventInfo.timeText}
                    </Typography>
                    <Typography variant="caption" display="block">
                      {eventInfo.event.title}
                    </Typography>
                  </Box>
                )}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar - Próximas Consultas */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>
                📅 Próximas Consultas
              </Typography>

              {proximasConsultas.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <CalendarToday sx={{ fontSize: 60, color: 'text.disabled' }} />
                  <Typography color="text.secondary" mt={2}>
                    Nenhuma consulta agendada
                  </Typography>
                </Box>
              ) : (
                <List>
                  {proximasConsultas.map((consulta, index) => (
                    <Box key={consulta.id}>
                      <ListItem
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'action.hover' },
                          borderRadius: 1,
                        }}
                        onClick={() => {
                          setEditingConsulta(consulta);
                          setFormData({
                            animal: consulta.animal.toString(),
                            veterinario: consulta.veterinario.toString(),
                            clinica: consulta.clinica.toString(),
                            data: consulta.data,
                            horario: consulta.horario || '09:00',
                            motivo: consulta.motivo,
                            status: consulta.status,
                            observacoes: consulta.observacoes || '',
                          });
                          openModal();
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: getStatusColor(consulta.status) }}>
                            <Pets />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="body2" fontWeight={600}>
                                {consulta.animal_nome}
                              </Typography>
                              <Chip
                                label={getStatusLabel(consulta.status)}
                                size="small"
                                sx={{
                                  bgcolor: getStatusColor(consulta.status),
                                  color: 'white',
                                  fontSize: '0.65rem',
                                }}
                              />
                            </Stack>
                          }
                          secondary={
                            <>
                              <Typography variant="caption" display="block">
                                📍 {consulta.clinica_nome}
                              </Typography>
                              <Typography variant="caption" display="block">
                                👨‍⚕️ {consulta.veterinario_nome}
                              </Typography>
                              <Typography variant="caption" display="block" color="primary">
                                🕐 {new Date(consulta.data).toLocaleDateString('pt-BR')} às {consulta.horario}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                      {index < proximasConsultas.length - 1 && <Divider variant="inset" />}
                    </Box>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>

          {/* Estatísticas */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>
                📊 Estatísticas
              </Typography>
              <Stack spacing={2}>
                <Paper sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
                  <Typography variant="h4" fontWeight={700}>
                    {consultas.filter(c => c.status === 'AGENDADA').length}
                  </Typography>
                  <Typography variant="caption">Agendadas</Typography>
                </Paper>
                <Paper sx={{ p: 2, bgcolor: 'success.main', color: 'white' }}>
                  <Typography variant="h4" fontWeight={700}>
                    {consultas.filter(c => c.status === 'CONFIRMADA').length}
                  </Typography>
                  <Typography variant="caption">Confirmadas</Typography>
                </Paper>
                <Paper sx={{ p: 2, bgcolor: 'warning.main', color: 'white' }}>
                  <Typography variant="h4" fontWeight={700}>
                    {consultas.filter(c => c.data === hoje).length}
                  </Typography>
                  <Typography variant="caption">Hoje</Typography>
                </Paper>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Modal de Agendamento */}
      <Dialog open={showModal} onClose={closeModal} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">
                {editingConsulta ? '✏️ Editar Consulta' : '📅 Nova Consulta'}
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
                  label="Animal"
                  value={formData.animal}
                  onChange={(e) => setFormData({ ...formData, animal: e.target.value })}
                  required
                >
                  <MenuItem value="">Selecione um animal</MenuItem>
                  {animais.map((animal) => (
                    <MenuItem key={animal.id} value={animal.id}>
                      {animal.name} ({animal.species})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Veterinário"
                  value={formData.veterinario}
                  onChange={(e) => setFormData({ ...formData, veterinario: e.target.value })}
                  required
                >
                  <MenuItem value="">Selecione um veterinário</MenuItem>
                  {veterinarios.map((vet) => (
                    <MenuItem key={vet.id} value={vet.id}>
                      {vet.name} - {vet.crmv}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  select
                  label="Clínica"
                  value={formData.clinica}
                  onChange={(e) => setFormData({ ...formData, clinica: e.target.value })}
                  required
                >
                  <MenuItem value="">Selecione uma clínica</MenuItem>
                  {clinicas.map((clinica) => (
                    <MenuItem key={clinica.id} value={clinica.id}>
                      {clinica.nome}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="Data"
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  type="time"
                  label="Horário"
                  value={formData.horario}
                  onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  required
                >
                  <MenuItem value="AGENDADA">Agendada</MenuItem>
                  <MenuItem value="CONFIRMADA">Confirmada</MenuItem>
                  <MenuItem value="EM_ANDAMENTO">Em Andamento</MenuItem>
                  <MenuItem value="CONCLUIDA">Concluída</MenuItem>
                  <MenuItem value="CANCELADA">Cancelada</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Motivo da Consulta"
                  value={formData.motivo}
                  onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                  required
                  multiline
                  rows={2}
                  placeholder="Ex: Consulta de rotina, vacinação, exame..."
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Observações"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  multiline
                  rows={3}
                  placeholder="Observações adicionais..."
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions>
            {editingConsulta && (
              <Button
                color="error"
                startIcon={<Delete />}
                onClick={() => handleDelete(editingConsulta.id)}
              >
                Cancelar Consulta
              </Button>
            )}
            <Box flexGrow={1} />
            <Button onClick={closeModal}>Fechar</Button>
            <Button type="submit" variant="contained">
              {editingConsulta ? 'Salvar' : 'Agendar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
