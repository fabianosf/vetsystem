import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Configuração de cores
const colors = {
  primary: [14, 165, 233], // #0ea5e9
  secondary: [139, 92, 246], // #8b5cf6
  success: [16, 185, 129], // #10b981
  text: [30, 41, 59], // #1e293b
  lightGray: [241, 245, 249], // #f1f5f9
};

// Logo base64 (substituir por logo real se tiver)
const logo = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHJ4PSI4IiBmaWxsPSIjMGVhNWU5Ii8+CiAgPHBhdGggZD0iTTIwIDEwQzE0LjQ3NyAxMCAxMCAxNC40NzcgMTAgMjBDMTAgMjUuNTIzIDE0LjQ3NyAzMCAyMCAzMEMyNS41MjMgMzAgMzAgMjUuNTIzIDMwIDIwQzMwIDE0LjQ3NyAyNS41MjMgMTAgMjAgMTBaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4=';

class PDFService {
  // Função auxiliar para adicionar header
  private addHeader(doc: jsPDF, title: string) {
    // Logo
    try {
      doc.addImage(logo, 'PNG', 15, 10, 20, 20);
    } catch (error) {
      console.error('Erro ao adicionar logo:', error);
    }

    // Título e informações da clínica
    doc.setFontSize(20);
    doc.setTextColor(...colors.primary);
    doc.text('VetSystem', 40, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(...colors.text);
    doc.text('Sistema de Gestão Veterinária', 40, 26);
    
    // Linha separadora
    doc.setDrawColor(...colors.primary);
    doc.setLineWidth(0.5);
    doc.line(15, 35, 195, 35);

    // Título do documento
    doc.setFontSize(16);
    doc.setTextColor(...colors.text);
    doc.text(title, 15, 45);

    // Data de emissão
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    const now = new Date().toLocaleString('pt-BR');
    doc.text(`Emitido em: ${now}`, 15, 52);
  }

  // Função auxiliar para adicionar footer
  private addFooter(doc: jsPDF) {
    const pageCount = (doc as any).internal.getNumberOfPages();
    const pageHeight = doc.internal.pageSize.height;
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      
      // Linha separadora
      doc.setDrawColor(200, 200, 200);
      doc.line(15, pageHeight - 20, 195, pageHeight - 20);
      
      // Texto do footer
      doc.text(
        'VetSystem - Sistema de Gestão Veterinária | www.vetsystem.com.br',
        doc.internal.pageSize.width / 2,
        pageHeight - 12,
        { align: 'center' }
      );
      
      // Número da página
      doc.text(
        `Página ${i} de ${pageCount}`,
        doc.internal.pageSize.width / 2,
        pageHeight - 8,
        { align: 'center' }
      );
    }
  }

  // 1. RECEITA MÉDICA VETERINÁRIA
  gerarReceitaMedica(data: {
    veterinario: { name: string; crmv: string; phone: string };
    animal: { name: string; species: string; age?: number };
    tutor: { name: string; phone: string; cpf: string };
    prescricoes: string;
    observacoes?: string;
    dataConsulta: string;
  }) {
    const doc = new jsPDF();
    
    this.addHeader(doc, 'RECEITA MÉDICA VETERINÁRIA');

    let yPos = 60;

    // Informações do Veterinário
    doc.setFontSize(11);
    doc.setTextColor(...colors.text);
    doc.text('Veterinário(a):', 15, yPos);
    
    doc.setFontSize(10);
    doc.text(`${data.veterinario.name}`, 15, yPos + 5);
    doc.text(`CRMV: ${data.veterinario.crmv}`, 15, yPos + 10);
    doc.text(`Telefone: ${data.veterinario.phone}`, 15, yPos + 15);

    yPos += 25;

    // Box com informações do animal e tutor
    doc.setFillColor(...colors.lightGray);
    doc.rect(15, yPos, 180, 25, 'F');
    
    doc.setFontSize(10);
    doc.setTextColor(...colors.text);
    yPos += 6;
    doc.text('Paciente:', 20, yPos);
    doc.setFont('helvetica', 'bold');
    doc.text(`${data.animal.name} (${data.animal.species})`, 45, yPos);
    doc.setFont('helvetica', 'normal');
    
    yPos += 5;
    doc.text('Tutor:', 20, yPos);
    doc.setFont('helvetica', 'bold');
    doc.text(data.tutor.name, 45, yPos);
    doc.setFont('helvetica', 'normal');
    
    yPos += 5;
    doc.text('CPF:', 20, yPos);
    doc.text(data.tutor.cpf, 45, yPos);
    doc.text('Telefone:', 120, yPos);
    doc.text(data.tutor.phone, 145, yPos);

    yPos += 10;

    // Prescrição
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PRESCRIÇÃO:', 15, yPos);
    doc.setFont('helvetica', 'normal');
    
    yPos += 7;
    doc.setFontSize(10);
    const prescricaoLines = doc.splitTextToSize(data.prescricoes, 175);
    doc.text(prescricaoLines, 15, yPos);
    
    yPos += prescricaoLines.length * 5 + 5;

    // Observações
    if (data.observacoes) {
      doc.setFont('helvetica', 'bold');
      doc.text('OBSERVAÇÕES:', 15, yPos);
      doc.setFont('helvetica', 'normal');
      
      yPos += 7;
      const obsLines = doc.splitTextToSize(data.observacoes, 175);
      doc.text(obsLines, 15, yPos);
      yPos += obsLines.length * 5 + 10;
    }

    // Assinatura
    yPos = Math.max(yPos + 20, 230);
    doc.setDrawColor(...colors.text);
    doc.line(120, yPos, 190, yPos);
    doc.setFontSize(9);
    doc.text('Assinatura e Carimbo', 155, yPos + 5, { align: 'center' });
    doc.text(data.veterinario.name, 155, yPos + 10, { align: 'center' });
    doc.text(`CRMV: ${data.veterinario.crmv}`, 155, yPos + 15, { align: 'center' });

    this.addFooter(doc);
    
    doc.save(`receita_${data.animal.name}_${Date.now()}.pdf`);
  }

