import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { DiagnosticoPage } from './pages/Diagnostico';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard/DashboardSimple';
import Tutores from './pages/Tutores/Tutores';
import Animais from './pages/Animais/Animais';
import Veterinarios from './pages/Veterinarios/Veterinarios';
import Planos from './pages/Planos/Planos';
import Clinicas from './pages/Clinicas/Clinicas';
import Agendamento from './pages/Agendamento/Agendamento';
import { AnimalDetailsPage } from './pages/Animais/AnimalDetails';
import { ConsultaDetailsPage } from './pages/Consultas/ConsultaDetails';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              {/* Rotas Públicas */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/diagnosticos" element={<DiagnosticoPage />} />
              <Route path="/animais/:id" element={<AnimalDetailsPage />} />
              <Route path="/consultas/:id" element={<ConsultaDetailsPage />} />

              {/* Rotas Protegidas */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/agendamento"
                element={
                  <PrivateRoute>
                    <Layout>
                      <Agendamento />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/tutores"
                element={
                  <PrivateRoute>
                    <Layout>
                      <Tutores />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/animais"
                element={
                  <PrivateRoute>
                    <Layout>
                      <Animais />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/veterinarios"
                element={
                  <PrivateRoute>
                    <Layout>
                      <Veterinarios />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/planos"
                element={
                  <PrivateRoute>
                    <Layout>
                      <Planos />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/clinicas"
                element={
                  <PrivateRoute>
                    <Layout>
                      <Clinicas />
                    </Layout>
                  </PrivateRoute>
                }
              />

              {/* Redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>

            {/* Toast Container - Configuração Global */}
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
              theme="light"
              style={{ zIndex: 9999 }}
            />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
