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

    def validate(self, attrs):
        request = self.context.get("request")
        user = getattr(request, "user", None)

        clinica = None
        if self.instance and self.instance.clinica:
            clinica = self.instance.clinica
        elif user and getattr(user, "role", "") != "admin" and not getattr(user, "is_superuser", False):
            clinica = getattr(user, "clinica", None)
        elif "clinica" in attrs:
            clinica = attrs.get("clinica")

        paciente = attrs.get("paciente") or (self.instance.paciente if self.instance else None)
        if clinica and paciente and paciente.clinica and paciente.clinica != clinica:
            raise serializers.ValidationError(
                {"paciente": "O paciente selecionado não pertence à clínica deste agendamento."}
            )

        return attrs
