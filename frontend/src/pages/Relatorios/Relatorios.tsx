import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Assessment,
  PictureAsPdf,
  TableChart,
  Pets,
  LocalHospital,
  Science,
  Download,
  DateRange,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';


const Relatorios: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [tipoRelatorio, setTipoRelatorio] = useState('consultas');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [formato, setFormato] = useState('pdf');

  // Estados para dados
  const [consultas, setConsultas] = useState<any[]>([]);
  const [animais, setAnimais] = useState<any[]>([]);
  const [diagnosticos, setDiagnosticos] = useState<any[]>([]);


  useEffect(() => {
    // Definir data padrão (último mês)
    const hoje = new Date();
    const mesPassado = new Date(hoje.getFullYear(), hoje.getMonth() - 1, hoje.getDate());
    
    setDataFim(hoje.toISOString().split('T')[0]);
    setDataInicio(mesPassado.toISOString().split('T')[0]);
  }, []);


  const fetchDados = async () => {
    setLoading(true);
    try {
      if (tipoRelatorio === 'consultas') {
        const response = await api.get('/consultas/', {
          params: { data_inicio: dataInicio, data_fim: dataFim }
        });
        setConsultas(response.data.results || response.data || []);
      } else if (tipoRelatorio === 'animais') {
        const response = await api.get('/animais/');
        setAnimais(response.data.results || response.data || []);
      } else if (tipoRelatorio === 'diagnosticos') {
        const response = await api.get('/diagnosticos/');
        setDiagnosticos(response.data.results || response.data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast.error('Erro ao carregar dados para o relatório');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (dataInicio && dataFim) {
      fetchDados();
    }
  }, [tipoRelatorio, dataInicio, dataFim]);


  // Função para gerar PDF de Consultas
  const gerarPDFConsultas = () => {
    const doc = new jsPDF();
    
    // Cabeçalho
    doc.setFontSize(20);
    doc.setTextColor(102, 126, 234);
    doc.text('VetSystem', 14, 20);
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Relatório de Consultas', 14, 30);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Período: ${formatDate(dataInicio)} a ${formatDate(dataFim)}`, 14, 37);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 42);
    
    // Linha separadora
    doc.setDrawColor(102, 126, 234);
    doc.setLineWidth(0.5);
    doc.line(14, 45, 196, 45);
    
    // Estatísticas
    const total = consultas.length;
    const agendadas = consultas.filter(c => c.status === 'agendada').length;
    const concluidas = consultas.filter(c => c.status === 'concluida').length;
    const canceladas = consultas.filter(c => c.status === 'cancelada').length;
    
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Resumo:', 14, 53);
    
    doc.setFontSize(10);
    doc.text(`Total de Consultas: ${total}`, 14, 60);
    doc.text(`Agendadas: ${agendadas}`, 14, 66);
    doc.text(`Concluídas: ${concluidas}`, 14, 72);
    doc.text(`Canceladas: ${canceladas}`, 14, 78);
    
    // Tabela de consultas
    const tableData = consultas.map(c => [
      formatDate(c.data),
      c.hora || '-',
      c.animal?.name || 'N/A',
      c.tutor?.name || 'N/A',
      c.veterinario?.name || 'N/A',
      translateStatus(c.status),
      c.motivo || '-'
    ]);
    
    autoTable(doc, {
      startY: 85,
      head: [['Data', 'Hora', 'Animal', 'Tutor', 'Veterinário', 'Status', 'Motivo']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [102, 126, 234],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 8,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { left: 14, right: 14 },
    });
    
    // Rodapé
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Página ${i} de ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    
    doc.save(`relatorio-consultas-${Date.now()}.pdf`);
    toast.success('PDF gerado com sucesso!');
  };


  // Função para gerar PDF de Animais
  const gerarPDFAnimais = () => {
    const doc = new jsPDF();
    
    // Cabeçalho
    doc.setFontSize(20);
    doc.setTextColor(102, 126, 234);
    doc.text('VetSystem', 14, 20);
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Relatório de Animais Cadastrados', 14, 30);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 37);
    
    doc.setDrawColor(102, 126, 234);
    doc.setLineWidth(0.5);
    doc.line(14, 40, 196, 40);
    
    // Estatísticas
    const total = animais.length;
    const especies = [...new Set(animais.map(a => a.species))];
    
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Resumo:', 14, 48);
    
    doc.setFontSize(10);
    doc.text(`Total de Animais: ${total}`, 14, 55);
    doc.text(`Espécies diferentes: ${especies.length}`, 14, 61);
    
    // Tabela de animais
    const tableData = animais.map(a => [
      a.name || 'N/A',
      a.species || 'N/A',
      a.breed || '-',
      a.birth_date ? formatDate(a.birth_date) : '-',
      a.tutor?.name || 'N/A',
    ]);
    
    autoTable(doc, {
      startY: 68,
      head: [['Nome', 'Espécie', 'Raça', 'Nascimento', 'Tutor']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [102, 126, 234],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { left: 14, right: 14 },
    });
    
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Página ${i} de ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    
    doc.save(`relatorio-animais-${Date.now()}.pdf`);
    toast.success('PDF gerado com sucesso!');
  };


  // Função para gerar PDF de Diagnósticos
  const gerarPDFDiagnosticos = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setTextColor(102, 126, 234);
    doc.text('VetSystem', 14, 20);
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Relatório de Diagnósticos IA', 14, 30);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 37);
    
    doc.setDrawColor(102, 126, 234);
    doc.setLineWidth(0.5);
    doc.line(14, 40, 196, 40);
    
    const total = diagnosticos.length;
    const validados = diagnosticos.filter(d => d.validado).length;
    
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Resumo:', 14, 48);
    
    doc.setFontSize(10);
    doc.text(`Total de Diagnósticos: ${total}`, 14, 55);
    doc.text(`Validados: ${validados}`, 14, 61);
    doc.text(`Pendentes: ${total - validados}`, 14, 67);
    
    const tableData = diagnosticos.map(d => [
      formatDate(d.created_at),
      d.animal?.name || 'N/A',
      d.classe_predita || '-',
      `${(d.confianca * 100).toFixed(1)}%`,
      d.validado ? 'Sim' : 'Não',
    ]);
    
    autoTable(doc, {
      startY: 74,
      head: [['Data', 'Animal', 'Diagnóstico', 'Confiança', 'Validado']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [102, 126, 234],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { left: 14, right: 14 },
    });
    
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Página ${i} de ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    
    doc.save(`relatorio-diagnosticos-${Date.now()}.pdf`);
    toast.success('PDF gerado com sucesso!');
  };


  // Função para gerar Excel de Consultas
  const gerarExcelConsultas = () => {
    const data = consultas.map(c => ({
      'Data': formatDate(c.data),
      'Hora': c.hora || '-',
      'Animal': c.animal?.name || 'N/A',
      'Tutor': c.tutor?.name || 'N/A',
      'Veterinário': c.veterinario?.name || 'N/A',
      'Status': translateStatus(c.status),
      'Motivo': c.motivo || '-',
      'Observações': c.observacoes || '-',
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Consultas');
    
    XLSX.writeFile(wb, `relatorio-consultas-${Date.now()}.xlsx`);
    toast.success('Excel gerado com sucesso!');
  };


  // Função para gerar Excel de Animais
  const gerarExcelAnimais = () => {
    const data = animais.map(a => ({
      'Nome': a.name || 'N/A',
      'Espécie': a.species || 'N/A',
      'Raça': a.breed || '-',
      'Nascimento': a.birth_date ? formatDate(a.birth_date) : '-',
      'Tutor': a.tutor?.name || 'N/A',
      'Peso (kg)': a.weight || '-',
      'Cor': a.color || '-',
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Animais');
    
    XLSX.writeFile(wb, `relatorio-animais-${Date.now()}.xlsx`);
    toast.success('Excel gerado com sucesso!');
  };


  // Função para gerar Excel de Diagnósticos
  const gerarExcelDiagnosticos = () => {
    const data = diagnosticos.map(d => ({
      'Data': formatDate(d.created_at),
      'Animal': d.animal?.name || 'N/A',
      'Diagnóstico': d.classe_predita || '-',
      'Confiança': `${(d.confianca * 100).toFixed(1)}%`,
      'Validado': d.validado ? 'Sim' : 'Não',
      'Veterinário': d.veterinario?.name || '-',
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Diagnósticos');
    
    XLSX.writeFile(wb, `relatorio-diagnosticos-${Date.now()}.xlsx`);
    toast.success('Excel gerado com sucesso!');
  };


  const handleGerarRelatorio = () => {
    if (!dataInicio || !dataFim) {
      toast.error('Selecione o período do relatório');
      return;
    }

    if (formato === 'pdf') {
      if (tipoRelatorio === 'consultas') gerarPDFConsultas();
      else if (tipoRelatorio === 'animais') gerarPDFAnimais();
      else if (tipoRelatorio === 'diagnosticos') gerarPDFDiagnosticos();
    } else {
      if (tipoRelatorio === 'consultas') gerarExcelConsultas();
      else if (tipoRelatorio === 'animais') gerarExcelAnimais();
      else if (tipoRelatorio === 'diagnosticos') gerarExcelDiagnosticos();
    }
  };


  // Helpers
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const translateStatus = (status: string) => {
    const translations: { [key: string]: string } = {
      'agendada': 'Agendada',
      'em_andamento': 'Em Andamento',
      'concluida': 'Concluída',
      'cancelada': 'Cancelada',
    };
    return translations[status] || status;
  };


  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Avatar sx={{ bgcolor: 'secondary.main', width: 48, height: 48 }}>
          <Assessment />
        </Avatar>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Relatórios
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gere relatórios detalhados em PDF ou Excel
          </Typography>
        </Box>
      </Box>


      {/* Grid usando Box */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '400px 1fr' },
          gap: 3,
        }}
      >
        {/* Configurações do Relatório */}
        <Box>
          <Card>
            <CardContent>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    Configurações
                  </Typography>
                  <Divider />
                </Box>

                {/* Tipo de Relatório */}
                <FormControl fullWidth>
                  <InputLabel>Tipo de Relatório</InputLabel>
                  <Select
                    value={tipoRelatorio}
                    onChange={(e) => setTipoRelatorio(e.target.value)}
                    label="Tipo de Relatório"
                  >
                    <MenuItem value="consultas">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <LocalHospital fontSize="small" />
                        <span>Consultas</span>
                      </Stack>
                    </MenuItem>
                    <MenuItem value="animais">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Pets fontSize="small" />
                        <span>Animais</span>
                      </Stack>
                    </MenuItem>
                    <MenuItem value="diagnosticos">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Science fontSize="small" />
                        <span>Diagnósticos IA</span>
                      </Stack>
                    </MenuItem>
                  </Select>
                </FormControl>

                {/* Período */}
                <Box>
                  <Typography variant="body2" fontWeight={600} mb={1}>
                    Período
                  </Typography>
                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Data Início"
                      value={dataInicio}
                      onChange={(e) => setDataInicio(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: <DateRange sx={{ mr: 1, color: 'action.active' }} />,
                      }}
                    />
                    <TextField
                      fullWidth
                      type="date"
                      label="Data Fim"
                      value={dataFim}
                      onChange={(e) => setDataFim(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: <DateRange sx={{ mr: 1, color: 'action.active' }} />,
                      }}
                    />
                  </Stack>
                </Box>

                {/* Formato */}
                <FormControl fullWidth>
                  <InputLabel>Formato</InputLabel>
                  <Select
                    value={formato}
                    onChange={(e) => setFormato(e.target.value)}
                    label="Formato"
                  >
                    <MenuItem value="pdf">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <PictureAsPdf fontSize="small" />
                        <span>PDF</span>
                      </Stack>
                    </MenuItem>
                    <MenuItem value="excel">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <TableChart fontSize="small" />
                        <span>Excel</span>
                      </Stack>
                    </MenuItem>
                  </Select>
                </FormControl>

                {/* Botão Gerar */}
                <Button
                  variant="contained"
                  size="large"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Download />}
                  onClick={handleGerarRelatorio}
                  disabled={loading}
                  fullWidth
                  sx={{
                    py: 1.5,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                  }}
                >
                  {loading ? 'Gerando...' : 'Gerar Relatório'}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Box>


        {/* Preview/Informações */}
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Tipos de Relatórios Disponíveis
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <List>
                <ListItem>
                  <ListItemIcon>
                    <LocalHospital color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Relatório de Consultas"
                    secondary="Lista completa de consultas realizadas com data, animal, tutor, veterinário e status"
                  />
                  <Chip label={`${consultas.length} registros`} color="primary" />
                </ListItem>

                <Divider variant="inset" component="li" />

                <ListItem>
                  <ListItemIcon>
                    <Pets color="secondary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Relatório de Animais"
                    secondary="Cadastro completo de animais com informações de espécie, raça, tutor e dados médicos"
                  />
                  <Chip label={`${animais.length} registros`} color="secondary" />
                </ListItem>

                <Divider variant="inset" component="li" />

                <ListItem>
                  <ListItemIcon>
                    <Science color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Relatório de Diagnósticos IA"
                    secondary="Histórico de diagnósticos realizados pela IA com taxa de confiança e validação"
                  />
                  <Chip label={`${diagnosticos.length} registros`} color="success" />
                </ListItem>
              </List>

              <Box mt={4} p={3} bgcolor="grey.50" borderRadius={2}>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  📊 Informações do Relatório Atual
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    <strong>Tipo:</strong> {tipoRelatorio === 'consultas' ? 'Consultas' : tipoRelatorio === 'animais' ? 'Animais' : 'Diagnósticos IA'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Período:</strong> {dataInicio ? formatDate(dataInicio) : '-'} até {dataFim ? formatDate(dataFim) : '-'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Formato:</strong> {formato === 'pdf' ? 'PDF' : 'Excel (XLSX)'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Registros:</strong>{' '}
                    {tipoRelatorio === 'consultas' ? consultas.length :
                     tipoRelatorio === 'animais' ? animais.length :
                     diagnosticos.length}
                  </Typography>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};


export default Relatorios;
