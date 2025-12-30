import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Clinica {
  nome: string;
  endereco: string;
  telefone: string;
  email: string;
  cnpj?: string;
}

interface Veterinario {
  name: string;
  crmv: string;
  especialidade?: string;
}

interface Animal {
  name: string;
  especie: string;
  raca?: string;
  idade?: number;
}

interface Tutor {
  nome: string;
  cpf: string;
  telefone: string;
}

interface ReceitaItem {
  medicamento: string;
  dosagem: string;
  frequencia: string;
  duracao: string;
}

interface ExameResultado {
  exame: string;
  resultado: string;
  valorReferencia: string;
}

// Configurações da clínica (pode vir do backend)
const CLINICA_PADRAO: Clinica = {
  nome: 'VetSystem Clínica Veterinária',
  endereco: 'Rua das Flores, 123 - Centro',
  telefone: '(11) 98765-4321',
  email: 'contato@vetsystem.com.br',
  cnpj: '12.345.678/0001-90',
};

// Função auxiliar para adicionar cabeçalho
const addHeader = (doc: jsPDF, clinica: Clinica = CLINICA_PADRAO) => {
  // Logo (emoji de pata como placeholder)
  doc.setFontSize(24);
  doc.text('🐾', 15, 20);

  // Nome da clínica
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(clinica.nome, 30, 15);

  // Informações da clínica
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(clinica.endereco, 30, 20);
  doc.text(`Tel: ${clinica.telefone} | Email: ${clinica.email}`, 30, 25);
  if (clinica.cnpj) {
    doc.text(`CNPJ: ${clinica.cnpj}`, 30, 30);
  }

  // Linha separadora
  doc.setDrawColor(0, 150, 200);
  doc.setLineWidth(0.5);
  doc.line(15, 35, 195, 35);
};

// Função auxiliar para adicionar rodapé
const addFooter = (doc: jsPDF, pageNumber: number) => {
  const pageHeight = doc.internal.pageSize.height;
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100);
  
  // Linha separadora
  doc.setDrawColor(200);
  doc.setLineWidth(0.3);
  doc.line(15, pageHeight - 20, 195, pageHeight - 20);
  
  // Texto do rodapé
  doc.text(
    'Este documento é válido apenas com assinatura e carimbo do veterinário responsável.',
    105,
    pageHeight - 15,
    { align: 'center' }
  );
  
  doc.text(
    `Página ${pageNumber} | Gerado em ${new Date().toLocaleDateString('pt-BR')}`,
    105,
    pageHeight - 10,
    { align: 'center' }
  );
};

// 1. RECEITA MÉDICA
export const gerarReceitaPDF = (data: {
  consulta: any;
  animal: Animal;
  tutor: Tutor;
  veterinario: Veterinario;
  receita: ReceitaItem[];
  observacoes?: string;
}) => {
  const doc = new jsPDF();
  
  addHeader(doc);

  // Título
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 100, 180);
  doc.text('RECEITA MÉDICA VETERINÁRIA', 105, 45, { align: 'center' });

  // Data
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0);
  doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 15, 55);

  // Dados do Tutor
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Dados do Tutor:', 15, 65);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nome: ${data.tutor.nome}`, 15, 72);
  doc.text(`CPF: ${data.tutor.cpf}`, 15, 78);
  doc.text(`Telefone: ${data.tutor.telefone}`, 15, 84);

  // Dados do Animal
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Dados do Paciente:', 15, 95);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nome: ${data.animal.name}`, 15, 102);
  doc.text(`Espécie: ${data.animal.especie}`, 15, 108);
  if (data.animal.raca) {
    doc.text(`Raça: ${data.animal.raca}`, 15, 114);
  }
  if (data.animal.idade) {
    doc.text(`Idade: ${data.animal.idade} anos`, 15, 120);
  }

  // Prescrição
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Prescrição:', 15, 132);

  // Tabela de medicamentos
  const tableData = data.receita.map((item, index) => [
    index + 1,
    item.medicamento,
    item.dosagem,
    item.frequencia,
    item.duracao,
  ]);

  autoTable(doc, {
    startY: 137,
    head: [['#', 'Medicamento', 'Dosagem', 'Frequência', 'Duração']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [0, 120, 215],
      fontSize: 10,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
    },
  });

  // Observações
  let finalY = (doc as any).lastAutoTable.finalY + 10;
  
  if (data.observacoes) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Observações:', 15, finalY);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const splitObs = doc.splitTextToSize(data.observacoes, 180);
    doc.text(splitObs, 15, finalY + 7);
    finalY += splitObs.length * 5 + 10;
  }

  // Assinatura do veterinário
  finalY = Math.max(finalY, 220);
  
  doc.setDrawColor(0);
  doc.line(120, finalY, 190, finalY);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(data.veterinario.name, 155, finalY + 5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text(`CRMV: ${data.veterinario.crmv}`, 155, finalY + 10, { align: 'center' });
  if (data.veterinario.especialidade) {
    doc.text(data.veterinario.especialidade, 155, finalY + 15, { align: 'center' });
  }

  addFooter(doc, 1);

  // Salvar
  const fileName = `receita_${data.animal.name}_${new Date().getTime()}.pdf`;
  doc.save(fileName);
};