  // 2. LAUDO DE EXAME
  gerarLaudoExame(data: {
    veterinario: { name: string; crmv: string };
    animal: { name: string; species: string; age?: number; weight?: number };
    tutor: { name: string; cpf: string };
    tipoExame: string;
    dataExame: string;
    resultados: string;
    conclusao: string;
    observacoes?: string;
  }) {
    const doc = new jsPDF();
    
    this.addHeader(doc, 'LAUDO DE EXAME VETERINÁRIO');

    let yPos = 60;

    // Informações do exame
    autoTable(doc, {
      startY: yPos,
      head: [['Informações do Exame']],
      body: [
        ['Tipo de Exame:', data.tipoExame],
        ['Data do Exame:', new Date(data.dataExame).toLocaleDateString('pt-BR')],
        ['Veterinário Responsável:', `${data.veterinario.name} - CRMV: ${data.veterinario.crmv}`],
      ],
      theme: 'grid',
      headStyles: { fillColor: colors.primary, fontSize: 11 },
      margin: { left: 15, right: 15 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    // Dados do paciente
    autoTable(doc, {
      startY: yPos,
      head: [['Dados do Paciente']],
      body: [
        ['Nome:', data.animal.name],
        ['Espécie:', data.animal.species],
        ['Idade:', data.animal.age ? `${data.animal.age} anos` : 'Não informado'],
        ['Peso:', data.animal.weight ? `${data.animal.weight} kg` : 'Não informado'],
        ['Tutor:', data.tutor.name],
        ['CPF do Tutor:', data.tutor.cpf],
      ],
      theme: 'grid',
      headStyles: { fillColor: colors.secondary, fontSize: 11 },
      margin: { left: 15, right: 15 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    // Resultados
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.primary);
    doc.text('RESULTADOS:', 15, yPos);
    
    yPos += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.text);
    const resultLines = doc.splitTextToSize(data.resultados, 175);
    doc.text(resultLines, 15, yPos);
    
    yPos += resultLines.length * 5 + 10;

    // Conclusão
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.success);
    doc.text('CONCLUSÃO:', 15, yPos);
    
    yPos += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.text);
    const conclusaoLines = doc.splitTextToSize(data.conclusao, 175);
    doc.text(conclusaoLines, 15, yPos);
    
    yPos += conclusaoLines.length * 5 + 10;

    // Observações
    if (data.observacoes) {
      doc.setFont('helvetica', 'bold');
      doc.text('OBSERVAÇÕES:', 15, yPos);
      doc.setFont('helvetica', 'normal');
      
      yPos += 7;
      const obsLines = doc.splitTextToSize(data.observacoes, 175);
      doc.text(obsLines, 15, yPos);
    }

    this.addFooter(doc);
    
    doc.save(`laudo_${data.animal.name}_${Date.now()}.pdf`);
  }

  // 3. RELATÓRIO DE TUTORES
  gerarRelatorioTutores(tutores: any[]) {
    const doc = new jsPDF();
    
    this.addHeader(doc, 'RELATÓRIO DE TUTORES');

    const tableData = tutores.map(tutor => [
      tutor.name,
      tutor.email,
      tutor.phone,
      tutor.cpf,
      `${tutor.total_animais || 0}`,
      tutor.city || '-',
    ]);

    autoTable(doc, {
      startY: 60,
      head: [['Nome', 'Email', 'Telefone', 'CPF', 'Animais', 'Cidade']],
      body: tableData,
      theme: 'striped',
      headStyles: { 
        fillColor: colors.primary,
        fontSize: 10,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250],
      },
      margin: { left: 15, right: 15 },
    });

    // Totalizador
    const yPos = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total de Tutores: ${tutores.length}`, 15, yPos);
    doc.text(`Total de Animais: ${tutores.reduce((sum, t) => sum + (t.total_animais || 0), 0)}`, 15, yPos + 7);

    this.addFooter(doc);
    
    doc.save(`relatorio_tutores_${Date.now()}.pdf`);
  }

  // 4. RELATÓRIO DE ANIMAIS
  gerarRelatorioAnimais(animais: any[], tutores: any[]) {
    const doc = new jsPDF();
    
    this.addHeader(doc, 'RELATÓRIO DE ANIMAIS');

    const getTutorName = (tutorId: number) => {
      const tutor = tutores.find(t => t.id === tutorId);
      return tutor?.name || 'N/A';
    };

    const tableData = animais.map(animal => [
      animal.name,
      animal.species,
      animal.breed || '-',
      animal.gender === 'M' ? 'Macho' : 'Fêmea',
      animal.age ? `${animal.age} anos` : '-',
      animal.weight ? `${animal.weight} kg` : '-',
      getTutorName(animal.tutor),
    ]);

    autoTable(doc, {
      startY: 60,
      head: [['Nome', 'Espécie', 'Raça', 'Sexo', 'Idade', 'Peso', 'Tutor']],
      body: tableData,
      theme: 'striped',
      headStyles: { 
        fillColor: colors.success,
        fontSize: 9,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250],
      },
      margin: { left: 15, right: 15 },
    });

    // Estatísticas
    const yPos = (doc as any).lastAutoTable.finalY + 10;
    const stats = {
      total: animais.length,
      cachorros: animais.filter(a => a.species === 'CACHORRO').length,
      gatos: animais.filter(a => a.species === 'GATO').length,
      outros: animais.filter(a => !['CACHORRO', 'GATO'].includes(a.species)).length,
    };

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('ESTATÍSTICAS:', 15, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Total de Animais: ${stats.total}`, 15, yPos + 7);
    doc.text(`Cachorros: ${stats.cachorros}`, 15, yPos + 13);
    doc.text(`Gatos: ${stats.gatos}`, 15, yPos + 19);
    doc.text(`Outros: ${stats.outros}`, 15, yPos + 25);

    this.addFooter(doc);
    
    doc.save(`relatorio_animais_${Date.now()}.pdf`);
  }

