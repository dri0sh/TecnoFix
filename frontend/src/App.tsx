import { useState } from "react";
import { apiFetch } from "./services/api";
import type {
  LoginRequestDto,
  LoginResponseDto,
  RegistrarClienteRequestDto,
  RegistrarClienteResponseDto,
} from "./Types/Auth.Type";

function App() {
  const [modo, setModo] = useState<"login" | "registro">("login");

  // Login
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");

  // Registro
  const [nombre, setNombre] = useState("");
  const [rut, setRut] = useState("");
  const [telefono, setTelefono] = useState("");

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

  const registrarCliente = async () => {
    try {
      setMensaje("Registrando cliente...");

      const datos: RegistrarClienteRequestDto = {
        name: nombre,
        correo: correo,
        rut: rut,
        telefono: telefono,
      };

      const respuesta = await apiFetch<RegistrarClienteResponseDto>(
        "/api/Auth/register",
        {
          method: "POST",
          body: JSON.stringify(datos),
        }
      );

      setMensaje(respuesta.mensaje);

      setNombre("");
      setCorreo("");
      setRut("");
      setTelefono("");
    } catch (error) {
      if (error instanceof Error) {
        setMensaje(error.message);
      } else {
        setMensaje("Ocurrió un error al registrar el cliente");
      }
    }
  };

  const cambiarModo = (nuevoModo: "login" | "registro") => {
    setModo(nuevoModo);
    setMensaje("");
  };

  return (
    <div>
      <h1>TECNOFIX</h1>

      {modo === "login" ? (
        <>
          <h2>Iniciar sesión</h2>

          <input
            type="email"
            placeholder="Correo electrónico"
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

          <p>
            ¿No tienes una cuenta?{" "}
            <button onClick={() => cambiarModo("registro")}>
              Registrarse
            </button>
          </p>
        </>
      ) : (
        <>
          <h2>Crear cuenta</h2>

          <input
            type="text"
            placeholder="Nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />

          <br />

          <input
            type="email"
            placeholder="Correo electrónico"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />

          <br />

          <input
            type="text"
            placeholder="RUT (sin puntos ni guion)"
            value={rut}
            onChange={(e) => setRut(e.target.value)}
          />

          <br />

          <input
            type="tel"
            placeholder="Teléfono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />

          <br />

          <button onClick={registrarCliente}>
            Registrarse
          </button>

          <p>
            ¿Ya tienes una cuenta?{" "}
            <button onClick={() => cambiarModo("login")}>
              Iniciar sesión
            </button>
          </p>
        </>
      )}

      <p>{mensaje}</p>
    </div>
  );
}

export default App;

