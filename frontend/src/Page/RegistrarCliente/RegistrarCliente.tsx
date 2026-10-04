import { FormEvent, useState } from "react";
import { registrarCliente } from "../../Api/Auth";
import "./RegistrarCliente.css";

export function RegistrarCliente() {
  const [nombre, setNombre] = useState("");
  const [rut, setRut] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    setCargando(true);
    setError(null);
    setMensaje(null);

    try {
      const response = await registrarCliente({
        name: nombre,
        correo,
        rut,
        telefono,
      });

      setMensaje(response.mensaje);

      setNombre("");
      setRut("");
      setCorreo("");
      setTelefono("");
    } catch (err) {
      setError(
        err instanceof Error  ? err.message : "Error desconocido al registrar cliente"
      );
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="container">
      <h1 className="title">Registrar Cliente</h1>

      {error && <p className="error">{error}</p>}
      {mensaje && <p className="success">{mensaje}</p>}

      <form onSubmit={handleSubmit} className="form">
        <div className="field">
          <label className="label" htmlFor="nombre">
            Nombre completo
          </label>

          <input
            id="nombre"
            type="text"
            className="input"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Juan Pérez"
            required
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="rut">
            RUT
          </label>

          <input
            id="rut"
            type="text"
            className="input"
            value={rut}
            onChange={(e) => setRut(e.target.value)}
            placeholder="12345678-9"
            required
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="correo">
            Correo electrónico
          </label>

          <input
            id="correo"
            type="email"
            className="input"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="correo@ejemplo.cl"
            required
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="telefono">
            Teléfono
          </label>

          <input
            id="telefono"
            type="tel"
            className="input"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="+56912345678"
            required
          />
        </div>

        <button type="submit" className="button" disabled={cargando}>
          {cargando ? "Registrando..." : "Registrar Cliente"}
        </button>
      </form>
    </div>
  );
}