  // 5. FICHA DE CONSULTA
  gerarFichaConsulta(data: {
    veterinario: { name: string; crmv: string };
    animal: { name: string; species: string; age?: number; weight?: number };
    tutor: { name: string; phone: string };
    dataConsulta: string;
    motivo: string;
    anamnese: string;
    exameFisico: string;
    diagnostico: string;
    prescricao: string;
    observacoes?: string;
  }) {
    const doc = new jsPDF();
    
    this.addHeader(doc, 'FICHA DE CONSULTA VETERINÁRIA');

    let yPos = 60;

    // Box de informações principais
    doc.setFillColor(...colors.lightGray);
    doc.rect(15, yPos, 180, 30, 'F');
    
    doc.setFontSize(10);
    doc.setTextColor(...colors.text);
    yPos += 6;
    
    doc.text('Data da Consulta:', 20, yPos);
    doc.setFont('helvetica', 'bold');
    doc.text(new Date(data.dataConsulta).toLocaleString('pt-BR'), 60, yPos);
    doc.setFont('helvetica', 'normal');
    
    yPos += 5;
    doc.text('Veterinário:', 20, yPos);
    doc.setFont('helvetica', 'bold');
    doc.text(`${data.veterinario.name} - CRMV: ${data.veterinario.crmv}`, 60, yPos);
    doc.setFont('helvetica', 'normal');
    
    yPos += 7;
    doc.text('Paciente:', 20, yPos);
    doc.setFont('helvetica', 'bold');
    doc.text(`${data.animal.name} (${data.animal.species})`, 60, yPos);
    doc.setFont('helvetica', 'normal');
    
    yPos += 5;
    doc.text('Tutor:', 20, yPos);
    doc.text(data.tutor.name, 60, yPos);
    doc.text('Telefone:', 120, yPos);
    doc.text(data.tutor.phone, 145, yPos);

    yPos += 12;

    // Seções do prontuário
    const secoes = [
      { titulo: 'MOTIVO DA CONSULTA', conteudo: data.motivo },
      { titulo: 'ANAMNESE', conteudo: data.anamnese },
      { titulo: 'EXAME FÍSICO', conteudo: data.exameFisico },
      { titulo: 'DIAGNÓSTICO', conteudo: data.diagnostico },
      { titulo: 'PRESCRIÇÃO', conteudo: data.prescricao },
    ];

    if (data.observacoes) {
      secoes.push({ titulo: 'OBSERVAÇÕES', conteudo: data.observacoes });
    }

    secoes.forEach(secao => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...colors.primary);
      doc.text(secao.titulo + ':', 15, yPos);
      
      yPos += 6;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...colors.text);
      const lines = doc.splitTextToSize(secao.conteudo, 175);
      doc.text(lines, 15, yPos);
      
      yPos += lines.length * 5 + 8;
    });

    this.addFooter(doc);
    
    doc.save(`ficha_consulta_${data.animal.name}_${Date.now()}.pdf`);
  }
}

export const pdfService = new PDFService();
