// src/pages/Configuracoes/index.tsx
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Stack,
  FormControlLabel,
  Switch,
  Checkbox,
} from '@mui/material';
import { useTheme } from '../../contexts/ThemeContext';

const ConfiguracoesPage: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [emailNotif, setEmailNotif] = React.useState(true);
  const [systemNotif, setSystemNotif] = React.useState(true);

  return (
    <Stack spacing={3}>
      <Typography variant="h5" fontWeight={600}>
        Configurações
      </Typography>

      <Card>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Aparência
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={isDarkMode}
                onChange={toggleTheme}
              />
            }
            label={isDarkMode ? 'Tema escuro' : 'Tema claro'}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Notificações
          </Typography>
          <Stack>
            <FormControlLabel
              control={
                <Checkbox
                  checked={emailNotif}
                  onChange={(e) => setEmailNotif(e.target.checked)}
                />
              }
              label="Receber notificações por e-mail"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={systemNotif}
                  onChange={(e) => setSystemNotif(e.target.checked)}
                />
              }
              label="Mostrar alertas dentro do sistema"
            />
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default ConfiguracoesPage;
