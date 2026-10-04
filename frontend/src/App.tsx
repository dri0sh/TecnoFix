import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom";
import { ChangePassword } from "./Page/CambiarPassword/CambiarPassword";
import { RegistrarTecnico } from "./Page/RegistrarTecnico/RegistrarTecnico";
import { Login } from "./Page/Login/Login";
import { RegistrarCliente } from "./Page/RegistrarCliente/RegistrarCliente";
import { ProtectedRoute } from "./Components/ProtectedRoute";
import { AccesoDenegado } from "./Page/AccesoDenegado/AccesoDenegado";

function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: "1rem", display: "flex", gap: "1rem" }}>
        <Link to="/login">Iniciar sesión</Link>
        <Link to="/cambiar-password">Cambiar contraseña</Link>
        <Link to="/registro-tecnico">Registrar Técnico</Link>
        <Link to="/registro-cliente">Registrar Cliente</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />

        <Route path="/cambiar-password" element={
            <ProtectedRoute
                rolesPermitidos={["Administrador", "Tecnico", "Cliente"]}>
                <ChangePassword/>
            </ProtectedRoute>
          }/>

        <Route path="/registro-cliente" element={
            <ProtectedRoute
                rolesPermitidos={["Administrador", "Tecnico"]}>
                <RegistrarCliente/>
            </ProtectedRoute>
        }/>

    <Route path="/registro-tecnico" element={
            <ProtectedRoute
                rolesPermitidos={["Administrador"]}>
                <RegistrarTecnico/>
            </ProtectedRoute>
        }/>

    <Route path="/acceso-denegado" element={
            <ProtectedRoute
                rolesPermitidos={["Administrador", "Tecnico", "Cliente"]}>
                <AccesoDenegado/>
            </ProtectedRoute>
          }/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
