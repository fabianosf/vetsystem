import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Tempo para renovar token antes de expirar (em milissegundos)
// Se token expira em 5 min, renova a cada 4 min
const REFRESH_INTERVAL = 4 * 60 * 1000; // 4 minutos

export const useTokenRefresh = () => {
  const { user, logout } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Só ativa se usuário estiver logado
    if (!user) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const refreshToken = async () => {
      try {
        const refresh = localStorage.getItem('refresh_token');
        
        if (!refresh) {
          console.warn('Refresh token não encontrado');
          logout();
          return;
        }

        const response = await axios.post(`${API_URL}/token/refresh/`, {
          refresh,
        });

        const { access } = response.data;
        localStorage.setItem('access_token', access);
        
        console.log('Token renovado automaticamente');
      } catch (error) {
        console.error('Erro ao renovar token automaticamente:', error);
        // Se falhar, força logout
        logout();
      }
    };

    // Executa a primeira renovação imediatamente (se necessário)
    // e depois a cada REFRESH_INTERVAL
    intervalRef.current = setInterval(refreshToken, REFRESH_INTERVAL);

    // Cleanup ao desmontar
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user, logout]);
};
