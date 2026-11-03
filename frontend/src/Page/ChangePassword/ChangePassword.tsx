import { useState, type FormEvent } from "react";
import { ChangePassword as ChangePasswordApi } from "../../Api/Auth";
import { ApiError } from "../../Api/Client";
import { useNavigate } from "react-router-dom";
import { ClearSession } from "../../Utils/Auth";
import "./ChangePassword.css";

// Campos del formulario (se usan como clave de los errores)
type PasswordField =
    | "currentPassword"
    | "newPassword"
    | "confirmNewPassword";

// Error de cada campo del formulario
type FieldErrors = Partial<Record<PasswordField, string>>;

const CONNECTION_ERROR_MESSAGE = "No se pudo conectar con el servidor. Intenta nuevamente.";

export function ChangePassword() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");

    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmNewPassword, setShowConfirmNewPassword] =
        useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    /**
     * Revisa todos los campos y devuelve el error correspondiente a cada uno.
     */
    function ValidateForm(): FieldErrors {
        const errors: FieldErrors = {};

        if (currentPassword === "") {
            errors.currentPassword = "Debe completar el campo Contraseña actual";
        }

        if (newPassword === "") {
            errors.newPassword = "Debe completar el campo Nueva contraseña";
        } else if (
            newPassword.length < 8 || !/\p{L}/u.test(newPassword) || !/[0-9]/.test(newPassword)
        ) {
            errors.newPassword = "La contraseña debe tener al menos 8 caracteres, una letra y un número";
        }

        if (confirmNewPassword === "") {
            errors.confirmNewPassword = "Debe completar el campo Confirmar nueva contraseña";
        } else if (newPassword !== confirmNewPassword) {
            errors.confirmNewPassword = "Las contraseñas ingresadas no coinciden";
        }

        return errors;
    }

    /**
     * Elimina el error del campo mientras el usuario vuelve a escribir.
     */
    function ClearFieldError(field: PasswordField): void {
        setFieldErrors((currentErrors) => {
            const nextErrors = { ...currentErrors };
            delete nextErrors[field];
            return nextErrors;
        });

        setErrorMessage(null);
    }

    async function HandleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setFieldErrors({});
        setErrorMessage(null);
        setSuccessMessage(null);

        const errors = ValidateForm();

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setIsLoading(true);

        try {
            const response = await ChangePasswordApi({currentPassword, newPassword, confirmNewPassword});

            if (response.success) { setSuccessMessage(`${response.message}. Serás redirigido al inicio de sesión.`);

                setCurrentPassword("");
                setNewPassword("");
                setConfirmNewPassword("");

                setTimeout(() => {
                    ClearSession();
                    navigate("/login", { replace: true });
                }, 2500);
            } else {
                setErrorMessage(response.message);
            }
        } catch (error) {
            // Si el backend devuelve errores por campo,
            // se muestran bajo cada campo.
            if (
                error instanceof ApiError &&
                Object.keys(error.fieldErrors).length > 0
            ) {
                setFieldErrors(error.fieldErrors as FieldErrors);
            } else if (
                error instanceof Error &&
                !(error instanceof TypeError)
            ) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage(CONNECTION_ERROR_MESSAGE);
            }
        } finally {
            setIsLoading(false);
        }
    }

    /** Clase del campo: se marca en rojo si tiene error. */
    function InputClass(field: PasswordField): string {
        return (
            "formPage__inputContainer" +
            (fieldErrors[field]
                ? " formPage__inputContainer--invalid"
                : "")
        );
    }

    return (
        <div className="formPage">
            <main className="formPage__content">
                <h1 className="formPage__title">
                    Cambiar contraseña
                </h1>

                <p className="formPage__subtitle">
                    Actualiza tu contraseña de acceso.
                </p>

                {errorMessage && (
                    <p className="formPage__error" role="alert">
                        {errorMessage}
                    </p>
                )}

                {successMessage && (
                    <p className="formPage__success" role="status">
                        {successMessage}
                    </p>
                )}

                <form
                    onSubmit={HandleSubmit}
                    className="formPage__form"
                    noValidate
                >
                    {/* Contraseña actual */}
                    <div className="formPage__field">
                        <label
                            className="formPage__label"
                            htmlFor="currentPassword"
                        >
                            Contraseña actual
                        </label>

                        <div className={InputClass("currentPassword")}>
                            <input
                                id="currentPassword"
                                name="currentPassword"
                                type={
                                    showCurrentPassword
                                        ? "text"
                                        : "password"
                                }
                                className="formPage__input"
                                autoComplete="current-password"
                                value={currentPassword}
                                onChange={(event) => {
                                    setCurrentPassword(event.target.value);
                                    ClearFieldError("currentPassword");
                                }}
                                aria-invalid={Boolean(
                                    fieldErrors.currentPassword
                                )}
                                aria-describedby={
                                    fieldErrors.currentPassword
                                        ? "currentPasswordHelp currentPasswordError"
                                        : "currentPasswordHelp"
                                }
                                required
                            />

                            <div className="formPage__fieldActions">
                                <button
                                    type="button"
                                    className="formPage__showPassword"
                                    aria-pressed={showCurrentPassword}
                                    onClick={() =>
                                        setShowCurrentPassword(
                                            !showCurrentPassword
                                        )
                                    }
                                >
                                    {showCurrentPassword
                                        ? "Ocultar"
                                        : "Ver"}
                                </button>

                                <span className="formPage__help">
                                    <button
                                        type="button"
                                        className="formPage__helpButton"
                                        aria-describedby="currentPasswordHelp"
                                        aria-label="Ayuda: contraseña actual"
                                    >
                                        ?
                                    </button>

                                    <span
                                        id="currentPasswordHelp"
                                        className="formPage__helpText"
                                        role="tooltip"
                                    >
                                        Ingresa tu contraseña actual. Si es tu
                                        primer ingreso, utiliza la contraseña
                                        temporal que recibiste por correo.
                                    </span>
                                </span>
                            </div>
                        </div>

                        {fieldErrors.currentPassword && (
                            <p
                                id="currentPasswordError"
                                className="formPage__fieldError"
                                role="alert"
                            >
                                {fieldErrors.currentPassword}
                            </p>
                        )}
                    </div>

                    {/* Nueva contraseña */}
                    <div className="formPage__field">
                        <label
                            className="formPage__label"
                            htmlFor="newPassword"
                        >
                            Nueva contraseña
                        </label>

                        <div className={InputClass("newPassword")}>
                            <input
                                id="newPassword"
                                name="newPassword"
                                type={
                                    showNewPassword
                                        ? "text"
                                        : "password"
                                }
                                className="formPage__input"
                                autoComplete="new-password"
                                value={newPassword}
                                onChange={(event) => {
                                    setNewPassword(event.target.value);
                                    ClearFieldError("newPassword");
                                }}
                                aria-invalid={Boolean(
                                    fieldErrors.newPassword
                                )}
                                aria-describedby={
                                    fieldErrors.newPassword
                                        ? "newPasswordHelp newPasswordError"
                                        : "newPasswordHelp"
                                }
                                required
                            />

                            <div className="formPage__fieldActions">
                                <button
                                    type="button"
                                    className="formPage__showPassword"
                                    aria-pressed={showNewPassword}
                                    onClick={() =>
                                        setShowNewPassword(
                                            !showNewPassword
                                        )
                                    }
                                >
                                    {showNewPassword ? "Ocultar" : "Ver"}
                                </button>

                                <span className="formPage__help">
                                    <button
                                        type="button"
                                        className="formPage__helpButton"
                                        aria-describedby="newPasswordHelp"
                                        aria-label="Ayuda: nueva contraseña"
                                    >
                                        ?
                                    </button>

                                    <span
                                        id="newPasswordHelp"
                                        className="formPage__helpText"
                                        role="tooltip"
                                    >
                                        Debe tener al menos 8 caracteres, una
                                        letra y un número.
                                    </span>
                                </span>
                            </div>
                        </div>

                        {fieldErrors.newPassword && (
                            <p
                                id="newPasswordError"
                                className="formPage__fieldError"
                                role="alert"
                            >
                                {fieldErrors.newPassword}
                            </p>
                        )}
                    </div>

                    {/* Confirmar nueva contraseña */}
                    <div className="formPage__field">
                        <label
                            className="formPage__label"
                            htmlFor="confirmNewPassword"
                        >
                            Confirmar nueva contraseña
                        </label>

                        <div className={InputClass("confirmNewPassword")}>
                            <input
                                id="confirmNewPassword"
                                name="confirmNewPassword"
                                type={
                                    showConfirmNewPassword
                                        ? "text"
                                        : "password"
                                }
                                className="formPage__input"
                                autoComplete="new-password"
                                value={confirmNewPassword}
                                onChange={(event) => {
                                    setConfirmNewPassword(
                                        event.target.value
                                    );
                                    ClearFieldError(
                                        "confirmNewPassword"
                                    );
                                }}
                                aria-invalid={Boolean(
                                    fieldErrors.confirmNewPassword
                                )}
                                aria-describedby={
                                    fieldErrors.confirmNewPassword
                                        ? "confirmNewPasswordHelp confirmNewPasswordError"
                                        : "confirmNewPasswordHelp"
                                }
                                required
                            />

                            <div className="formPage__fieldActions">
                                <button
                                    type="button"
                                    className="formPage__showPassword"
                                    aria-pressed={showConfirmNewPassword}
                                    onClick={() =>
                                        setShowConfirmNewPassword(
                                            !showConfirmNewPassword
                                        )
                                    }
                                >
                                    {showConfirmNewPassword
                                        ? "Ocultar"
                                        : "Ver"}
                                </button>

                                <span className="formPage__help">
                                    <button
                                        type="button"
                                        className="formPage__helpButton"
                                        aria-describedby="confirmNewPasswordHelp"
                                        aria-label="Ayuda: confirmar nueva contraseña"
                                    >
                                        ?
                                    </button>

                                    <span
                                        id="confirmNewPasswordHelp"
                                        className="formPage__helpText"
                                        role="tooltip"
                                    >
                                        Repite exactamente la nueva contraseña
                                        para confirmar que fue ingresada
                                        correctamente.
                                    </span>
                                </span>
                            </div>
                        </div>

                        {fieldErrors.confirmNewPassword && (
                            <p
                                id="confirmNewPasswordError"
                                className="formPage__fieldError"
                                role="alert"
                            >
                                {fieldErrors.confirmNewPassword}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="formPage__button"
                        disabled={isLoading}
                    >
                        {isLoading
                            ? "Cambiando..."
                            : "Cambiar contraseña"}
                    </button>
                </form>
            </main>
        </div>
    );
}