import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { ChangePassword } from "./Page/ChangePassword/ChangePassword";

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/cambiar-password">Cambiar contraseña</Link>
      </nav>

      <Routes>
        <Route path="/cambiar-password" element={
          <ChangePassword />
        }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;