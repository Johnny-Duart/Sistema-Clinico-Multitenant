from django.db.models import Q
from rest_framework import permissions, viewsets
from .models import Paciente
from .serializers import PacienteSerializer


class PacienteViewSet(viewsets.ModelViewSet):
    queryset = Paciente.objects.all()
    serializer_class = PacienteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Paciente.objects.all().select_related("clinica", "usuario")

        # Multi-tenancy: restringe por clínica do usuário logado se não for admin geral
        if getattr(user, "role", "") != "admin" and getattr(user, "clinica", None):
            queryset = queryset.filter(clinica=user.clinica)
        elif "clinica" in self.request.query_params:
            clinica_slug = self.request.query_params.get("clinica")
            if clinica_slug:
                queryset = queryset.filter(clinica__slug=clinica_slug)

        # Filtro de busca por nome ou CPF
        search = self.request.query_params.get("search", "").strip()
        if search:
            queryset = queryset.filter(
                Q(nome__icontains=search) | Q(cpf__icontains=search)
            )

        return queryset.order_by("nome")

    def perform_create(self, serializer):
        user = self.request.user
        if getattr(user, "clinica", None) and not serializer.validated_data.get("clinica"):
            serializer.save(clinica=user.clinica)
        else:
            serializer.save()
