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
import DashboardSimple from './pages/Dashboard/DashboardSimple';
import Agendamento from './pages/Agendamento/Agendamento';
import Tutores from './pages/Tutores/Tutores';
import Animais from './pages/Animais/Animais';
import Diagnostico from './pages/Diagnostico/Diagnostico';
import Veterinarios from './pages/Veterinarios/Veterinarios';
import Planos from './pages/Planos/Planos';
import Clinicas from './pages/Clinicas/Clinicas';
import Configuracoes from './pages/Configuracoes/Configuracoes';
import Consultas from './pages/Consultas/Consultas'; // ✅ Nova
import { ConsultaDetailsPage } from './pages/Consultas/ConsultaDetailsPage';
import Documentos from './pages/Documentos/Documentos'; // ✅ Nova importação
import Exames from './pages/Exames/Exames'; // ✅ Nova importação
import Perfil from './pages/Perfil/Perfil'; // ✅ Nova importação
import Relatorios from './pages/Relatorios/Relatorios'; // ✅ Nova importação
import Vacinas from './pages/Vacinas/Vacinas'; // ✅ Nova importação





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
                    <Route path="/dashboard" element={<DashboardSimple />} />
                    
                    {/* Módulos */}
                    <Route path="/agendamento" element={<Agendamento />} />
                    <Route path="/tutores" element={<Tutores />} />
                    <Route path="/animais" element={<Animais />} />
                    <Route path="/diagnostico" element={<Diagnostico />} />
                    <Route path="/veterinarios" element={<Veterinarios />} />
                    <Route path="/planos" element={<Planos />} />
                    <Route path="/clinicas" element={<Clinicas />} />
                    <Route path="/configuracoes" element={<Configuracoes />} />
                    <Route path="/documentos" element={<Documentos />} /> {/* ✅ Nova rota */}
                    <Route path="/exames" element={<Exames />} /> {/* ✅ Nova rota */}
                    <Route path="/perfil" element={<Perfil />} /> {/* ✅ Nova rota */}
                    <Route path="/relatorios" element={<Relatorios />} /> {/* ✅ Nova rota */}
                    <Route path="/vacinas" element={<Vacinas />} /> {/* ✅ Nova rota */}



                    {/* Consultas */}
                    <Route path="/consultas" element={<Consultas />} /> {/* ✅ Nova */}
                    <Route path="/consultas/:id" element={<ConsultaDetailsPage />} /> {/* ✅ Nova */}
                    
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
