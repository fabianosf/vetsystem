from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """
    Permissão apenas para admins
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'ADMIN'


class IsVeterinario(permissions.BasePermission):
    """
    Permissão para veterinários
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role in ['ADMIN', 'VETERINARIO']


class IsAtendente(permissions.BasePermission):
    """
    Permissão para atendentes
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role in ['ADMIN', 'ATENDENTE', 'RECEPCIONISTA']


class ReadOnlyOrAuthenticated(permissions.BasePermission):
    """
    Leitura para todos autenticados, escrita apenas para roles específicos
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_authenticated and request.user.role in ['ADMIN', 'VETERINARIO', 'ATENDENTE']
