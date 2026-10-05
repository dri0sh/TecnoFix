import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ChangePassword } from "./Page/CambiarPassword/CambiarPassword";
import { RegistrarTecnico } from "./Page/RegistrarTecnico/RegistrarTecnico";
import { Login } from "./Page/Login/Login";
import { RegistrarCliente } from "./Page/RegistrarCliente/RegistrarCliente";
import { ProtectedRoute } from "./Components/ProtectedRoute";
import { AccesoDenegado } from "./Page/AccesoDenegado/AccesoDenegado";
import { Navigation } from "./Components/Navigation";

function App() {
  return (
    <BrowserRouter>

      <Navigation/>

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
                rolesPermitidos={["Administrador", "Tecnico"]}
                  permitirSinAutenticar={true}>
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
