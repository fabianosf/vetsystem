import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  IconButton,
  CircularProgress,
  Typography,
  Stack,
  Alert,
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  PhotoCamera,
  Close,
} from '@mui/icons-material';
import { toast } from 'react-toastify';


interface ImageUploadProps {
  currentImage?: string | null;
  onImageChange: (file: File | null) => void;
  maxSize?: number; // em MB
  aspectRatio?: string;
  label?: string;
}


const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImage,
  onImageChange,
  maxSize = 5,
  //aspectRatio = '1/1',
  label = 'Foto do Animal',
}) => {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione apenas arquivos de imagem');
      return;
    }

    // Validar tamanho
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error(`A imagem deve ter no máximo ${maxSize}MB`);
      return;
    }

    // Criar preview
    const reader = new FileReader();
    reader.onloadstart = () => setLoading(true);
    reader.onloadend = () => {
      setLoading(false);
      setPreview(reader.result as string);
      onImageChange(file);
    };
    reader.readAsDataURL(file);
  };


  const handleRemove = () => {
    setPreview(null);
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };


  const handleClick = () => {
    fileInputRef.current?.click();
  };


  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={600} mb={1}>
        {label}
      </Typography>

      <Stack spacing={2} alignItems="center">
        {/* Preview da Imagem */}
        <Box
          sx={{
            position: 'relative',
            width: 200,
            height: 200,
            borderRadius: 2,
            overflow: 'hidden',
            bgcolor: 'grey.100',
            border: '2px dashed',
            borderColor: preview ? 'primary.main' : 'grey.300',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {loading ? (
            <CircularProgress />
          ) : preview ? (
            <>
              <img
                src={preview}
                alt="Preview"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              <IconButton
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'error.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'error.dark',
                  },
                }}
                size="small"
                onClick={handleRemove}
              >
                <Close fontSize="small" />
              </IconButton>
            </>
          ) : (
            <Stack alignItems="center" spacing={1}>
              <PhotoCamera sx={{ fontSize: 48, color: 'grey.400' }} />
              <Typography variant="caption" color="text.secondary">
                Nenhuma imagem
              </Typography>
            </Stack>
          )}
        </Box>

        {/* Botões */}
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            startIcon={<CloudUpload />}
            onClick={handleClick}
            sx={{ textTransform: 'none' }}
          >
            {preview ? 'Trocar Foto' : 'Selecionar Foto'}
          </Button>
          
          {preview && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={handleRemove}
              sx={{ textTransform: 'none' }}
            >
              Remover
            </Button>
          )}
        </Stack>

        {/* Input oculto */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />

        {/* Info */}
        <Alert severity="info" sx={{ width: '100%' }}>
          <Typography variant="caption">
            Formatos aceitos: JPG, PNG, GIF (máx. {maxSize}MB)
          </Typography>
        </Alert>
      </Stack>
    </Box>
  );
};


export default ImageUpload;
