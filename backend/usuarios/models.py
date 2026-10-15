from django.contrib.auth.models import AbstractUser
from django.db import models


class Usuario(AbstractUser):
    ROLE_CHOICES = [
        ("admin", "Administrador Geral"),
        ("recepcao", "Recepção"),
        ("profissional", "Médico / Dentista / Especialista"),
        ("paciente", "Paciente"),
    ]
    role = models.CharField(
        max_length=20, choices=ROLE_CHOICES, default="recepcao"
    )
    clinica = models.ForeignKey(
        "clinicas.Clinica",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="usuarios",
        help_text="Clínica associada (vazio para administradores com acesso geral)"
    )
    telefone = models.CharField(max_length=20, blank=True)
    cpf = models.CharField(max_length=14, blank=True)

    def __str__(self):
        clinica_str = f" - {self.clinica.nome}" if self.clinica else ""
        return f"{self.get_full_name() or self.username} ({self.get_role_display()}{clinica_str})"
