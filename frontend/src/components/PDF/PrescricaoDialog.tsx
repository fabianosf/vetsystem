import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

interface Medicamento {
  nome: string;
  dosagem: string;
  frequencia: string;
  duracao: string;
}

interface PrescricaoDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (medicamentos: Medicamento[]) => void;
}

export const PrescricaoDialog: React.FC<PrescricaoDialogProps> = ({
  open,
  onClose,
  onConfirm,
}) => {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([
    { nome: '', dosagem: '', frequencia: '', duracao: '' },
  ]);

  const handleAddMedicamento = () => {
    setMedicamentos([
      ...medicamentos,
      { nome: '', dosagem: '', frequencia: '', duracao: '' },
    ]);
  };

  const handleRemoveMedicamento = (index: number) => {
    setMedicamentos(medicamentos.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: keyof Medicamento, value: string) => {
    const newMedicamentos = [...medicamentos];
    newMedicamentos[index][field] = value;
    setMedicamentos(newMedicamentos);
  };

  const handleConfirm = () => {
    const validMedicamentos = medicamentos.filter((m) => m.nome.trim() !== '');
    onConfirm(validMedicamentos);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Gerar Prescrição Médica</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Adicione os medicamentos prescritos para o animal
        </Typography>

        {medicamentos.map((med, index) => (
          <Box
            key={index}
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr) auto' },
              gap: 2,
              mb: 2,
              p: 2,
              border: '1px solid #e0e0e0',
              borderRadius: 1,
            }}
          >
            <TextField
              label="Medicamento"
              value={med.nome}
              onChange={(e) => handleChange(index, 'nome', e.target.value)}
              size="small"
              required
            />
            <TextField
              label="Dosagem"
              value={med.dosagem}
              onChange={(e) => handleChange(index, 'dosagem', e.target.value)}
              placeholder="Ex: 1 comprimido"
              size="small"
            />
            <TextField
              label="Frequência"
              value={med.frequencia}
              onChange={(e) => handleChange(index, 'frequencia', e.target.value)}
              placeholder="Ex: 2x ao dia"
              size="small"
            />
            <TextField
              label="Duração"
              value={med.duracao}
              onChange={(e) => handleChange(index, 'duracao', e.target.value)}
              placeholder="Ex: 7 dias"
              size="small"
            />
            <IconButton
              onClick={() => handleRemoveMedicamento(index)}
              disabled={medicamentos.length === 1}
              color="error"
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}

        <Button
          startIcon={<AddIcon />}
          onClick={handleAddMedicamento}
          variant="outlined"
          fullWidth
        >
          Adicionar Medicamento
        </Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleConfirm} variant="contained" color="primary">
          Gerar Prescrição
        </Button>
      </DialogActions>
    </Dialog>
  );
};
