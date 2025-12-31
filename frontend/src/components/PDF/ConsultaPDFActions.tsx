import React, { useState } from 'react';
import {
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  Description as RelatorioIcon,
  Assignment as PrescricaoIcon,
  VerifiedUser as AtestadoIcon,
  ExpandMore as ExpandIcon,
} from '@mui/icons-material';
import { pdfService } from '../../services/pdfService';
import { PrescricaoDialog } from './PrescricaoDialog';
import { AtestadoDialog } from './AtestadoDialog';

interface ConsultaPDFActionsProps {
  consultaId: number;
}

export const ConsultaPDFActions: React.FC<ConsultaPDFActionsProps> = ({ consultaId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [prescricaoOpen, setPrescricaoOpen] = useState(false);
  const [atestadoOpen, setAtestadoOpen] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDownloadRelatorio = async () => {
    handleMenuClose();
    try {
      setLoading(true);
      setError(null);
      await pdfService.downloadRelatorioConsulta(consultaId);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao gerar PDF');
    } finally {
      setLoading(false);
    }
  };

  const handlePrescricao = (medicamentos: any[]) => {
    handleMenuClose();
    setLoading(true);
    pdfService
      .downloadPrescricao(consultaId, medicamentos)
      .then(() => setSuccess(true))
      .catch((err) => setError(err.response?.data?.message || 'Erro ao gerar prescrição'))
      .finally(() => setLoading(false));
  };

  const handleAtestado = (
    tipo: 'saude' | 'comparecimento',
    diasRepouso?: number,
    observacoes?: string
  ) => {
    handleMenuClose();
    setLoading(true);
    pdfService
      .downloadAtestado(consultaId, tipo, diasRepouso, observacoes)
      .then(() => setSuccess(true))
      .catch((err) => setError(err.response?.data?.message || 'Erro ao gerar atestado'))
      .finally(() => setLoading(false));
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={loading ? <CircularProgress size={20} /> : <PdfIcon />}
        endIcon={<ExpandIcon />}
        onClick={handleMenuOpen}
        disabled={loading}
      >
        Gerar PDF
      </Button>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleDownloadRelatorio}>
          <ListItemIcon>
            <RelatorioIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Relatório da Consulta</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose();
            setPrescricaoOpen(true);
          }}
        >
          <ListItemIcon>
            <PrescricaoIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Prescrição Médica</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose();
            setAtestadoOpen(true);
          }}
        >
          <ListItemIcon>
            <AtestadoIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Atestado</ListItemText>
        </MenuItem>
      </Menu>

      <PrescricaoDialog
        open={prescricaoOpen}
        onClose={() => setPrescricaoOpen(false)}
        onConfirm={handlePrescricao}
      />

      <AtestadoDialog
        open={atestadoOpen}
        onClose={() => setAtestadoOpen(false)}
        onConfirm={handleAtestado}
      />

      <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)}>
        <Alert severity="success">PDF gerado com sucesso!</Alert>
      </Snackbar>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert severity="error">{error}</Alert>
      </Snackbar>
    </>
  );
};
 
