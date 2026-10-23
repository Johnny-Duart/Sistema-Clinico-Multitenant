from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from clinicas.models import Clinica
from pacientes.models import Paciente

Usuario = get_user_model()


class MultiTenancyPacienteSecurityTests(APITestCase):
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
            username="recep_alpha",
            password="password123",
            role="recepcao",
            clinica=self.clinica_a,
        )
        self.staff_b = Usuario.objects.create_user(
            username="recep_beta",
            password="password123",
            role="recepcao",
            clinica=self.clinica_b,
        )
        self.staff_sem_clinica = Usuario.objects.create_user(
            username="staff_sem_clinica",
            password="password123",
            role="recepcao",
            clinica=None,
        )
        self.paciente_user = Usuario.objects.create_user(
            username="paciente_comum",
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
            nome="Paciente Alpha",
            cpf="11144477735",
            email="paciente_alpha@teste.com",
            telefone="(11) 91111-1111",
        )
        self.paciente_b = Paciente.objects.create(
            clinica=self.clinica_b,
            nome="Paciente Beta",
            cpf="22255588896",
            email="paciente_beta@teste.com",
            telefone="(11) 92222-2222",
        )

    def test_usuario_clinica_a_nao_enxerga_paciente_de_b(self):
        self.client.force_authenticate(user=self.staff_a)
        res = self.client.get("/api/pacientes/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        ids = [p["id"] for p in res.data]
        self.assertIn(self.paciente_a.id, ids)
        self.assertNotIn(self.paciente_b.id, ids)

    def test_usuario_clinica_a_tenta_consultar_paciente_b_pelo_id(self):
        self.client.force_authenticate(user=self.staff_a)
        res = self.client.get(f"/api/pacientes/{self.paciente_b.id}/")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_usuario_clinica_a_tenta_alterar_paciente_b(self):
        self.client.force_authenticate(user=self.staff_a)
        res = self.client.patch(
            f"/api/pacientes/{self.paciente_b.id}/",
            data={"nome": "Nome Modificado Indevidamente"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)
        self.paciente_b.refresh_from_db()
        self.assertEqual(self.paciente_b.nome, "Paciente Beta")

    def test_servidor_deriva_clinica_do_usuario_ao_cadastrar_paciente(self):
        self.client.force_authenticate(user=self.staff_a)
        payload = {
            "nome": "Novo Paciente em A",
            "cpf": "12345678909",
            "telefone": "(11) 93333-3333",
            "email": "novo.a@teste.com",
            "clinica": self.clinica_b.id,
        }
        res = self.client.post("/api/pacientes/", data=payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        novo_paciente = Paciente.objects.get(id=res.data["id"])
        self.assertEqual(novo_paciente.clinica, self.clinica_a)
        self.assertNotEqual(novo_paciente.clinica, self.clinica_b)

    def test_paciente_nao_tem_permissao_para_acessar_viewset_de_pacientes(self):
        self.client.force_authenticate(user=self.paciente_user)
        res = self.client.get("/api/pacientes/")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        res_detail = self.client.get(f"/api/pacientes/{self.paciente_a.id}/")
        self.assertEqual(res_detail.status_code, status.HTTP_403_FORBIDDEN)

    def test_usuario_operacional_sem_clinica_tem_acesso_vazio_em_pacientes(self):
        self.client.force_authenticate(user=self.staff_sem_clinica)
        res = self.client.get("/api/pacientes/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 0)

        res_post = self.client.post(
            "/api/pacientes/",
            data={
                "nome": "Tentativa Órfã",
                "cpf": "98765432100",
            },
            format="json",
        )
        self.assertEqual(res_post.status_code, status.HTTP_403_FORBIDDEN)
