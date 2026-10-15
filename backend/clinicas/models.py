from django.db import models


class Clinica(models.Model):
    nome = models.CharField(max_length=100)
    slug = models.SlugField(max_length=50, unique=True, help_text="Identificador único na URL (ex: dermato, odonto)")
    descricao = models.TextField(blank=True)
    duracao_slot_minutos = models.PositiveIntegerField(
        default=30,
        help_text="Duração de cada consulta em minutos (ex: 20 para dermato, 40 para odonto)"
    )
    hora_abertura = models.TimeField(default="08:00")
    hora_fechamento = models.TimeField(default="18:00")
    dias_semana = models.CharField(
        max_length=50,
        default="0,1,2,3,4",
        help_text="Dias de funcionamento (0=Segunda, 4=Sexta, 5=Sábado, 6=Domingo)"
    )
    telefone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    ativo = models.BooleanField(default=True)
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Clínica"
        verbose_name_plural = "Clínicas"
        ordering = ["nome"]

    def __str__(self):
        return f"{self.nome} ({self.slug})"
