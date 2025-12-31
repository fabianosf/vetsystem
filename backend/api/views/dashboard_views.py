"""
Views para Dashboard Avançado
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count, Sum, Avg, Q
from django.utils import timezone
from datetime import timedelta
from api.models import (
    Animal, Tutor, Veterinario, Consulta, 
    PlanoSaude, Clinica, DiagnosticoIA
)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """Estatísticas gerais do sistema"""
    hoje = timezone.now().date()
    inicio_mes = hoje.replace(day=1)
    mes_passado = (inicio_mes - timedelta(days=1)).replace(day=1)
    
    total_animais = Animal.objects.count()
    total_tutores = Tutor.objects.count()
    total_veterinarios = Veterinario.objects.count()
    total_consultas = Consulta.objects.count()
    
    consultas_mes = Consulta.objects.filter(data_consulta__gte=inicio_mes).count()
    consultas_mes_passado = Consulta.objects.filter(
        data_consulta__gte=mes_passado,
        data_consulta__lt=inicio_mes
    ).count()
    
    if consultas_mes_passado > 0:
        crescimento = ((consultas_mes - consultas_mes_passado) / consultas_mes_passado) * 100
    else:
        crescimento = 100 if consultas_mes > 0 else 0
    
    consultas_hoje = Consulta.objects.filter(data_consulta=hoje).count()
    
    diagnosticos_total = DiagnosticoIA.objects.count()
    diagnosticos_validados = DiagnosticoIA.objects.filter(validado=True).count()
    
    animais_por_especie = list(
        Animal.objects.values('species')
        .annotate(total=Count('id'))
        .order_by('-total')
    )
    
    tres_meses_atras = hoje - timedelta(days=90)
    animais_ativos = Animal.objects.filter(
        consulta__data_consulta__gte=tres_meses_atras
    ).distinct().count()
    
    return Response({
        'totais': {
            'animais': total_animais,
            'tutores': total_tutores,
            'veterinarios': total_veterinarios,
            'consultas': total_consultas,
            'animais_ativos': animais_ativos,
        },
        'consultas': {
            'hoje': consultas_hoje,
            'mes_atual': consultas_mes,
            'mes_passado': consultas_mes_passado,
            'crescimento': round(crescimento, 1),
        },
        'diagnosticos': {
            'total': diagnosticos_total,
            'validados': diagnosticos_validados,
            'taxa_validacao': round((diagnosticos_validados / diagnosticos_total * 100) if diagnosticos_total > 0 else 0, 1),
        },
        'animais_por_especie': animais_por_especie,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def consultas_timeline(request):
    """Timeline de consultas (últimos 30 dias)"""
    dias = int(request.GET.get('dias', 30))
    hoje = timezone.now().date()
    data_inicio = hoje - timedelta(days=dias)
    
    consultas = Consulta.objects.filter(
        data_consulta__gte=data_inicio
    ).values('data_consulta').annotate(
        total=Count('id')
    ).order_by('data_consulta')
    
    timeline = []
    data_atual = data_inicio
    consultas_dict = {c['data_consulta']: c['total'] for c in consultas}
    
    while data_atual <= hoje:
        timeline.append({
            'data': data_atual.strftime('%Y-%m-%d'),
            'total': consultas_dict.get(data_atual, 0),
        })
        data_atual += timedelta(days=1)
    
    return Response(timeline)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def consultas_por_status(request):
    """Distribuição de consultas por status"""
    status_counts = Consulta.objects.values('status').annotate(
        total=Count('id')
    ).order_by('-total')
    
    return Response(list(status_counts))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def veterinarios_performance(request):
    """Performance dos veterinários"""
    performance = Veterinario.objects.annotate(
        total_consultas=Count('consulta'),
    ).order_by('-total_consultas')[:10]
    
    data = []
    for vet in performance:
        data.append({
            'nome': vet.nome,
            'especialidade': vet.especialidade,
            'total_consultas': vet.total_consultas,
        })
    
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def racas_mais_comuns(request):
    """Raças mais comuns"""
    racas = Animal.objects.values('breed', 'species').annotate(
        total=Count('id')
    ).order_by('-total')[:10]
    
    return Response(list(racas))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def diagnosticos_ia_timeline(request):
    """Timeline de diagnósticos IA"""
    dias = int(request.GET.get('dias', 30))
    hoje = timezone.now().date()
    data_inicio = hoje - timedelta(days=dias)
    
    diagnosticos = DiagnosticoIA.objects.filter(
        created_at__date__gte=data_inicio
    ).extra(
        select={'data': 'DATE(created_at)'}
    ).values('data').annotate(
        total=Count('id'),
        validados=Count('id', filter=Q(validado=True)),
    ).order_by('data')
    
    return Response(list(diagnosticos))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def planos_distribuicao(request):
    """Distribuição de animais por plano"""
    planos = PlanoSaude.objects.annotate(
        total_animais=Count('animal')
    ).order_by('-total_animais')
    
    data = []
    for plano in planos:
        data.append({
            'nome': plano.nome,
            'total': plano.total_animais,
            'valor': float(plano.valor_mensal),
        })
    
    return Response(data)
