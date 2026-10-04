import { useState } from "react";
import { apiFetch } from "./services/api";
import type { LoginRequestDto, LoginResponseDto } from "./Types/Auth.Type";

function App() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");

  const iniciarSesion = async () => {
    try {
      setMensaje("Iniciando sesión...");

      const datos: LoginRequestDto = {
        Correo: correo,
        Password: password,
      };

      const respuesta = await apiFetch<LoginResponseDto>(
        "/api/Auth/login",
        {
          method: "POST",
          body: JSON.stringify(datos),
        }
      );

      setMensaje(`Bienvenido ${respuesta.name}. Rol: ${respuesta.rol}`);
    } catch (error) {
      if (error instanceof Error) {
        setMensaje(error.message);
      } else {
        setMensaje("Ocurrió un error al iniciar sesión");
      }
    }
  };

  return (
    <div>
      <h1>Login TecnoFix</h1>

      <input
        type="email"
        placeholder="Correo"
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
      />

      <br />

      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br />

      <button onClick={iniciarSesion}>
        Iniciar sesión
      </button>

      <p>{mensaje}</p>
    </div>
  );
}

export default App;

