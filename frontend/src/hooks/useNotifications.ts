import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { toast } from 'react-toastify';
import type { Notificacao } from '../types';

export function useNotifications() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [naoLidas, setNaoLidas] = useState(0);
  const [loading, setLoading] = useState(false);

  // Carregar notificações não lidas
  const carregarNaoLidas = useCallback(async () => {
    try {
      const response = await api.get<{ count: number; results: Notificacao[] }>(
        '/notificacoes/nao_lidas/'
      );
      setNotificacoes(response.data.results);
      setNaoLidas(response.data.count);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  }, []);

  // Marcar como lida
  const marcarComoLida = async (id: number) => {
    try {
      await api.post(`/notificacoes/${id}/marcar_lida/`);
      setNotificacoes(prev => prev.filter(n => n.id !== id));
      setNaoLidas(prev => Math.max(0, prev - 1));
    } catch (error) {
      toast.error('Erro ao marcar notificação como lida');
    }
  };

  // Marcar todas como lidas
  const marcarTodasLidas = async () => {
    try {
      setLoading(true);
      await api.post('/notificacoes/marcar_todas_lidas/');
      setNotificacoes([]);
      setNaoLidas(0);
      toast.success('Todas as notificações foram marcadas como lidas');
    } catch (error) {
      toast.error('Erro ao marcar notificações');
    } finally {
      setLoading(false);
    }
  };

  // Limpar notificações lidas
  const limparLidas = async () => {
    try {
      setLoading(true);
      await api.delete('/notificacoes/limpar_lidas/');
      toast.success('Notificações lidas removidas');
    } catch (error) {
      toast.error('Erro ao limpar notificações');
    } finally {
      setLoading(false);
    }
  };

  // Carregar ao montar
  useEffect(() => {
    carregarNaoLidas();
    
    // Polling a cada 30 segundos
    const interval = setInterval(carregarNaoLidas, 30000);
    
    return () => clearInterval(interval);
  }, [carregarNaoLidas]);

  return {
    notificacoes,
    naoLidas,
    loading,
    carregarNaoLidas,
    marcarComoLida,
    marcarTodasLidas,
    limparLidas,
  };
}
