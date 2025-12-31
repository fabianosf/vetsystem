// src/components/Notificacoes/NotificacaoForm.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Alert,
  Stack,
  Chip,
  CircularProgress,
} from '@mui/material';
import { Email as EmailIcon, WhatsApp as WhatsAppIcon } from '@mui/icons-material';
import api from '../../services/api';

interface Tutor {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
}

interface NotificacaoFormProps {
  onSuccess?: () => void;
}

export const NotificacaoForm: React.FC<NotificacaoFormProps> = ({ onSuccess }) => {
  const [tutores, setTutores] = useState<Tutor[]>([]);
  const [loadingTutores, setLoadingTutores] = useState(true);

  const [tutorId, setTutorId] = useState<number | ''>('');
  const [tipo, setTipo] = useState<'email' | 'whatsapp' | ''>('');
  const [assunto, setAssunto] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadTutores();
  }, []);

  const loadTutores = async () => {
    try {
      const response = await api.get('/tutores/');
      setTutores(response.data.results || response.data);
    } catch (error) {
      console.error('Erro ao carregar tutores:', error);
      setErrorMsg('Erro ao carregar lista de tutores');
    } finally {
      setLoadingTutores(false);
    }
  };

  const handleSubmit = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!tutorId || !tipo || !mensagem.trim()) {
      setErrorMsg('Selecione tutor, tipo e preencha a mensagem');
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        tutor_id: tutorId,
        tipo,
        mensagem,
      };
      if (tipo === 'email') {
        payload.assunto = assunto || 'Mensagem do VetSystem';
      }

      const response = await api.post('/notificacoes/custom/', payload);
      if (response.data.success) {
        setSuccessMsg(response.data.message || 'Notificação enviada com sucesso');
        setMensagem('');
        if (tipo === 'email') setAssunto('');
        if (onSuccess) onSuccess();
      } else {
        setErrorMsg(response.data.erro || 'Falha ao enviar notificação');
      }
    } catch (error: any) {
      console.error('Erro ao enviar notificação:', error);
      setErrorMsg(error.response?.data?.error || 'Erro ao enviar notificação');
    } finally {
      setLoading(false);
    }
  };

  const selectedTutor = tutores.find((t) => t.id === tutorId);

  return (
    <Card>
      <CardContent>
        <Stack spacing={3}>
          <Typography variant="h6">Enviar Notificação</Typography>

          {errorMsg && <Alert severity="error">{errorMsg}</Alert>}
          {successMsg && <Alert severity="success">{successMsg}</Alert>}

          {/* Seleção de tutor */}
          <FormControl fullWidth>
            <InputLabel>Tutor</InputLabel>
            <Select
              value={tutorId}
              label="Tutor"
              onChange={(e) => setTutorId(e.target.value as number | '')}
            >
              {loadingTutores && (
                <MenuItem value="">
                  <CircularProgress size={16} sx={{ mr: 1 }} /> Carregando...
                </MenuItem>
              )}
              {!loadingTutores &&
                tutores.map((tutor) => (
                  <MenuItem key={tutor.id} value={tutor.id}>
                    {tutor.name} ({tutor.email || 'sem email'} / {tutor.phone || 'sem telefone'})
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          {/* Info rápida do tutor */}
          {selectedTutor && (
            <Stack direction="row" spacing={1}>
              {selectedTutor.email && <Chip icon={<EmailIcon />} label={selectedTutor.email} />}
              {selectedTutor.phone && <Chip icon={<WhatsAppIcon />} label={selectedTutor.phone} />}
            </Stack>
          )}

          {/* Tipo */}
          <FormControl fullWidth>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={tipo}
              label="Tipo"
              onChange={(e) => setTipo(e.target.value as 'email' | 'whatsapp' | '')}
            >
              <MenuItem value="email">
                <EmailIcon fontSize="small" style={{ marginRight: 8 }} /> Email
              </MenuItem>
              <MenuItem value="whatsapp">
                <WhatsAppIcon fontSize="small" style={{ marginRight: 8 }} /> WhatsApp
              </MenuItem>
            </Select>
          </FormControl>

          {/* Assunto (apenas email) */}
          {tipo === 'email' && (
            <TextField
              label="Assunto"
              fullWidth
              value={assunto}
              onChange={(e) => setAssunto(e.target.value)}
            />
          )}

          {/* Mensagem */}
          <TextField
            label="Mensagem"
            fullWidth
            multiline
            minRows={4}
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            placeholder="Digite a mensagem a ser enviada ao tutor..."
          />

          <Box display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar Notificação'}
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};
