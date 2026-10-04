import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom";
import { ChangePassword } from "./Page/ChangePassword/ChangePassword";
import { Login } from "./Page/Login/Login";

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/login">Iniciar sesión</Link>
        {" | "}
        <Link to="/cambiar-password">Cambiar contraseña</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cambiar-password" element={<ChangePassword />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;