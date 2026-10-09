import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Login as LoginApi } from "../../Api/Auth";
import { SaveRole, NormalizeRole } from "../../Utils/Auth";
import "./Login.css";

// Mensajes exactos de la tarjeta USU-001
const INVALID_EMAIL_MESSAGE = "El correo electrónico no tiene un formato válido";

const CONNECTION_ERROR_MESSAGE = "No se pudo conectar con el servidor. Intenta nuevamente.";

// Formato: algo@dominio.ext
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function GetEmptyFieldMessage(fieldName: string): string {
    return "Debe completar el campo " + fieldName;
}

// Pantalla de inicio según el rol (NF02).
// Provisorio: todos van a cambiar contraseña hasta que existan las pantallas de cada rol.
function GetStartRoute(role: string): string {
    const normalizedRole = NormalizeRole(role);

    if (normalizedRole === "administrador") {
        return "/change-password";
    }

    if (normalizedRole === "tecnico") {
        return "/change-password";
    }

    if (normalizedRole === "cliente") {
        return "/change-password";
    }

    return "/login";
}

export function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [generalError, setGeneralError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Revisa que los campos estén completos y con buen formato
    function ValidateForm(trimmedEmail: string): boolean {
        let isValid = true;

        if (trimmedEmail === "") {
            setEmailError(GetEmptyFieldMessage("Correo electrónico"));
            isValid = false;
        } else if (!EMAIL_REGEX.test(trimmedEmail)) {
            setEmailError(INVALID_EMAIL_MESSAGE);
            isValid = false;
        }

        if (password === "") {
            setPasswordError(
                GetEmptyFieldMessage("Contraseña")
            );
            isValid = false;
        }

        return isValid;
    }

    async function HandleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setEmailError("");
        setPasswordError("");
        setGeneralError("");

        const trimmedEmail = email.trim();

        if (!ValidateForm(trimmedEmail)) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await LoginApi({email: trimmedEmail, password});

            SaveRole(response.role);
            navigate(GetStartRoute(response.role));
        } catch (error) {
            // Un TypeError significa que no hubo conexión con el servidor.
            // Cualquier otro Error trae el mensaje del backend.
            if (error instanceof Error && !(error instanceof TypeError)
            ) {
                setGeneralError(error.message);
            } else {
                setGeneralError(CONNECTION_ERROR_MESSAGE);
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="loginPage">
            <main className="formColumn">
                <div className="content">
                    <h1>Iniciar sesión</h1>

                    <p className="subtitle">
                        Ingresa con tu correo electrónico y tu contraseña.
                    </p>

                    {/* Error general (credenciales incorrectas) */}
                    <p
                        id="generalError"
                        className="errorMessage"
                        role="alert"
                    >
                        {generalError}
                    </p>

                    <form onSubmit={HandleSubmit} noValidate>
                        <div className="field">
                            <label htmlFor="email">
                                Correo electrónico
                            </label>

                            <div
                                className={
                                    "inputContainer" +
                                    (emailError ? " invalid" : "")
                                }
                            >
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="username"
                                    placeholder="usuario@correo.cl"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(event.target.value)
                                    }
                                />

                                <div className="fieldActions">
                                    <span className="help">
                                        <button
                                            type="button"
                                            className="helpButton"
                                            aria-describedby="emailHelp"
                                            aria-label="Ayuda: correo electrónico"
                                        >
                                            ?
                                        </button>

                                        <span
                                            id="emailHelp"
                                            className="helpText"
                                            role="tooltip"
                                        >
                                            Es el correo con el que te
                                            registraste, por ejemplo
                                            usuario@correo.cl.
                                        </span>
                                    </span>
                                </div>
                            </div>

                            <p
                                className="errorMessage"
                                role="alert"
                            >
                                {emailError}
                            </p>
                        </div>

                        <div className="field">
                            <label htmlFor="password">
                                Contraseña
                            </label>

                            <div
                                className={
                                    "inputContainer" +
                                    (passwordError ? " invalid" : "")
                                }
                            >
                                <input
                                    id="password"
                                    name="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    autoComplete="current-password"
                                    placeholder="Ingresa tu contraseña"
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(event.target.value)
                                    }
                                />

                                <div className="fieldActions">
                                    <button
                                        type="button"
                                        className="showPassword"
                                        aria-pressed={showPassword}
                                        onClick={() =>
                                            setShowPassword(
                                                !showPassword
                                            )
                                        }
                                    >
                                        {showPassword
                                            ? "Ocultar"
                                            : "Ver"}
                                    </button>

                                    <span className="help">
                                        <button
                                            type="button"
                                            className="helpButton"
                                            aria-describedby="passwordHelp"
                                            aria-label="Ayuda: contraseña"
                                        >
                                            ?
                                        </button>

                                        <span
                                            id="passwordHelp"
                                            className="helpText"
                                            role="tooltip"
                                        >
                                            Si es tu primer ingreso, usa la
                                            contraseña temporal que te llegó
                                            por correo.
                                        </span>
                                    </span>
                                </div>
                            </div>

                            <p
                                className="errorMessage"
                                role="alert"
                            >
                                {passwordError}
                            </p>
                        </div>

                        <button
                            type="submit"
                            className="primaryButton"
                            disabled={isLoading}
                        >
                            {isLoading
                                ? "Ingresando..."
                                : "Iniciar sesión"}
                        </button>
                    </form>

                    <p className="formFooter">
                        ¿No tienes cuenta?{" "}
                        <Link to="/register-client">
                            Regístrate
                        </Link>
                    </p>
                </div>
            </main>

            <aside className="panel" aria-hidden="true">
                {/* Espacio reservado para una foto o ilustración real, a definir con el cliente (NF01) */}
                <p>
                    Sigue el estado de tu reparación paso a paso con
                    TecnoFix.
                </p>
            </aside>
        </div>
    );
}