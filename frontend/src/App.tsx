import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom";
import { ChangePassword } from "./Page/ChangePassword/ChangePassword";
import { RegistrarTecnico } from "./Page/RegistrarTecnico/RegistrarTecnico";
import { Login } from "./Page/Login/Login";

function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: "1rem", display: "flex", gap: "1rem" }}>
        <Link to="/login">Iniciar sesión</Link>
        <Link to="/cambiar-password">Cambiar contraseña</Link>
        <Link to="/registro-tecnico">Registrar Técnico</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cambiar-password" element={<ChangePassword />} />
        <Route path="/registro-tecnico" element={<RegistrarTecnico />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;