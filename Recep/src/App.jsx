import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import Agendamentos from "./pages/Agendamentos";
import Cadastros from "./pages/Cadastros";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";
import PortalPaciente from "./pages/PortalPaciente";

function RotaProtegida({ children }) {
  const token = localStorage.getItem("access_token");
  return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/portal-paciente"
          element={
            <RotaProtegida>
              <PortalPaciente />
            </RotaProtegida>
          }
        />
        <Route
          path="/dashboard"
          element={
            <RotaProtegida>
              <Dashboard />
            </RotaProtegida>
          }
        />
        <Route
          path="/clientes"
          element={
            <RotaProtegida>
              <Clientes />
            </RotaProtegida>
          }
        />
        <Route
          path="/agendamentos"
          element={
            <RotaProtegida>
              <Agendamentos />
            </RotaProtegida>
          }
        />
        <Route
          path="/cadastros"
          element={
            <RotaProtegida>
              <Cadastros />
            </RotaProtegida>
          }
        />
        <Route
          path="/relatorios"
          element={
            <RotaProtegida>
              <Relatorios />
            </RotaProtegida>
          }
        />
        <Route
          path="/configuracoes"
          element={
            <RotaProtegida>
              <Configuracoes />
            </RotaProtegida>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;