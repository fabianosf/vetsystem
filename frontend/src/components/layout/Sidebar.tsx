import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box, Typography, Divider } from '@mui/material';
import { 
  Dashboard as DashboardIcon, 
  Person, 
  Pets, 
  MedicalServices, 
  HealthAndSafety,
  LocalHospital,
  CalendarMonth,
  BiotechOutlined
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';


const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Agendamento', icon: <CalendarMonth />, path: '/agendamento' },
  { text: 'Tutores', icon: <Person />, path: '/tutores' },
  { text: 'Animais', icon: <Pets />, path: '/animais' },
  { text: 'Diagnóstico IA', icon: <BiotechOutlined />, path: '/diagnosticos' },
  { text: 'Veterinários', icon: <MedicalServices />, path: '/veterinarios' },
  { text: 'Planos', icon: <HealthAndSafety />, path: '/planos' },
  { text: 'Clínicas', icon: <LocalHospital />, path: '/clinicas' },
];


export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();


  return (
    <Box sx={{ width: 240, height: '100%', bgcolor: 'background.paper', borderRight: 1, borderColor: 'divider' }}>
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" fontWeight={700} color="primary">
          🐾 VetSystem
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Sistema de Gestão
        </Typography>
      </Box>
      
      <Divider />
      
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
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
              <ListItemIcon sx={{ color: location.pathname === item.path ? 'white' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
