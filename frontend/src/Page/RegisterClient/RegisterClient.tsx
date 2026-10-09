import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { RegisterClient as RegisterClientApi } from "../../Api/Auth";
import "./RegisterClient.css";

export function RegisterClient() {
    const [name, setName] = useState("");
    const [rut, setRut] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    function ValidateForm(): boolean {
        if (name.trim() === "") {
            setErrorMessage("Debe completar el campo Nombre");
            return false;
        }

        if (rut.trim() === "") {
            setErrorMessage("Debe completar el campo RUT");
            return false;
        }

        if (email.trim() === "") {
            setErrorMessage(
                "Debe completar el campo Correo electrónico"
            );
            return false;
        }

        if (phoneNumber.trim() === "") {
            setErrorMessage("Debe completar el campo Teléfono");
            return false;
        }

        return true;
    }

    async function HandleSubmit(event: FormEvent) {
        event.preventDefault();

        setErrorMessage(null);
        setSuccessMessage(null);

        if (!ValidateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await RegisterClientApi({
                name,
                email,
                rut,
                phoneNumber
            });

            setSuccessMessage(response.message);

            setName("");
            setRut("");
            setEmail("");
            setPhoneNumber("");
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
                    Crear Cuenta
                </h1>

                <p className="formPage__subtitle">
                    Regístrate como cliente de TecnoFix
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
                            htmlFor="name"
                        >
                            Nombre completo
                        </label>

                        <input
                            id="name"
                            type="text"
                            className="formPage__input"
                            value={name}
                            onChange={(event) =>
                                setName(event.target.value)
                            }
                            placeholder="Ingresa tu nombre."
                            required
                        />
                    </div>

                    <div className="formPage__field">
                        <label
                            className="formPage__label"
                            htmlFor="rut"
                        >
                            RUT (sin puntos ni guion)
                        </label>

                        <input
                            id="rut"
                            type="text"
                            className="formPage__input"
                            value={rut}
                            onChange={(event) =>
                                setRut(event.target.value)
                            }
                            placeholder="12345678K"
                            required
                        />
                    </div>

                    <div className="formPage__field">
                        <label
                            className="formPage__label"
                            htmlFor="email"
                        >
                            Correo electrónico
                        </label>

                        <input
                            id="email"
                            type="email"
                            className="formPage__input"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            placeholder="correo@ejemplo.cl"
                            required
                        />
                    </div>

                    <div className="formPage__field">
                        <label
                            className="formPage__label"
                            htmlFor="phoneNumber"
                        >
                            Teléfono
                        </label>

                        <input
                            id="phoneNumber"
                            type="tel"
                            className="formPage__input"
                            value={phoneNumber}
                            onChange={(event) =>
                                setPhoneNumber(event.target.value)
                            }
                            placeholder="+56 9 1234 5678"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="formPage__button"
                        disabled={isLoading}
                    >
                        {isLoading
                            ? "Creando cuenta..."
                            : "Crear Cuenta"}
                    </button>
                </form>

                <p className="formFooter">
                    ¿Ya tienes una cuenta?{" "}
                    <Link to="/login">
                        Iniciar Sesión
                    </Link>
                </p>
            </main>
        </div>
    );
}