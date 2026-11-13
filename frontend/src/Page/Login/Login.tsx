import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Login as LoginApi } from "../../Api/Auth";
import { HOME_ROUTE } from "../../Utils/Menu";
import { useAuth } from "../../Context/AuthContext";
import "./Login.css";

// Mensajes exactos de la tarjeta USU-001
const INVALID_EMAIL_MESSAGE = "El correo electrónico no tiene un formato válido";
const CONNECTION_ERROR_MESSAGE = "No se pudo conectar con el servidor. Intenta nuevamente.";

// Formato de correo: texto@dominio.extensión
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Rutas definidas en App.tsx
const REGISTER_ROUTE = "/register-client";

// Configuración del aviso emergente (toast) de SweetAlert2
const TOAST = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        // Pausa el temporizador mientras el cursor está sobre el aviso
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
    }
});

/** Muestra el aviso de inicio de sesión exitoso. */
function ShowLoginSuccessToast(): void {
    TOAST.fire({
        icon: "success",
        title: "Sesión iniciada correctamente"
    });
}

/** Mensaje para un campo obligatorio vacío. */
function GetEmptyFieldMessage(fieldName: string): string {
    return "Debe completar el campo " + fieldName;
}

/**
 * Ruta de inicio según el rol (NF02).
 * Provisorio: todos los roles van a cambiar contraseña hasta que existan sus pantallas.
 */
function GetHomeRoute(): string {
    return HOME_ROUTE;
}

/**
 * Vista de inicio de sesión (USU-001).
 * Valida formato y campos vacíos antes de llamar al backend,
 * que vuelve a validar las credenciales.
 */
export function Login() {
    const navigate = useNavigate();
    const { refreshSession } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    /** Revisa que los campos estén completos y el correo tenga formato válido. */
    function ValidateForm(cleanEmail: string): boolean {
        let isValid = true;

        if (cleanEmail === "") {
            setEmailError(GetEmptyFieldMessage("Correo electrónico"));
            isValid = false;
        } else if (!EMAIL_REGEX.test(cleanEmail)) {
            setEmailError(INVALID_EMAIL_MESSAGE);
            isValid = false;
        }

        if (password === "") {
            setPasswordError(GetEmptyFieldMessage("Contraseña"));
            isValid = false;
        }

        return isValid;
    }

    async function HandleSubmit(event: FormEvent) {
        event.preventDefault();

        setEmailError("");
        setPasswordError("");
        setErrorMessage("");

        const cleanEmail = email.trim();

        if (!ValidateForm(cleanEmail)) return;

        setIsLoading(true);

        try {
            // Los nombres de las propiedades coinciden con LoginRequestDto
            await LoginApi({
                email: cleanEmail,
                password
            });

            const sessionLoaded = await refreshSession();

            if (!sessionLoaded) {
            setErrorMessage("No fue posible verificar la sesión. Intenta nuevamente.");
            return;
        }

        ShowLoginSuccessToast();
        navigate(GetHomeRoute());

        } catch (error) {
            setErrorMessage(GetErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="loginPage">
            <main className="loginPage__card">
                {/* Marca: ícono de servicio técnico y nombre */}
                <div className="loginPage__brand">
                    <span className="loginPage__icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor"
                            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                        </svg>
                    </span>
                    <span className="loginPage__name">TecnoFix</span>
                </div>

                <h1 className="loginPage__title">Iniciar sesión</h1>

                <p className="loginPage__subtitle">
                    Ingresa con tu correo electrónico y tu contraseña.
                </p>

                {errorMessage && (
                    <p className="loginPage__error" role="alert">
                        {errorMessage}
                    </p>
                )}

                <form onSubmit={HandleSubmit} className="loginPage__form" noValidate>
                    <div className="loginPage__field">
                        <label className="loginPage__label" htmlFor="email">
                            Correo electrónico
                        </label>

                        <div className={"loginPage__inputWrapper" + (emailError ? " loginPage__inputWrapper--invalid" : "")}>
                            <input
                                id="email"
                                type="email"
                                className="loginPage__input"
                                autoComplete="username"
                                placeholder="usuario@correo.cl"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                aria-invalid={Boolean(emailError)}
                            />

                            <div className="loginPage__actions">
                                <span className="loginPage__help">
                                    <button
                                        type="button"
                                        className="loginPage__helpButton"
                                        aria-describedby="emailHelp"
                                        aria-label="Ayuda: correo electrónico"
                                    >
                                        ?
                                    </button>
                                    <span id="emailHelp" className="loginPage__helpText" role="tooltip">
                                        Es el correo con el que te registraste, por ejemplo usuario@correo.cl.
                                    </span>
                                </span>
                            </div>
                        </div>

                        {emailError && (
                            <p className="loginPage__fieldError" role="alert">
                                {emailError}
                            </p>
                        )}
                    </div>

                    <div className="loginPage__field">
                        <label className="loginPage__label" htmlFor="password">
                            Contraseña
                        </label>

                        <div className={"loginPage__inputWrapper" + (passwordError ? " loginPage__inputWrapper--invalid" : "")}>
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                className="loginPage__input"
                                autoComplete="current-password"
                                placeholder="Ingresa tu contraseña"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                aria-invalid={Boolean(passwordError)}
                            />

                            <div className="loginPage__actions">
                                <button
                                    type="button"
                                    className="loginPage__toggle"
                                    aria-pressed={showPassword}
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? "Ocultar" : "Ver"}
                                </button>

                                <span className="loginPage__help">
                                    <button
                                        type="button"
                                        className="loginPage__helpButton"
                                        aria-describedby="passwordHelp"
                                        aria-label="Ayuda: contraseña"
                                    >
                                        ?
                                    </button>
                                    <span id="passwordHelp" className="loginPage__helpText" role="tooltip">
                                        Si es tu primer ingreso, usa la contraseña temporal que te llegó por correo.
                                    </span>
                                </span>
                            </div>
                        </div>

                        {passwordError && (
                            <p className="loginPage__fieldError" role="alert">
                                {passwordError}
                            </p>
                        )}
                    </div>

                    <button type="submit" className="loginPage__button" disabled={isLoading}>
                        {isLoading ? "Ingresando..." : "Iniciar sesión"}
                    </button>
                </form>

                <p className="loginPage__footer">
                    ¿No tienes cuenta? <Link to={REGISTER_ROUTE}>Regístrate</Link>
                </p>
            </main>
        </div>
    );
}

/** Convierte cualquier error en un mensaje para el usuario. */
function GetErrorMessage(error: unknown): string {
    // Un TypeError significa que no hubo conexión con el servidor
    if (error instanceof Error && !(error instanceof TypeError)) {
        return error.message;
    }

    return CONNECTION_ERROR_MESSAGE;
}