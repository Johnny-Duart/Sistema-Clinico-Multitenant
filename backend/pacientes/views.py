from django.db.models import Q
from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied
from core.permissions import IsClinicStaff
from .models import Paciente
from .serializers import PacienteSerializer


class PacienteViewSet(viewsets.ModelViewSet):
    queryset = Paciente.objects.all()
    serializer_class = PacienteSerializer
    permission_classes = [IsClinicStaff]

    def get_queryset(self):
        user = self.request.user
        queryset = Paciente.objects.all().select_related("clinica", "usuario")

        if getattr(user, "role", "") == "admin" or user.is_superuser:
            clinica_slug = self.request.query_params.get("clinica")
            if clinica_slug:
                queryset = queryset.filter(clinica__slug=clinica_slug)
        else:
            if getattr(user, "clinica", None):
                queryset = queryset.filter(clinica=user.clinica)
            else:
                return queryset.none()

        search = self.request.query_params.get("search", "").strip()
        if search:
            queryset = queryset.filter(
                Q(nome__icontains=search) | Q(cpf__icontains=search)
            )

        return queryset.order_by("nome")

    def perform_create(self, serializer):
        user = self.request.user
        if getattr(user, "role", "") != "admin" and not user.is_superuser:
            if not getattr(user, "clinica", None):
                raise PermissionDenied(
                    "Usuário sem clínica vinculada não possui permissão para cadastrar pacientes."
                )
            serializer.save(clinica=user.clinica)
        else:
            serializer.save()

    def perform_update(self, serializer):
        user = self.request.user
        if getattr(user, "role", "") != "admin" and not user.is_superuser:
            serializer.save(clinica=self.get_object().clinica)
        else:
            serializer.save()
