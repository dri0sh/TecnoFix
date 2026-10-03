import { FormEvent, useState } from "react";
import { cambiarPassword } from "../../Api/Auth";
import "./ChangePassword.css";

export function ChangePassword() {
    const [passwordActual, setPasswordActual] = useState("");
    const [passwordNueva, setPasswordNueva] = useState("");
    const [confirmarPasswordNueva, setConfirmarPasswordNueva] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [mensaje, setMensaje] = useState<string | null>(null);
    const [cargando, setCargando] = useState(false);

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setCargando(true);
        setError(null);
        setMensaje(null);

        try {
            const response = await cambiarPassword({PasswordActual: passwordActual, 
                PasswordNueva: passwordNueva, 
                ConfirmarPasswordNueva: confirmarPasswordNueva});

            if (response.Exito) {
                setMensaje(response.Mensaje);
                setPasswordActual("");
                setPasswordNueva("");
                setConfirmarPasswordNueva("");

            } else {
                setError(response.Mensaje);
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : "Error desconocido");
        } finally {
            setCargando(false);
        }
    }

    return (
        <div className="container">
            <h1 className="title">Cambiar contraseña</h1>

            {error && <p className="error">{error}</p>}

            {mensaje && <p className="success">{mensaje}</p>}

            <form onSubmit={handleSubmit} className="form">
                <div className="field">
                    <label className="label" htmlFor="passwordActual">Contraseña actual</label>
                    <input
                        id="passwordActual"
                        type="password"
                        className="input"
                        value={passwordActual}
                        onChange={(e) => setPasswordActual(e.target.value)}
                        required
                    />
                </div>

                <div className="field">
                    <label className="label" htmlFor="passwordNueva">Nueva contraseña</label>
                    <input
                        id="passwordNueva"
                        type="password"
                        className="input"
                        value={passwordNueva}
                        onChange={(e) => setPasswordNueva(e.target.value)}
                        required
                    />
                </div>

                <div className="field">
                    <label className="label" htmlFor="confirmarPasswordNueva">Confirmar nueva contraseña</label>
                    <input
                        id="confirmarPasswordNueva"
                        type="password"
                        className="input"
                        value={confirmarPasswordNueva}
                        onChange={(e) => setConfirmarPasswordNueva(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" className="button" disabled={cargando}>
                    {cargando ? "Cambiando..." : "Cambiar contraseña"}
                </button>
            </form>
        </div>
    );
}