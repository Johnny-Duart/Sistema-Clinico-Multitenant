from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClinicaViewSet, HorariosDisponiveisView, AgendarPublicoView

router = DefaultRouter()
router.register(r"", ClinicaViewSet, basename="clinicas")

urlpatterns = [
    path("<slug:slug>/horarios-disponiveis/", HorariosDisponiveisView.as_view(), name="horarios_disponiveis"),
    path("<slug:slug>/agendar/", AgendarPublicoView.as_view(), name="agendar_publico"),
    path("", include(router.urls)),
]
