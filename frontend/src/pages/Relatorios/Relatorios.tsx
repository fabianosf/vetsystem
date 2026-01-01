import { useState, ReactElement } from 'react';
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
  TextField,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  Assessment,
  PictureAsPdf,
  Download,
  TrendingUp,
  AttachMoney,
  Pets,
  MedicalServices,
  CalendarMonth,
  Schedule,
  Science,
  BarChart,
  CheckCircle,
  DateRange,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

interface Relatorio {
  id: string;
  titulo: string;
  descricao: string;
  icon: ReactElement;
  color: string;
  bgColor: string;
  categoria: string;
  campos: string[];
}

export default function Relatorios() {
  const [gerandoRelatorio, setGerandoRelatorio] = useState<string | null>(null);
  const [periodo, setPeriodo] = useState('mes_atual');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const relatorios: Relatorio[] = [
    {
      id: 'financeiro',
      titulo: 'Relatório Financeiro',
      descricao: 'Receitas, despesas e lucro líquido do período',
      icon: <AttachMoney sx={{ fontSize: 48 }} />,
      color: '#10b981',
      bgColor: '#d1fae5',
      categoria: 'Financeiro',
      campos: ['Receitas por categoria', 'Despesas detalhadas', 'Fluxo de caixa', 'Lucro líquido'],
    },
    {
      id: 'consultas',
      titulo: 'Relatório de Consultas',
      descricao: 'Total de consultas realizadas e agendadas',
      icon: <MedicalServices sx={{ fontSize: 48 }} />,
      color: '#3b82f6',
      bgColor: '#dbeafe',
      categoria: 'Atendimento',
      campos: ['Consultas por período', 'Consultas por veterinário', 'Taxa de comparecimento', 'Receita gerada'],
    },
    {
      id: 'animais',
      titulo: 'Relatório de Animais',
      descricao: 'Estatísticas de animais cadastrados e ativos',
      icon: <Pets sx={{ fontSize: 48 }} />,
      color: '#f59e0b',
      bgColor: '#fef3c7',
      categoria: 'Cadastro',
      campos: ['Total de animais', 'Espécies', 'Raças mais comuns', 'Novos cadastros'],
    },
    {
      id: 'exames',
      titulo: 'Relatório de Exames',
      descricao: 'Exames solicitados e resultados do período',
      icon: <Science sx={{ fontSize: 48 }} />,
      color: '#8b5cf6',
      bgColor: '#f3e8ff',
      categoria: 'Laboratório',
      campos: ['Exames realizados', 'Tipos de exames', 'Tempo médio de resultado', 'Custo total'],
    },
    {
      id: 'agendamento',
      titulo: 'Relatório de Agendamentos',
      descricao: 'Performance e ocupação da agenda',
      icon: <CalendarMonth sx={{ fontSize: 48 }} />,
      color: '#ec4899',
      bgColor: '#fce7f3',
      categoria: 'Agenda',
      campos: ['Taxa de ocupação', 'Horários mais procurados', 'Cancelamentos', 'No-shows'],
    },
    {
      id: 'desempenho',
      titulo: 'Relatório de Desempenho',
      descricao: 'KPIs e métricas gerais da clínica',
      icon: <TrendingUp sx={{ fontSize: 48 }} />,
      color: '#06b6d4',
      bgColor: '#cffafe',
      categoria: 'Gestão',
      campos: ['Faturamento total', 'Ticket médio', 'Crescimento mensal', 'ROI'],
    },
  ];

  const handleGerarRelatorio = async (relatorioId: string) => {
    setGerandoRelatorio(relatorioId);
    try {
      // Simular geração de relatório
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Relatório gerado com sucesso!');
      
      // Em produção, chamaria a API:
      // const response = await api.post(`/relatorios/${relatorioId}/`, {
      //   periodo,
      //   dataInicio,
      //   dataFim,
      // });
      // window.open(response.data.url);
    } catch (error) {
      toast.error('Erro ao gerar relatório');
    } finally {
      setGerandoRelatorio(null);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ bgcolor: 'success.main', width: 48, height: 48 }}>
              <Assessment />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight={700}>
                Relatórios
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gere relatórios detalhados para análise e tomada de decisão
              </Typography>
            </Box>
          </Stack>
        </Box>
        <Chip
          icon={<BarChart />}
          label="Analytics"
          color="success"
          sx={{ fontWeight: 600 }}
        />
      </Box>

      {/* Filtros de Período */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Período de Análise
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
              gap: 2,
            }}
          >
            <TextField
              select
              label="Período"
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: (
                  <DateRange sx={{ mr: 1, color: 'action.active' }} />
                ),
              }}
            >
              <MenuItem value="hoje">Hoje</MenuItem>
              <MenuItem value="semana_atual">Esta Semana</MenuItem>
              <MenuItem value="mes_atual">Este Mês</MenuItem>
              <MenuItem value="ultimo_mes">Último Mês</MenuItem>
              <MenuItem value="trimestre">Últimos 3 Meses</MenuItem>
              <MenuItem value="semestre">Últimos 6 Meses</MenuItem>
              <MenuItem value="ano">Este Ano</MenuItem>
              <MenuItem value="personalizado">Personalizado</MenuItem>
            </TextField>

            {periodo === 'personalizado' && (
              <>
                <TextField
                  type="date"
                  label="Data Início"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
                <TextField
                  type="date"
                  label="Data Fim"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Grid de Relatórios */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
          gap: 3,
          mb: 4,
        }}
      >
        {relatorios.map((relatorio) => (
          <Card
            key={relatorio.id}
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
                bgcolor: relatorio.bgColor,
                borderBottom: '3px solid',
                borderColor: relatorio.color,
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ color: relatorio.color }}>
                  {relatorio.icon}
                </Box>
                <Box flex={1}>
                  <Chip
                    label={relatorio.categoria}
                    size="small"
                    sx={{
                      bgcolor: relatorio.color,
                      color: 'white',
                      fontWeight: 600,
                      mb: 1,
                    }}
                  />
                  <Typography variant="h6" fontWeight={700}>
                    {relatorio.titulo}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {relatorio.descricao}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <CardContent>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Campos Incluídos:
              </Typography>
              
              <List dense>
                {relatorio.campos.map((campo, index) => (
                  <ListItem key={index} disablePadding>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CheckCircle sx={{ fontSize: 18, color: relatorio.color }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={campo}
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
                startIcon={
                  gerandoRelatorio === relatorio.id ? (
                    <Schedule />
                  ) : (
                    <Download />
                  )
                }
                onClick={() => handleGerarRelatorio(relatorio.id)}
                disabled={gerandoRelatorio === relatorio.id}
                sx={{
                  mt: 2,
                  bgcolor: relatorio.color,
                  '&:hover': {
                    bgcolor: relatorio.color,
                    filter: 'brightness(0.9)',
                  },
                }}
              >
                {gerandoRelatorio === relatorio.id ? 'Gerando...' : 'Gerar Relatório'}
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
              <PictureAsPdf />
            </Avatar>
            <Typography variant="h6" fontWeight={600} color="info.dark">
              Sobre os Relatórios
            </Typography>
          </Stack>
          
          <Typography variant="body2" color="info.dark">
            • Todos os relatórios são gerados em formato PDF para fácil compartilhamento
          </Typography>
          
          <Typography variant="body2" color="info.dark">
            • Os dados são baseados no período selecionado e atualizados em tempo real
          </Typography>
          
          <Typography variant="body2" color="info.dark">
            • Você pode personalizar o período de análise para atender suas necessidades
          </Typography>
          
          <Typography variant="body2" color="info.dark">
            • Os relatórios incluem gráficos e tabelas para melhor visualização
          </Typography>

          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="body2" fontWeight={600}>
              💡 Dica: Use os relatórios mensais para acompanhar o crescimento da clínica!
            </Typography>
          </Alert>
        </Stack>
      </Paper>
    </Box>
  );
}
