"""
Utilitário para geração de PDFs
"""
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm, inch
from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle, Paragraph, 
    Spacer, Image, PageBreak, KeepTogether
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from io import BytesIO
from datetime import datetime
import os


class PDFGenerator:
    """Classe base para geração de PDFs"""
    
    def __init__(self):
        self.buffer = BytesIO()
        self.pagesize = A4
        self.width, self.height = self.pagesize
        self.styles = getSampleStyleSheet()
        self._setup_styles()
    
    def _setup_styles(self):
        """Configurar estilos customizados"""
        # Título principal
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1976d2'),
            spaceAfter=30,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
        
        # Subtítulo
        self.styles.add(ParagraphStyle(
            name='CustomSubtitle',
            parent=self.styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#424242'),
            spaceAfter=12,
            spaceBefore=12,
            fontName='Helvetica-Bold'
        ))
        
        # Texto normal
        self.styles.add(ParagraphStyle(
            name='CustomBody',
            parent=self.styles['Normal'],
            fontSize=11,
            spaceAfter=6,
            alignment=TA_JUSTIFY,
        ))
        
        # Label (campo)
        self.styles.add(ParagraphStyle(
            name='Label',
            parent=self.styles['Normal'],
            fontSize=9,
            textColor=colors.HexColor('#666666'),
            spaceAfter=2,
        ))
        
        # Valor (campo)
        self.styles.add(ParagraphStyle(
            name='Value',
            parent=self.styles['Normal'],
            fontSize=11,
            fontName='Helvetica-Bold',
            spaceAfter=8,
        ))
    
    def _header(self, canvas, doc):
        """Header do PDF"""
        canvas.saveState()
        
        # Logo (se existir)
        # logo_path = 'static/logo.png'
        # if os.path.exists(logo_path):
        #     canvas.drawImage(logo_path, 50, self.height - 80, width=100, height=50)
        
        # Nome da clínica
        canvas.setFont('Helvetica-Bold', 16)
        canvas.setFillColor(colors.HexColor('#1976d2'))
        canvas.drawString(50, self.height - 50, "VetSystem")
        
        canvas.setFont('Helvetica', 10)
        canvas.setFillColor(colors.black)
        canvas.drawString(50, self.height - 65, "Sistema de Gestão Veterinária")
        
        # Linha separadora
        canvas.setStrokeColor(colors.HexColor('#1976d2'))
        canvas.setLineWidth(2)
        canvas.line(50, self.height - 75, self.width - 50, self.height - 75)
        
        canvas.restoreState()
    
    def _footer(self, canvas, doc):
        """Footer do PDF"""
        canvas.saveState()
        
        # Linha separadora
        canvas.setStrokeColor(colors.HexColor('#cccccc'))
        canvas.setLineWidth(1)
        canvas.line(50, 50, self.width - 50, 50)
        
        # Informações do rodapé
        canvas.setFont('Helvetica', 8)
        canvas.setFillColor(colors.HexColor('#666666'))
        
        # Data de geração
        data_geracao = datetime.now().strftime('%d/%m/%Y às %H:%M')
        canvas.drawString(50, 35, f"Gerado em: {data_geracao}")
        
        # Número da página
        page_num = canvas.getPageNumber()
        text = f"Página {page_num}"
        canvas.drawRightString(self.width - 50, 35, text)
        
        canvas.restoreState()
    
    def _create_field(self, label, value):
        """Criar um campo label/valor"""
        return [
            Paragraph(f"<b>{label}</b>", self.styles['Label']),
            Paragraph(str(value) if value else "-", self.styles['Value']),
        ]
    
    def _create_table(self, data, col_widths=None, style=None):
        """Criar uma tabela estilizada"""
        default_style = TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1976d2')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f5f5f5')]),
        ])
        
        table = Table(data, colWidths=col_widths)
        table.setStyle(style if style else default_style)
        return table
    
    def build(self, elements):
        """Construir o PDF"""
        doc = SimpleDocTemplate(
            self.buffer,
            pagesize=self.pagesize,
            rightMargin=50,
            leftMargin=50,
            topMargin=100,
            bottomMargin=60,
        )
        
        doc.build(elements, onFirstPage=self._header, onLaterPages=self._header)
        
        # Adicionar footer manualmente
        pdf_value = self.buffer.getvalue()
        self.buffer.close()
        return pdf_value
