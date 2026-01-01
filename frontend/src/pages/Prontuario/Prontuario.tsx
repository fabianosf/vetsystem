import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Card,
  CardContent,
  Stack,
  Chip,
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
  Divider,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,  
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import {
  Add,
  LocalHospital,
  Science,
  Vaccines,
  Description,
  Favorite,
  ThermostatAuto,
  MonitorWeight,
  Medication,
  MedicalServices,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const Prontuario: React.FC = () => {
  const [animais, setAnimais] = useState<any[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState<any>(null);
  const [prontuarios, setProntuarios] = useState<any[]>([]);
  const [vacinas, setVacinas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  // Dialogs
  const [openProntuarioDialog, setOpenProntuarioDialog] = useState(false);
  const [openVacinaDialog, setOpenVacinaDialog] = useState(false);
  const [openPrescricaoDialog, setOpenPrescricaoDialog] = useState(false);

  // Forms
  const [prontuarioForm, setProntuarioForm] = useState({
    tipo: 'consulta',
    data: new Date().toISOString().split('T')[0],
    motivo: '',
    sintomas: '',
    diagnostico: '',
    tratamento: '',
    observacoes: '',
    temperatura: '',
    peso: '',
    frequencia_cardiaca: '',
    frequencia_respiratoria: '',
  });

  const [vacinaForm, setVacinaForm] = useState({
    nome_vacina: 'V10',
    lote: '',
    fabricante: '',
    dose: '1ª dose',
    data_aplicacao: new Date().toISOString().split('T')[0],
    data_proxima_dose: '',
    veterinario_responsavel: '',
    observacoes: '',
  });

  const [prescricaoForm, setPrescricaoForm] = useState({
    prontuario: '',
    medicamento: '',
    dosagem: '',
    via_administracao: '',
    frequencia: '',
    duracao: '',
    data_inicio: new Date().toISOString().split('T')[0],
    data_fim: '',
    orientacoes: '',
  });

  useEffect(() => {
    fetchAnimais();
  }, []);

  useEffect(() => {
    if (selectedAnimal) {
      fetchProntuarios();
      fetchVacinas();
    }
  }, [selectedAnimal]);

  const fetchAnimais = async () => {
    try {
      const response = await api.get('/animais/');
      setAnimais(response.data.results || response.data || []);
    } catch (error) {
      console.error('Erro ao carregar animais:', error);
    }
  };

  const fetchProntuarios = async () => {
    if (!selectedAnimal) return;
    try {
      setLoading(true);
      const response = await api.get(`/prontuarios/?animal=${selectedAnimal.id}`);
      setProntuarios(response.data.results || response.data || []);
    } catch (error) {
      console.error('Erro ao carregar prontuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVacinas = async () => {
    if (!selectedAnimal) return;
    try {
      const response = await api.get(`/vacinas/?animal=${selectedAnimal.id}`);
      setVacinas(response.data.results || response.data || []);
    } catch (error) {
      console.error('Erro ao carregar vacinas:', error);
    }
  };

  const handleSaveProntuario = async () => {
    if (!selectedAnimal || !prontuarioForm.motivo) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    try {
      const dataToSend = {
        ...prontuarioForm,
        animal: selectedAnimal.id,
        data: `${prontuarioForm.data}T${new Date().toTimeString().split(' ')[0]}`,
      };

      await api.post('/prontuarios/', dataToSend);
      toast.success('Prontuário salvo com sucesso!');
      setOpenProntuarioDialog(false);
      fetchProntuarios();
      resetProntuarioForm();
    } catch (error: any) {
      console.error('Erro ao salvar prontuário:', error);
      toast.error('Erro ao salvar prontuário');
    }
  };

  const handleSaveVacina = async () => {
    if (!selectedAnimal || !vacinaForm.nome_vacina) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    try {
      await api.post('/vacinas/', {
        ...vacinaForm,
        animal: selectedAnimal.id,
      });

      toast.success('Vacina registrada com sucesso!');
      setOpenVacinaDialog(false);
      fetchVacinas();
      resetVacinaForm();
    } catch (error) {
      toast.error('Erro ao registrar vacina');
    }
  };

  const handleSavePrescricao = async () => {
    if (!prescricaoForm.prontuario || !prescricaoForm.medicamento) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    try {
      await api.post('/prescricoes/', prescricaoForm);
      toast.success('Prescrição adicionada com sucesso!');
      setOpenPrescricaoDialog(false);
      fetchProntuarios();
      resetPrescricaoForm();
    } catch (error) {
      toast.error('Erro ao adicionar prescrição');
    }
  };

  const resetProntuarioForm = () => {
    setProntuarioForm({
      tipo: 'consulta',
      data: new Date().toISOString().split('T')[0],
      motivo: '',
      sintomas: '',
      diagnostico: '',
      tratamento: '',
      observacoes: '',
      temperatura: '',
      peso: '',
      frequencia_cardiaca: '',
      frequencia_respiratoria: '',
    });
  };

  const resetVacinaForm = () => {
    setVacinaForm({
      nome_vacina: 'V10',
      lote: '',
      fabricante: '',
      dose: '1ª dose',
      data_aplicacao: new Date().toISOString().split('T')[0],
      data_proxima_dose: '',
      veterinario_responsavel: '',
      observacoes: '',
    });
  };

  const resetPrescricaoForm = () => {
    setPrescricaoForm({
      prontuario: '',
      medicamento: '',
      dosagem: '',
      via_administracao: '',
      frequencia: '',
      duracao: '',
      data_inicio: new Date().toISOString().split('T')[0],
      data_fim: '',
      orientacoes: '',
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getTipoIcon = (tipo: string) => {
    const icons: any = {
      consulta: <LocalHospital />,
      exame: <Science />,
      vacina: <Vaccines />,
      cirurgia: <MedicalServices />,
      internacao: <Favorite />,
      retorno: <Description />,
    };
    return icons[tipo] || <LocalHospital />;
  };

  const getTipoColor = (tipo: string): any => {
    const colors: any = {
      consulta: 'primary',
      exame: 'info',
      vacina: 'success',
      cirurgia: 'error',
      internacao: 'warning',
      retorno: 'secondary',
    };
    return colors[tipo] || 'default';
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
            <Description />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight={700}>
              Prontuário Eletrônico
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Histórico médico completo dos animais
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Seleção de Animal */}
      <Card sx={{ mb: 3, p: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Selecione o Animal</InputLabel>
          <Select
            value={selectedAnimal?.id || ''}
            onChange={(e) => {
              const animal = animais.find((a) => a.id === e.target.value);
              setSelectedAnimal(animal);
            }}
            label="Selecione o Animal"
          >
            <MenuItem value="">
              <em>Selecione um animal</em>
            </MenuItem>
            {animais.map((animal) => (
              <MenuItem key={animal.id} value={animal.id}>
                {animal.name} - {animal.species} ({animal.tutor?.name})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Card>

      {selectedAnimal && (
        <>
          {/* Info do Animal */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" flexWrap="wrap" gap={3}>
                <Box sx={{ width: { xs: '100%', md: '24%' } }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      src={selectedAnimal.photo_url}
                      sx={{ width: 80, height: 80, bgcolor: 'secondary.main' }}
                    >
                      {!selectedAnimal.photo_url && selectedAnimal.name[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        {selectedAnimal.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedAnimal.species} - {selectedAnimal.breed}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
                <Box sx={{ width: { xs: '100%', md: '74%' }, flexGrow: 1 }}>
                  <Box display="flex" flexWrap="wrap" gap={2}>
                    <Box sx={{ width: { xs: '48%', sm: '24%' } }}>
                      <Typography variant="caption" color="text.secondary">
                        Tutor
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {selectedAnimal.tutor?.name}
                      </Typography>
                    </Box>
                    <Box sx={{ width: { xs: '48%', sm: '24%' } }}>
                      <Typography variant="caption" color="text.secondary">
                        Peso
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {selectedAnimal.weight} kg
                      </Typography>
                    </Box>
                    <Box sx={{ width: { xs: '48%', sm: '24%' } }}>
                      <Typography variant="caption" color="text.secondary">
                        Cor
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {selectedAnimal.color}
                      </Typography>
                    </Box>
                    <Box sx={{ width: { xs: '48%', sm: '24%' } }}>
                      <Typography variant="caption" color="text.secondary">
                        Data de Nascimento
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {formatDate(selectedAnimal.birth_date)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Card>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={(_e, v) => setTabValue(v)}>
                <Tab icon={<Description />} label="Histórico" iconPosition="start" />
                <Tab icon={<Vaccines />} label="Vacinas" iconPosition="start" />
              </Tabs>
            </Box>

            {/* Tab: Histórico */}
            <TabPanel value={tabValue} index={0}>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setOpenProntuarioDialog(true)}
                >
                  Nova Entrada
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Medication />}
                  onClick={() => {
                    if (prontuarios.length > 0) {
                      setPrescricaoForm({ ...prescricaoForm, prontuario: prontuarios[0].id });
                      setOpenPrescricaoDialog(true);
                    } else {
                      toast.warning('Crie uma entrada no prontuário primeiro');
                    }
                  }}
                >
                  Adicionar Prescrição
                </Button>
              </Box>

              {loading ? (
                <Box textAlign="center" py={4}>
                  <CircularProgress />
                </Box>
              ) : prontuarios.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <Description sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography color="text.secondary">
                    Nenhum registro no prontuário
                  </Typography>
                </Box>
              ) : (
                <Timeline position="right">
                  {prontuarios.map((prontuario, index) => (
                    <TimelineItem key={prontuario.id}>
                      <TimelineOppositeContent color="text.secondary">
                        {formatDate(prontuario.data)}
                      </TimelineOppositeContent>
                      <TimelineSeparator>
                        <TimelineDot color={getTipoColor(prontuario.tipo)}>
                          {getTipoIcon(prontuario.tipo)}
                        </TimelineDot>
                        {index < prontuarios.length - 1 && <TimelineConnector />}
                      </TimelineSeparator>
                      <TimelineContent>
                        <Paper elevation={3} sx={{ p: 2 }}>
                          <Stack spacing={1}>
                            <Box display="flex" justifyContent="space-between">
                              <Typography variant="h6" fontWeight={600}>
                                {prontuario.tipo_display}
                              </Typography>
                              <Chip
                                label={prontuario.tipo_display}
                                color={getTipoColor(prontuario.tipo)}
                                size="small"
                              />
                            </Box>

                            <Typography variant="body2" color="text.secondary">
                              <strong>Motivo:</strong> {prontuario.motivo}
                            </Typography>

                            {prontuario.sintomas && (
                              <Typography variant="body2">
                                <strong>Sintomas:</strong> {prontuario.sintomas}
                              </Typography>
                            )}

                            {prontuario.diagnostico && (
                              <Typography variant="body2">
                                <strong>Diagnóstico:</strong> {prontuario.diagnostico}
                              </Typography>
                            )}

                            {prontuario.tratamento && (
                              <Typography variant="body2">
                                <strong>Tratamento:</strong> {prontuario.tratamento}
                              </Typography>
                            )}

                            {/* Sinais Vitais */}
                            {(prontuario.temperatura ||
                              prontuario.peso ||
                              prontuario.frequencia_cardiaca ||
                              prontuario.frequencia_respiratoria) && (
                              <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                                <Typography variant="caption" fontWeight={600}>
                                  Sinais Vitais:
                                </Typography>
                                <Box display="flex" flexWrap="wrap" gap={1} sx={{ mt: 0.5 }}>
                                  {prontuario.temperatura && (
                                    <Box sx={{ width: '48%' }}>
                                      <Stack direction="row" spacing={0.5} alignItems="center">
                                        <ThermostatAuto fontSize="small" />
                                        <Typography variant="caption">
                                          {prontuario.temperatura}°C
                                        </Typography>
                                      </Stack>
                                    </Box>
                                  )}
                                  {prontuario.peso && (
                                    <Box sx={{ width: '48%' }}>
                                      <Stack direction="row" spacing={0.5} alignItems="center">
                                        <MonitorWeight fontSize="small" />
                                        <Typography variant="caption">
                                          {prontuario.peso} kg
                                        </Typography>
                                      </Stack>
                                    </Box>
                                  )}
                                  {prontuario.frequencia_cardiaca && (
                                    <Box sx={{ width: '48%' }}>
                                      <Stack direction="row" spacing={0.5} alignItems="center">
                                        <Favorite fontSize="small" />
                                        <Typography variant="caption">
                                          FC: {prontuario.frequencia_cardiaca} bpm
                                        </Typography>
                                      </Stack>
                                    </Box>
                                  )}
                                  {prontuario.frequencia_respiratoria && (
                                    <Box sx={{ width: '48%' }}>
                                      <Typography variant="caption">
                                        FR: {prontuario.frequencia_respiratoria} rpm
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>
                              </Box>
                            )}

                            {/* Prescrições */}
                            {prontuario.prescricoes?.length > 0 && (
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="caption" fontWeight={600}>
                                  Prescrições:
                                </Typography>
                                {prontuario.prescricoes.map((presc: any) => (
                                  <Chip
                                    key={presc.id}
                                    icon={<Medication />}
                                    label={`${presc.medicamento} - ${presc.dosagem}`}
                                    size="small"
                                    sx={{ mr: 0.5, mt: 0.5 }}
                                  />
                                ))}
                              </Box>
                            )}

                            {prontuario.veterinario_nome && (
                              <Typography variant="caption" color="text.secondary">
                                Veterinário: {prontuario.veterinario_nome}
                              </Typography>
                            )}
                          </Stack>
                        </Paper>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              )}
            </TabPanel>

            {/* Tab: Vacinas */}
            <TabPanel value={tabValue} index={1}>
              <Box display="flex" justifyContent="flex-end" mb={2}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setOpenVacinaDialog(true)}
                >
                  Registrar Vacina
                </Button>
              </Box>

              {vacinas.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <Vaccines sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography color="text.secondary">Nenhuma vacina registrada</Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.50' }}>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight={700}>
                            Vacina
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight={700}>
                            Data Aplicação
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight={700}>
                            Próxima Dose
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight={700}>
                            Lote
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight={700}>
                            Dose
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {vacinas.map((vacina) => (
                        <TableRow key={vacina.id} hover>
                          <TableCell>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Vaccines color="success" />
                              <Box>
                                <Typography variant="body2" fontWeight={600}>
                                  {vacina.nome_vacina}
                                </Typography>
                                {vacina.fabricante && (
                                  <Typography variant="caption" color="text.secondary">
                                    {vacina.fabricante}
                                  </Typography>
                                )}
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell>{formatDate(vacina.data_aplicacao)}</TableCell>
                          <TableCell>
                            {vacina.data_proxima_dose ? (
                              <Chip
                                label={formatDate(vacina.data_proxima_dose)}
                                color="warning"
                                size="small"
                              />
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>{vacina.lote || '-'}</TableCell>
                          <TableCell>{vacina.dose || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </TabPanel>
          </Card>
        </>
      )}

      {/* Dialog: Novo Prontuário */}
      <Dialog
        open={openProntuarioDialog}
        onClose={() => setOpenProntuarioDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <Add />
            <Typography variant="h6" fontWeight={600}>
              Nova Entrada no Prontuário
            </Typography>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <Box display="flex" flexWrap="wrap" gap={2}>
              <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
                <FormControl fullWidth required>
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    value={prontuarioForm.tipo}
                    onChange={(e) =>
                      setProntuarioForm({ ...prontuarioForm, tipo: e.target.value })
                    }
                    label="Tipo"
                  >
                    <MenuItem value="consulta">Consulta</MenuItem>
                    <MenuItem value="exame">Exame</MenuItem>
                    <MenuItem value="vacina">Vacina</MenuItem>
                    <MenuItem value="cirurgia">Cirurgia</MenuItem>
                    <MenuItem value="internacao">Internação</MenuItem>
                    <MenuItem value="retorno">Retorno</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
                <TextField
                  fullWidth
                  required
                  type="date"
                  label="Data"
                  value={prontuarioForm.data}
                  onChange={(e) =>
                    setProntuarioForm({ ...prontuarioForm, data: e.target.value })
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            </Box>

            <TextField
              fullWidth
              required
              multiline
              rows={2}
              label="Motivo"
              value={prontuarioForm.motivo}
              onChange={(e) =>
                setProntuarioForm({ ...prontuarioForm, motivo: e.target.value })
              }
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Sintomas"
              value={prontuarioForm.sintomas}
              onChange={(e) =>
                setProntuarioForm({ ...prontuarioForm, sintomas: e.target.value })
              }
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Diagnóstico"
              value={prontuarioForm.diagnostico}
              onChange={(e) =>
                setProntuarioForm({ ...prontuarioForm, diagnostico: e.target.value })
              }
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Tratamento"
              value={prontuarioForm.tratamento}
              onChange={(e) =>
                setProntuarioForm({ ...prontuarioForm, tratamento: e.target.value })
              }
            />

            <Divider />
            <Typography variant="subtitle2" fontWeight={600}>
              Sinais Vitais
            </Typography>

            <Box display="flex" flexWrap="wrap" gap={2}>
              <Box sx={{ width: { xs: '48%', sm: '24%' } }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Temperatura (°C)"
                  value={prontuarioForm.temperatura}
                  onChange={(e) =>
                    setProntuarioForm({ ...prontuarioForm, temperatura: e.target.value })
                  }
                  InputProps={{ inputProps: { step: 0.1 } }}
                />
              </Box>
              <Box sx={{ width: { xs: '48%', sm: '24%' } }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Peso (kg)"
                  value={prontuarioForm.peso}
                  onChange={(e) =>
                    setProntuarioForm({ ...prontuarioForm, peso: e.target.value })
                  }
                  InputProps={{ inputProps: { step: 0.1 } }}
                />
              </Box>
              <Box sx={{ width: { xs: '48%', sm: '24%' } }}>
                <TextField
                  fullWidth
                  type="number"
                  label="FC (bpm)"
                  value={prontuarioForm.frequencia_cardiaca}
                  onChange={(e) =>
                    setProntuarioForm({
                      ...prontuarioForm,
                      frequencia_cardiaca: e.target.value,
                    })
                  }
                />
              </Box>
              <Box sx={{ width: { xs: '48%', sm: '24%' } }}>
                <TextField
                  fullWidth
                  type="number"
                  label="FR (rpm)"
                  value={prontuarioForm.frequencia_respiratoria}
                  onChange={(e) =>
                    setProntuarioForm({
                      ...prontuarioForm,
                      frequencia_respiratoria: e.target.value,
                    })
                  }
                />
              </Box>
            </Box>

            <TextField
              fullWidth
              multiline
              rows={2}
              label="Observações"
              value={prontuarioForm.observacoes}
              onChange={(e) =>
                setProntuarioForm({ ...prontuarioForm, observacoes: e.target.value })
              }
            />
          </Stack>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenProntuarioDialog(false)} variant="outlined">
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleSaveProntuario}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Nova Vacina */}
      <Dialog
        open={openVacinaDialog}
        onClose={() => setOpenVacinaDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <Vaccines />
            <Typography variant="h6" fontWeight={600}>
              Registrar Vacina
            </Typography>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Tipo de Vacina</InputLabel>
              <Select
                value={vacinaForm.nome_vacina}
                onChange={(e) => setVacinaForm({ ...vacinaForm, nome_vacina: e.target.value })}
                label="Tipo de Vacina"
              >
                <MenuItem value="V10">Vacina V10 (Cães)</MenuItem>
                <MenuItem value="V8">Vacina V8 (Cães)</MenuItem>
                <MenuItem value="RAIVA">Vacina Antirrábica</MenuItem>
                <MenuItem value="GRIPE_CANINA">Gripe Canina</MenuItem>
                <MenuItem value="V3">Vacina V3 (Gatos)</MenuItem>
                <MenuItem value="V4">Vacina V4 (Gatos)</MenuItem>
                <MenuItem value="V5">Vacina V5 (Gatos)</MenuItem>
                <MenuItem value="LEUCEMIA_FELINA">Leucemia Felina</MenuItem>
                <MenuItem value="OUTRA">Outra</MenuItem>
              </Select>
            </FormControl>

            <Box display="flex" flexWrap="wrap" gap={2}>
              <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
                <TextField
                  fullWidth
                  label="Lote"
                  value={vacinaForm.lote}
                  onChange={(e) => setVacinaForm({ ...vacinaForm, lote: e.target.value })}
                />
              </Box>
              <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
                <TextField
                  fullWidth
                  label="Fabricante"
                  value={vacinaForm.fabricante}
                  onChange={(e) => setVacinaForm({ ...vacinaForm, fabricante: e.target.value })}
                />
              </Box>
            </Box>

            <TextField
              fullWidth
              required
              label="Dose"
              value={vacinaForm.dose}
              onChange={(e) => setVacinaForm({ ...vacinaForm, dose: e.target.value })}
              placeholder="Ex: 1ª dose, 2ª dose, Reforço anual"
            />

            <Box display="flex" flexWrap="wrap" gap={2}>
              <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
                <TextField
                  fullWidth
                  required
                  type="date"
                  label="Data de Aplicação"
                  value={vacinaForm.data_aplicacao}
                  onChange={(e) =>
                    setVacinaForm({ ...vacinaForm, data_aplicacao: e.target.value })
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
              <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
                <TextField
                  fullWidth
                  type="date"
                  label="Próxima Dose"
                  value={vacinaForm.data_proxima_dose}
                  onChange={(e) =>
                    setVacinaForm({ ...vacinaForm, data_proxima_dose: e.target.value })
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            </Box>

            <TextField
              fullWidth
              label="Veterinário Responsável"
              value={vacinaForm.veterinario_responsavel}
              onChange={(e) =>
                setVacinaForm({ ...vacinaForm, veterinario_responsavel: e.target.value })
              }
            />

            <TextField
              fullWidth
              multiline
              rows={2}
              label="Observações"
              value={vacinaForm.observacoes}
              onChange={(e) => setVacinaForm({ ...vacinaForm, observacoes: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenVacinaDialog(false)} variant="outlined">
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleSaveVacina}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Nova Prescrição */}
      <Dialog
        open={openPrescricaoDialog}
        onClose={() => setOpenPrescricaoDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <Medication />
            <Typography variant="h6" fontWeight={600}>
              Adicionar Prescrição
            </Typography>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Prontuário</InputLabel>
              <Select
                value={prescricaoForm.prontuario}
                onChange={(e) =>
                  setPrescricaoForm({ ...prescricaoForm, prontuario: e.target.value })
                }
                label="Prontuário"
              >
                {prontuarios.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {formatDate(p.data)} - {p.tipo_display}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              required
              label="Medicamento"
              value={prescricaoForm.medicamento}
              onChange={(e) =>
                setPrescricaoForm({ ...prescricaoForm, medicamento: e.target.value })
              }
            />

            <Box display="flex" flexWrap="wrap" gap={2}>
              <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
                <TextField
                  fullWidth
                  required
                  label="Dosagem"
                  value={prescricaoForm.dosagem}
                  onChange={(e) =>
                    setPrescricaoForm({ ...prescricaoForm, dosagem: e.target.value })
                  }
                  placeholder="Ex: 10mg"
                />
              </Box>
              <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
                <TextField
                  fullWidth
                  required
                  label="Via de Administração"
                  value={prescricaoForm.via_administracao}
                  onChange={(e) =>
                    setPrescricaoForm({ ...prescricaoForm, via_administracao: e.target.value })
                  }
                  placeholder="Ex: Oral, Injetável"
                />
              </Box>
            </Box>

            <Box display="flex" flexWrap="wrap" gap={2}>
              <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
                <TextField
                  fullWidth
                  required
                  label="Frequência"
                  value={prescricaoForm.frequencia}
                  onChange={(e) =>
                    setPrescricaoForm({ ...prescricaoForm, frequencia: e.target.value })
                  }
                  placeholder="Ex: 2x ao dia"
                />
              </Box>
              <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
                <TextField
                  fullWidth
                  required
                  label="Duração"
                  value={prescricaoForm.duracao}
                  onChange={(e) =>
                    setPrescricaoForm({ ...prescricaoForm, duracao: e.target.value })
                  }
                  placeholder="Ex: 7 dias"
                />
              </Box>
            </Box>

            <Box display="flex" flexWrap="wrap" gap={2}>
              <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
                <TextField
                  fullWidth
                  required
                  type="date"
                  label="Data de Início"
                  value={prescricaoForm.data_inicio}
                  onChange={(e) =>
                    setPrescricaoForm({ ...prescricaoForm, data_inicio: e.target.value })
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
              <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
                <TextField
                  fullWidth
                  type="date"
                  label="Data de Término"
                  value={prescricaoForm.data_fim}
                  onChange={(e) =>
                    setPrescricaoForm({ ...prescricaoForm, data_fim: e.target.value })
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            </Box>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Orientações"
              value={prescricaoForm.orientacoes}
              onChange={(e) =>
                setPrescricaoForm({ ...prescricaoForm, orientacoes: e.target.value })
              }
              placeholder="Instruções de uso, precauções..."
            />
          </Stack>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenPrescricaoDialog(false)} variant="outlined">
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleSavePrescricao}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Prontuario;
