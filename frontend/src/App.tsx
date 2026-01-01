import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout
import { Layout } from './components/layout/Layout';

// Pages - Auth
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

// Pages - App
import Dashboard from './pages/Dashboard/Dashboard';
import Agendamento from './pages/Agendamento/Agendamento';
import Tutores from './pages/Tutores/Tutores';
import Animais from './pages/Animais/Animais';
import Diagnostico from './pages/Diagnostico/Diagnostico';
import Veterinarios from './pages/Veterinarios/Veterinarios';
import Planos from './pages/Planos/Planos';
import Clinicas from './pages/Clinicas/Clinicas';
import Configuracoes from './pages/Configuracoes/Configuracoes';
import Consultas from './pages/Consultas/Consultas';
import { ConsultaDetailsPage } from './pages/Consultas/ConsultaDetailsPage';
import Documentos from './pages/Documentos/Documentos';
import Exames from './pages/Exames/Exames';
import Perfil from './pages/Perfil/Perfil';
import Relatorios from './pages/Relatorios/Relatorios';
import Vacinas from './pages/Vacinas/Vacinas';
import Prontuario from './pages/Prontuario/Prontuario';

// Financeiro
import DashboardFinanceiro from './pages/Financeiro/DashboardFinanceiro';
import ListaTransacoes from './pages/Financeiro/ListaTransacoes';
import GerenciarCategorias from './pages/Financeiro/GerenciarCategorias';

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#667eea',
      },
      secondary: {
        main: '#764ba2',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
  });

  const handleToggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const isAuthenticated = () => {
    return !!localStorage.getItem('access_token');
  };

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    return isAuthenticated() ? <>{children}</> : <Navigate to="/login" />;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout darkMode={darkMode} onToggleTheme={handleToggleTheme}>
                  <Routes>
                    {/* Dashboard */}
                    <Route path="/dashboard" element={<Dashboard />} />
                    
                    {/* Módulos */}
                    <Route path="/agendamento" element={<Agendamento />} />
                    <Route path="/tutores" element={<Tutores />} />
                    <Route path="/animais" element={<Animais />} />
                    <Route path="/diagnostico" element={<Diagnostico />} />
                    <Route path="/veterinarios" element={<Veterinarios />} />
                    <Route path="/planos" element={<Planos />} />
                    <Route path="/clinicas" element={<Clinicas />} />
                    <Route path="/configuracoes" element={<Configuracoes />} />
                    <Route path="/documentos" element={<Documentos />} />
                    <Route path="/exames" element={<Exames />} />
                    <Route path="/perfil" element={<Perfil />} />
                    <Route path="/relatorios" element={<Relatorios />} />
                    <Route path="/vacinas" element={<Vacinas />} />
                    <Route path="/prontuario" element={<Prontuario />} />

                    {/* Consultas */}
                    <Route path="/consultas" element={<Consultas />} />
                    <Route path="/consultas/:id" element={<ConsultaDetailsPage />} />
                    
                    {/* Financeiro */}
                    <Route path="/financeiro/dashboard" element={<DashboardFinanceiro />} />
                    <Route path="/financeiro/transacoes" element={<ListaTransacoes />} />
                    <Route path="/financeiro/categorias" element={<GerenciarCategorias />} />
                    <Route path="/financeiro" element={<Navigate to="/financeiro/dashboard" />} />
                    
                    {/* Redirect root to dashboard */}
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={darkMode ? 'dark' : 'light'}
      />
    </ThemeProvider>
  );
};

export default App;
