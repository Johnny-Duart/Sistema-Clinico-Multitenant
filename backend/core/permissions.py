from rest_framework import permissions


class IsClinicStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        return request.user.role in ["admin", "profissional", "recepcao"] or request.user.is_superuser


class IsAdminUserRole(permissions.BasePermission):
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        return request.user.role == "admin" or request.user.is_superuser


class IsNotPatient(permissions.BasePermission):
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        return request.user.role != "paciente"
