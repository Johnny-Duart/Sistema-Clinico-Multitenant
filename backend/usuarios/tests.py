from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from clinicas.models import Clinica

Usuario = get_user_model()


class UsuarioSecurityTests(APITestCase):
    def setUp(self):
        self.clinica = Clinica.objects.create(
            nome="Clínica Exemplo",
            slug="exemplo",
            duracao_slot_minutos=30,
        )
        self.user_medico = Usuario.objects.create_user(
            username="medico_dr",
            email="medico@exemplo.com",
            password="password123",
            role="profissional",
            clinica=self.clinica,
        )
        self.user_paciente = Usuario.objects.create_user(
            username="paciente_joao",
            email="joao@email.com",
            password="password123",
            role="paciente",
        )

    def test_usuario_me_retorna_perfil_autenticado_com_clinica(self):
        self.client.force_authenticate(user=self.user_medico)
        res = self.client.get("/api/usuarios/me/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["username"], "medico_dr")
        self.assertEqual(res.data["role"], "profissional")
        self.assertEqual(res.data["clinica"], self.clinica.id)
        self.assertIn("clinica_detalhes", res.data)

    def test_usuario_me_sem_autenticacao_retorna_401(self):
        res = self.client.get("/api/usuarios/me/")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_registro_paciente_cria_usuario_com_role_paciente(self):
        payload = {
            "username": "novo_paciente_reg",
            "email": "novo@paciente.com",
            "password": "SenhaSegura123!",
            "nome": "Maria Paciente",
            "cpf": "11144477735",
            "telefone": "(11) 97777-7777",
        }
        res = self.client.post("/api/usuarios/registro/", data=payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn("tokens", res.data)

        novo = Usuario.objects.get(username="novo_paciente_reg")
        self.assertEqual(novo.role, "paciente")
        self.assertIsNone(novo.clinica)
        self.assertFalse(novo.is_staff)

    def test_registro_com_username_duplicado_retorna_400(self):
        payload = {
            "username": "paciente_joao",
            "email": "outro@email.com",
            "password": "SenhaSegura123!",
        }
        res = self.client.post("/api/usuarios/registro/", data=payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("erro", res.data)
