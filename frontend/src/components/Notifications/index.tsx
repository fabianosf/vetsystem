// src/pages/Notificacoes/index.tsx
import React, { useState } from 'react';
import {
  Box,
  Container,
  Tabs,
  Tab,
  Paper,
  Typography,
} from '@mui/material';
import { NotificacaoForm } from '../../components/Notifications/NotificacaoForm';
import { NotificacaoList } from '../../components/Notifications/NotificacaoList';
import { NotificacaoDashboard } from '../../components/Notifications/NotificacaoDashboard';

export const NotificacoesPage: React.FC = () => {
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Notificações (Email / WhatsApp)
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabIndex}
          onChange={(_, newValue) => setTabIndex(newValue)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Enviar" />
          <Tab label="Histórico" />
          <Tab label="Dashboard" />
        </Tabs>
      </Paper>

      <Box>
        {tabIndex === 0 && (
          <NotificacaoForm
            onSuccess={() => {
              setTabIndex(1);
            }}
          />
        )}
        {tabIndex === 1 && <NotificacaoList />}
        {tabIndex === 2 && <NotificacaoDashboard />}
      </Box>
    </Container>
  );
};
