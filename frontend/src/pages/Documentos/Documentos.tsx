import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Divider,
  Paper,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Description,
  Assignment,
  Receipt,
  Vaccines,
  PictureAsPdf,
  Science,
  Download,
  CheckCircle,
} from '@mui/icons-material';
import {
  gerarReceitaPDF,
  gerarLaudoExamePDF,
  gerarRelatorioFinanceiroPDF,
  gerarCarteiraVacinacaoPDF,
} from '../../utils/pdfGenerator';
import { toast } from 'react-toastify';

export default function Documentos() {
  const [gerandoPDF, setGerandoPDF] = useState<string | null>(null);

  const handleGerarReceita = async () => {
    setGerandoPDF('receita');
    try {
      const dadosExemplo = {
        consulta: { id: 1 },
        animal: {
          name: 'Rex',
          especie: 'Canino',
          raca: 'Golden Retriever',
          idade: 5,
        },
        tutor: {
          nome: 'João Silva',
          cpf: '123.456.789-00',
          telefone: '(11) 98765-4321',
        },
        veterinario: {
          name: 'Dra. Maria Santos',
          crmv: 'SP-12345',
          especialidade: 'Clínica Geral',
        },
        receita: [
          {
            medicamento: 'Amoxicilina 500mg',
            dosagem: '1 comprimido',
            frequencia: '2x ao dia',
            duracao: '7 dias',
          },
          {
            medicamento: 'Dipirona 500mg',
            dosagem: '1 comprimido',
            frequencia: '3x ao dia (se dor)',
            duracao: '5 dias',
          },
        ],
        observacoes: 'Administrar os medicamentos junto com a alimentação. Retornar em 7 dias para reavaliação.',
      };

      gerarReceitaPDF(dadosExemplo);
      toast.success('Receita gerada com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar receita');
    } finally {
      setGerandoPDF(null);
    }
  };

  const handleGerarLaudo = async () => {
    setGerandoPDF('laudo');
    try {
      const dadosExemplo = {
        animal: {
          name: 'Mimi',
          especie: 'Felino',
          raca: 'Siamês',
          idade: 3,
        },
        tutor: {
          nome: 'Maria Oliveira',
          cpf: '987.654.321-00',
          telefone: '(11) 91234-5678',
        },
        veterinario: {
          name: 'Dr. Pedro Costa',
          crmv: 'SP-54321',
          especialidade: 'Patologia Clínica',
        },
        tipoExame: 'Hemograma Completo',
        dataColeta: '10/12/2025',
        resultados: [
          { exame: 'Hemácias', resultado: '7.2 milhões/mm³', valorReferencia: '5.5 - 8.5' },
          { exame: 'Hemoglobina', resultado: '15.2 g/dL', valorReferencia: '12 - 18' },
          { exame: 'Leucócitos', resultado: '12.500/mm³', valorReferencia: '6.000 - 17.000' },
          { exame: 'Plaquetas', resultado: '285.000/mm³', valorReferencia: '200.000 - 500.000' },
        ],
        diagnostico: 'Resultados dentro dos parâmetros normais. Animal apresenta quadro hematológico saudável.',
        observacoes: 'Manter acompanhamento anual de rotina.',
      };

      gerarLaudoExamePDF(dadosExemplo);
      toast.success('Laudo gerado com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar laudo');
    } finally {
      setGerandoPDF(null);
    }
  };

  const handleGerarRelatorioFinanceiro = async () => {
    setGerandoPDF('relatorio');
    try {
      const dadosExemplo = {
        periodo: 'Dezembro/2025',
        totalReceitas: 45280.50,
        totalDespesas: 28150.75,
        receitasPorCategoria: [
          { categoria: 'Consultas', valor: 28500.00 },
          { categoria: 'Cirurgias', valor: 12000.00 },
          { categoria: 'Exames', valor: 3200.50 },
          { categoria: 'Vacinas', valor: 1580.00 },
        ],
        despesasPorCategoria: [
          { categoria: 'Medicamentos', valor: 12500.00 },
          { categoria: 'Salários', valor: 8200.00 },
          { categoria: 'Aluguel', valor: 4500.00 },
          { categoria: 'Equipamentos', valor: 2950.75 },
        ],
      };

      gerarRelatorioFinanceiroPDF(dadosExemplo);
      toast.success('Relatório financeiro gerado com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar relatório');
    } finally {
      setGerandoPDF(null);
    }
  };

  const handleGerarCarteiraVacinacao = async () => {
    setGerandoPDF('carteira');
    try {
      const dadosExemplo = {
        animal: {
          name: 'Thor',
          especie: 'Canino',
          raca: 'Labrador',
          idade: 2,
        },
        tutor: {
          nome: 'Ana Paula',
          cpf: '456.789.123-00',
          telefone: '(11) 99876-5432',
        },
        vacinas: [
          {
            nome: 'V10',
            data: '15/01/2025',
            proximaDose: '15/01/2026',
            veterinario: 'Dra. Maria Santos',
            lote: 'ABC123',
          },
          {
            nome: 'Antirrábica',
            data: '20/01/2025',
            proximaDose: '20/01/2026',
            veterinario: 'Dr. João Silva',
            lote: 'XYZ789',
          },
          {
            nome: 'Gripe Canina',
            data: '10/02/2025',
            proximaDose: '10/02/2026',
            veterinario: 'Dra. Maria Santos',
            lote: 'GRP456',
          },
        ],
      };

      gerarCarteiraVacinacaoPDF(dadosExemplo);
      toast.success('Carteira de vacinação gerada com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar carteira');
    } finally {
      setGerandoPDF(null);
    }
  };

  const documentos = [
    {
      id: 'receita',
      titulo: 'Receita Médica',
      descricao: 'Gerar receita veterinária com prescrições de medicamentos',
      icon: <Receipt sx={{ fontSize: 48 }} />,
      color: '#0ea5e9',
      bgColor: '#e0f2fe',
      action: handleGerarReceita,
      features: [
        'Prescrição de medicamentos',
        'Dosagem e frequência',
        'Observações do veterinário',
        'Assinatura digital',
      ],
    },
    {
      id: 'laudo',
      titulo: 'Laudo de Exame',
      descricao: 'Gerar laudo profissional com resultados de exames',
      icon: <Science sx={{ fontSize: 48 }} />,
      color: '#8b5cf6',
      bgColor: '#f3e8ff',
      action: handleGerarLaudo,
      features: [
        'Resultados detalhados',
        'Valores de referência',
        'Diagnóstico veterinário',
        'Recomendações',
      ],
    },
    {
      id: 'relatorio',
      titulo: 'Relatório Financeiro',
      descricao: 'Gerar relatório completo de receitas e despesas',
      icon: <Assignment sx={{ fontSize: 48 }} />,
      color: '#10b981',
      bgColor: '#d1fae5',
      action: handleGerarRelatorioFinanceiro,
      features: [
        'Receitas por categoria',
        'Despesas detalhadas',
        'Saldo do período',
        'Análise visual',
      ],
    },
    {
      id: 'carteira',
      titulo: 'Carteira de Vacinação',
      descricao: 'Gerar histórico completo de vacinação do animal',
      icon: <Vaccines sx={{ fontSize: 48 }} />,
      color: '#f59e0b',
      bgColor: '#fef3c7',
      action: handleGerarCarteiraVacinacao,
      features: [
        'Histórico completo',
        'Datas de aplicação',
        'Próximas doses',
        'Lotes e fabricantes',
      ],
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ bgcolor: 'error.main', width: 48, height: 48 }}>
              <PictureAsPdf />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight={700}>
                Geração de Documentos
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gere PDFs profissionais para sua clínica
              </Typography>
            </Box>
          </Stack>
        </Box>
        <Chip
          icon={<PictureAsPdf />}
          label="Formato PDF"
          color="error"
          sx={{ fontWeight: 600 }}
        />
      </Box>

      {/* Grid de Documentos com Box */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
          gap: 3,
          mb: 4,
        }}
      >
        {documentos.map((doc) => (
          <Card
            key={doc.id}
            sx={{
              height: '100%',
              transition: 'all 0.3s',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: 6,
              },
            }}
          >
            {/* Header do Card */}
            <Box
              sx={{
                p: 3,
                bgcolor: doc.bgColor,
                borderBottom: '3px solid',
                borderColor: doc.color,
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ color: doc.color }}>
                  {doc.icon}
                </Box>
                <Box flex={1}>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    {doc.titulo}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {doc.descricao}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <CardContent>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Recursos Incluídos:
              </Typography>
              
              <List dense>
                {doc.features.map((feature, index) => (
                  <ListItem key={index} disablePadding>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CheckCircle sx={{ fontSize: 18, color: doc.color }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={feature}
                      primaryTypographyProps={{
                        variant: 'body2',
                        color: 'text.secondary',
                      }}
                    />
                  </ListItem>
                ))}
              </List>

              <Button
                fullWidth
                variant="contained"
                startIcon={gerandoPDF === doc.id ? <PictureAsPdf /> : <Download />}
                onClick={doc.action}
                disabled={gerandoPDF === doc.id}
                sx={{
                  mt: 2,
                  bgcolor: doc.color,
                  '&:hover': {
                    bgcolor: doc.color,
                    filter: 'brightness(0.9)',
                  },
                }}
              >
                {gerandoPDF === doc.id ? 'Gerando...' : 'Gerar PDF'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Informações */}
      <Paper sx={{ p: 3, bgcolor: 'info.light' }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ bgcolor: 'info.main' }}>
              <Description />
            </Avatar>
            <Typography variant="h6" fontWeight={600} color="info.dark">
              Informações Importantes
            </Typography>
          </Stack>
          
          <Typography variant="body2" color="info.dark">
            • Os PDFs são gerados com dados de exemplo para demonstração
          </Typography>
          
          <Typography variant="body2" color="info.dark">
            • Em produção, os documentos serão preenchidos com dados reais do sistema
          </Typography>
          
          <Typography variant="body2" color="info.dark">
            • Todos os documentos incluem cabeçalho profissional, rodapé e assinatura digital
          </Typography>
          
          <Typography variant="body2" color="info.dark">
            • Os arquivos são salvos automaticamente no seu computador após a geração
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