// 2. LAUDO DE EXAME
export const gerarLaudoExamePDF = (data: {
  animal: Animal;
  tutor: Tutor;
  veterinario: Veterinario;
  tipoExame: string;
  dataColeta: string;
  resultados: ExameResultado[];
  diagnostico?: string;
  observacoes?: string;
}) => {
  const doc = new jsPDF();
  
  addHeader(doc);

  // Título
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 100, 180);
  doc.text('LAUDO DE EXAME VETERINÁRIO', 105, 45, { align: 'center' });

  // Tipo de exame e data
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text(`Tipo de Exame: ${data.tipoExame}`, 15, 55);
  doc.text(`Data da Coleta: ${data.dataColeta}`, 15, 61);
  doc.text(`Data do Laudo: ${new Date().toLocaleDateString('pt-BR')}`, 15, 67);

  // Dados do Animal
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Dados do Paciente:', 15, 78);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nome: ${data.animal.name}`, 15, 85);
  doc.text(`Espécie: ${data.animal.especie}`, 15, 91);
  if (data.animal.raca) {
    doc.text(`Raça: ${data.animal.raca}`, 100, 85);
  }
  if (data.animal.idade) {
    doc.text(`Idade: ${data.animal.idade} anos`, 100, 91);
  }

  // Dados do Tutor
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Tutor: ${data.tutor.nome}`, 15, 97);

  // Resultados
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Resultados:', 15, 108);

  // Tabela de resultados
  const tableData = data.resultados.map((item) => [
    item.exame,
    item.resultado,
    item.valorReferencia,
  ]);

  autoTable(doc, {
    startY: 113,
    head: [['Exame', 'Resultado', 'Valor de Referência']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [0, 120, 215],
      fontSize: 10,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
    },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 60 },
      2: { cellWidth: 60 },
    },
  });

  let finalY = (doc as any).lastAutoTable.finalY + 10;

  // Diagnóstico
  if (data.diagnostico) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Diagnóstico:', 15, finalY);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const splitDiag = doc.splitTextToSize(data.diagnostico, 180);
    doc.text(splitDiag, 15, finalY + 7);
    finalY += splitDiag.length * 5 + 10;
  }

  // Observações
  if (data.observacoes) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Observações:', 15, finalY);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const splitObs = doc.splitTextToSize(data.observacoes, 180);
    doc.text(splitObs, 15, finalY + 7);
    finalY += splitObs.length * 5 + 10;
  }

  // Assinatura do veterinário
  finalY = Math.max(finalY, 220);
  
  doc.setDrawColor(0);
  doc.line(120, finalY, 190, finalY);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(data.veterinario.name, 155, finalY + 5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text(`CRMV: ${data.veterinario.crmv}`, 155, finalY + 10, { align: 'center' });

  addFooter(doc, 1);

  // Salvar
  const fileName = `laudo_${data.tipoExame}_${data.animal.name}_${new Date().getTime()}.pdf`;
  doc.save(fileName);
};

// 3. RELATÓRIO FINANCEIRO
export const gerarRelatorioFinanceiroPDF = (data: {
  periodo: string;
  totalReceitas: number;
  totalDespesas: number;
  receitasPorCategoria: { categoria: string; valor: number }[];
  despesasPorCategoria: { categoria: string; valor: number }[];
}) => {
  const doc = new jsPDF();
  
  addHeader(doc);

  // Título
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 100, 180);
  doc.text('RELATÓRIO FINANCEIRO', 105, 45, { align: 'center' });

  // Período
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0);
  doc.text(`Período: ${data.periodo}`, 105, 55, { align: 'center' });

  // Resumo
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumo Geral:', 15, 68);

  // Cards de resumo
  const saldo = data.totalReceitas - data.totalDespesas;
  
  doc.setFillColor(16, 185, 129); // verde
  doc.rect(15, 75, 55, 25, 'F');
  doc.setTextColor(255);
  doc.setFontSize(10);
  doc.text('RECEITAS', 42.5, 83, { align: 'center' });
  doc.setFontSize(14);
  doc.text(`R$ ${data.totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 42.5, 93, { align: 'center' });

  doc.setFillColor(239, 68, 68); // vermelho
  doc.rect(75, 75, 55, 25, 'F');
  doc.setTextColor(255);
  doc.setFontSize(10);
  doc.text('DESPESAS', 102.5, 83, { align: 'center' });
  doc.setFontSize(14);
  doc.text(`R$ ${data.totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 102.5, 93, { align: 'center' });

  const saldoCor = saldo >= 0 ? [59, 130, 246] : [239, 68, 68]; // azul ou vermelho
  doc.setFillColor(saldoCor[0], saldoCor[1], saldoCor[2]);
  doc.rect(135, 75, 55, 25, 'F');
  doc.setTextColor(255);
  doc.setFontSize(10);
  doc.text('SALDO', 162.5, 83, { align: 'center' });
  doc.setFontSize(14);
  doc.text(`R$ ${saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 162.5, 93, { align: 'center' });

  // Receitas por Categoria
  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Receitas por Categoria:', 15, 115);

  const receitasData = data.receitasPorCategoria.map((item) => [
    item.categoria,
    `R$ ${item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
  ]);

  autoTable(doc, {
    startY: 120,
    head: [['Categoria', 'Valor']],
    body: receitasData,
    theme: 'striped',
    headStyles: {
      fillColor: [16, 185, 129],
      fontSize: 10,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
    },
  });

  // Despesas por Categoria
  let finalY = (doc as any).lastAutoTable.finalY + 15;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Despesas por Categoria:', 15, finalY);

  const despesasData = data.despesasPorCategoria.map((item) => [
    item.categoria,
    `R$ ${item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
  ]);

  autoTable(doc, {
    startY: finalY + 5,
    head: [['Categoria', 'Valor']],
    body: despesasData,
    theme: 'striped',
    headStyles: {
      fillColor: [239, 68, 68],
      fontSize: 10,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
    },
  });

  addFooter(doc, 1);

  // Salvar
  const fileName = `relatorio_financeiro_${new Date().getTime()}.pdf`;
  doc.save(fileName);
};

// 4. CARTEIRA DE VACINAÇÃO
export const gerarCarteiraVacinacaoPDF = (data: {
  animal: Animal;
  tutor: Tutor;
  vacinas: {
    nome: string;
    data: string;
    proximaDose?: string;
    veterinario: string;
    lote?: string;
  }[];
}) => {
  const doc = new jsPDF();
  
  addHeader(doc);

  // Título
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 100, 180);
  doc.text('CARTEIRA DE VACINAÇÃO', 105, 45, { align: 'center' });

  // Foto do animal (placeholder)
  doc.setFillColor(230, 230, 230);
  doc.rect(15, 55, 40, 40, 'F');
  doc.setFontSize(24);
  doc.text('📷', 35, 80, { align: 'center' });

  // Dados do Animal
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text('Dados do Paciente:', 60, 60);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nome: ${data.animal.name}`, 60, 68);
  doc.text(`Espécie: ${data.animal.especie}`, 60, 74);
  if (data.animal.raca) {
    doc.text(`Raça: ${data.animal.raca}`, 60, 80);
  }
  if (data.animal.idade) {
    doc.text(`Idade: ${data.animal.idade} anos`, 60, 86);
  }
  doc.text(`Tutor: ${data.tutor.nome}`, 60, 92);

  // Histórico de Vacinas
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Histórico de Vacinação:', 15, 108);

  const vacinasData = data.vacinas.map((item) => [
    item.nome,
    item.data,
    item.proximaDose || '-',
    item.veterinario,
    item.lote || '-',
  ]);

  autoTable(doc, {
    startY: 113,
    head: [['Vacina', 'Data Aplicação', 'Próxima Dose', 'Veterinário', 'Lote']],
    body: vacinasData,
    theme: 'grid',
    headStyles: {
      fillColor: [139, 92, 246],
      fontSize: 9,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 45 },
      1: { cellWidth: 30 },
      2: { cellWidth: 30 },
      3: { cellWidth: 45 },
      4: { cellWidth: 30 },
    },
  });

  addFooter(doc, 1);

  // Salvar
  const fileName = `carteira_vacinacao_${data.animal.name}_${new Date().getTime()}.pdf`;
  doc.save(fileName);
};
