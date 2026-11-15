
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { RegisterClient as RegisterClientApi } from "../../Api/Auth";
import "./RegisterClient.css";
import { ApiError } from "../../Api/Client";
import {
    ConfirmAction,
    ShowSuccessToast
} from "../../Utils/Alert";
import { HelpTooltip } from "../../Components/HelpTooltip";

export function RegisterClient() {
    const [name, setName] = useState("");
    const [rut, setRut] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const ValidateRut = (rut: string): boolean => {
    const cleanRut = rut.replace(/\./g, "").replace(/-/g, "").trim();

    // Debe tener entre 7 y 8 números y un dígito verificador.
    if (!/^\d{7,8}[0-9kK]$/.test(cleanRut)) {
        return false;
    }

    const body = cleanRut.slice(0, -1);
    const verifier = cleanRut.slice(-1).toUpperCase();

    let sum = 0;
    let multiplier = 2;

    for (let i = body.length - 1; i >= 0; i--) {
        sum += Number(body[i]) * multiplier;
        multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }

    const result = 11 - (sum % 11);
    const expectedVerifier =
        result === 11 ? "0" : result === 10 ? "K" : String(result);

    return verifier === expectedVerifier;
};

    function ValidateForm(): boolean {
        const errors: Record<string, string> = {};

        if (name.trim() === "") {
            errors["name"] = "Debe completar el campo Nombre";
        } else if (!/^[\p{L}\s]+$/u.test(name.trim())) {
            errors["name"] = "El nombre y apellidos solo pueden contener letras y espacios.";
        }

        if (rut.trim() === "") {
            errors["rut"] = "Debe completar el campo RUT";
        } else if (!ValidateRut(rut)) {
            errors["rut"] = "El RUT ingresado no es válido.";
        }


        if (email.trim() === "") {
             errors["email"] = "Debe completar el campo Correo electrónico";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            errors["email"] = "El correo electrónico no tiene un formato válido";
        }

        if (phoneNumber.trim() === "") {
            errors["phoneNumber"] = "Debe completar el campo Teléfono";
        } else if (!/^\d{9}$/.test(phoneNumber.trim())) {
            errors["phoneNumber"] = "El teléfono debe contener exactamente 9 números.";
        }

        setFieldErrors(errors);

        return Object.keys(errors).length === 0;
    }

    async function HandleSubmit(event: FormEvent) {
    event.preventDefault();

    setErrorMessage(null);
    setSuccessMessage(null);
    setFieldErrors({});

    if (!ValidateForm()) {
        return;
    }

    // Primera confirmación: mostrar los datos antes de registrar.
    const confirmed = await ConfirmAction(
        "¿Deseas registrar este cliente?",
        {
            "Nombre completo": name,
            "RUT": rut,
            "Correo electrónico": email,
            "Teléfono": phoneNumber
        }
    );

    // Si el usuario cancela, no se registra.
    if (!confirmed) {
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

        // Segunda confirmación: informar que el registro fue exitoso.
        await ShowSuccessToast(response.message);

        setName("");
        setRut("");
        setEmail("");
        setPhoneNumber("");

    } catch (error) {
        if (error instanceof ApiError) {
            const backendErrors = error.fieldErrors;

            const mappedErrors: Record<string, string> = {
                name: backendErrors.Name ?? backendErrors.name ?? "",
                rut: backendErrors.Rut ?? backendErrors.rut ?? "",
                email: backendErrors.Email ?? backendErrors.Correo ?? backendErrors.email ?? "",
                phoneNumber: backendErrors.PhoneNumber ?? backendErrors.Telefono ?? backendErrors.phoneNumber ?? ""
            };

            const filteredErrors = Object.fromEntries(
                Object.entries(mappedErrors).filter(([, value]) => value !== "")
            );

            setFieldErrors(filteredErrors);

            if (Object.keys(filteredErrors).length === 0) {
            setFieldErrors({
             email: error.message
            });
        }   
        } else {
            setFieldErrors({
            email: "No se pudo conectar con el servidor. Intenta nuevamente."
            });
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

                    
                {/* Nombre */}
                <div className="formPage__field">
                    <label className="formPage__label" htmlFor="name">
                        Nombre y apellidos
                    </label>

                    <div className="formPage__control">
                        <input
                            id="name"
                            type="text"
                            className={`formPage__input ${fieldErrors.name ? "formPage__input--invalid" : ""}`}
                            value={name}
                            onChange={(event) => {
                                setName(event.target.value);
                                setFieldErrors(prev => ({ ...prev, name: "" }));
                            }}
                            placeholder="Juan Pérez Soto"
                            required
                        />
                    </div>

                    {fieldErrors.name && (
                        <p className="formPage__fieldError" role="alert">
                            {fieldErrors.name}
                        </p>
                    )}
                </div>

                {/* RUT */}
                <div className="formPage__field">
                    <label className="formPage__label" htmlFor="rut">
                        RUT 
                     </label>

                    <div className="formPage__control">
                        <input
                            id="rut"
                            type="text"
                            className={`formPage__input ${fieldErrors.rut ? "formPage__input--invalid" : ""}`}
                            value={rut}
                            onChange={(event) => {
                                setRut(event.target.value);
                                setFieldErrors(prev => ({ ...prev, rut: "" }));
                            }}
                            placeholder="12345678K"
                            required
                        />

                        <HelpTooltip
                            label="RUT"
                            text="Ingresa tu RUT sin puntos ni guion."
                        />
                    </div>

                    {fieldErrors.rut && (
                        <p className="formPage__fieldError" role="alert">
                            {fieldErrors.rut}
                        </p>
                    )}
                </div>

                {/* Correo electrónico */}
                <div className="formPage__field">
                    <label className="formPage__label" htmlFor="email">
                        Correo electrónico
                    </label>

                    <div className="formPage__control">
                        <input
                            id="email"
                            type="email"
                            className={`formPage__input ${fieldErrors.email ? "formPage__input--invalid" : ""}`}
                            value={email}
                            onChange={(event) => {
                                setEmail(event.target.value);
                                setFieldErrors(prev => ({ ...prev, email: "" }));
                            }}
                            placeholder="correo@ejemplo.cl"
                            required
                        />

                        <HelpTooltip
                            label="correo electrónico"
                            text="Ingresa un correo válido. A esta dirección se enviará la contraseña temporal."
                        />
                    </div>

                    {fieldErrors.email && (
                        <p className="formPage__fieldError" role="alert">
                            {fieldErrors.email}
                        </p>
                    )}
                </div>

                {/* Teléfono */}
                <div className="formPage__field">
                    <label className="formPage__label" htmlFor="phoneNumber">
                        Teléfono
                    </label>

                    <div className="formPage__control">
                        <input
                            id="phoneNumber"
                            type="tel"
                            className={`formPage__input ${fieldErrors.phoneNumber ? "formPage__input--invalid" : ""}`}
                            value={phoneNumber}
                            onChange={(event) => {
                                setPhoneNumber(event.target.value);
                                setFieldErrors(prev => ({ ...prev, phoneNumber: "" }));
                            }}
                            placeholder="+56 9 1234 5678"
                            required
                        />

                        <HelpTooltip
                            label="teléfono"
                            text="Ingresa un número de teléfono de contacto."
                        />
                    </div>

                    {fieldErrors.phoneNumber && (
                        <p className="formPage__fieldError" role="alert">
                            {fieldErrors.phoneNumber}
                        </p>
                    )}
                </div>


                    <button
                        type="submit"
                        className="formPage__button"
                        disabled={isLoading}
                    >
                        {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
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
