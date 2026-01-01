import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Pets as PetsIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import api from '../../services/api';

interface Animal {
  id: number;
  name: string;
  species: string;
  breed: string;
}

interface DiagnosticoResultado {
  classe_predita: string;
  confianca: number;
  descricao?: string;
  recomendacao?: string;
  alerta?: string;
  todas_predicoes?: Array<{
    classe: string;
    probabilidade: number;
  }>;
}

interface DiagnosticoUploadProps {
  animal: Animal;
  onSuccess?: () => void;
}

export const DiagnosticoUpload: React.FC<DiagnosticoUploadProps> = ({
  animal,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<DiagnosticoResultado | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: async (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.file.size > 10 * 1024 * 1024) {
          setError('Arquivo muito grande. Máximo: 10MB');
        } else {
          setError('Formato inválido. Use JPG, JPEG ou PNG');
        }
        return;
      }

      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
      setResultado(null);

      await handleUpload(file);
    },
  });

  const handleUpload = async (file: File) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('animal', animal.id.toString());
      formData.append('imagem', file);

      const response = await api.post('/diagnosticos/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Adaptar resposta do backend
      const data = response.data;
      const resultado: DiagnosticoResultado = {
        classe_predita: data.classe_predita || 'Diagnóstico realizado',
        confianca: (data.confianca || 0) * 100, // Converter de 0-1 para 0-100
        descricao: data.resultado?.descricao || 'Análise realizada com sucesso',
        recomendacao: data.resultado?.recomendacao || 'Consulte um veterinário',
        alerta: data.resultado?.alerta,
        todas_predicoes: data.resultado?.predicoes?.map((p: any) => ({
          classe: p.classe,
          probabilidade: p.confianca * 100,
        })) || [],
      };

      setResultado(resultado);
      toast.success('Diagnóstico realizado com sucesso!');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao processar imagem';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number): 'success' | 'warning' | 'error' => {
    if (confidence >= 80) return 'success';
    if (confidence >= 60) return 'warning';
    return 'error';
  };

  return (
    <Box>
      {/* Upload Area */}
      <Card
        {...getRootProps()}
        sx={{
          p: 3,
          mb: 3,
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          bgcolor: isDragActive ? 'action.hover' : 'background.paper',
          cursor: 'pointer',
          transition: 'all 0.3s',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'action.hover',
          },
        }}
      >
        <input {...getInputProps()} />
        <Box textAlign="center">
          <UploadIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {isDragActive
              ? 'Solte a imagem aqui...'
              : 'Arraste uma foto ou clique para selecionar'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Formatos aceitos: JPG, JPEG, PNG • Máximo: 10MB
          </Typography>
        </Box>
      </Card>

      {/* Loading */}
      {loading && (
        <Card sx={{ p: 3, mb: 3 }}>
          <Box textAlign="center">
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              🔬 Analisando imagem com IA...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Isso pode levar alguns segundos
            </Typography>
            <LinearProgress sx={{ mt: 2 }} />
          </Box>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Preview + Resultado */}
      {previewUrl && resultado && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 3,
          }}
        >
          {/* Imagem Preview */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <PetsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                {animal.name} - {animal.species}
              </Typography>
              <Box
                component="img"
                src={previewUrl}
                alt="Preview"
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 2,
                  maxHeight: 400,
                  objectFit: 'contain',
                }}
              />
            </CardContent>
          </Card>

          {/* Resultado do Diagnóstico */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <CheckIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Resultado do Diagnóstico
              </Typography>

              {/* Diagnóstico Principal */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Diagnóstico:
                </Typography>
                <Typography variant="h5" gutterBottom color="primary">
                  {resultado.classe_predita}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary" mt={2}>
                  Confiança:
                </Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <LinearProgress
                    variant="determinate"
                    value={resultado.confianca}
                    color={getConfidenceColor(resultado.confianca)}
                    sx={{ flexGrow: 1, height: 10, borderRadius: 5 }}
                  />
                  <Typography
                    variant="h6"
                    color={`${getConfidenceColor(resultado.confianca)}.main`}
                  >
                    {resultado.confianca.toFixed(1)}%
                  </Typography>
                </Box>
              </Box>

              {/* Alerta */}
              {resultado.alerta && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  {resultado.alerta}
                </Alert>
              )}

              {/* Descrição */}
              {resultado.descricao && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Descrição:
                  </Typography>
                  <Typography variant="body2">{resultado.descricao}</Typography>
                </Box>
              )}

              {/* Recomendação */}
              {resultado.recomendacao && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Recomendação:
                  </Typography>
                  <Typography variant="body2">{resultado.recomendacao}</Typography>
                </Box>
              )}

              {/* Todas as Predições */}
              {resultado.todas_predicoes && resultado.todas_predicoes.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Outras Possibilidades:
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {resultado.todas_predicoes.slice(0, 5).map((pred, idx) => (
                      <Chip
                        key={idx}
                        label={`${pred.classe}: ${pred.probabilidade.toFixed(1)}%`}
                        size="small"
                        color={idx === 0 ? 'primary' : 'default'}
                        variant={idx === 0 ? 'filled' : 'outlined'}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
};
