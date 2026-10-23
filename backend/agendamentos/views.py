from datetime import datetime
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
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

        if getattr(user, "role", "") == "paciente":
            return queryset.filter(paciente__usuario=user).order_by("-data_hora")

        if getattr(user, "role", "") == "admin" or user.is_superuser:
            clinica_slug = self.request.query_params.get("clinica")
            if clinica_slug:
                queryset = queryset.filter(clinica__slug=clinica_slug)
        else:
            if getattr(user, "clinica", None):
                queryset = queryset.filter(clinica=user.clinica)
            else:
                return queryset.none()

        data_filtro = self.request.query_params.get("data")
        if data_filtro:
            try:
                data_obj = datetime.strptime(data_filtro, "%Y-%m-%d").date()
                queryset = queryset.filter(data_hora__date=data_obj)
            except ValueError:
                pass

        status_filtro = self.request.query_params.get("status")
        if status_filtro:
            queryset = queryset.filter(status=status_filtro)

        return queryset.order_by("data_hora")

    def perform_create(self, serializer):
        user = self.request.user

        if getattr(user, "role", "") == "paciente":
            raise PermissionDenied(
                "Pacientes devem utilizar o fluxo de agendamento público para reservar horários."
            )

        if getattr(user, "role", "") != "admin" and not user.is_superuser:
            if not getattr(user, "clinica", None):
                raise PermissionDenied(
                    "Usuário sem clínica vinculada não possui permissão para cadastrar agendamentos."
                )
            serializer.save(clinica=user.clinica)
        else:
            paciente = serializer.validated_data.get("paciente")
            if "clinica" not in serializer.validated_data and paciente and paciente.clinica:
                serializer.save(clinica=paciente.clinica)
            else:
                serializer.save()

    def perform_update(self, serializer):
        user = self.request.user
        if getattr(user, "role", "") == "paciente":
            raise PermissionDenied("Pacientes não possuem permissão para editar agendamentos diretamente.")

        if getattr(user, "role", "") != "admin" and not user.is_superuser:
            serializer.save(clinica=self.get_object().clinica)
        else:
            serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user
        if getattr(user, "role", "") == "paciente":
            raise PermissionDenied(
                "Pacientes não possuem permissão para excluir agendamentos. Utilize a ação de cancelamento."
            )
        instance.delete()

    @action(detail=False, methods=["get"], url_path="meus")
    def meus(self, request):
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

        if getattr(user, "role", "") == "paciente":
            if not agendamento.paciente or agendamento.paciente.usuario != user:
                return Response(
                    {"erro": "Permissão negada. Este agendamento não pertence ao seu usuário."},
                    status=status.HTTP_403_FORBIDDEN,
                )
        elif getattr(user, "role", "") != "admin" and not user.is_superuser:
            if agendamento.clinica != getattr(user, "clinica", None):
                return Response(
                    {"erro": "Permissão negada. Agendamento pertence a outra clínica."},
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
        user = request.user
        if getattr(user, "role", "") == "paciente":
            return Response(
                {"erro": "Pacientes não possuem permissão para alterar o status operacional do agendamento."},
                status=status.HTTP_403_FORBIDDEN,
            )

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
