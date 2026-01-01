import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  FormControlLabel,
  Switch,
  Checkbox,
  Divider,
  Paper,
  Button,
  TextField,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  Settings,
  Palette,
  Notifications,
  Language,
  Security,
  Save,
} from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from 'react-toastify';

const ConfiguracoesPage: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [emailNotif, setEmailNotif] = useState(true);
  const [systemNotif, setSystemNotif] = useState(true);
  const [agendamentoNotif, setAgendamentoNotif] = useState(true);
  const [consultaNotif, setConsultaNotif] = useState(true);
  const [idioma, setIdioma] = useState('pt-BR');
  const [timezone, setTimezone] = useState('America/Sao_Paulo');
  const [autoSave, setAutoSave] = useState(true);

  const handleSavePreferences = () => {
    // Aqui você salvaria as preferências no backend ou localStorage
    toast.success('Configurações salvas com sucesso!');
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Settings sx={{ fontSize: 40, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Configurações
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Personalize sua experiência no sistema
          </Typography>
        </Box>
      </Box>

      <Stack spacing={3}>
        {/* Aparência */}
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Palette color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Aparência
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={isDarkMode}
                    onChange={toggleTheme}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1" fontWeight={500}>
                      {isDarkMode ? 'Tema Escuro' : 'Tema Claro'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Altere o tema visual do sistema para sua preferência
                    </Typography>
                  </Box>
                }
              />
            </Box>
          </CardContent>
        </Card>

        {/* Notificações */}
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Notifications color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Notificações
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={emailNotif}
                    onChange={(e) => setEmailNotif(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1" fontWeight={500}>
                      Notificações por E-mail
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Receba atualizações importantes por e-mail
                    </Typography>
                  </Box>
                }
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={systemNotif}
                    onChange={(e) => setSystemNotif(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1" fontWeight={500}>
                      Alertas no Sistema
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Exibir notificações dentro da plataforma
                    </Typography>
                  </Box>
                }
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={agendamentoNotif}
                    onChange={(e) => setAgendamentoNotif(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1" fontWeight={500}>
                      Lembretes de Agendamento
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Receba lembretes antes das consultas agendadas
                    </Typography>
                  </Box>
                }
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={consultaNotif}
                    onChange={(e) => setConsultaNotif(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1" fontWeight={500}>
                      Atualizações de Consulta
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Notificações sobre mudanças nas consultas
                    </Typography>
                  </Box>
                }
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Regionalização */}
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Language color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Regionalização
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Idioma do Sistema
                </Typography>
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={idioma}
                  onChange={(e) => setIdioma(e.target.value)}
                >
                  <MenuItem value="pt-BR">Português (Brasil)</MenuItem>
                  <MenuItem value="en-US">English (US)</MenuItem>
                  <MenuItem value="es-ES">Español</MenuItem>
                </TextField>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Fuso Horário
                </Typography>
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                >
                  <MenuItem value="America/Sao_Paulo">Brasília (GMT-3)</MenuItem>
                  <MenuItem value="America/New_York">New York (GMT-5)</MenuItem>
                  <MenuItem value="Europe/London">London (GMT+0)</MenuItem>
                </TextField>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Sistema */}
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Security color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Sistema
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={autoSave}
                    onChange={(e) => setAutoSave(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1" fontWeight={500}>
                      Auto Salvar
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Salvar automaticamente alterações em formulários
                    </Typography>
                  </Box>
                }
              />

              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Dica:</strong> Mantenha suas configurações atualizadas para uma melhor 
                  experiência no sistema.
                </Typography>
              </Alert>
            </Stack>
          </CardContent>
        </Card>

        {/* Botão Salvar */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            bgcolor: 'primary.50',
            border: '1px solid',
            borderColor: 'primary.200',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSavePreferences}
            size="large"
          >
            Salvar Configurações
          </Button>
        </Paper>
      </Stack>
    </Box>
  );
};

export default ConfiguracoesPage;
