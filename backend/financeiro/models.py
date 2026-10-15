from agendamentos.models import Agendamento
from django.db import models


class Pagamento(models.Model):
    agendamento = models.OneToOneField(
        Agendamento, on_delete=models.CASCADE, related_name="pagamento"
    )
    gateway = models.CharField(max_length=30, default="mercadopago")
    transacao_id = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, default="pendente")
    valor = models.DecimalField(max_digits=8, decimal_places=2)
    atualizado_em = models.DateTimeField(auto_now=True)
