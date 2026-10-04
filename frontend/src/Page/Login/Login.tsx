import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { iniciarSesion } from "../../Api/Auth";
import "./Login.css";

// Mensajes exactos de la tarjeta USU-001
const MENSAJE_CORREO_INVALIDO = "El correo electrónico no tiene un formato válido";
const MENSAJE_ERROR_CONEXION = "No se pudo conectar con el servidor. Intenta nuevamente.";

// Formato: algo@dominio.ext
const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function mensajeCampoVacio(nombreCampo: string): string {
    return "Debe completar el campo " + nombreCampo;
}

// Pantalla de inicio según el rol (NF02).
// Provisorio: todos van a cambiar contraseña hasta que existan las pantallas de cada rol.
function obtenerRutaDeInicio(rol: string): string {
    const rolNormalizado = rol.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    if (rolNormalizado === "administrador") return "/cambiar-password";
    if (rolNormalizado === "tecnico") return "/cambiar-password";
    return "/cambiar-password";
}

export function Login() {
    const navegar = useNavigate();

    const [correo, setCorreo] = useState("");
    const [contrasena, setContrasena] = useState("");
    const [verContrasena, setVerContrasena] = useState(false);
    const [errorCorreo, setErrorCorreo] = useState("");
    const [errorContrasena, setErrorContrasena] = useState("");
    const [errorGeneral, setErrorGeneral] = useState("");
    const [cargando, setCargando] = useState(false);

    // Revisa que los campos estén completos y con buen formato
    function validarFormulario(correoLimpio: string): boolean {
        let esValido = true;

        if (correoLimpio === "") {
            setErrorCorreo(mensajeCampoVacio("Correo electrónico"));
            esValido = false;
        } else if (!REGEX_CORREO.test(correoLimpio)) {
            setErrorCorreo(MENSAJE_CORREO_INVALIDO);
            esValido = false;
        }

        if (contrasena === "") {
            setErrorContrasena(mensajeCampoVacio("Contraseña"));
            esValido = false;
        }

        return esValido;
    }

    async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();
        setErrorCorreo("");
        setErrorContrasena("");
        setErrorGeneral("");

        const correoLimpio = correo.trim();
        if (!validarFormulario(correoLimpio)) return;

        setCargando(true);
        try {
            const respuesta = await iniciarSesion({
                Correo: correoLimpio,
                Contrasena: contrasena
            });

            localStorage.setItem("rol", respuesta.rol);
            navegar(obtenerRutaDeInicio(respuesta.rol));
        } catch (error) {
            // Un TypeError significa que no hubo conexión con el servidor.
            // Cualquier otro Error trae el mensaje del backend ("Correo electrónico o contraseña incorrectos").
            if (error instanceof Error && !(error instanceof TypeError)) {
                setErrorGeneral(error.message);
            } else {
                setErrorGeneral(MENSAJE_ERROR_CONEXION);
            }
        } finally {
            setCargando(false);
        }
    }

    return (
        <div className="paginaLogin">
            <main className="columnaFormulario">
                <div className="contenido">
                    <h1>Iniciar sesión</h1>
                    <p className="subtitulo">Ingresa con tu correo electrónico y tu contraseña.</p>

                    {/* Error general (credenciales incorrectas) */}
                    <p id="errorGeneral" className="mensajeError" role="alert">{errorGeneral}</p>

                    <form onSubmit={manejarEnvio} noValidate>
                        <div className="campo">
                            <label htmlFor="correo">Correo electrónico</label>
                            <div className={"entradaContenedor" + (errorCorreo ? " invalido" : "")}>
                                <input
                                    id="correo"
                                    name="correo"
                                    type="email"
                                    autoComplete="username"
                                    placeholder="usuario@correo.cl"
                                    value={correo}
                                    onChange={(e) => setCorreo(e.target.value)}
                                />
                                <div className="accionesCampo">
                                    <span className="ayuda">
                                        <button type="button" className="ayudaBoton" aria-describedby="ayudaCorreo" aria-label="Ayuda: correo electrónico">?</button>
                                        <span id="ayudaCorreo" className="ayudaTexto" role="tooltip">
                                            Es el correo con el que te registraste, por ejemplo usuario@correo.cl.
                                        </span>
                                    </span>
                                </div>
                            </div>
                            <p className="mensajeError" role="alert">{errorCorreo}</p>
                        </div>

                        <div className="campo">
                            <label htmlFor="contrasena">Contraseña</label>
                            <div className={"entradaContenedor" + (errorContrasena ? " invalido" : "")}>
                                <input
                                    id="contrasena"
                                    name="contrasena"
                                    type={verContrasena ? "text" : "password"}
                                    autoComplete="current-password"
                                    placeholder="Ingresa tu contraseña"
                                    value={contrasena}
                                    onChange={(e) => setContrasena(e.target.value)}
                                />
                                <div className="accionesCampo">
                                    <button
                                        type="button"
                                        className="verContrasena"
                                        aria-pressed={verContrasena}
                                        onClick={() => setVerContrasena(!verContrasena)}
                                    >
                                        {verContrasena ? "Ocultar" : "Ver"}
                                    </button>
                                    <span className="ayuda">
                                        <button type="button" className="ayudaBoton" aria-describedby="ayudaContrasena" aria-label="Ayuda: contraseña">?</button>
                                        <span id="ayudaContrasena" className="ayudaTexto" role="tooltip">
                                            Si es tu primer ingreso, usa la contraseña temporal que te llegó por correo.
                                        </span>
                                    </span>
                                </div>
                            </div>
                            <p className="mensajeError" role="alert">{errorContrasena}</p>
                        </div>

                        <button type="submit" className="botonPrincipal" disabled={cargando}>
                            {cargando ? "Ingresando..." : "Iniciar sesión"}
                        </button>
                    </form>

                    {/* Enlace a USU-002 (registro de cliente). Ruta provisoria. */}
                    <p className="pieFormulario">¿No tienes cuenta? <Link to="/registro">Regístrate</Link></p>
                </div>
            </main>

            <aside className="panel" aria-hidden="true">
                {/* Espacio reservado para una foto o ilustración real, a definir con el cliente (NF01) */}
                <p>Sigue el estado de tu reparación paso a paso con TecnoFix.</p>
            </aside>
        </div>
    );
}