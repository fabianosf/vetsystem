import { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  Box,
  Badge,
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Typography,
  Divider,
  Chip,
  Button,
  Stack,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Circle,
  CheckCircle,
  Warning,
  Info,
  Event,
  Vaccines,
  Close,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Notificacao {
  id: number;
  tipo: 'CONSULTA' | 'VACINA' | 'EXAME' | 'SISTEMA' | 'ALERTA';
  titulo: string;
  mensagem: string;
  lida: boolean;
  data: string;
  link?: string;
}

export default function NotificationCenter() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [naoLidas, setNaoLidas] = useState(0);

  useEffect(() => {
    loadNotificacoes();
    
    // Atualizar notificações a cada 30 segundos
    const interval = setInterval(loadNotificacoes, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotificacoes = async () => {
    try {
      // Simular notificações - em produção viriam do backend
      const mockNotificacoes: Notificacao[] = [
        {
          id: 1,
          tipo: 'CONSULTA',
          titulo: 'Consulta Próxima',
          mensagem: 'Consulta com Rex às 14:00 hoje',
          lida: false,
          data: new Date().toISOString(),
        },
        {
          id: 2,
          tipo: 'VACINA',
          titulo: 'Vacina Vencendo',
          mensagem: 'Vacina antirrábica de Mimi vence em 3 dias',
          lida: false,
          data: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 3,
          tipo: 'ALERTA',
          titulo: 'Estoque Baixo',
          mensagem: 'Vacina V10 com apenas 5 unidades',
          lida: false,
          data: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: 4,
          tipo: 'EXAME',
          titulo: 'Resultado Disponível',
          mensagem: 'Exame de sangue de Thor está pronto',
          lida: true,
          data: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 5,
          tipo: 'SISTEMA',
          titulo: 'Backup Concluído',
          mensagem: 'Backup automático realizado com sucesso',
          lida: true,
          data: new Date(Date.now() - 172800000).toISOString(),
        },
      ];

      setNotificacoes(mockNotificacoes);
      setNaoLidas(mockNotificacoes.filter(n => !n.lida).length);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const marcarComoLida = async (id: number) => {
    try {
      // Em produção: await api.put(`/notificacoes/${id}/`, { lida: true });
      setNotificacoes(prev =>
        prev.map(n => (n.id === id ? { ...n, lida: true } : n))
      );
      setNaoLidas(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erro ao marcar notificação:', error);
    }
  };

  const marcarTodasComoLidas = async () => {
    try {
      // Em produção: await api.post('/notificacoes/marcar-todas-lidas/');
      setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
      setNaoLidas(0);
    } catch (error) {
      console.error('Erro ao marcar todas:', error);
    }
  };

  const getIcon = (tipo: string) => {
    const icons: any = {
      CONSULTA: <Event fontSize="small" color="primary" />,
      VACINA: <Vaccines fontSize="small" color="success" />,
      EXAME: <Info fontSize="small" color="info" />,
      ALERTA: <Warning fontSize="small" color="warning" />,
      SISTEMA: <CheckCircle fontSize="small" color="action" />,
    };
    return icons[tipo] || <Circle fontSize="small" />;
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton color="primary" onClick={handleClick}>
        <Badge badgeContent={naoLidas} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 500,
            mt: 1,
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={600}>
            Notificações
          </Typography>
          <IconButton size="small" onClick={handleClose}>
            <Close fontSize="small" />
          </IconButton>
        </Box>

        <Divider />

        {naoLidas > 0 && (
          <Box sx={{ px: 2, py: 1, bgcolor: 'action.hover' }}>
            <Button size="small" onClick={marcarTodasComoLidas}>
              Marcar todas como lidas
            </Button>
          </Box>
        )}

        <List sx={{ p: 0, maxHeight: 400, overflow: 'auto' }}>
          {notificacoes.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <NotificationsIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Nenhuma notificação
              </Typography>
            </Box>
          ) : (
            notificacoes.map((notif, index) => (
              <Box key={notif.id}>
                <ListItem
                  disablePadding
                  sx={{
                    bgcolor: notif.lida ? 'transparent' : 'action.hover',
                  }}
                >
                  <ListItemButton
                    onClick={() => !notif.lida && marcarComoLida(notif.id)}
                    sx={{ gap: 1.5 }}
                  >
                    {getIcon(notif.tipo)}
                    
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography
                            variant="body2"
                            fontWeight={notif.lida ? 400 : 600}
                            sx={{ flex: 1 }}
                          >
                            {notif.titulo}
                          </Typography>
                          {!notif.lida && (
                            <Circle sx={{ fontSize: 8, color: 'primary.main' }} />
                          )}
                        </Stack>
                      }
                      secondary={
                        <>
                          <Typography variant="caption" display="block" color="text.secondary">
                            {notif.mensagem}
                          </Typography>
                          <Typography variant="caption" color="text.disabled">
                            {formatDistanceToNow(new Date(notif.data), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </Typography>
                        </>
                      }
                    />
                  </ListItemButton>
                </ListItem>
                {index < notificacoes.length - 1 && <Divider />}
              </Box>
            ))
          )}
        </List>

        <Divider />

        <Box sx={{ p: 1, textAlign: 'center' }}>
          <Button size="small" fullWidth>
            Ver todas
          </Button>
        </Box>
      </Popover>
    </>
  );
}
