from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Usuario
from .serializers import UsuarioSerializer


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UsuarioSerializer(request.user)
        return Response(serializer.data)


class RegistroPacienteView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        dados = request.data
        username = dados.get("username", "").strip() or dados.get("email", "").strip()
        email = dados.get("email", "").strip()
        senha = dados.get("password", "") or dados.get("senha", "")
        nome = dados.get("nome", "").strip()
        cpf = dados.get("cpf", "").strip()
        telefone = dados.get("telefone", "").strip()

        if not username or not senha:
            return Response(
                {"erro": "Usuário/E-mail e senha são obrigatórios."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if Usuario.objects.filter(username=username).exists():
            return Response(
                {"erro": "Este nome de usuário ou e-mail já está em uso."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        usuario = Usuario.objects.create_user(
            username=username,
            email=email,
            password=senha,
            first_name=nome.split()[0] if nome else "",
            last_name=" ".join(nome.split()[1:]) if len(nome.split()) > 1 else "",
            role="paciente",
            cpf="".join(filter(str.isdigit, cpf)),
            telefone=telefone,
        )

        refresh = RefreshToken.for_user(usuario)
        return Response(
            {
                "mensagem": "Cadastro realizado com sucesso!",
                "usuario": UsuarioSerializer(usuario).data,
                "tokens": {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                },
            },
            status=status.HTTP_201_CREATED,
        )
