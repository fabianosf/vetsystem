import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  CheckCircle as ValidadoIcon,
  HourglassEmpty as PendenteIcon,
  Visibility as ViewIcon,
  ThumbUp as ValidarIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'react-toastify';
import api from '../../services/api';

interface Diagnostico {
  id: number;
  animal: {
    id: number;
    name: string;
    species: string;
  };
  imagem: string;
  classe_predita: string;
  confianca: number;
  validado: boolean;
  validado_por: string | null;
  data_validacao: string | null;
  observacoes: string;
  created_at: string;
  resultado: any;
}

export const DiagnosticoList: React.FC = () => {
  const [diagnosticos, setDiagnosticos] = useState<Diagnostico[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDiagnostico, setSelectedDiagnostico] = useState<Diagnostico | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [validarDialogOpen, setValidarDialogOpen] = useState(false);
  const [observacoes, setObservacoes] = useState('');
  const [validando, setValidando] = useState(false);

  useEffect(() => {
    loadDiagnosticos();
  }, []);

  const loadDiagnosticos = async () => {
    setLoading(true);
    try {
      const response = await api.get('/diagnosticos/');
      const data = response.data.results || response.data || [];
      setDiagnosticos(data);
    } catch (error) {
      console.error('Erro ao carregar diagnósticos:', error);
      toast.error('Erro ao carregar diagnósticos');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (diagnostico: Diagnostico) => {
    setSelectedDiagnostico(diagnostico);
    setDialogOpen(true);
  };

  const handleOpenValidar = (diagnostico: Diagnostico) => {
    setSelectedDiagnostico(diagnostico);
    setObservacoes('');
    setValidarDialogOpen(true);
  };

  const handleValidar = async () => {
    if (!selectedDiagnostico) return;

    setValidando(true);
    try {
      await api.post(`/diagnosticos/${selectedDiagnostico.id}/validar/`, {
        aprovado: true,
        observacoes_vet: observacoes,
      });

      toast.success('Diagnóstico validado com sucesso!');
      setValidarDialogOpen(false);
      setObservacoes('');
      loadDiagnosticos();
    } catch (error: any) {
      console.error('Erro ao validar diagnóstico:', error);
      toast.error(error.response?.data?.error || 'Erro ao validar diagnóstico');
    } finally {
      setValidando(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight={600}>
        📋 Histórico de Diagnósticos
      </Typography>

      {diagnosticos.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          Nenhum diagnóstico realizado ainda. Faça o primeiro diagnóstico na aba "Novo Diagnóstico".
        </Alert>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
            gap: 2,
            mt: 2,
          }}
        >
          {diagnosticos.map((diag) => (
            <Card key={diag.id} elevation={2}>
              <Box
                component="img"
                src={diag.imagem}
                alt={diag.classe_predita}
                sx={{
                  width: '100%',
                  height: 200,
                  objectFit: 'cover',
                }}
              />
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="h6" noWrap>
                    {diag.animal?.name || 'Animal'}
                  </Typography>
                  {diag.validado ? (
                    <Chip
                      icon={<ValidadoIcon />}
                      label="Validado"
                      color="success"
                      size="small"
                    />
                  ) : (
                    <Chip
                      icon={<PendenteIcon />}
                      label="Pendente"
                      color="warning"
                      size="small"
                    />
                  )}
                </Box>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {format(new Date(diag.created_at), "dd/MM/yyyy 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </Typography>

                <Typography variant="subtitle1" color="primary" gutterBottom>
                  {diag.classe_predita}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Confiança: {((diag.confianca || 0) * 100).toFixed(1)}%
                </Typography>

                <Box display="flex" gap={1} mt={2}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ViewIcon />}
                    onClick={() => handleView(diag)}
                    fullWidth
                  >
                    Detalhes
                  </Button>
                  {!diag.validado && (
                    <Tooltip title="Validar Diagnóstico">
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => handleOpenValidar(diag)}
                      >
                        <ValidarIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Dialog de Detalhes */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedDiagnostico && (
          <>
            <DialogTitle>
              Diagnóstico - {selectedDiagnostico.animal?.name || 'Animal'}
            </DialogTitle>
            <DialogContent>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                  gap: 2,
                  mt: 1,
                }}
              >
                <Box>
                  <img
                    src={selectedDiagnostico.imagem}
                    alt="Diagnóstico"
                    style={{ width: '100%', borderRadius: 8 }}
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Diagnóstico:
                  </Typography>
                  <Typography variant="h6" gutterBottom>
                    {selectedDiagnostico.classe_predita}
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary" mt={2}>
                    Confiança:
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {((selectedDiagnostico.confianca || 0) * 100).toFixed(1)}%
                  </Typography>

                  {selectedDiagnostico.validado && (
                    <>
                      <Typography variant="subtitle2" color="text.secondary" mt={2}>
                        Validado por:
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {selectedDiagnostico.validado_por || 'Veterinário'}
                      </Typography>
                    </>
                  )}

                  {selectedDiagnostico.observacoes && (
                    <>
                      <Typography variant="subtitle2" color="text.secondary" mt={2}>
                        Observações:
                      </Typography>
                      <Typography variant="body2">
                        {selectedDiagnostico.observacoes}
                      </Typography>
                    </>
                  )}
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Fechar</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Dialog de Validação */}
      <Dialog
        open={validarDialogOpen}
        onClose={() => !validando && setValidarDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Validar Diagnóstico</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Ao validar, você confirma que revisou o diagnóstico da IA e concorda com o resultado.
          </Typography>
          <TextField
            label="Observações (opcional)"
            multiline
            rows={4}
            fullWidth
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Adicione suas observações sobre o diagnóstico..."
            disabled={validando}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setValidarDialogOpen(false)} disabled={validando}>
            Cancelar
          </Button>
          <Button
            onClick={handleValidar}
            variant="contained"
            color="primary"
            disabled={validando}
          >
            {validando ? 'Validando...' : 'Validar Diagnóstico'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
