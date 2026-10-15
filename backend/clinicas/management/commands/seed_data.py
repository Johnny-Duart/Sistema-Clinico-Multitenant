from datetime import datetime, time, timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from clinicas.models import Clinica
from pacientes.models import Paciente
from agendamentos.models import Agendamento

Usuario = get_user_model()


class Command(BaseCommand):
    help = "Popula o banco de dados com clínicas, usuários e agendamentos realistas para demonstração."

    def handle(self, *args, **options):
        self.stdout.write("Iniciando população de dados...")

        # 1. Clínicas
        dermato, _ = Clinica.objects.get_or_create(
            slug="dermato",
            defaults={
                "nome": "Dermatologia Integrada",
                "descricao": "Atendimento dermatológico clínico e estético de alta precisão.",
                "duracao_slot_minutos": 20,
                "hora_abertura": time(8, 0),
                "hora_fechamento": time(18, 0),
                "dias_semana": "0,1,2,3,4",
                "telefone": "(11) 99999-9999",
                "email": "contato@dermato.com",
            }
        )

        odonto, _ = Clinica.objects.get_or_create(
            slug="odonto",
            defaults={
                "nome": "Odontologia & Estética Orofacial",
                "descricao": "Consultório moderno para saúde bucal, estética e prevenção.",
                "duracao_slot_minutos": 40,
                "hora_abertura": time(8, 0),
                "hora_fechamento": time(18, 0),
                "dias_semana": "0,1,2,3,4",
                "telefone": "(11) 98888-8888",
                "email": "contato@odonto.com",
            }
        )

        self.stdout.write(self.style.SUCCESS("[OK] Clínicas configuradas: Dermatologia (slots 20m) e Odontologia (slots 40m)."))

        # 2. Usuários
        def criar_usuario(username, senha, role, clinica=None, first_name="", last_name="", is_staff=False, is_superuser=False):
            u = Usuario.objects.filter(username=username).first()
            if not u:
                u = Usuario.objects.create_user(
                    username=username,
                    password=senha,
                    role=role,
                    clinica=clinica,
                    first_name=first_name,
                    last_name=last_name,
                    is_staff=is_staff,
                    is_superuser=is_superuser,
                )
            else:
                u.role = role
                u.clinica = clinica
                u.first_name = first_name
                u.last_name = last_name
                u.is_staff = is_staff
                u.is_superuser = is_superuser
                u.set_password(senha)
                u.save()
            return u

        u_admin = criar_usuario("admin", "admin123", "admin", None, "Administrador", "Geral", is_staff=True, is_superuser=True)
        u_dermato = criar_usuario("dermato", "dermato123", "profissional", dermato, "Dra. Sofia", "Martins", is_staff=True)
        u_odonto = criar_usuario("odonto", "odonto123", "profissional", odonto, "Dra. Marina", "Costa", is_staff=True)
        u_recep_derm = criar_usuario("recep_dermato", "recep123", "recepcao", dermato, "Recepção", "Dermato")
        u_recep_odont = criar_usuario("recep_odonto", "recep123", "recepcao", odonto, "Recepção", "Odonto")
        u_paciente = criar_usuario("paciente", "paciente123", "paciente", None, "Carlos", "Eduardo")

        self.stdout.write(self.style.SUCCESS("[OK] Usuários de teste criados/atualizados com sucesso!"))

        # 3. Pacientes
        hoje = timezone.localdate()

        p_dermato1, _ = Paciente.objects.get_or_create(
            clinica=dermato,
            cpf="11122233344",
            defaults={"nome": "Ana Beatriz Ferreira", "telefone": "(11) 97123-4567", "email": "ana.beatriz@email.com"}
        )
        p_dermato2, _ = Paciente.objects.get_or_create(
            clinica=dermato,
            cpf="22233344455",
            defaults={"nome": "Lucas Silveira Mendes", "telefone": "(11) 98234-5678", "email": "lucas.mendes@email.com"}
        )
        p_dermato3, _ = Paciente.objects.get_or_create(
            clinica=dermato,
            cpf="33344455566",
            defaults={"nome": "Mariana Souza Lima", "telefone": "(11) 99345-6789", "email": "mariana.lima@email.com"}
        )

        p_odonto1, _ = Paciente.objects.get_or_create(
            clinica=odonto,
            cpf="44455566677",
            defaults={"nome": "Rodrigo Alves Rocha", "telefone": "(11) 98456-7890", "email": "rodrigo.alves@email.com"}
        )
        p_odonto2, _ = Paciente.objects.get_or_create(
            clinica=odonto,
            cpf="55566677788",
            defaults={"nome": "Camila Duarte Santos", "telefone": "(11) 97567-8901", "email": "camila.santos@email.com"}
        )
        p_odonto3, _ = Paciente.objects.get_or_create(
            clinica=odonto,
            cpf="66677788899",
            defaults={
                "nome": "Carlos Eduardo (Paciente Demo)",
                "telefone": "(11) 99876-5432",
                "email": "carlos.eduardo@email.com",
                "usuario": u_paciente,
            }
        )

        # 4. Agendamentos de Exemplo (Hoje)
        dt_base = timezone.localtime()

        def criar_agendamento(clinica, paciente, hora, minuto, status="agendado", valor=250.0):
            data_hora = timezone.make_aware(datetime.combine(hoje, time(hora, minuto)))
            ag, _ = Agendamento.objects.get_or_create(
                clinica=clinica,
                paciente=paciente,
                data_hora=data_hora,
                defaults={
                    "duracao_minutos": clinica.duracao_slot_minutos,
                    "status": status,
                    "valor": valor,
                    "observacoes": "Agendamento de demonstração",
                }
            )
            return ag

        # Dermato (slots de 20 min)
        criar_agendamento(dermato, p_dermato1, 9, 0, status="realizado", valor=280.0)
        criar_agendamento(dermato, p_dermato2, 10, 20, status="confirmado", valor=320.0)
        criar_agendamento(dermato, p_dermato3, 14, 0, status="agendado", valor=280.0)

        # Odonto (slots de 40 min)
        criar_agendamento(odonto, p_odonto1, 9, 0, status="realizado", valor=350.0)
        criar_agendamento(odonto, p_odonto2, 10, 20, status="confirmado", valor=400.0)
        criar_agendamento(odonto, p_odonto3, 14, 40, status="agendado", valor=300.0)

        self.stdout.write(self.style.SUCCESS("[OK] Agendamentos de exemplo gerados para Dermatologia e Odontologia."))
        self.stdout.write(self.style.SUCCESS("""
==================================================
DADOS DE DEMO PRONTOS:
- Admin Geral:           admin / admin123
- Profissional Dermato:  dermato / dermato123
- Profissional Odonto:   odonto / odonto123
- Recepção Dermato:      recep_dermato / recep123
- Recepção Odonto:       recep_odonto / recep123
- Paciente (Portal):     paciente / paciente123
==================================================
"""))
