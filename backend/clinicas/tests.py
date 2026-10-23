from datetime import time, timedelta
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from agendamentos.models import Agendamento
from clinicas.models import Clinica
from pacientes.models import Paciente

Usuario = get_user_model()


class ClinicaAndPublicBookingSecurityTests(APITestCase):
    def setUp(self):
        self.clinica = Clinica.objects.create(
            nome="Dermatologia Teste",
            slug="dermato-teste",
            duracao_slot_minutos=30,
            hora_abertura=time(8, 0),
            hora_fechamento=time(12, 0),
        )
        self.medico = Usuario.objects.create_user(
            username="medico_dermato",
            email="medico@dermato.com",
            password="SenhaForte123!",
            role="profissional",
            clinica=self.clinica,
        )

    def test_prevencao_account_takeover_no_agendamento_publico(self):
        amanha = (timezone.now() + timedelta(days=1)).replace(
            hour=9, minute=0, second=0, microsecond=0
        )
        payload = {
            "nome": "Atacante Falso",
            "cpf": "11144477735",
            "telefone": "(11) 99999-9999",
            "email": "medico@dermato.com",
            "senha": "senha_completamente_errada",
            "data_hora": amanha.isoformat(),
        }

        response = self.client.post(
            f"/api/clinicas/{self.clinica.slug}/agendar/",
            data=payload,
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertNotIn("tokens", response.data)

    def test_agendamento_publico_com_usuario_existente_e_senha_correta(self):
        amanha = (timezone.now() + timedelta(days=1)).replace(
            hour=9, minute=0, second=0, microsecond=0
        )
        payload = {
            "nome": "Dra. Sofia Martins",
            "cpf": "11144477735",
            "telefone": "(11) 99999-9999",
            "email": "medico@dermato.com",
            "senha": "SenhaForte123!",
            "data_hora": amanha.isoformat(),
        }

        response = self.client.post(
            f"/api/clinicas/{self.clinica.slug}/agendar/",
            data=payload,
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("tokens", response.data)
        self.assertIsNotNone(response.data["tokens"]["access"])

    def test_agendamento_publico_com_novo_usuario_cria_conta(self):
        amanha = (timezone.now() + timedelta(days=1)).replace(
            hour=10, minute=0, second=0, microsecond=0
        )
        payload = {
            "nome": "Novo Paciente João",
            "cpf": "22255588896",
            "telefone": "(11) 98888-8888",
            "email": "joao.paciente@teste.com",
            "senha": "minhasenhanova123",
            "data_hora": amanha.isoformat(),
        }

        response = self.client.post(
            f"/api/clinicas/{self.clinica.slug}/agendar/",
            data=payload,
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("tokens", response.data)

        novo_user = Usuario.objects.get(email="joao.paciente@teste.com")
        self.assertEqual(novo_user.role, "paciente")
        self.assertFalse(novo_user.is_staff)

    def test_prevencao_de_double_booking_retorna_409_conflict(self):
        amanha = (timezone.now() + timedelta(days=1)).replace(
            hour=11, minute=0, second=0, microsecond=0
        )
        payload_1 = {
            "nome": "Primeiro Paciente",
            "cpf": "11144477735",
            "email": "primeiro@teste.com",
            "data_hora": amanha.isoformat(),
        }
        res1 = self.client.post(
            f"/api/clinicas/{self.clinica.slug}/agendar/",
            data=payload_1,
            format="json",
        )
        self.assertEqual(res1.status_code, status.HTTP_201_CREATED)

        payload_2 = {
            "nome": "Segundo Paciente Concorrente",
            "cpf": "22255588896",
            "email": "segundo@teste.com",
            "data_hora": amanha.isoformat(),
        }
        res2 = self.client.post(
            f"/api/clinicas/{self.clinica.slug}/agendar/",
            data=payload_2,
            format="json",
        )
        self.assertEqual(res2.status_code, status.HTTP_409_CONFLICT)
        self.assertIn("erro", res2.data)

    def test_protecao_contra_dos_em_horarios_disponiveis(self):
        clinica_invalida = Clinica.objects.create(
            nome="Clínica Bugada",
            slug="clinica-bugada",
            duracao_slot_minutos=0,
            hora_abertura=time(8, 0),
            hora_fechamento=time(18, 0),
        )
        amanha = (timezone.now() + timedelta(days=1)).date().isoformat()
        response = self.client.get(
            f"/api/clinicas/{clinica_invalida.slug}/horarios-disponiveis/?data={amanha}"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
