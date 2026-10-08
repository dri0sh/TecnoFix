import { FormEvent, useState } from "react";
import { registrarCliente } from "../../Api/Auth";
import "./RegistrarCliente.css";
import { Link } from "react-router-dom";

export function RegistrarCliente() {
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
            <h1 className="formPage__title">Crear Cuenta</h1>

            <p className="formPage__subtitle">
                Registrate como cliente de TecnoFix
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
                        placeholder="Ingresa tu nombre."
                        required
                    />
                </div>

                <div className="formPage__field">
                    <label className="formPage__label" htmlFor="rut">
                        RUT (sin puntos ni guion)
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
                        placeholder="+56 9 1234 5678"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="formPage__button"
                    disabled={cargando}
                >
                    {cargando ? "Creando cuenta..." : "Crear Cuenta"}
                </button>
            </form>
            <p className="pieFormulario">¿Ya tienes una cuenta? <Link to="/login">Iniciar Sesión</Link></p>
        </main>
    </div>
  );
}