import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import {
  Dashboard,
  CalendarMonth,
  Person,
  Pets,
  Science,
  MedicalServices,
  LocalHospital,
  HealthAndSafety,
  Assessment
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  isMobile: boolean;
}

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { text: 'Agendamento', icon: <CalendarMonth />, path: '/agendamento' },
  { text: 'Consultas', icon: <MedicalServices />, path: '/consultas' },
  { text: 'Tutores', icon: <Person />, path: '/tutores' },
  { text: 'Animais', icon: <Pets />, path: '/animais' },
  { text: 'Diagnóstico IA', icon: <Science />, path: '/diagnostico' },
  { text: 'Veterinários', icon: <MedicalServices />, path: '/veterinarios' },
  { text: 'Planos', icon: <HealthAndSafety />, path: '/planos' },
  { text: 'Clínicas', icon: <LocalHospital />, path: '/clinicas' },
  { text: 'Relatórios', icon: <Assessment />, path: '/relatorios' }, // ✅ Novo
];

const Sidebar: React.FC<SidebarProps> = ({ open, onClose, isMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const drawerContent = (
    <Box sx={{ width: 240, pt: 2 }}>
      {/* Logo/Header */}
      <Box sx={{ px: 2, pb: 2 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Pets color="primary" />
          <Typography variant="h6" fontWeight={700} color="primary">
            VetSystem
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">
          Sistema de Gestão
        </Typography>
      </Box>

      <Divider />

      {/* Menu Items */}
      <List sx={{ pt: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={isActive}
                sx={{
                  mx: 1,
                  borderRadius: 1,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive ? 'white' : 'text.secondary',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontWeight: isActive ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <>
      {/* Mobile Drawer */}
      {isMobile ? (
        <Drawer
          anchor="left"
          open={open}
          onClose={onClose}
          ModalProps={{
            keepMounted: true,
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        /* Desktop Drawer */
        <Drawer
          variant="persistent"
          open={open}
          sx={{
            width: 240,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 240,
              boxSizing: 'border-box',
              top: 64,
              height: 'calc(100% - 64px)',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;
