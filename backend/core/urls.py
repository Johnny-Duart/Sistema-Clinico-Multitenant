from agendamentos.views import AgendamentoViewSet
from django.contrib import admin
from django.urls import include, path
from pacientes.views import PacienteViewSet
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = DefaultRouter()
router.register(r"pacientes", PacienteViewSet)
router.register(r"agendamentos", AgendamentoViewSet)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/clinicas/", include("clinicas.urls")),
    path("api/usuarios/", include("usuarios.urls")),
    path("api/", include(router.urls)),
    path(
        "api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"
    ),
    path(
        "api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"
    ),
]
