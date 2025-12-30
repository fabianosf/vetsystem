import { useState } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Button,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  Notifications,
  NotificationsNone,
  EventAvailable,
  Vaccines,
  Warning,
  Info,
  CheckCircle,
  Error as ErrorIcon,
  DoneAll,
  Delete,
} from '@mui/icons-material';
import { useNotifications } from '../../hooks/useNotifications';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function NotificationBell() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const {
    notificacoes,
    naoLidas,
    marcarComoLida,
    marcarTodasLidas,
    limparLidas,
  } = useNotifications();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notificacao: any) => {
    marcarComoLida(notificacao.id);
    if (notificacao.link) {
      navigate(notificacao.link);
    }
    handleClose();
  };

  const getIconByType = (tipo: string) => {
    switch (tipo) {
      case 'SUCCESS': return <CheckCircle color="success" />;
      case 'ERROR': return <ErrorIcon color="error" />;
      case 'WARNING': return <Warning color="warning" />;
      default: return <Info color="info" />;
    }
  };

  const getIconByCategory = (categoria: string) => {
    switch (categoria) {
      case 'CONSULTA': return <EventAvailable />;
      case 'VACINA': return <Vaccines />;
      default: return <Info />;
    }
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{ ml: 1 }}
      >
        <Badge badgeContent={naoLidas} color="error">
          {naoLidas > 0 ? <Notifications /> : <NotificationsNone />}
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 500,
          },
        }}
      >
        {/* Header */}
        <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="bold">
            Notificações
          </Typography>
          {naoLidas > 0 && (
            <Chip
              label={naoLidas}
              color="error"
              size="small"
            />
          )}
        </Box>

        <Divider />

        {/* Lista de notificações */}
        {notificacoes.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <NotificationsNone sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography color="text.secondary">
              Nenhuma notificação
            </Typography>
          </Box>
        ) : (
          <>
            {notificacoes.map((notif) => (
              <MenuItem
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                sx={{
                  py: 1.5,
                  px: 2,
                  borderLeft: 3,
                  borderColor: notif.tipo === 'ERROR' ? 'error.main' :
                               notif.tipo === 'WARNING' ? 'warning.main' :
                               notif.tipo === 'SUCCESS' ? 'success.main' : 'info.main',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <ListItemIcon>
                  {getIconByCategory(notif.categoria)}
                </ListItemIcon>
                <ListItemText
                  primary={notif.titulo}
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">
                        {notif.mensagem}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDistanceToNow(new Date(notif.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </Typography>
                    </>
                  }
                  primaryTypographyProps={{ fontWeight: 'medium' }}
                />
              </MenuItem>
            ))}
          </>
        )}

        {/* Footer com ações */}
        {notificacoes.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 1, display: 'flex', gap: 1 }}>
              <Button
                size="small"
                startIcon={<DoneAll />}
                onClick={() => {
                  marcarTodasLidas();
                  handleClose();
                }}
                fullWidth
              >
                Marcar todas como lidas
              </Button>
              <Button
                size="small"
                startIcon={<Delete />}
                onClick={() => {
                  limparLidas();
                  handleClose();
                }}
                color="error"
                fullWidth
              >
                Limpar
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
}
