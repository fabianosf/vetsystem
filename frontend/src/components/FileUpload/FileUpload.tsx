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
  InsertDriveFile,
  PictureAsPdf,
  Image,
} from '@mui/icons-material';
import { toast } from 'react-toastify';


interface FileUploadProps {
  currentFile?: string | null;
  onFileChange: (file: File | null) => void;
  maxSize?: number; // em MB
  acceptedTypes?: string;
  label?: string;
}


const FileUpload: React.FC<FileUploadProps> = ({
  currentFile,
  onFileChange,
  maxSize = 10,
  acceptedTypes = '.pdf,.jpg,.jpeg,.png,.doc,.docx',
  label = 'Arquivo do Exame',
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) return;

    // Validar tamanho
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error(`O arquivo deve ter no máximo ${maxSize}MB`);
      return;
    }

    setSelectedFile(file);
    onFileChange(file);
    toast.success('Arquivo selecionado com sucesso!');
  };


  const handleRemove = () => {
    setSelectedFile(null);
    onFileChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };


  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <PictureAsPdf />;
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return <Image />;
    return <InsertDriveFile />;
  };


  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };


  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={600} mb={1}>
        {label}
      </Typography>

      <Stack spacing={2}>
        {/* Preview do Arquivo */}
        {(selectedFile || currentFile) && (
          <Box
            sx={{
              p: 2,
              border: '1px solid',
              borderColor: 'primary.main',
              borderRadius: 2,
              bgcolor: 'primary.50',
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" spacing={2} alignItems="center">
                {getFileIcon(selectedFile?.name || currentFile || '')}
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {selectedFile?.name || 'Arquivo atual'}
                  </Typography>
                  {selectedFile && (
                    <Typography variant="caption" color="text.secondary">
                      {formatFileSize(selectedFile.size)}
                    </Typography>
                  )}
                </Box>
              </Stack>
              <IconButton color="error" size="small" onClick={handleRemove}>
                <Delete />
              </IconButton>
            </Stack>
          </Box>
        )}

        {/* Botão de Upload */}
        <Button
          variant="outlined"
          startIcon={loading ? <CircularProgress size={20} /> : <CloudUpload />}
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          fullWidth
          sx={{ textTransform: 'none' }}
        >
          {selectedFile || currentFile ? 'Trocar Arquivo' : 'Selecionar Arquivo'}
        </Button>

        {/* Input oculto */}
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes}
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />

        {/* Info */}
        <Alert severity="info">
          <Typography variant="caption">
            Formatos aceitos: PDF, DOC, DOCX, Imagens (máx. {maxSize}MB)
          </Typography>
        </Alert>
      </Stack>
    </Box>
  );
};


export default FileUpload;
