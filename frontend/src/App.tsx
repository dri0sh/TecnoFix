import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { ChangePassword } from "./Page/ChangePassword/ChangePassword";
import { RegistrarTecnico } from "./Page/RegistrarTecnico/RegistrarTecnico";

function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: "1rem", display: "flex", gap: "1rem" }}>
        <Link to="/cambiar-password">Cambiar contraseña</Link>
        <Link to="/registro-tecnico">Registrar Técnico</Link>
      </nav>

      <Routes>
        <Route path="/cambiar-password" element={<ChangePassword />} />
        <Route path="/registro-tecnico" element={<RegistrarTecnico />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;