import re

from django.core.exceptions import ValidationError


def validar_cpf(cpf):
    cpf = re.sub(r"\D", "", cpf)  # remove pontos, traços, espaços

    if len(cpf) != 11:
        raise ValidationError("CPF deve conter exatamente 11 dígitos.")

    if cpf == cpf[0] * 11:
        raise ValidationError("CPF inválido.")

    def calcular_digito(cpf_parcial):
        peso = len(cpf_parcial) + 1
        soma = sum(int(d) * (peso - i) for i, d in enumerate(cpf_parcial))
        resto = soma % 11
        return "0" if resto < 2 else str(11 - resto)

    digito1 = calcular_digito(cpf[:9])
    digito2 = calcular_digito(cpf[:9] + digito1)

    if cpf[-2:] != digito1 + digito2:
        raise ValidationError("CPF inválido.")
