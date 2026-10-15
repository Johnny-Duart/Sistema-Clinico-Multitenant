import re

from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from .models import Paciente
from .validators import validar_cpf


class PacienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paciente
        fields = "__all__"

    def validate_cpf(self, value):
        cpf_limpo = re.sub(r"\D", "", value)
        try:
            validar_cpf(cpf_limpo)
        except DjangoValidationError as e:
            raise serializers.ValidationError(e.message)
        return cpf_limpo  # sempre salva só os 11 dígitos, sem máscara
