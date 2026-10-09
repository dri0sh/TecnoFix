import { useState, type FormEvent } from "react";
import { ChangePassword as ChangePasswordApi } from "../../Api/Auth";
import { useNavigate } from "react-router-dom";
import { ClearSession } from "../../Utils/Auth";
import "./ChangePassword.css";

export function ChangePassword() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    function ValidateForm(): boolean {
        if (currentPassword.trim() === "") {
            setErrorMessage("Debe completar el campo Contraseña actual");
            return false;
        }

        if (newPassword.trim() === "") {
            setErrorMessage("Debe completar el campo Nueva contraseña");
            return false;
        }

        if (confirmNewPassword.trim() === "") {
            setErrorMessage("Debe completar el campo Confirmar nueva contraseña");
            return false;
        }

        if (newPassword !== confirmNewPassword) {
            setErrorMessage("Las contraseñas no coinciden");
            return false;
        }

        return true;
    }

    async function HandleSubmit(event: FormEvent) {
        event.preventDefault();
        setErrorMessage(null);
        setSuccessMessage(null);

        if (!ValidateForm()) {return;}

        setIsLoading(true);

        try {
            const response = await ChangePasswordApi({currentPassword, newPassword, confirmNewPassword});

            if (response.success) {
                setSuccessMessage(`${response.message}. Serás redirigido al inicio de sesión.`);

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
            if (error instanceof Error && !(error instanceof TypeError)) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage("No se pudo conectar con el servidor. Intenta nuevamente.");
            }
        } finally {
            setIsLoading(false);
        }
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
                    <p className="formPage__success" role="alert">
                        {successMessage}
                    </p>
                )}

                <form
                    onSubmit={HandleSubmit}
                    className="formPage__form"
                    noValidate
                >
                    <div className="formPage__field">
                        <label
                            className="formPage__label"
                            htmlFor="currentPassword"
                        >
                            Contraseña actual
                        </label>

                        <input
                            id="currentPassword"
                            type="password"
                            className="formPage__input"
                            value={currentPassword}
                            onChange={(event) =>
                                setCurrentPassword(event.target.value)
                            }
                            required
                        />
                    </div>

                    <div className="formPage__field">
                        <label
                            className="formPage__label"
                            htmlFor="newPassword"
                        >
                            Nueva contraseña
                        </label>

                        <input
                            id="newPassword"
                            type="password"
                            className="formPage__input"
                            value={newPassword}
                            onChange={(event) =>
                                setNewPassword(event.target.value)
                            }
                            required
                        />
                    </div>

                    <div className="formPage__field">
                        <label
                            className="formPage__label"
                            htmlFor="confirmNewPassword"
                        >
                            Confirmar nueva contraseña
                        </label>

                        <input
                            id="confirmNewPassword"
                            type="password"
                            className="formPage__input"
                            value={confirmNewPassword}
                            onChange={(event) =>
                                setConfirmNewPassword(event.target.value)
                            }
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="formPage__button"
                        disabled={isLoading}
                    >
                        {isLoading ? "Cambiando..." : "Cambiar contraseña"}
                    </button>
                </form>
            </main>
        </div>
    );
}