import { useEffect, useState, type FormEvent } from "react";
import { GetRepairOrderFormOptions, RegisterRepairOrder } from "../../Api/Order";
import { ApiError } from "../../Api/Client";
import type { SelectOptionDto } from "../../Types/OrderType";
import "../RegisterTechnician/RegisterTechnician.css";
import "./RegisterOrder.css";

// Campos del formulario (se usan como clave de los errores)
type OrderField =
    | "clientId"
    | "equipmentTypeId"
    | "brandModel"
    | "serialNumber"
    | "reportedFault"
    | "accessories";

// Error de cada campo del formulario
type FieldErrors = Partial<Record<OrderField, string>>;

const CONNECTION_ERROR_MESSAGE = "No se pudo conectar con el servidor. Intenta nuevamente.";

/**
 * Vista para registrar una orden de reparación al recibir un equipo (ORD-001).
 * La usan el técnico y el administrador.
 */
export function RegisterOrder() {
    // Valores del formulario. Las listas guardan el id como texto ("" = sin seleccionar).
    const [clientId, setClientId] = useState("");
    const [equipmentTypeId, setEquipmentTypeId] = useState("");
    const [brandModel, setBrandModel] = useState("");
    const [serialNumber, setSerialNumber] = useState("");
    const [reportedFault, setReportedFault] = useState("");
    const [accessories, setAccessories] = useState("");

    // Listas que entrega el backend
    const [clients, setClients] = useState<SelectOptionDto[]>([]);
    const [equipmentTypes, setEquipmentTypes] = useState<SelectOptionDto[]>([]);

    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Al abrir la vista se cargan los clientes y los tipos de equipo habilitados
    useEffect(() => {
        GetRepairOrderFormOptions()
            .then((options) => {
                setClients(options.clients);
                setEquipmentTypes(options.equipmentTypes);
            })
            .catch((error: unknown) => setErrorMessage(GetErrorMessage(error)));
    }, []);

    /** Revisa los campos obligatorios de la tarjeta ORD-001. */
    function ValidateForm(): FieldErrors {
        const errors: FieldErrors = {};

        if (clientId === "") {
            errors.clientId = "Debe completar el campo Cliente";
        }

        if (equipmentTypeId === "") {
            errors.equipmentTypeId = "Debe completar el campo Tipo de equipo";
        }

        if (brandModel.trim() === "") {
            errors.brandModel = "Debe completar el campo Marca y modelo";
        }

        if (reportedFault.trim() === "") {
            errors.reportedFault = "Debe completar el campo Descripción de la falla reportada";
        }

        return errors;
    }

    function ResetForm() {
        setClientId("");
        setEquipmentTypeId("");
        setBrandModel("");
        setSerialNumber("");
        setReportedFault("");
        setAccessories("");
    }

    async function HandleSubmit(event: FormEvent) {
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
            const response = await RegisterRepairOrder({
                clientId: Number(clientId),
                equipmentTypeId: Number(equipmentTypeId),
                brandModel: brandModel.trim(),
                serialNumber: serialNumber.trim() || null,
                reportedFault: reportedFault.trim(),
                accessories: accessories.trim() || null
            });

            setSuccessMessage(response.message);
            ResetForm();
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

    /** Clase del campo: se marca en rojo si tiene error. */
    function InputClass(field: OrderField, extraClass = ""): string {
        return ["formPage__input", fieldErrors[field] ? "formPage__input--invalid" : "", extraClass]
            .filter(Boolean)
            .join(" ");
    }

    /** Mensaje de error bajo un campo. No se muestra si el campo no tiene error. */
    function RenderFieldError(field: OrderField) {
        if (!fieldErrors[field]) return null;

        return (
            <p className="formPage__fieldError" role="alert">
                {fieldErrors[field]}
            </p>
        );
    }

    return (
        <div className="formPage">
            <main className="formPage__content">
                <h1 className="formPage__title">
                    Registrar orden
                </h1>

                <p className="formPage__subtitle">
                    Ingresa los datos del equipo recibido.
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
                    <div className="formPage__field">
                        <label className="formPage__label" htmlFor="clientId">
                            Cliente
                        </label>

                        <select
                            id="clientId"
                            className={InputClass("clientId", "formPage__select")}
                            value={clientId}
                            onChange={(event) => setClientId(event.target.value)}
                            aria-invalid={Boolean(fieldErrors.clientId)}
                        >
                            <option value="">Selecciona un cliente</option>
                            {clients.map((client) => (
                                <option key={client.id} value={client.id}>
                                    {client.label}
                                </option>
                            ))}
                        </select>

                        {RenderFieldError("clientId")}
                    </div>

                    <div className="formPage__field">
                        <label className="formPage__label" htmlFor="equipmentTypeId">
                            Tipo de equipo
                        </label>

                        <select
                            id="equipmentTypeId"
                            className={InputClass("equipmentTypeId", "formPage__select")}
                            value={equipmentTypeId}
                            onChange={(event) => setEquipmentTypeId(event.target.value)}
                            aria-invalid={Boolean(fieldErrors.equipmentTypeId)}
                        >
                            <option value="">Selecciona un tipo de equipo</option>
                            {equipmentTypes.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {type.label}
                                </option>
                            ))}
                        </select>

                        {RenderFieldError("equipmentTypeId")}
                    </div>

                    <div className="formPage__field">
                        <label className="formPage__label" htmlFor="brandModel">
                            Marca y modelo
                        </label>

                        <input
                            id="brandModel"
                            type="text"
                            className={InputClass("brandModel")}
                            value={brandModel}
                            onChange={(event) => setBrandModel(event.target.value)}
                            placeholder="Lenovo IdeaPad 3"
                            maxLength={100}
                            aria-invalid={Boolean(fieldErrors.brandModel)}
                        />

                        {RenderFieldError("brandModel")}
                    </div>

                    <div className="formPage__field">
                        <label className="formPage__label" htmlFor="serialNumber">
                            Número de serie (opcional)
                        </label>

                        <input
                            id="serialNumber"
                            type="text"
                            className={InputClass("serialNumber")}
                            value={serialNumber}
                            onChange={(event) => setSerialNumber(event.target.value)}
                            placeholder="PF3AB12C"
                            maxLength={60}
                            aria-invalid={Boolean(fieldErrors.serialNumber)}
                        />

                        {RenderFieldError("serialNumber")}
                    </div>

                    <div className="formPage__field">
                        <label className="formPage__label" htmlFor="reportedFault">
                            Descripción de la falla reportada
                        </label>

                        <textarea
                            id="reportedFault"
                            className={InputClass("reportedFault", "formPage__textarea")}
                            value={reportedFault}
                            onChange={(event) => setReportedFault(event.target.value)}
                            placeholder="No enciende después de una caída."
                            maxLength={1000}
                            rows={4}
                            aria-invalid={Boolean(fieldErrors.reportedFault)}
                        />

                        {RenderFieldError("reportedFault")}
                    </div>

                    <div className="formPage__field">
                        <label className="formPage__label" htmlFor="accessories">
                            Accesorios entregados (opcional)
                        </label>

                        <input
                            id="accessories"
                            type="text"
                            className={InputClass("accessories")}
                            value={accessories}
                            onChange={(event) => setAccessories(event.target.value)}
                            placeholder="Cargador, funda"
                            maxLength={250}
                            aria-invalid={Boolean(fieldErrors.accessories)}
                        />

                        {RenderFieldError("accessories")}
                    </div>

                    <button
                        type="submit"
                        className="formPage__button"
                        disabled={isLoading}
                    >
                        {isLoading ? "Registrando..." : "Registrar orden"}
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