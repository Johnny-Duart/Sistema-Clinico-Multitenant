from rest_framework import serializers
from .models import Clinica


class ClinicaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Clinica
        fields = [
            "id",
            "nome",
            "slug",
            "descricao",
            "duracao_slot_minutos",
            "hora_abertura",
            "hora_fechamento",
            "dias_semana",
            "telefone",
            "email",
            "ativo",
        ]
