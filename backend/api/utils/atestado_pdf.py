"""
Gerador de PDF - Atestado Veterinário
"""
from api.utils.pdf_generator import PDFGenerator
from reportlab.platypus import Paragraph, Spacer
from reportlab.lib.units import mm
from datetime import datetime


class AtestadoPDF(PDFGenerator):
    """Gerador de Atestado Veterinário"""
    
    def generate(self, consulta, tipo='saude', dias_repouso=None, observacoes=None):
        """
        Gerar atestado veterinário
        tipo: 'saude' ou 'comparecimento'
        """
        elements = []
        
        # Título
        titulo = "ATESTADO DE SAÚDE" if tipo == 'saude' else "ATESTADO DE COMPARECIMENTO"
        elements.append(Paragraph(titulo, self.styles['CustomTitle']))
        elements.append(Spacer(1, 15*mm))
        
        # Corpo do atestado
        if tipo == 'saude':
            texto = f"""
            Atesto para os devidos fins que o animal <b>{consulta.animal.name}</b>, 
            da espécie <b>{consulta.animal.species}</b>, raça <b>{consulta.animal.breed}</b>, 
            pertencente ao tutor <b>{consulta.animal.tutor.name}</b>, 
            foi submetido a exame clínico nesta data e encontra-se em boas condições de saúde.
            """
        else:
            texto = f"""
            Atesto para os devidos fins que o tutor <b>{consulta.animal.tutor.name}</b> 
            compareceu a esta clínica veterinária no dia <b>{consulta.data_consulta.strftime('%d/%m/%Y')}</b> 
            às <b>{consulta.horario.strftime('%H:%M')}</b> para consulta do animal <b>{consulta.animal.name}</b>.
            """
        
        elements.append(Paragraph(texto, self.styles['CustomBody']))
        elements.append(Spacer(1, 10*mm))
        
        # Dias de repouso (se aplicável)
        if dias_repouso:
            repouso_texto = f"""
            Recomenda-se repouso de <b>{dias_repouso} dias</b> para completa recuperação.
            """
            elements.append(Paragraph(repouso_texto, self.styles['CustomBody']))
            elements.append(Spacer(1, 5*mm))
        
        # Observações adicionais
        if observacoes:
            elements.append(Paragraph("<b>Observações:</b>", self.styles['CustomSubtitle']))
            elements.append(Paragraph(observacoes, self.styles['CustomBody']))
            elements.append(Spacer(1, 10*mm))
        
        # Data e local
        data_texto = f"""
        Rio de Janeiro, {datetime.now().strftime('%d de %B de %Y')}.
        """
        elements.append(Spacer(1, 15*mm))
        elements.append(Paragraph(data_texto, self.styles['CustomBody']))
        elements.append(Spacer(1, 20*mm))
        
        # Assinatura
        elements.append(Paragraph("_" * 50, self.styles['CustomBody']))
        vet_info = f"""
        <b>{consulta.veterinario.nome}</b><br/>
        CRMV: {consulta.veterinario.crmv}<br/>
        Especialidade: {consulta.veterinario.especialidade}
        """
        elements.append(Paragraph(vet_info, self.styles['CustomBody']))
        
        return self.build(elements)
