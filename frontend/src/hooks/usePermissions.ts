import { useAuth } from '../contexts/AuthContext';

export type UserRole = 'admin' | 'veterinario' | 'recepcionista' | 'tutor';

interface Permissions {
  // Consultas
  canCreateConsulta: boolean;
  canEditConsulta: boolean;
  canCancelConsulta: boolean;
  canViewAllConsultas: boolean;
  
  // Animais
  canCreateAnimal: boolean;
  canEditAnimal: boolean;
  canDeleteAnimal: boolean;
  
  // Usuários
  canManageUsers: boolean;
  canViewUsers: boolean;
  
  // Clínicas/Planos (admin only)
  canManageClinicas: boolean;
  canManagePlanos: boolean;
  
  // Notificações
  canSendNotifications: boolean;
  
  // Relatórios
  canViewReports: boolean;
  canExportData: boolean;
  
  // Role atual
  isAdmin: boolean;
  isVeterinario: boolean;
  isRecepcionista: boolean;
  isTutor: boolean;
}

export const usePermissions = (): Permissions => {
  const { user } = useAuth();
  
  // Normaliza role para minúsculo para aceitar Admin, ADMIN, admin, etc.
  const role = user?.role?.toLowerCase() as UserRole;

  const isAdmin = role === 'admin';
  const isVeterinario = role === 'veterinario';
  const isRecepcionista = role === 'recepcionista';
  const isTutor = role === 'tutor';

  return {
    // Consultas
    canCreateConsulta: isAdmin || isVeterinario || isRecepcionista,
    canEditConsulta: isAdmin || isVeterinario,
    canCancelConsulta: isAdmin || isVeterinario || isRecepcionista,
    canViewAllConsultas: isAdmin || isVeterinario || isRecepcionista,
    
    // Animais
    canCreateAnimal: isAdmin || isRecepcionista || isTutor,
    canEditAnimal: isAdmin || isVeterinario || isRecepcionista,
    canDeleteAnimal: isAdmin,
    
    // Usuários
    canManageUsers: isAdmin,
    canViewUsers: isAdmin || isRecepcionista,
    
    // Clínicas/Planos
    canManageClinicas: isAdmin,
    canManagePlanos: isAdmin,
    
    // Notificações
    canSendNotifications: isAdmin || isVeterinario || isRecepcionista,
    
    // Relatórios
    canViewReports: isAdmin || isVeterinario,
    canExportData: isAdmin,
    
    // Roles
    isAdmin,
    isVeterinario,
    isRecepcionista,
    isTutor,
  };
};
