"""
Views para geração de PDFs
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from api.models import Animal, Consulta
from api.utils.animal_pdf import AnimalFichaPDF
from api.utils.prescricao_pdf import PrescricaoPDF
from api.utils.atestado_pdf import AtestadoPDF
from api.utils.relatorio_consulta_pdf import RelatorioConsultaPDF


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def animal_ficha_pdf(request, animal_id):
    """Gerar PDF da ficha do animal"""
    animal = get_object_or_404(Animal, id=animal_id)
    
    # Gerar PDF
    pdf_generator = AnimalFichaPDF()
    pdf_content = pdf_generator.generate(animal)
    
    # Retornar como resposta HTTP
    response = HttpResponse(pdf_content, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="ficha_{animal.name}.pdf"'
    
    return response


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def prescricao_pdf(request, consulta_id):
    """Gerar PDF de prescrição médica"""
    consulta = get_object_or_404(Consulta, id=consulta_id)
    
    # Medicamentos enviados no body
    medicamentos = request.data.get('medicamentos', [])
    
    # Gerar PDF
    pdf_generator = PrescricaoPDF()
    pdf_content = pdf_generator.generate(consulta, medicamentos)
    
    # Retornar como resposta HTTP
    response = HttpResponse(pdf_content, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="prescricao_{consulta.animal.name}.pdf"'
    
    return response


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def atestado_pdf(request, consulta_id):
    """Gerar PDF de atestado"""
    consulta = get_object_or_404(Consulta, id=consulta_id)
    
    # Parâmetros
    tipo = request.data.get('tipo', 'saude')  # 'saude' ou 'comparecimento'
    dias_repouso = request.data.get('dias_repouso', None)
    observacoes = request.data.get('observacoes', None)
    
    # Gerar PDF
    pdf_generator = AtestadoPDF()
    pdf_content = pdf_generator.generate(consulta, tipo, dias_repouso, observacoes)
    
    # Retornar como resposta HTTP
    response = HttpResponse(pdf_content, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="atestado_{consulta.animal.name}.pdf"'
    
    return response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def relatorio_consulta_pdf(request, consulta_id):
    """Gerar PDF do relatório da consulta"""
    consulta = get_object_or_404(Consulta, id=consulta_id)
    
    # Gerar PDF
    pdf_generator = RelatorioConsultaPDF()
    pdf_content = pdf_generator.generate(consulta)
    
    # Retornar como resposta HTTP
    response = HttpResponse(pdf_content, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="relatorio_consulta_{consulta.id}.pdf"'
    
    return response
