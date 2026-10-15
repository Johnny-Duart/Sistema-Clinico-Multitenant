from rest_framework import serializers
from .models import Usuario
from clinicas.serializers import ClinicaSerializer


class UsuarioSerializer(serializers.ModelSerializer):
    clinica_detalhes = ClinicaSerializer(source="clinica", read_only=True)
    nome_completo = serializers.SerializerMethodField()

    class Meta:
        model = Usuario
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "nome_completo",
            "role",
            "clinica",
            "clinica_detalhes",
            "telefone",
            "cpf",
        ]

    def get_nome_completo(self, obj):
        return obj.get_full_name() or obj.username
