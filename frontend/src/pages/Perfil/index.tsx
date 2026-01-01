// src/pages/Perfil/index.tsx
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const PerfilPage: React.FC = () => {
  const { user } = useAuth();

  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changing, setChanging] = useState(false);

  if (!user) {
    return <Typography>Carregando dados do usuário...</Typography>;
  }

  const handleOpenEdit = () => {
    setFirstName(user.first_name);
    setLastName(user.last_name);
    setEmail(user.email);
    setEditOpen(true);
  };

  const handleCloseEdit = () => {
    setEditOpen(false);
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      // Ajuste o endpoint conforme seu backend
      const response = await api.put('/auth/me/', {
        first_name: firstName,
        last_name: lastName,
        email,
      });

      // atualiza storage para manter consistência
      localStorage.setItem('user', JSON.stringify(response.data));

      setEditOpen(false);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenPassword = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordOpen(true);
  };

  const handleClosePassword = () => {
    setPasswordOpen(false);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      // aqui você pode disparar um toast/snackbar
      return;
    }

    setChanging(true);
    try {
      // Ajuste o endpoint conforme seu backend
      await api.post('/auth/change-password/', {
        current_password: currentPassword,
        new_password: newPassword,
      });

      setPasswordOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      // aqui você pode disparar um toast/snackbar de sucesso
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
    } finally {
      setChanging(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h5" fontWeight={600}>
        Meu perfil
      </Typography>

      <Card>
        <CardContent>
          <Stack direction="row" spacing={3} alignItems="center">
            <Avatar sx={{ width: 64, height: 64 }}>
              {user.first_name?.[0] || user.username?.[0] || 'U'}
            </Avatar>

            <Stack spacing={0.5}>
              <Typography variant="h6">
                {user.first_name} {user.last_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Usuário: {user.username}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Papel: {user.role}
              </Typography>
            </Stack>
          </Stack>

          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button variant="outlined" size="small" onClick={handleOpenEdit}>
              Editar dados
            </Button>
            <Button
              variant="outlined"
              size="small"
              color="secondary"
              onClick={handleOpenPassword}
            >
              Alterar senha
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Dialog Editar Dados */}
      <Dialog open={editOpen} onClose={handleCloseEdit} fullWidth maxWidth="sm">
        <DialogTitle>Editar dados</DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          <Stack spacing={2}>
            <TextField
              label="Nome"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              fullWidth
            />
            <TextField
              label="Sobrenome"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              fullWidth
            />
            <TextField
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit}>Cancelar</Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            disabled={saving}
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Alterar Senha */}
      <Dialog
        open={passwordOpen}
        onClose={handleClosePassword}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Alterar senha</DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          <Stack spacing={2}>
            <TextField
              label="Senha atual"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              fullWidth
            />
            <TextField
              label="Nova senha"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
            />
            <TextField
              label="Confirmar nova senha"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePassword}>Cancelar</Button>
          <Button
            variant="contained"
            disabled={changing}
            onClick={handleChangePassword}
          >
            {changing ? 'Alterando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default PerfilPage;
