from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """
    Permissão apenas para administradores
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_admin

class IsVeterinarioUser(permissions.BasePermission):
    """
    Permissão para veterinários e admins
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (
            request.user.is_veterinario or request.user.is_admin
        )

class IsTutorUser(permissions.BasePermission):
    """
    Permissão para tutores e admins
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (
            request.user.is_tutor or request.user.is_admin
        )

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Permissão para dono do objeto ou admin
    """
    def has_object_permission(self, request, view, obj):
        # Admins têm acesso total
        if request.user.is_admin:
            return True
        
        # Verificar se é o dono
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        # Para Tutor
        if hasattr(obj, 'tutor') and request.user.tutor_profile:
            return obj.tutor == request.user.tutor_profile
        
        return False

class ReadOnlyOrAuthenticated(permissions.BasePermission):
    """
    Leitura para todos, escrita apenas autenticados
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated
