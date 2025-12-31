"""
Gerador de PDF - Ficha do Animal
"""
from api.utils.pdf_generator import PDFGenerator
from reportlab.platypus import Paragraph, Spacer, Table, KeepTogether
from reportlab.lib.units import mm
from reportlab.lib import colors
from datetime import datetime


class AnimalFichaPDF(PDFGenerator):
    """Gerador de Ficha do Animal"""
    
    def generate(self, animal):
        """Gerar ficha completa do animal"""
        elements = []
        
        # Título
        elements.append(Paragraph("FICHA DO ANIMAL", self.styles['CustomTitle']))
        elements.append(Spacer(1, 10*mm))
        
        # Dados do Animal
        elements.append(Paragraph("Dados do Animal", self.styles['CustomSubtitle']))
        
        dados_animal = [
            ['Nome:', animal.name, 'Espécie:', animal.species],
            ['Raça:', animal.breed, 'Sexo:', animal.get_sex_display()],
            ['Idade:', f"{animal.age} anos" if animal.age else "-", 'Peso:', f"{animal.weight} kg" if animal.weight else "-"],
            ['Cor:', animal.color or "-", 'Microchip:', animal.microchip_number or "-"],
        ]
        
        table = self._create_table(dados_animal)
        elements.append(table)
        elements.append(Spacer(1, 5*mm))
        
        # Dados do Tutor
        elements.append(Paragraph("Dados do Tutor", self.styles['CustomSubtitle']))
        
        tutor = animal.tutor
        dados_tutor = [
            ['Nome:', tutor.name, 'CPF:', tutor.cpf or "-"],
            ['Telefone:', tutor.phone, 'Email:', tutor.email or "-"],
            ['Endereço:', tutor.address or "-", '', ''],
        ]
        
        table_tutor = self._create_table(dados_tutor)
        elements.append(table_tutor)
        elements.append(Spacer(1, 5*mm))
        
        # Histórico de Consultas
        consultas = animal.consulta_set.all().order_by('-data_consulta')[:10]
        
        if consultas:
            elements.append(Paragraph("Últimas Consultas", self.styles['CustomSubtitle']))
            
            consultas_data = [['Data', 'Veterinário', 'Motivo', 'Status']]
            for consulta in consultas:
                consultas_data.append([
                    consulta.data_consulta.strftime('%d/%m/%Y'),
                    consulta.veterinario.nome,
                    consulta.motivo[:30] + '...' if len(consulta.motivo) > 30 else consulta.motivo,
                    consulta.get_status_display(),
                ])
            
            table_consultas = self._create_table(consultas_data)
            elements.append(table_consultas)
            elements.append(Spacer(1, 5*mm))
        
        # Plano de Saúde
        if hasattr(animal, 'plano_saude') and animal.plano_saude:
            elements.append(Paragraph("Plano de Saúde", self.styles['CustomSubtitle']))
            
            plano = animal.plano_saude
            dados_plano = [
                ['Plano:', plano.nome, 'Valor:', f"R$ {plano.valor_mensal}"],
                ['Cobertura:', plano.cobertura or "-", '', ''],
            ]
            
            table_plano = self._create_table(dados_plano)
            elements.append(table_plano)
        
        # Observações
        if animal.observacoes:
            elements.append(Spacer(1, 5*mm))
            elements.append(Paragraph("Observações", self.styles['CustomSubtitle']))
            elements.append(Paragraph(animal.observacoes, self.styles['CustomBody']))
        
        return self.build(elements)
