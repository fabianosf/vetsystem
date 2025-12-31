import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';

interface AtestadoDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (tipo: 'saude' | 'comparecimento', diasRepouso?: number, observacoes?: string) => void;
}

export const AtestadoDialog: React.FC<AtestadoDialogProps> = ({
  open,
  onClose,
  onConfirm,
}) => {
  const [tipo, setTipo] = useState<'saude' | 'comparecimento'>('saude');
  const [diasRepouso, setDiasRepouso] = useState<string>('');
  const [observacoes, setObservacoes] = useState<string>('');

  const handleConfirm = () => {
    onConfirm(
      tipo,
      diasRepouso ? parseInt(diasRepouso) : undefined,
      observacoes || undefined
    );
    onClose();
    // Reset
    setTipo('saude');
    setDiasRepouso('');
    setObservacoes('');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Gerar Atestado</DialogTitle>
      <DialogContent>
        <FormControl component="fieldset" fullWidth sx={{ mb: 3, mt: 1 }}>
          <FormLabel component="legend">Tipo de Atestado</FormLabel>
          <RadioGroup
            value={tipo}
            onChange={(e) => setTipo(e.target.value as 'saude' | 'comparecimento')}
          >
            <FormControlLabel value="saude" control={<Radio />} label="Atestado de Saúde" />
            <FormControlLabel
              value="comparecimento"
              control={<Radio />}
              label="Atestado de Comparecimento"
            />
          </RadioGroup>
        </FormControl>

        {tipo === 'saude' && (
          <TextField
            label="Dias de Repouso (opcional)"
            type="number"
            value={diasRepouso}
            onChange={(e) => setDiasRepouso(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            helperText="Deixe em branco se não houver necessidade de repouso"
          />
        )}

        <TextField
          label="Observações (opcional)"
          multiline
          rows={4}
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          fullWidth
          placeholder="Adicione observações adicionais ao atestado..."
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleConfirm} variant="contained" color="primary">
          Gerar Atestado
        </Button>
      </DialogActions>
    </Dialog>
  );
};

