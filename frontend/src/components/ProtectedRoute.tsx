import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, Typography, Paper } from '@mui/material';
import { Block as BlockIcon } from '@mui/icons-material';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
  requireAuth?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requiredRoles = [], 
  requireAuth = true 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // Aguarda carregar dados do usuário
  if (loading) {
    return null;
  }

  // Se requer autenticação e não está logado
  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  // Se especificou roles e usuário não tem permissão
  if (requiredRoles.length > 0 && user && !requiredRoles.includes(user.role)) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            textAlign: 'center',
            maxWidth: 400,
          }}
        >
          <BlockIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Acesso Negado
          </Typography>
          <Typography color="text.secondary">
            Você não tem permissão para acessar esta página.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return <>{children}</>;
}
