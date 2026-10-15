from django.db import models


class Agendamento(models.Model):
    STATUS_CHOICES = [
        ("agendado", "Agendado"),
        ("confirmado", "Confirmado"),
        ("cancelado", "Cancelado"),
        ("realizado", "Realizado"),
    ]
    PAGAMENTO_CHOICES = [
        ("nao_aplicavel", "Não aplicável"),
        ("pendente", "Pendente"),
        ("pago", "Pago"),
    ]

    clinica = models.ForeignKey(
        "clinicas.Clinica",
        on_delete=models.CASCADE,
        related_name="agendamentos",
        null=True,
        blank=True,
        help_text="Clínica do agendamento"
    )
    paciente = models.ForeignKey(
        "pacientes.Paciente",
        on_delete=models.CASCADE,
        related_name="agendamentos"
    )
    data_hora = models.DateTimeField()
    duracao_minutos = models.PositiveIntegerField(default=30)
    observacoes = models.TextField(blank=True)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="agendado"
    )
    status_pagamento = models.CharField(
        max_length=20, choices=PAGAMENTO_CHOICES, default="nao_aplicavel"
    )
    valor = models.DecimalField(
        max_digits=8, decimal_places=2, null=True, blank=True
    )
    criado_em = models.DateTimeField(auto_now_add=True, null=True)
    atualizado_em = models.DateTimeField(auto_now=True, null=True)

    class Meta:
        verbose_name = "Agendamento"
        verbose_name_plural = "Agendamentos"
        ordering = ["data_hora"]

    def __str__(self):
        clinica_str = f" [{self.clinica.nome}]" if self.clinica else ""
        return f"{self.paciente.nome} - {self.data_hora.strftime('%d/%m/%Y %H:%M')}{clinica_str}"
