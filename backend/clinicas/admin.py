from django.contrib import admin
from .models import Clinica


@admin.register(Clinica)
class ClinicaAdmin(admin.ModelAdmin):
    list_display = ("nome", "slug", "duracao_slot_minutos", "hora_abertura", "hora_fechamento", "ativo")
    search_fields = ("nome", "slug")
    list_filter = ("ativo",)
