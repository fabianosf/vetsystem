import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box, Grid, Card, CardContent, Typography, Avatar, Stack,
  LinearProgress, CircularProgress
} from '@mui/material';
import {
  Pets, Person, MedicalServices, HealthAndSafety
} from '@mui/icons-material';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    tutores: 0,
    animais: 0,
    veterinarios: 0,
    planos: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tutoresRes, animaisRes, veterinariosRes, planosRes] = await Promise.all([
        api.get('/tutores/').catch(() => ({ data: [] })),
        api.get('/animais/').catch(() => ({ data: [] })),
        api.get('/veterinarios/').catch(() => ({ data: [] })),
        api.get('/planos/').catch(() => ({ data: [] })),
      ]);

      const tutores = tutoresRes.data.results || tutoresRes.data || [];
      const animais = animaisRes.data.results || animaisRes.data || [];
      const veterinarios = veterinariosRes.data.results || veterinariosRes.data || [];
      const planos = planosRes.data.results || planosRes.data || [];

      setStats({
        tutores: tutores.length,
        animais: animais.length,
        veterinarios: veterinarios.length,
        planos: planos.length,
      });
    } catch (error) {
      console.error('Erro ao carregar:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Bem-vindo(a), {user?.first_name || user?.username}! 👋
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" color="white" fontWeight={700}>
                    {stats.tutores}
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.8)">
                    Tutores
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <Person sx={{ color: 'white', fontSize: 32 }} />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" color="white" fontWeight={700}>
                    {stats.animais}
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.8)">
                    Animais
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <Pets sx={{ color: 'white', fontSize: 32 }} />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" color="white" fontWeight={700}>
                    {stats.veterinarios}
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.8)">
                    Veterinários
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <MedicalServices sx={{ color: 'white', fontSize: 32 }} />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" color="white" fontWeight={700}>
                    {stats.planos}
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.8)">
                    Planos
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <HealthAndSafety sx={{ color: 'white', fontSize: 32 }} />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box mt={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              🎉 Sistema Funcionando!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Seu VetSystem está configurado e pronto para uso. 
              Use o menu lateral para navegar entre as páginas.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
