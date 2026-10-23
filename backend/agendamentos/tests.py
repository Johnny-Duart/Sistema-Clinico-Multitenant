from datetime import datetime, timedelta
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from agendamentos.models import Agendamento
from clinicas.models import Clinica
from pacientes.models import Paciente

Usuario = get_user_model()


class MultiTenancyAgendamentoSecurityTests(APITestCase):
    def setUp(self):
        self.clinica_a = Clinica.objects.create(
            nome="Clínica Dermatológica Alpha",
            slug="alpha-dermato",
            duracao_slot_minutos=20,
        )
        self.clinica_b = Clinica.objects.create(
            nome="Clínica Odontológica Beta",
            slug="beta-odonto",
            duracao_slot_minutos=40,
        )

        self.staff_a = Usuario.objects.create_user(
            username="medico_alpha",
            password="password123",
            role="profissional",
            clinica=self.clinica_a,
        )
        self.recep_a = Usuario.objects.create_user(
            username="recep_alpha",
            password="password123",
            role="recepcao",
            clinica=self.clinica_a,
        )

        self.staff_b = Usuario.objects.create_user(
            username="dentista_beta",
            password="password123",
            role="profissional",
            clinica=self.clinica_b,
        )
        self.recep_b = Usuario.objects.create_user(
            username="recep_beta",
            password="password123",
            role="recepcao",
            clinica=self.clinica_b,
        )

        self.staff_sem_clinica = Usuario.objects.create_user(
            username="staff_orfao",
            password="password123",
            role="recepcao",
            clinica=None,
        )

        self.user_paciente_a = Usuario.objects.create_user(
            username="paciente_alpha_user",
            password="password123",
            role="paciente",
        )
        self.user_paciente_b = Usuario.objects.create_user(
            username="paciente_beta_user",
            password="password123",
            role="paciente",
        )

        self.admin_master = Usuario.objects.create_user(
            username="admin_master",
            password="password123",
            role="admin",
            clinica=None,
        )

        self.paciente_a = Paciente.objects.create(
            clinica=self.clinica_a,
            usuario=self.user_paciente_a,
            nome="Paciente da Clínica A",
            cpf="11144477735",
            email="paciente_a@teste.com",
        )
        self.paciente_b = Paciente.objects.create(
            clinica=self.clinica_b,
            usuario=self.user_paciente_b,
            nome="Paciente da Clínica B",
            cpf="22255588896",
            email="paciente_b@teste.com",
        )

        amanha = timezone.now() + timedelta(days=1)
        self.agendamento_a = Agendamento.objects.create(
            clinica=self.clinica_a,
            paciente=self.paciente_a,
            data_hora=amanha.replace(hour=9, minute=0, second=0, microsecond=0),
            duracao_minutos=20,
            status="agendado",
        )
        self.agendamento_b = Agendamento.objects.create(
            clinica=self.clinica_b,
            paciente=self.paciente_b,
            data_hora=amanha.replace(hour=10, minute=0, second=0, microsecond=0),
            duracao_minutos=40,
            status="agendado",
        )

    def test_usuario_clinica_a_tenta_consultar_agendamento_de_b_pelo_id(self):
        self.client.force_authenticate(user=self.staff_a)
        response = self.client.get(f"/api/agendamentos/{self.agendamento_b.id}/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_usuario_clinica_a_tenta_alterar_agendamento_de_b_pelo_id(self):
        self.client.force_authenticate(user=self.staff_a)
        payload = {
            "observacoes": "Tentativa de adulteração indevida de observações do tenant B"
        }
        response = self.client.patch(
            f"/api/agendamentos/{self.agendamento_b.id}/",
            data=payload,
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.agendamento_b.refresh_from_db()
        self.assertNotEqual(self.agendamento_b.observacoes, payload["observacoes"])

    def test_usuario_clinica_a_tenta_cancelar_agendamento_de_b_pelo_id(self):
        self.client.force_authenticate(user=self.staff_a)
        response = self.client.post(
            f"/api/agendamentos/{self.agendamento_b.id}/cancelar/"
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.agendamento_b.refresh_from_db()
        self.assertEqual(self.agendamento_b.status, "agendado")

    def test_usuario_clinica_a_tenta_mudar_status_de_b(self):
        self.client.force_authenticate(user=self.staff_a)
        response = self.client.patch(
            f"/api/agendamentos/{self.agendamento_b.id}/status/",
            data={"status": "realizado"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.agendamento_b.refresh_from_db()
        self.assertEqual(self.agendamento_b.status, "agendado")

    def test_usuario_clinica_a_tenta_excluir_agendamento_de_b(self):
        self.client.force_authenticate(user=self.staff_a)
        response = self.client.delete(f"/api/agendamentos/{self.agendamento_b.id}/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(Agendamento.objects.filter(id=self.agendamento_b.id).exists())

    def test_servidor_deriva_escopo_do_token_ao_criar_agendamento(self):
        self.client.force_authenticate(user=self.staff_a)
        amanha = timezone.now() + timedelta(days=2)
        payload = {
            "clinica": self.clinica_b.id,
            "paciente": self.paciente_a.id,
            "data_hora": amanha.isoformat(),
            "observacoes": "Consulta marcada pela equipe da clínica A",
        }
        response = self.client.post("/api/agendamentos/", data=payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        novo_agendamento_id = response.data["id"]
        novo_agendamento = Agendamento.objects.get(id=novo_agendamento_id)
        self.assertEqual(novo_agendamento.clinica, self.clinica_a)
        self.assertNotEqual(novo_agendamento.clinica, self.clinica_b)

    def test_impede_associar_paciente_de_outra_clinica_ao_agendamento(self):
        self.client.force_authenticate(user=self.staff_a)
        amanha = timezone.now() + timedelta(days=2)
        payload = {
            "paciente": self.paciente_b.id,
            "data_hora": amanha.isoformat(),
        }
        response = self.client.post("/api/agendamentos/", data=payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("paciente", response.data)

    def test_impede_transferencia_de_clinica_no_update(self):
        self.client.force_authenticate(user=self.staff_a)
        response = self.client.patch(
            f"/api/agendamentos/{self.agendamento_a.id}/",
            data={"clinica": self.clinica_b.id},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.agendamento_a.refresh_from_db()
        self.assertEqual(self.agendamento_a.clinica, self.clinica_a)

    def test_listagem_de_agendamentos_restringe_estritamente_ao_tenant(self):
        self.client.force_authenticate(user=self.staff_a)

        res = self.client.get("/api/agendamentos/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        ids = [item["id"] for item in res.data]
        self.assertIn(self.agendamento_a.id, ids)
        self.assertNotIn(self.agendamento_b.id, ids)

        res_tamper = self.client.get(f"/api/agendamentos/?clinica={self.clinica_b.slug}")
        self.assertEqual(res_tamper.status_code, status.HTTP_200_OK)
        ids_tamper = [item["id"] for item in res_tamper.data]
        self.assertIn(self.agendamento_a.id, ids_tamper)
        self.assertNotIn(self.agendamento_b.id, ids_tamper)

    def test_paciente_so_visualiza_seus_proprios_agendamentos(self):
        self.client.force_authenticate(user=self.user_paciente_a)
        res = self.client.get("/api/agendamentos/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        ids = [item["id"] for item in res.data]
        self.assertIn(self.agendamento_a.id, ids)
        self.assertNotIn(self.agendamento_b.id, ids)

    def test_paciente_nao_pode_cancelar_agendamento_de_outro_paciente(self):
        self.client.force_authenticate(user=self.user_paciente_a)
        res = self.client.post(f"/api/agendamentos/{self.agendamento_b.id}/cancelar/")
        self.assertIn(res.status_code, [status.HTTP_404_NOT_FOUND, status.HTTP_403_FORBIDDEN])
        self.agendamento_b.refresh_from_db()
        self.assertEqual(self.agendamento_b.status, "agendado")

    def test_paciente_nao_pode_alterar_status_operacional_do_agendamento(self):
        self.client.force_authenticate(user=self.user_paciente_a)
        res = self.client.patch(
            f"/api/agendamentos/{self.agendamento_a.id}/status/",
            data={"status": "realizado"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
        self.agendamento_a.refresh_from_db()
        self.assertEqual(self.agendamento_a.status, "agendado")

    def test_paciente_nao_pode_criar_agendamento_direto_pelo_viewset(self):
        self.client.force_authenticate(user=self.user_paciente_a)
        amanha = timezone.now() + timedelta(days=1)
        res = self.client.post(
            "/api/agendamentos/",
            data={
                "clinica": self.clinica_a.id,
                "paciente": self.paciente_a.id,
                "data_hora": amanha.isoformat(),
            },
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_paciente_pode_cancelar_seu_proprio_agendamento(self):
        self.client.force_authenticate(user=self.user_paciente_a)
        res = self.client.post(f"/api/agendamentos/{self.agendamento_a.id}/cancelar/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.agendamento_a.refresh_from_db()
        self.assertEqual(self.agendamento_a.status, "cancelado")

    def test_usuario_operacional_sem_clinica_tem_acesso_negado_ou_vazio(self):
        self.client.force_authenticate(user=self.staff_sem_clinica)
        res_list = self.client.get("/api/agendamentos/")
        self.assertEqual(res_list.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res_list.data), 0)

        amanha = timezone.now() + timedelta(days=1)
        res_create = self.client.post(
            "/api/agendamentos/",
            data={
                "paciente": self.paciente_a.id,
                "data_hora": amanha.isoformat(),
            },
            format="json",
        )
        self.assertEqual(res_create.status_code, status.HTTP_403_FORBIDDEN)

    def test_administrador_geral_pode_ver_todas_as_clinicas_e_filtrar(self):
        self.client.force_authenticate(user=self.admin_master)

        res_all = self.client.get("/api/agendamentos/")
        self.assertEqual(res_all.status_code, status.HTTP_200_OK)
        ids = [item["id"] for item in res_all.data]
        self.assertIn(self.agendamento_a.id, ids)
        self.assertIn(self.agendamento_b.id, ids)

        res_a = self.client.get(f"/api/agendamentos/?clinica={self.clinica_a.slug}")
        ids_a = [item["id"] for item in res_a.data]
        self.assertIn(self.agendamento_a.id, ids_a)
        self.assertNotIn(self.agendamento_b.id, ids_a)
