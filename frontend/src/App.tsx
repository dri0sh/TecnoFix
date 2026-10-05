import { useState } from "react";

import { apiFetch } from "./services/api";

import type {
  RegistrarClienteRequestDto,
  RegistrarClienteResponseDto,
} from "./Types/Auth.Type";

function App() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [rut, setRut] = useState("");
  const [telefono, setTelefono] = useState("");
  const [mensaje, setMensaje] = useState("");

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

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-logo">
          <div className="logo-icon">
            TF
          </div>

          <span>
            TECNOFIX
          </span>
        </div>

        <div className="auth-title">
          <h1>
            Crear cuenta
          </h1>

          <p>
            Regístrate como cliente de TecnoFix
          </p>
        </div>

        <div className="formulario">

          <label>
            Nombre completo
          </label>

          <input
            type="text"
            placeholder="Ingresa tu nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />

          <label>
            Correo electrónico
          </label>

          <input
            type="email"
            placeholder="ejemplo@correo.com"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />

          <label>
            RUT
          </label>

          <input
            type="text"
            placeholder="12345678K"
            value={rut}
            onChange={(e) => setRut(e.target.value)}
          />

          <small>
            Ingresa el RUT sin puntos ni guion.
          </small>

          <label>
            Teléfono
          </label>

          <input
            type="tel"
            placeholder="+56 9 1234 5678"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />

          <button
            className="boton-azul boton-form"
            onClick={registrarCliente}
          >
            Crear cuenta
          </button>

        </div>

        {mensaje && (
          <div className="mensaje">
            {mensaje}
          </div>
        )}

      </div>
    </div>
  );
}

export default App;