import { FormEvent, useState } from "react";
import { registrarTecnico } from "../../Api/Auth";
import "./RegistrarTecnico.css";

export function RegistrarTecnico() {
  const [nombre, setNombre] = useState("");
  const [rut, setRut] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

    function validarFormulario(): boolean {
    if (nombre.trim() === "") {
        setError("Debe completar el campo Nombre");
        return false;
    }

    if (rut.trim() === "") {
        setError("Debe completar el campo RUT");
        return false;
    }

    if (correo.trim() === "") {
        setError("Debe completar el campo Correo electrónico");
        return false;
    }

    if (telefono.trim() === "") {
        setError("Debe completar el campo Teléfono");
        return false;
    }

    return true;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMensaje(null);

    if (!validarFormulario()) {return;}

    setCargando(true);

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
      } catch (error) {
          if (error instanceof Error && !(error instanceof TypeError)) {
              setError(error.message);
          } else {
              setError("No se pudo conectar con el servidor. Intenta nuevamente.");
              }
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

            <form onSubmit={handleSubmit} className="formPage__form" noValidate>
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
                        placeholder="+56 912345678"
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