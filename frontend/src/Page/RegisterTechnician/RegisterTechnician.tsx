import { useEffect, useState, type FormEvent } from "react";
import { AddTechnicianSpecialty, GetTechnicianSpecialties, RegisterTechnician as RegisterTechnicianApi } from "../../Api/Auth";
import { ApiError } from "../../Api/Client";
import { AskNewOption, ConfirmAction, ShowSuccessToast } from "../../Utils/Alert";
import "./RegisterTechnician.css";

// Campos del formulario (se usan como clave de los errores)
type TechnicianField = "name" | "email" | "specialty";

// Error de cada campo del formulario
type FieldErrors = Partial<Record<TechnicianField, string>>;

// Formato de correo: texto@dominio.extensión (el mismo que valida el backend)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Solo letras (incluye tildes, ñ y ü) y espacios (el mismo que valida el backend)
const PERSON_NAME_REGEX = /^[\p{L} ]+$/u;

const CONNECTION_ERROR_MESSAGE = "No se pudo conectar con el servidor. Intenta nuevamente.";

/**
 * Vista para que el administrador registre un nuevo técnico (USU-003).
 * Solicita nombre y apellidos, correo electrónico y especialidad.
 * El frontend valida para avisar antes, pero el backend vuelve a validar todo.
 */
export function RegisterTechnician() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [specialty, setSpecialty] = useState("");
    const [specialties, setSpecialties] = useState<string[]>([]);

    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Al abrir la vista se cargan las especialidades desde el backend
    useEffect(() => {
        GetTechnicianSpecialties()
            .then(setSpecialties)
            .catch((error: unknown) => setErrorMessage(GetErrorMessage(error)));
    }, []);

    /**
     * Revisa todos los campos y devuelve el error de cada uno.
     * Se revisan todos a la vez para marcar todos los campos con problemas.
     */
    function ValidateForm(cleanName: string, cleanEmail: string): FieldErrors {
        const errors: FieldErrors = {};

        if (cleanName === "") {
            errors.name = "Debe completar el campo Nombre y apellidos";
        } else if (!PERSON_NAME_REGEX.test(cleanName)) {
            errors.name = "El nombre solo puede contener letras y espacios";
        }

        if (cleanEmail === "") {
            errors.email = "Debe completar el campo Correo electrónico";
        } else if (!EMAIL_REGEX.test(cleanEmail)) {
            errors.email = "El correo electrónico no tiene un formato válido";
        }

        if (specialty === "") {
            errors.specialty = "Debe completar el campo Especialidad";
        }

        return errors;
    }

    async function HandleSubmit(event: FormEvent) {
        event.preventDefault();

        setFieldErrors({});
        setErrorMessage(null);

        const cleanName = name.trim();
        const cleanEmail = email.trim();

        const errors = ValidateForm(cleanName, cleanEmail);

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        // Confirmación antes de registrar (NF01)
        const confirmed = await ConfirmAction("Se registrará el técnico con los siguientes datos:", {
            "Nombre y apellidos": cleanName,
            "Correo electrónico": cleanEmail,
            "Especialidad": specialty
        });

        if (!confirmed) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await RegisterTechnicianApi({
                name: cleanName,
                email: cleanEmail,
                specialty
            });

            void ShowSuccessToast(response.message);

            setName("");
            setEmail("");
            setSpecialty("");
        } catch (error) {
            // Si el backend devolvió errores por campo, se muestran bajo cada campo
            if (error instanceof ApiError && Object.keys(error.fieldErrors).length > 0) {
                setFieldErrors(error.fieldErrors as FieldErrors);
            } else {
                setErrorMessage(GetErrorMessage(error));
            }
        } finally {
            setIsLoading(false);
        }
    }

    /** Agrega una especialidad nueva y la deja seleccionada (USU-003). */
    async function HandleAddSpecialty() {
        const newSpecialty = await AskNewOption(
            "Agregar especialidad",
            "Nombre de la nueva especialidad",
            async (value) => {
                if (value === "") {
                    return "Debe completar el campo Especialidad";
                }

                try {
                    await AddTechnicianSpecialty(value);
                    return null;
                } catch (error) {
                    return GetErrorMessage(error);
                }
            }
        );

        if (newSpecialty === null) {
            return;
        }

        setSpecialties((current) => [...current, newSpecialty]);
        setSpecialty(newSpecialty);
        setFieldErrors((current) => ({ ...current, specialty: undefined }));

        void ShowSuccessToast("Especialidad registrada correctamente");
    }

    /** Clase del campo: se marca en rojo si tiene error. */
    function InputClass(field: TechnicianField): string {
        return "formPage__input" + (fieldErrors[field] ? " formPage__input--invalid" : "");
    }

    return (
        <div className="formPage">
            <main className="formPage__content">
                <h1 className="formPage__title">
                    Registrar técnico
                </h1>

                <p className="formPage__subtitle">
                    Ingresa los datos del nuevo técnico. Su contraseña temporal se enviará a su correo electrónico.
                </p>

                {errorMessage && (
                    <p className="formPage__error" role="alert">
                        {errorMessage}
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
                            Nombre y apellidos
                        </label>

                        <input
                            id="name"
                            type="text"
                            className={InputClass("name")}
                            value={name}
                            onChange={(event) =>
                                setName(event.target.value)
                            }
                            placeholder="Juan Pérez Soto"
                            aria-invalid={Boolean(fieldErrors.name)}
                        />

                        {fieldErrors.name && (
                            <p className="formPage__fieldError" role="alert">
                                {fieldErrors.name}
                            </p>
                        )}
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
                            className={InputClass("email")}
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            placeholder="tecnico@correo.cl"
                            aria-invalid={Boolean(fieldErrors.email)}
                        />

                        {fieldErrors.email && (
                            <p className="formPage__fieldError" role="alert">
                                {fieldErrors.email}
                            </p>
                        )}
                    </div>

                    <div className="formPage__field">
                        <label
                            className="formPage__label"
                            htmlFor="specialty"
                        >
                            Especialidad
                        </label>

                        <div className="formPage__selectRow">
                            <select
                                id="specialty"
                                className={InputClass("specialty") + " formPage__select"}
                                value={specialty}
                                onChange={(event) =>
                                    setSpecialty(event.target.value)
                                }
                                aria-invalid={Boolean(fieldErrors.specialty)}
                            >
                                <option value="">Selecciona una especialidad</option>
                                {specialties.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>

                            <button
                                type="button"
                                className="formPage__addButton"
                                onClick={HandleAddSpecialty}
                                title="Agregar una especialidad que no está en la lista"
                            >
                                + Agregar
                            </button>
                        </div>

                        {fieldErrors.specialty && (
                            <p className="formPage__fieldError" role="alert">
                                {fieldErrors.specialty}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="formPage__button"
                        disabled={isLoading}
                    >
                        {isLoading
                            ? "Registrando..."
                            : "Registrar técnico"}
                    </button>
                </form>
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