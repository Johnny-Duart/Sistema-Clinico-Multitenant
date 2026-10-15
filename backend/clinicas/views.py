from datetime import datetime, time, timedelta
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from agendamentos.models import Agendamento
from pacientes.models import Paciente
from .models import Clinica
from .serializers import ClinicaSerializer

Usuario = get_user_model()


class ClinicaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Clinica.objects.filter(ativo=True)
    serializer_class = ClinicaSerializer
    lookup_field = "slug"
    permission_classes = [permissions.AllowAny]


class HorariosDisponiveisView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, slug):
        try:
            clinica = Clinica.objects.get(slug=slug, ativo=True)
        except Clinica.DoesNotExist:
            return Response(
                {"erro": f"Clínica '{slug}' não encontrada."},
                status=status.HTTP_404_NOT_FOUND,
            )

        data_str = request.query_params.get("data")
        if not data_str:
            return Response(
                {"erro": "Parâmetro 'data' (formato AAAA-MM-DD) é obrigatório."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            data_alvo = datetime.strptime(data_str, "%Y-%m-%d").date()
        except ValueError:
            return Response(
                {"erro": "Formato de data inválido. Use AAAA-MM-DD."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Verificar se é data passada
        hoje = timezone.localdate()
        if data_alvo < hoje:
            return Response(
                {"horarios": [], "mensagem": "Não é possível agendar em datas passadas."},
                status=status.HTTP_200_OK,
            )

        # Gerar slots de tempo do início ao fim
        slot_min = clinica.duracao_slot_minutos or 30
        hora_atual = datetime.combine(data_alvo, clinica.hora_abertura)
        hora_fim = datetime.combine(data_alvo, clinica.hora_fechamento)

        todos_slots = []
        while hora_atual + timedelta(minutes=slot_min) <= hora_fim:
            todos_slots.append(hora_atual)
            hora_atual += timedelta(minutes=slot_min)

        # Buscar agendamentos existentes no dia que não estejam cancelados
        agendamentos_ocupados = Agendamento.objects.filter(
            clinica=clinica,
            data_hora__date=data_alvo,
        ).exclude(status="cancelado")

        horarios_ocupados = {
            timezone.localtime(a.data_hora).strftime("%H:%M")
            for a in agendamentos_ocupados
        }

        # Filtrar horários passados se o dia for hoje
        agora = timezone.localtime()
        horarios_disponiveis = []
        for slot in todos_slots:
            slot_str = slot.strftime("%H:%M")
            slot_aware = timezone.make_aware(slot) if timezone.is_naive(slot) else slot

            if data_alvo == hoje and slot_aware <= agora:
                continue

            if slot_str not in horarios_ocupados:
                horarios_disponiveis.append(slot_str)

        return Response({
            "clinica": clinica.nome,
            "slug": clinica.slug,
            "data": data_str,
            "duracao_slot_minutos": slot_min,
            "horarios": horarios_disponiveis,
        })


class AgendarPublicoView(APIView):
    permission_classes = [permissions.AllowAny]

    @transaction.atomic
    def post(self, request, slug):
        try:
            clinica = Clinica.objects.get(slug=slug, ativo=True)
        except Clinica.DoesNotExist:
            return Response(
                {"erro": f"Clínica '{slug}' não encontrada."},
                status=status.HTTP_404_NOT_FOUND,
            )

        dados = request.data
        nome = dados.get("nome", "").strip()
        cpf = dados.get("cpf", "").strip()
        telefone = dados.get("telefone", "").strip()
        email = dados.get("email", "").strip().lower()
        senha = dados.get("senha", "")
        data_hora_str = dados.get("data_hora", "")
        observacoes = dados.get("observacoes", "").strip()

        if not nome or not cpf or not data_hora_str:
            return Response(
                {"erro": "Nome, CPF e data/hora são obrigatórios."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            data_hora = datetime.fromisoformat(data_hora_str.replace("Z", "+00:00"))
            if timezone.is_naive(data_hora):
                data_hora = timezone.make_aware(data_hora)
        except ValueError:
            return Response(
                {"erro": "Formato de data_hora inválido. Use formato ISO (ex: 2026-10-05T09:00:00)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Checar se já existe agendamento neste horário na clínica
        horario_ocupado = Agendamento.objects.filter(
            clinica=clinica,
            data_hora=data_hora,
        ).exclude(status="cancelado").exists()

        if horario_ocupado:
            return Response(
                {"erro": "Este horário acabou de ser reservado. Por favor, escolha outro."},
                status=status.HTTP_409_CONFLICT,
            )

        cpf_limpo = "".join(filter(str.isdigit, cpf))
        usuario = None
        tokens = None

        # Criar conta para o paciente se informado senha
        if senha:
            username = email or cpf_limpo
            usuario = Usuario.objects.filter(username=username).first()
            if not usuario:
                usuario = Usuario.objects.create_user(
                    username=username,
                    email=email,
                    password=senha,
                    first_name=nome.split()[0],
                    last_name=" ".join(nome.split()[1:]) if len(nome.split()) > 1 else "",
                    role="paciente",
                    cpf=cpf_limpo,
                    telefone=telefone,
                )
            refresh = RefreshToken.for_user(usuario)
            tokens = {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            }

        # Criar ou atualizar Paciente
        paciente, _ = Paciente.objects.get_or_create(
            clinica=clinica,
            cpf=cpf_limpo,
            defaults={
                "nome": nome,
                "telefone": telefone,
                "email": email,
                "usuario": usuario,
            },
        )
        if usuario and not paciente.usuario:
            paciente.usuario = usuario
            paciente.save()

        # Criar Agendamento
        agendamento = Agendamento.objects.create(
            clinica=clinica,
            paciente=paciente,
            data_hora=data_hora,
            duracao_minutos=clinica.duracao_slot_minutos,
            observacoes=observacoes,
            status="agendado",
            status_pagamento="pendente",
        )

        return Response(
            {
                "mensagem": "Agendamento realizado com sucesso!",
                "agendamento": {
                    "id": agendamento.id,
                    "clinica": clinica.nome,
                    "paciente": paciente.nome,
                    "data_hora": agendamento.data_hora.isoformat(),
                    "duracao_minutos": agendamento.duracao_minutos,
                    "status": agendamento.status,
                },
                "tokens": tokens,
            },
            status=status.HTTP_201_CREATED,
        )
