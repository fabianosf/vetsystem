import React, { useState } from 'react';
import { Button, CircularProgress, Alert, Snackbar } from '@mui/material';
import { PictureAsPdf as PdfIcon } from '@mui/icons-material';
import { pdfService } from '../../services/pdfService';

interface AnimalPDFActionsProps {
  animalId: number;
}

export const AnimalPDFActions: React.FC<AnimalPDFActionsProps> = ({ animalId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleDownloadFicha = async () => {
    try {
      setLoading(true);
      setError(null);
      await pdfService.downloadFichaAnimal(animalId);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao gerar PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={loading ? <CircularProgress size={20} /> : <PdfIcon />}
        onClick={handleDownloadFicha}
        disabled={loading}
      >
        {loading ? 'Gerando...' : 'Baixar Ficha (PDF)'}
      </Button>

      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success">PDF gerado com sucesso!</Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error">{error}</Alert>
      </Snackbar>
    </>
  );
};

