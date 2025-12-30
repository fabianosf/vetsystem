from django.contrib import admin
from api.models import Notificacao
# from api.models import Notificacao
from api.models import (
    Tutor, Animal, Veterinario, Consulta, Vacina, Exame,
    PlanoSaude, ContratoPlano, Clinica
)


@admin.register(Tutor)
class TutorAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'email', 'phone', 'created_at']
    search_fields = ['name', 'email', 'phone']
    list_filter = ['created_at']


@admin.register(Animal)
class AnimalAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'species', 'tutor', 'created_at']
    search_fields = ['name']
    list_filter = ['species', 'created_at']


@admin.register(Veterinario)
class VeterinarioAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'crmv', 'email', 'created_at']
    search_fields = ['name', 'crmv']
    list_filter = ['created_at']


@admin.register(Consulta)
class ConsultaAdmin(admin.ModelAdmin):
    list_display = ['id', 'animal', 'created_at']
    search_fields = ['animal__name']
    list_filter = ['created_at']


@admin.register(Vacina)
class VacinaAdmin(admin.ModelAdmin):
    list_display = ['id', 'animal', 'created_at']
    search_fields = ['animal__name']
    list_filter = ['created_at']


@admin.register(Exame)
class ExameAdmin(admin.ModelAdmin):
    list_display = ['id', 'animal', 'created_at']
    search_fields = ['animal__name']
    list_filter = ['created_at']


@admin.register(PlanoSaude)
class PlanoSaudeAdmin(admin.ModelAdmin):
    list_display = ['id', 'nome', 'preco_mensal', 'is_active', 'created_at']
    search_fields = ['nome']
    list_filter = ['is_active', 'created_at']


@admin.register(ContratoPlano)
class ContratoPlanoAdmin(admin.ModelAdmin):
    list_display = ['id', 'animal', 'plano', 'is_active', 'created_at']
    search_fields = ['animal__name', 'plano__nome']
    list_filter = ['is_active', 'created_at']


@admin.register(Clinica)
class ClinicaAdmin(admin.ModelAdmin):
    list_display = ['id', 'nome', 'cidade', 'is_active', 'created_at']
    search_fields = ['nome', 'cidade']
    list_filter = ['is_active', 'created_at']




# @admin.register(Notificacao)
# class NotificacaoAdmin(admin.ModelAdmin):
#     list_display = ['id', 'titulo', 'user', 'tipo', 'categoria', 'lida', 'created_at']
#     list_filter = ['tipo', 'categoria', 'lida', 'created_at']
#     search_fields = ['titulo', 'mensagem', 'user__username']
#     readonly_fields = ['created_at', 'updated_at', 'lida_em']
#     ordering = ['-created_at']

# Diagnósticos IA
from api.models import DiagnosticoIA

@admin.register(DiagnosticoIA)
class DiagnosticoIAAdmin(admin.ModelAdmin):
    list_display = ['id', 'animal', 'classe_predita', 'confianca', 'validado', 'created_at']
    list_filter = ['classe_predita', 'validado', 'created_at']
    search_fields = ['animal__name', 'classe_predita', 'observacoes']
    readonly_fields = ['resultado', 'classe_predita', 'confianca', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('animal', 'imagem')
        }),
        ('Resultado da IA', {
            'fields': ('classe_predita', 'confianca', 'resultado')
        }),
        ('Validação', {
            'fields': ('validado', 'validado_por', 'data_validacao', 'observacoes')
        }),
        ('Auditoria', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
