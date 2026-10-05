import { FormEvent, useState } from "react";
import { cambiarPassword } from "../../Api/Auth";
import { useNavigate } from "react-router-dom";
import { eliminarSesion } from "../../Utils/Auth";
import "../../EstandarPage.css";

export function ChangePassword() {
    const [passwordActual, setPasswordActual] = useState("");
    const [passwordNueva, setPasswordNueva] = useState("");
    const [confirmarPasswordNueva, setConfirmarPasswordNueva] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [mensaje, setMensaje] = useState<string | null>(null);
    const [cargando, setCargando] = useState(false);
    const navigate = useNavigate();

    function validarFormulario(): boolean {
    if (passwordActual.trim() === "") {
        setError("Debe completar el campo Contraseña actual");
        return false;
    }

    if (passwordNueva.trim() === "") {
        setError("Debe completar el campo Nueva contraseña");
        return false;
    }

    if (confirmarPasswordNueva.trim() === "") {
        setError("Debe completar el campo Confirmar nueva contraseña");
        return false;
    }

    if (passwordNueva !== confirmarPasswordNueva) {
        setError("Las contraseñas no coinciden");
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
            const response = await cambiarPassword({PasswordActual: passwordActual, 
                PasswordNueva: passwordNueva, 
                ConfirmarPasswordNueva: confirmarPasswordNueva});

            if (response.exito) {
                setMensaje(`${response.mensaje}. Serás redirigido al inicio de sesión.`);

                setPasswordActual("");
                setPasswordNueva("");
                setConfirmarPasswordNueva("");

                setTimeout(() => {eliminarSesion();
                navigate("/login", { replace: true });
                }, 2500);
            } else {
                setError(response.mensaje);
            }
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
                <h1 className="formPage__title">Cambiar contraseña</h1>

                <p className="formPage__subtitle">
                    Actualiza tu contraseña de acceso.
                </p>

                {error && (<p className="formPage__error" role="alert">{error}</p>)}

                {mensaje && (<p className="formPage__success" role="alert">{mensaje}</p>)}

                <form onSubmit={handleSubmit} className="formPage__form" noValidate>
                    <div className="formPage__field">
                        <label
                            className="formPage__label"
                            htmlFor="passwordActual"
                        >
                            Contraseña actual
                        </label>

                        <input
                            id="passwordActual"
                            type="password"
                            className="formPage__input"
                            value={passwordActual}
                            onChange={(e) => setPasswordActual(e.target.value)}
                            required
                        />
                    </div>

                    <div className="formPage__field">
                        <label
                            className="formPage__label"
                            htmlFor="passwordNueva"
                        >
                            Nueva contraseña
                        </label>

                        <input
                            id="passwordNueva"
                            type="password"
                            className="formPage__input"
                            value={passwordNueva}
                            onChange={(e) => setPasswordNueva(e.target.value)}
                            required
                        />
                    </div>

                    <div className="formPage__field">
                        <label
                            className="formPage__label"
                            htmlFor="confirmarPasswordNueva"
                        >
                            Confirmar nueva contraseña
                        </label>

                        <input
                            id="confirmarPasswordNueva"
                            type="password"
                            className="formPage__input"
                            value={confirmarPasswordNueva}
                            onChange={(e) => setConfirmarPasswordNueva(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="formPage__button"
                        disabled={cargando}
                    >
                        {cargando ? "Cambiando..." : "Cambiar contraseña"}
                    </button>
                </form>
            </main>
        </div>
    );
}