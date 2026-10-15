from django.urls import path
from .views import MeView, RegistroPacienteView

urlpatterns = [
    path("me/", MeView.as_view(), name="usuario_me"),
    path("registro/", RegistroPacienteView.as_view(), name="usuario_registro"),
]
