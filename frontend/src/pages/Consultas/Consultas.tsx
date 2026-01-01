import React from 'react';
import {
  Box,
  Typography,
  Paper,
} from '@mui/material';
import { MedicalServices } from '@mui/icons-material';

const Consultas: React.FC = () => {
  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <MedicalServices sx={{ fontSize: 40, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Consultas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie as consultas veterinárias
          </Typography>
        </Box>
      </Box>

      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <MedicalServices sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Módulo de Consultas em desenvolvimento
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          Em breve você poderá gerenciar todas as consultas por aqui
        </Typography>
      </Paper>
    </Box>
  );
};

export default Consultas;
