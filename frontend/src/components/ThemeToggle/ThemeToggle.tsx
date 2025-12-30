import { IconButton, Tooltip } from '@mui/material';
import { LightMode, DarkMode } from '@mui/icons-material';
import { useThemeMode } from '../../contexts/ThemeContext';

export default function ThemeToggle() {
  const { mode, toggleTheme } = useThemeMode();

  return (
    <Tooltip title={mode === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}>
      <IconButton
        onClick={toggleTheme}
        color="primary"
        sx={{
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'rotate(20deg)',
          },
        }}
      >
        {mode === 'light' ? <DarkMode /> : <LightMode />}
      </IconButton>
    </Tooltip>
  );
}
