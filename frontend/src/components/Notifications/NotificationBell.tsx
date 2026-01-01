import React, { useState } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Event as EventIcon,
  Science as ScienceIcon,
  Vaccines as VaccinesIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { useNotifications } from '../../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const iconMap: Record<string, React.ReactElement> = {
  event: <EventIcon fontSize="small" />,
  lab: <ScienceIcon fontSize="small" />,
  vaccine: <VaccinesIcon fontSize="small" />,
  default: <NotificationsIcon fontSize="small" />,
};

export const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = async (id: number) => {
    await markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    handleClose();
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 480,
          },
        }}
      >
        <Box sx={{ p: 2, pb: 1 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={600}>
              Notificações
            </Typography>
            {unreadCount > 0 && (
              <Button size="small" onClick={handleMarkAllAsRead}>
                Marcar todas como lidas
              </Button>
            )}
          </Box>
        </Box>

        <Divider />

        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box p={3} textAlign="center">
            <CheckIcon color="success" sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Nenhuma notificação nova
            </Typography>
          </Box>
        ) : (
          notifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => handleMarkAsRead(notification.id)}
              sx={{
                whiteSpace: 'normal',
                py: 1.5,
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <ListItemIcon>
                {iconMap[notification.icon || 'default'] || iconMap.default}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="body2" fontWeight={600}>
                    {notification.titulo}
                  </Typography>
                }
                secondary={
                  <>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {notification.mensagem}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </Typography>
                  </>
                }
              />
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
};
