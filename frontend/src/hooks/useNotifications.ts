import { useState, useEffect } from 'react';
import api from '../services/api';

export interface Notification {
  id: number;
  tipo: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  created_at: string;
  icon?: string;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notificacoes/nao_lidas/');
      
      setNotifications(response.data.results || []);
      setUnreadCount(response.data.count || 0);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      // Define valores padrão em caso de erro
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await api.post(`/notificacoes/${id}/marcar_lida/`);
      await fetchNotifications();
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notificacoes/marcar_todas_lidas/');
      await fetchNotifications();
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Atualiza a cada 60 segundos
    const interval = setInterval(fetchNotifications, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return { 
    notifications, 
    unreadCount, 
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead 
  };
};
