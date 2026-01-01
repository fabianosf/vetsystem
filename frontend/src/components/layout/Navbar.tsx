import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Brightness4,
  Brightness7,
  AccountCircle,
  Logout,
  Settings,
} from '@mui/icons-material';
import { NotificationBell } from '../Notifications/NotificationBell';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  onMenuClick: () => void;
  onToggleTheme: () => void;
  darkMode: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onMenuClick,
  onToggleTheme,
  darkMode,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = user.first_name || user.email?.split('@')[0] || 'Usuário';

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleProfile = () => {
    handleClose();
    navigate('/perfil');
  };

  const handleSettings = () => {
    handleClose();
    navigate('/configuracoes');
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        bgcolor: darkMode ? 'background.paper' : 'primary.main',
        color: darkMode ? 'text.primary' : 'white',
      }}
    >
      <Toolbar>
        {/* Menu Hamburger */}
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        {/* Título */}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          VetSystem
        </Typography>

        {/* Ações do usuário */}
        <Box display="flex" alignItems="center" gap={1}>
          {/* Toggle Dark Mode */}
          <IconButton color="inherit" onClick={onToggleTheme}>
            {darkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>

          {/* ✅ NOTIFICAÇÕES - APENAS UMA VEZ */}
          <NotificationBell />

          {/* User Avatar Menu */}
          <IconButton color="inherit" onClick={handleMenu}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: 'secondary.main',
                fontSize: '0.875rem',
              }}
            >
              {userName.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            PaperProps={{
              sx: { width: 220, mt: 1 },
            }}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            {/* User Info */}
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                {userName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user.email}
              </Typography>
            </Box>

            <Divider />

            {/* Menu Items */}
            <MenuItem onClick={handleProfile}>
              <AccountCircle sx={{ mr: 1.5 }} fontSize="small" />
              Meu Perfil
            </MenuItem>

            <MenuItem onClick={handleSettings}>
              <Settings sx={{ mr: 1.5 }} fontSize="small" />
              Configurações
            </MenuItem>

            <Divider />

            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
              <Logout sx={{ mr: 1.5 }} fontSize="small" />
              Sair
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
