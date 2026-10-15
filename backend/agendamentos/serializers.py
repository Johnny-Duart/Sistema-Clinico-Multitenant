from rest_framework import serializers
from .models import Agendamento


class AgendamentoSerializer(serializers.ModelSerializer):
    paciente_nome = serializers.CharField(source="paciente.nome", read_only=True)
    paciente_telefone = serializers.CharField(source="paciente.telefone", read_only=True)
    paciente_cpf = serializers.CharField(source="paciente.cpf", read_only=True)
    clinica_nome = serializers.CharField(source="clinica.nome", read_only=True)
    clinica_slug = serializers.CharField(source="clinica.slug", read_only=True)

    class Meta:
        model = Agendamento
        fields = [
            "id",
            "clinica",
            "clinica_nome",
            "clinica_slug",
            "paciente",
            "paciente_nome",
            "paciente_telefone",
            "paciente_cpf",
            "data_hora",
            "duracao_minutos",
            "observacoes",
            "status",
            "status_pagamento",
            "valor",
            "criado_em",
            "atualizado_em",
        ]
