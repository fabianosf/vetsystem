import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'ADMIN' | 'VETERINARIO' | 'ATENDENTE' | 'RECEPCIONISTA';
  role_display: string;
  full_name: string;
  phone?: string;
  cpf?: string;
  crmv?: string;
  photo?: string;
  address?: string;
  city?: string;
  state?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: User) => void;
  isAuthenticated: boolean;
  hasRole: (roles: string[]) => boolean;
  isAdmin: () => boolean;
  isVeterinario: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Tentar buscar dados atualizados do servidor
        try {
          const response = await api.get('/accounts/users/me/');
          const freshUserData = response.data;
          
          setUser(freshUserData);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(freshUserData));
        } catch (error) {
          // Se falhar, usar dados do localStorage
          setUser(JSON.parse(userData));
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      // Login e obtenção do token
      const tokenResponse = await api.post('/accounts/token/', { 
        username, 
        password 
      });
      
      const { access, refresh } = tokenResponse.data;

      // Salvar tokens
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      // Configurar header de autorização
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      
      // Buscar dados do usuário
      const userResponse = await api.get('/accounts/users/me/');
      const userData = userResponse.data;

      // Salvar usuário
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);

      toast.success(`Bem-vindo, ${userData.full_name || userData.username}!`);
    } catch (error: any) {
      console.error('Erro no login:', error);
      toast.error('Usuário ou senha inválidos');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token'); // Manter compatibilidade
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
    toast.info('Você saiu do sistema');
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const hasRole = (roles: string[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  const isAdmin = (): boolean => {
    return user?.role === 'ADMIN';
  };

  const isVeterinario = (): boolean => {
    return user ? ['ADMIN', 'VETERINARIO'].includes(user.role) : false;
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading,
        login, 
        logout, 
        updateUser, 
        isAuthenticated,
        hasRole,
        isAdmin,
        isVeterinario,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
