import { FormEvent, useState } from "react";
import { registrarTecnico } from "../../Api/Auth";
import "../../EstandarPage.css";

export function RegistrarTecnico() {
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
      const response = await registrarTecnico({
        Nombre: nombre,
        Rut: rut,
        Correo: correo,
        Telefono: telefono,
      });

      setMensaje(response.mensaje);
      setNombre("");
      setRut("");
      setCorreo("");
      setTelefono("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido al registrar técnico");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="formPage">
        <main className="formPage__content">
            <h1 className="formPage__title">Registrar Técnico</h1>

            <p className="formPage__subtitle">
                Ingresa los datos del nuevo técnico.
            </p>

            {error && (
                <p className="formPage__error" role="alert">
                    {error}
                </p>
            )}

            {mensaje && (
                <p className="formPage__success" role="alert">
                    {mensaje}
                </p>
            )}

            <form onSubmit={handleSubmit} className="formPage__form">
                <div className="formPage__field">
                    <label className="formPage__label" htmlFor="nombre">
                        Nombre completo
                    </label>

                    <input
                        id="nombre"
                        type="text"
                        className="formPage__input"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="Juan Pérez"
                        required
                    />
                </div>

                <div className="formPage__field">
                    <label className="formPage__label" htmlFor="rut">
                        RUT
                    </label>

                    <input
                        id="rut"
                        type="text"
                        className="formPage__input"
                        value={rut}
                        onChange={(e) => setRut(e.target.value)}
                        placeholder="12345678K"
                        required
                    />
                </div>

                <div className="formPage__field">
                    <label className="formPage__label" htmlFor="correo">
                        Correo electrónico
                    </label>

                    <input
                        id="correo"
                        type="email"
                        className="formPage__input"
                        value={correo}
                        onChange={(e) => setCorreo(e.target.value)}
                        placeholder="correo@ejemplo.cl"
                        required
                    />
                </div>

                <div className="formPage__field">
                    <label className="formPage__label" htmlFor="telefono">
                        Teléfono
                    </label>

                    <input
                        id="telefono"
                        type="tel"
                        className="formPage__input"
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                        placeholder="+56912345678"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="formPage__button"
                    disabled={cargando}
                >
                    {cargando ? "Registrando..." : "Registrar Técnico"}
                </button>
            </form>
        </main>
    </div>
  );
}