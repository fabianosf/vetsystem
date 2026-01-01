import React, { useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { Navbar } from './Navbar'; // ✅ Named import
import Sidebar  from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  darkMode: boolean;
  onToggleTheme: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, darkMode, onToggleTheme }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Navbar */}
      <Navbar
        onMenuClick={handleToggleSidebar}
        onToggleTheme={onToggleTheme}
        darkMode={darkMode}
      />

      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={handleToggleSidebar} isMobile={isMobile} />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          ml: sidebarOpen && !isMobile ? '240px' : 0,
          transition: theme.transitions.create(['margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          bgcolor: 'background.default',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
