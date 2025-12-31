"""
Gerador de PDF - Relatório de Consulta
"""
from api.utils.pdf_generator import PDFGenerator
from reportlab.platypus import Paragraph, Spacer, Table
from reportlab.lib.units import mm
from datetime import datetime


class RelatorioConsultaPDF(PDFGenerator):
    """Gerador de Relatório de Consulta"""
    
    def generate(self, consulta):
        """Gerar relatório completo da consulta"""
        elements = []
        
        # Título
        elements.append(Paragraph("RELATÓRIO DE CONSULTA", self.styles['CustomTitle']))
        elements.append(Spacer(1, 10*mm))
        
        # Informações Gerais
        info_data = [
            ['Data:', consulta.data_consulta.strftime('%d/%m/%Y'), 
             'Horário:', consulta.horario.strftime('%H:%M')],
            ['Status:', consulta.get_status_display(), 
             'Tipo:', 'Consulta Veterinária'],
        ]
        table_info = self._create_table(info_data)
        elements.append(table_info)
        elements.append(Spacer(1, 8*mm))
        
        # Dados do Paciente
        elements.append(Paragraph("Paciente", self.styles['CustomSubtitle']))
        paciente_data = [
            ['Nome:', consulta.animal.name, 'Espécie:', consulta.animal.species],
            ['Raça:', consulta.animal.breed, 'Idade:', f"{consulta.animal.age} anos"],
            ['Sexo:', consulta.animal.get_sex_display(), 'Peso:', f"{consulta.animal.weight} kg"],
        ]
        table_paciente = self._create_table(paciente_data)
        elements.append(table_paciente)
        elements.append(Spacer(1, 8*mm))
        
        # Dados do Tutor
        elements.append(Paragraph("Tutor Responsável", self.styles['CustomSubtitle']))
        tutor_data = [
            ['Nome:', consulta.animal.tutor.name, 'CPF:', consulta.animal.tutor.cpf or "-"],
            ['Telefone:', consulta.animal.tutor.phone, 'Email:', consulta.animal.tutor.email or "-"],
        ]
        table_tutor = self._create_table(tutor_data)
        elements.append(table_tutor)
        elements.append(Spacer(1, 8*mm))
        
        # Veterinário
        elements.append(Paragraph("Veterinário Responsável", self.styles['CustomSubtitle']))
        vet_data = [
            ['Nome:', consulta.veterinario.nome, 'CRMV:', consulta.veterinario.crmv],
            ['Especialidade:', consulta.veterinario.especialidade, 'Telefone:', consulta.veterinario.telefone],
        ]
        table_vet = self._create_table(vet_data)
        elements.append(table_vet)
        elements.append(Spacer(1, 8*mm))
        
        # Motivo da Consulta
        elements.append(Paragraph("Motivo da Consulta", self.styles['CustomSubtitle']))
        elements.append(Paragraph(consulta.motivo, self.styles['CustomBody']))
        elements.append(Spacer(1, 5*mm))
        
        # Diagnóstico
        if consulta.diagnostico:
            elements.append(Paragraph("Diagnóstico", self.styles['CustomSubtitle']))
            elements.append(Paragraph(consulta.diagnostico, self.styles['CustomBody']))
            elements.append(Spacer(1, 5*mm))
        
        # Tratamento Recomendado
        if consulta.tratamento:
            elements.append(Paragraph("Tratamento Recomendado", self.styles['CustomSubtitle']))
            elements.append(Paragraph(consulta.tratamento, self.styles['CustomBody']))
            elements.append(Spacer(1, 5*mm))
        
        # Observações
        if consulta.observacoes:
            elements.append(Paragraph("Observações Adicionais", self.styles['CustomSubtitle']))
            elements.append(Paragraph(consulta.observacoes, self.styles['CustomBody']))
            elements.append(Spacer(1, 5*mm))
        
        # Retorno
        if hasattr(consulta, 'data_retorno') and consulta.data_retorno:
            elements.append(Paragraph("Retorno Agendado", self.styles['CustomSubtitle']))
            retorno_texto = f"Próxima consulta agendada para: {consulta.data_retorno.strftime('%d/%m/%Y')}"
            elements.append(Paragraph(retorno_texto, self.styles['CustomBody']))
        
        # Assinatura
        elements.append(Spacer(1, 20*mm))
        elements.append(Paragraph("_" * 50, self.styles['CustomBody']))
        assinatura = f"""
        <b>{consulta.veterinario.nome}</b><br/>
        CRMV: {consulta.veterinario.crmv}
        """
        elements.append(Paragraph(assinatura, self.styles['CustomBody']))
        
        return self.build(elements)
