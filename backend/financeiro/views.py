import mercadopago
from agendamentos.models import Agendamento
from rest_framework.response import Response
from rest_framework.views import APIView

sdk = mercadopago.SDK("SEU_ACCESS_TOKEN")


class CriarPagamentoView(APIView):
    def post(self, request, agendamento_id):
        agendamento = Agendamento.objects.get(id=agendamento_id)

        preference_data = {
            "items": [
                {
                    "title": f"Consulta dermatológica - {agendamento.data_hora.strftime('%d/%m %H:%M')}",
                    "quantity": 1,
                    "unit_price": float(agendamento.valor),
                }
            ],
            "back_urls": {
                "success": "http://localhost:5173/agendamento/sucesso",
                "failure": "http://localhost:5173/agendamento/falha",
            },
            "notification_url": "https://seubackend.com/api/webhook/mercadopago/",
        }
        preference = sdk.preference().create(preference_data)
        return Response({"checkout_url": preference["response"]["init_point"]})
