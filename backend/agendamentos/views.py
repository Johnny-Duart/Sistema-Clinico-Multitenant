from datetime import datetime
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Agendamento
from .serializers import AgendamentoSerializer


class AgendamentoViewSet(viewsets.ModelViewSet):
    queryset = Agendamento.objects.all()
    serializer_class = AgendamentoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Agendamento.objects.select_related("paciente", "clinica").all()

        # Se for paciente, vê apenas os agendamentos dele
        if getattr(user, "role", "") == "paciente":
            return queryset.filter(paciente__usuario=user).order_by("-data_hora")

        # Se tiver clínica associada (médico / recepcionista)
        if getattr(user, "role", "") != "admin" and getattr(user, "clinica", None):
            queryset = queryset.filter(clinica=user.clinica)
        elif "clinica" in self.request.query_params:
            clinica_slug = self.request.query_params.get("clinica")
            if clinica_slug:
                queryset = queryset.filter(clinica__slug=clinica_slug)

        # Filtro opcional por data (AAAA-MM-DD)
        data_filtro = self.request.query_params.get("data")
        if data_filtro:
            try:
                data_obj = datetime.strptime(data_filtro, "%Y-%m-%d").date()
                queryset = queryset.filter(data_hora__date=data_obj)
            except ValueError:
                pass

        # Filtro opcional por status
        status_filtro = self.request.query_params.get("status")
        if status_filtro:
            queryset = queryset.filter(status=status_filtro)

        return queryset.order_by("data_hora")

    def perform_create(self, serializer):
        user = self.request.user
        if getattr(user, "clinica", None) and not serializer.validated_data.get("clinica"):
            serializer.save(clinica=user.clinica)
        else:
            serializer.save()

    @action(detail=False, methods=["get"], url_path="meus")
    def meus(self, request):
        """Retorna os agendamentos do paciente logado"""
        user = request.user
        agendamentos = Agendamento.objects.filter(
            paciente__usuario=user
        ).select_related("clinica", "paciente").order_by("-data_hora")
        serializer = self.get_serializer(agendamentos, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="cancelar")
    def cancelar(self, request, pk=None):
        agendamento = self.get_object()
        user = request.user

        # Paciente só pode cancelar se for o agendamento dele
        if getattr(user, "role", "") == "paciente":
            if agendamento.paciente.usuario != user:
                return Response(
                    {"erro": "Permissão negada."},
                    status=status.HTTP_403_FORBIDDEN,
                )

        agendamento.status = "cancelado"
        agendamento.save()
        return Response(
            {
                "mensagem": "Agendamento cancelado com sucesso.",
                "agendamento": self.get_serializer(agendamento).data,
            }
        )

    @action(detail=True, methods=["patch"], url_path="status")
    def atualizar_status(self, request, pk=None):
        agendamento = self.get_object()
        novo_status = request.data.get("status")
        status_validos = [s[0] for s in Agendamento.STATUS_CHOICES]

        if novo_status not in status_validos:
            return Response(
                {"erro": f"Status inválido. Escolha entre: {', '.join(status_validos)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        agendamento.status = novo_status
        agendamento.save()
        return Response(self.get_serializer(agendamento).data)
