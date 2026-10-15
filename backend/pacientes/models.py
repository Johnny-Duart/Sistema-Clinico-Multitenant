from django.db import models
from .validators import validar_cpf


class Paciente(models.Model):
    clinica = models.ForeignKey(
        "clinicas.Clinica",
        on_delete=models.CASCADE,
        related_name="pacientes",
        null=True,
        blank=True,
        help_text="Clínica onde o paciente foi cadastrado"
    )
    usuario = models.OneToOneField(
        "usuarios.Usuario",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="perfil_paciente",
        help_text="Conta de login do paciente para acompanhar agendamentos"
    )
    nome = models.CharField(max_length=150)
    cpf = models.CharField(
        max_length=14, validators=[validar_cpf]
    )
    telefone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    data_nascimento = models.DateField(null=True, blank=True)
    endereco = models.CharField(max_length=255, blank=True)
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Paciente"
        verbose_name_plural = "Pacientes"
        ordering = ["nome"]

    def __str__(self):
        clinica_str = f" [{self.clinica.nome}]" if self.clinica else ""
        return f"{self.nome}{clinica_str}"
