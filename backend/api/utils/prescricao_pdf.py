"""
Gerador de PDF - Prescrição Médica
"""
from api.utils.pdf_generator import PDFGenerator
from reportlab.platypus import Paragraph, Spacer, Table
from reportlab.lib.units import mm
from datetime import datetime


class PrescricaoPDF(PDFGenerator):
    """Gerador de Prescrição Médica"""
    
    def generate(self, consulta, medicamentos):
        """
        Gerar prescrição médica
        medicamentos: lista de dicts com {nome, dosagem, frequencia, duracao, observacoes}
        """
        elements = []
        
        # Título
        elements.append(Paragraph("PRESCRIÇÃO MÉDICA", self.styles['CustomTitle']))
        elements.append(Spacer(1, 10*mm))
        
        # Data
        data_texto = f"Data: {consulta.data_consulta.strftime('%d/%m/%Y')}"
        elements.append(Paragraph(data_texto, self.styles['CustomBody']))
        elements.append(Spacer(1, 5*mm))
        
        # Dados do Animal
        elements.append(Paragraph("Paciente", self.styles['CustomSubtitle']))
        animal_info = f"""
        <b>Nome:</b> {consulta.animal.name}<br/>
        <b>Espécie:</b> {consulta.animal.species}<br/>
        <b>Raça:</b> {consulta.animal.breed}<br/>
        <b>Idade:</b> {consulta.animal.age} anos<br/>
        <b>Peso:</b> {consulta.animal.weight} kg
        """
        elements.append(Paragraph(animal_info, self.styles['CustomBody']))
        elements.append(Spacer(1, 5*mm))
        
        # Dados do Tutor
        elements.append(Paragraph("Tutor", self.styles['CustomSubtitle']))
        tutor_info = f"""
        <b>Nome:</b> {consulta.animal.tutor.name}<br/>
        <b>Telefone:</b> {consulta.animal.tutor.phone}
        """
        elements.append(Paragraph(tutor_info, self.styles['CustomBody']))
        elements.append(Spacer(1, 8*mm))
        
        # Medicamentos
        elements.append(Paragraph("Medicamentos Prescritos", self.styles['CustomSubtitle']))
        
        med_data = [['Medicamento', 'Dosagem', 'Frequência', 'Duração']]
        for med in medicamentos:
            med_data.append([
                med.get('nome', '-'),
                med.get('dosagem', '-'),
                med.get('frequencia', '-'),
                med.get('duracao', '-'),
            ])
        
        table_med = self._create_table(med_data, col_widths=[150, 80, 120, 80])
        elements.append(table_med)
        elements.append(Spacer(1, 8*mm))
        
        # Observações
        if consulta.observacoes:
            elements.append(Paragraph("Observações", self.styles['CustomSubtitle']))
            elements.append(Paragraph(consulta.observacoes, self.styles['CustomBody']))
            elements.append(Spacer(1, 8*mm))
        
        # Assinatura
        elements.append(Spacer(1, 15*mm))
        elements.append(Paragraph("_" * 50, self.styles['CustomBody']))
        vet_info = f"""
        <b>{consulta.veterinario.nome}</b><br/>
        CRMV: {consulta.veterinario.crmv}<br/>
        Especialidade: {consulta.veterinario.especialidade}
        """
        elements.append(Paragraph(vet_info, self.styles['CustomBody']))
        
        return self.build(elements)
