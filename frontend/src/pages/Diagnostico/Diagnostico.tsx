import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Divider,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  CloudUpload,
  Science,
  CheckCircle,
  Warning,
  Info,
  Delete,
  Psychology,
  PhotoCamera,
  Pets,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';


interface DiagnosticoResult {
  disease: string;
  confidence: number;
  recommendations: string[];
  severity: 'low' | 'medium' | 'high';
}

interface Animal {
  id: number;
  name: string;
  species: string;
}


const Diagnostico: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnosticoResult | null>(null);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState<number | ''>('');


  // Carregar lista de animais
  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        const response = await api.get('/animais/');
        setAnimals(response.data.results || response.data);
      } catch (error) {
        console.error('Erro ao carregar animais:', error);
      }
    };
    fetchAnimals();
  }, []);


  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecione apenas arquivos de imagem');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error('O arquivo deve ter no máximo 10MB');
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setResult(null);
    }
  };


  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast.warning('Selecione uma imagem primeiro');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      
      // Campo 'imagem' (português)
      formData.append('imagem', selectedFile);
      
      // Adicionar animal se selecionado
      if (selectedAnimal) {
        formData.append('animal', selectedAnimal.toString());
      }

      console.log('Enviando:', {
        arquivo: selectedFile.name,
        animal: selectedAnimal || 'Não selecionado'
      });

      const response = await api.post('/diagnosticos/analyze/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Resposta do backend:', response.data);

      const resultado = response.data.resultado || response.data;

      // ✅ CORREÇÃO: Normalizar confiança para 0-1
      let confidence = resultado.confianca || resultado.confidence || 0;
      
      // Se veio em porcentagem (> 1), dividir por 100
      if (confidence > 1) {
        confidence = confidence / 100;
      }
      
      // Garantir que fique entre 0 e 1
      confidence = Math.max(0, Math.min(1, confidence));

      setResult({
        disease: resultado.classe_predita || resultado.disease || 'Diagnóstico não identificado',
        confidence: confidence,
        recommendations: resultado.recomendacoes || resultado.recommendations || ['Consulte um veterinário'],
        severity: resultado.gravidade || resultado.severity || 'low'
      });

      toast.success(response.data.message || 'Análise concluída com sucesso!');
    } catch (error: any) {
      console.error('Erro ao analisar imagem:', error);
      console.error('Detalhes do erro:', error.response?.data);
      
      const errorMessage = error.response?.data?.imagem?.[0] || 
                          error.response?.data?.animal?.[0] || 
                          error.response?.data?.error || 
                          error.response?.data?.detail || 
                          'Erro ao analisar imagem';
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  const handleClear = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
  };


  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      default:
        return 'success';
    }
  };


  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Warning />;
      case 'medium':
        return <Info />;
      default:
        return <CheckCircle />;
    }
  };


  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'Alta Gravidade';
      case 'medium':
        return 'Gravidade Moderada';
      default:
        return 'Baixa Gravidade';
    }
  };


  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Psychology sx={{ fontSize: 40, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Diagnóstico com IA
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Análise de imagens veterinárias com inteligência artificial
          </Typography>
        </Box>
      </Box>


      {/* Alert Info */}
      <Alert severity="info" icon={<Science />} sx={{ mb: 3 }}>
        <Typography variant="body2" fontWeight={600} gutterBottom>
          Como funciona esta ferramenta?
        </Typography>
        <Typography variant="caption" display="block">
          Nossa IA analisa imagens de animais para identificar possíveis condições de saúde.
          Faça upload de uma foto clara do animal ou da área afetada para obter um diagnóstico preliminar.
        </Typography>
      </Alert>


      {/* Grid com Box */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
          gap: 3,
        }}
      >
        {/* Upload Section */}
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <PhotoCamera color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Upload de Imagem
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

            {/* Seletor de Animal */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Animal (Opcional)</InputLabel>
              <Select
                value={selectedAnimal}
                onChange={(e) => setSelectedAnimal(e.target.value as number)}
                label="Animal (Opcional)"
                startAdornment={<Pets sx={{ mr: 1, color: 'action.active' }} />}
              >
                <MenuItem value="">
                  <em>Nenhum selecionado</em>
                </MenuItem>
                {animals.map((animal) => (
                  <MenuItem key={animal.id} value={animal.id}>
                    {animal.name} ({animal.species})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box
              sx={{
                border: '2px dashed',
                borderColor: preview ? 'primary.main' : 'grey.300',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                bgcolor: preview ? 'primary.50' : 'grey.50',
                cursor: 'pointer',
                transition: 'all 0.3s',
                minHeight: 300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'primary.50',
                },
              }}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <input
                id="file-input"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />

              {preview ? (
                <Box>
                  <img
                    src={preview}
                    alt="Preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: 300,
                      borderRadius: 8,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Typography variant="body2" color="text.secondary" mt={2} fontWeight={500}>
                    📎 {selectedFile?.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(selectedFile!.size / 1024).toFixed(2)} KB
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <CloudUpload sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Clique para fazer upload
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    ou arraste e solte aqui
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Formatos: JPG, PNG, JPEG (máx. 10MB)
                  </Typography>
                </Box>
              )}
            </Box>


            <Stack direction="row" spacing={2} mt={3}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Science />}
                onClick={handleAnalyze}
                disabled={!selectedFile || loading}
              >
                {loading ? 'Analisando...' : 'Analisar Imagem'}
              </Button>
              <Button
                variant="outlined"
                color="error"
                size="large"
                startIcon={<Delete />}
                onClick={handleClear}
                disabled={!selectedFile}
              >
                Limpar
              </Button>
            </Stack>
          </CardContent>
        </Card>


        {/* Results Section */}
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Psychology color="secondary" />
              <Typography variant="h6" fontWeight={600}>
                Resultado da Análise
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />


            {loading && (
              <Box>
                <Typography variant="body2" color="text.secondary" mb={2} textAlign="center">
                  Analisando imagem com IA...
                </Typography>
                <LinearProgress sx={{ mb: 2 }} />
                <Box textAlign="center">
                  <CircularProgress size={60} />
                </Box>
              </Box>
            )}


            {!result && !loading && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 300,
                  textAlign: 'center',
                }}
              >
                <Science sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Aguardando análise
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Faça o upload de uma imagem e clique em Analisar
                </Typography>
              </Box>
            )}


            {result && !loading && (
              <Box>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    mb: 2,
                    bgcolor: `${getSeverityColor(result.severity)}.50`,
                    border: '2px solid',
                    borderColor: `${getSeverityColor(result.severity)}.200`,
                  }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Diagnóstico Identificado
                      </Typography>
                      <Typography variant="h5" fontWeight={700} color="primary.main">
                        {result.disease}
                      </Typography>
                    </Box>
                    <Chip
                      icon={getSeverityIcon(result.severity)}
                      label={getSeverityLabel(result.severity)}
                      color={getSeverityColor(result.severity)}
                    />
                  </Box>


                  <Divider sx={{ my: 2 }} />


                  <Box>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      Nível de Confiança da IA
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                      <LinearProgress
                        variant="determinate"
                        value={result.confidence * 100}
                        sx={{
                          flex: 1,
                          height: 8,
                          borderRadius: 4,
                        }}
                      />
                      <Chip
                        label={`${(result.confidence * 100).toFixed(1)}%`}
                        color="primary"
                        size="small"
                      />
                    </Box>
                  </Box>
                </Paper>


                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="body2" fontWeight={600}>
                    ⚠️ Aviso Importante
                  </Typography>
                  <Typography variant="caption">
                    Este diagnóstico é uma sugestão baseada em IA. Consulte sempre um
                    veterinário profissional para confirmação e tratamento.
                  </Typography>
                </Alert>


                <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle2" fontWeight={600} mb={1} color="primary">
                    📋 Recomendações:
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, m: 0 }}>
                    {result.recommendations.map((rec, index) => (
                      <Typography
                        component="li"
                        key={index}
                        variant="body2"
                        mb={0.5}
                        sx={{ '&::marker': { color: 'primary.main' } }}
                      >
                        {rec}
                      </Typography>
                    ))}
                  </Box>
                </Paper>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>


      {/* Bottom Warning */}
      <Alert severity="error" icon={<Warning />} sx={{ mt: 3 }}>
        <Typography variant="body2" fontWeight={600} gutterBottom>
          ⚕️ Disclaimer Médico
        </Typography>
        <Typography variant="caption">
          Esta ferramenta utiliza inteligência artificial para auxiliar no diagnóstico veterinário,
          mas <strong>NÃO substitui</strong> a avaliação de um profissional qualificado.
          Em caso de emergências ou dúvidas, consulte imediatamente um veterinário licenciado.
        </Typography>
      </Alert>
    </Box>
  );
};


export default Diagnostico;
