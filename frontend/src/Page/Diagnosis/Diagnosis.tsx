import { useEffect, useState, type FormEvent } from "react";
import {
    GetOrdersForDiagnosis,
    StartOrderDiagnosis,
    RegisterDiagnosisAndBudget
} from "../../Api/Order";
import { ApiError } from "../../Api/Client";
import type { RepairOrderDiagnosisListDto } from "../../Types/OrderType";
import "../ChangePassword/ChangePassword.css";
import "./Diagnosis.css";
import {
    ConfirmAction,
    ShowSuccessToast,
    ShowError
} from "../../Utils/Alert";

type DiagnosisField =
    | "technicalDiagnosis"
    | "laborCost"
    | "partsCost";

type FieldErrors = Partial<Record<DiagnosisField, string>>;

const CONNECTION_ERROR_MESSAGE =
    "No se pudo conectar con el servidor. Intenta nuevamente.";

export function Diagnosis() {
    const [orders, setOrders] = useState<RepairOrderDiagnosisListDto[]>([]);
    const [selectedOrder, setSelectedOrder] =
        useState<RepairOrderDiagnosisListDto | null>(null);

    const [technicalDiagnosis, setTechnicalDiagnosis] = useState("");
    const [laborCost, setLaborCost] = useState("");
    const [partsCost, setPartsCost] = useState("");

    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isStarting, setIsStarting] = useState(false);
    const [startingOrderId, setStartingOrderId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        LoadOrders();
    }, []);

    async function LoadOrders() {
        setIsLoading(true);

        try {
            const response = await GetOrdersForDiagnosis();
            setOrders(response);
        } catch (error) {
            setErrorMessage(GetErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    }

    async function HandleSelectOrder(order: RepairOrderDiagnosisListDto) {
        setErrorMessage(null);
        setSuccessMessage(null);
        setFieldErrors({});

        if (order.status === "Recibida") {
            setIsStarting(true);
            setStartingOrderId(order.id);

            try {
                await StartOrderDiagnosis(order.id);

                const updatedOrder = {
                    ...order,
                    status: "En diagnóstico"
                };

                setOrders((currentOrders) =>
                    currentOrders.map((item) =>
                        item.id === order.id ? updatedOrder : item
                    )
                );

                setSelectedOrder(updatedOrder);
            } catch (error) {
                setErrorMessage(GetErrorMessage(error));
            } finally {
                setIsStarting(false);
                setStartingOrderId(null);
            }
        } else {
            setSelectedOrder(order);
        }

        setTechnicalDiagnosis("");
        setLaborCost("");
        setPartsCost("");
    }

    function ClearFieldError(field: DiagnosisField) {
        setFieldErrors((currentErrors) => {
            const nextErrors = { ...currentErrors };
            delete nextErrors[field];
            return nextErrors;
        });
    }

    function ValidateForm(): FieldErrors {
        const errors: FieldErrors = {};

        if (technicalDiagnosis.trim() === "") {
            errors.technicalDiagnosis =
                "Debe completar el campo del diagnóstico técnico.";
        }

        if (laborCost.trim() === "") {
            errors.laborCost =
                "Debe completar el campo del costo de mano de obra.";
        } else if (
            !Number.isFinite(Number(laborCost)) ||
            Number(laborCost) < 0
        ) {
            errors.laborCost = "El costo ingresado no es válido";
        }

        if (partsCost.trim() === "") {
            errors.partsCost =
                "Debe completar el campo del costo de repuestos.";
        } else if (
            !Number.isFinite(Number(partsCost)) ||
            Number(partsCost) < 0
        ) {
            errors.partsCost = "El costo ingresado no es válido";
        }

        return errors;
    }

    function ResetForm() {
        setSelectedOrder(null);
        setTechnicalDiagnosis("");
        setLaborCost("");
        setPartsCost("");
        setFieldErrors({});
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

    if (!selectedOrder) return;

    const confirmed = await ConfirmAction(
        "¿Deseas confirmar el diagnóstico y presupuesto de esta orden?",
        {
            "Número de orden": selectedOrder.orderNumber,
            "Cliente": selectedOrder.clientName,
            "Equipo": `${selectedOrder.equipmentType} - ${selectedOrder.brandModel}`,
            "Diagnóstico técnico": technicalDiagnosis.trim(),
            "Mano de obra": `$${Number(laborCost).toLocaleString("es-CL")}`,
            "Repuestos": `$${Number(partsCost).toLocaleString("es-CL")}`,
            "Total presupuesto": `$${(Number(laborCost) + Number(partsCost)).toLocaleString("es-CL")}`
        }
    );

    // Si cancela, no se registra la información.
    if (!confirmed) return;

    setIsSubmitting(true);

    try {
        const response = await RegisterDiagnosisAndBudget({
            orderId: selectedOrder.id,
            technicalDiagnosis: technicalDiagnosis.trim(),
            laborCost: Number(laborCost),
            partsCost: Number(partsCost)
        });

        await ShowSuccessToast(response.message);

        ResetForm();
        await LoadOrders();

    } catch (error) {
        if (
            error instanceof ApiError &&
            Object.keys(error.fieldErrors).length > 0
        ) {
            const normalizedErrors: FieldErrors = {};

            Object.entries(error.fieldErrors).forEach(([key, value]) => {
                const normalizedKey = key.toLowerCase();

                if (normalizedKey === "technicaldiagnosis") {
                    normalizedErrors.technicalDiagnosis = value;
                } else if (normalizedKey === "laborcost") {
                    normalizedErrors.laborCost = value;
                } else if (normalizedKey === "partscost") {
                    normalizedErrors.partsCost = value;
                }
            });

            setFieldErrors(normalizedErrors);
        } else {
            await ShowError(GetErrorMessage(error));
        }
    } finally {
        setIsSubmitting(false);
    }
    }


    function InputClass(field: DiagnosisField): string {
        return (
            "formPage__inputContainer" +
            (fieldErrors[field]
                ? " formPage__inputContainer--invalid"
                : "")
        );
    }

    const totalCost =
        laborCost.trim() !== "" &&
        partsCost.trim() !== "" &&
        Number.isFinite(Number(laborCost)) &&
        Number.isFinite(Number(partsCost)) &&
        Number(laborCost) >= 0 &&
        Number(partsCost) >= 0
            ? Number(laborCost) + Number(partsCost)
            : null;

    return (
        <div className="formPage diagnosisPage">
            <main className="formPage__content diagnosisPage__content">
                <h1 className="formPage__title">
                    Diagnóstico y presupuesto
                </h1>

                <p className="formPage__subtitle">
                    Selecciona una orden para registrar su diagnóstico técnico
                    y presupuesto.
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

                <section className="diagnosisPage__orders">
                    <h2 className="diagnosisPage__sectionTitle">
                        Órdenes pendientes de diagnóstico
                    </h2>

                    {isLoading ? (
                        <p>Cargando órdenes...</p>
                    ) : orders.length === 0 ? (
                        <p className="diagnosisPage__empty">
                            No hay órdenes pendientes de diagnóstico.
                        </p>
                    ) : (
                        <div className="diagnosisPage__orderList">
                            {orders.map((order) => (
                                <article
                                    className="diagnosisPage__order"
                                    key={order.id}
                                >
                                    <div className="diagnosisPage__orderInfo">
                                        <h3>Orden #{order.orderNumber}</h3>

                                        <p>
                                            <strong>Cliente:</strong>{" "}
                                            {order.clientName}
                                        </p>

                                        <p>
                                            <strong>Equipo:</strong>{" "}
                                            {order.equipmentType} - {order.brandModel}
                                        </p>

                                        <p>
                                            <strong>Falla reportada:</strong>{" "}
                                            {order.reportedFault}
                                        </p>

                                        <span className="diagnosisPage__status">
                                            {order.status}
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        className="diagnosisPage__selectButton"
                                        onClick={() => HandleSelectOrder(order)}
                                        disabled={isStarting || isSubmitting}
                                    >
                                        {startingOrderId === order.id
                                            ? "Iniciando..."
                                            : order.status === "Recibida"
                                                ? "Iniciar diagnóstico"
                                                : "Continuar diagnóstico"}
                                    </button>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                {selectedOrder && (
                    <section className="diagnosisPage__formSection">
                        <h2 className="diagnosisPage__sectionTitle">
                            Registrar diagnóstico
                        </h2>

                        <p className="diagnosisPage__selectedOrder">
                            Orden #{selectedOrder.orderNumber} —{" "}
                            {selectedOrder.brandModel}
                        </p>

                        <form
                            onSubmit={HandleSubmit}
                            className="formPage__form"
                            noValidate
                        >
                            <div className="formPage__field">
                                <label
                                    className="formPage__label"
                                    htmlFor="technicalDiagnosis"
                                >
                                    Diagnóstico técnico
                                </label>

                                <div className={InputClass("technicalDiagnosis")}>
                                    <textarea
                                        id="technicalDiagnosis"
                                        name="technicalDiagnosis"
                                        className="formPage__input diagnosisPage__textarea"
                                        value={technicalDiagnosis}
                                        onChange={(event) => {
                                            setTechnicalDiagnosis(event.target.value);
                                            ClearFieldError("technicalDiagnosis");
                                        }}
                                        placeholder="Describe el diagnóstico técnico del equipo."
                                        maxLength={2000}
                                        required
                                    />
                                </div>

                                {fieldErrors.technicalDiagnosis && (
                                    <p className="formPage__fieldError" role="alert">
                                        {fieldErrors.technicalDiagnosis}
                                    </p>
                                )}
                            </div>

                            <div className="formPage__field">
                                <label
                                    className="formPage__label"
                                    htmlFor="laborCost"
                                >
                                    Costo de mano de obra ($)
                                </label>

                                <div className={InputClass("laborCost")}>
                                    <input
                                        id="laborCost"
                                        name="laborCost"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        className="formPage__input"
                                        value={laborCost}
                                        onChange={(event) => {
                                            setLaborCost(event.target.value);
                                            ClearFieldError("laborCost");
                                        }}
                                        placeholder="Ingresa el costo de mano de obra"
                                        required
                                    />
                                </div>

                                {fieldErrors.laborCost && (
                                    <p className="formPage__fieldError" role="alert">
                                        {fieldErrors.laborCost}
                                    </p>
                                )}
                            </div>

                            <div className="formPage__field">
                                <label
                                    className="formPage__label"
                                    htmlFor="partsCost"
                                >
                                    Costo de repuestos ($)
                                </label>

                                <div className={InputClass("partsCost")}>
                                    <input
                                        id="partsCost"
                                        name="partsCost"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        className="formPage__input"
                                        value={partsCost}
                                        onChange={(event) => {
                                            setPartsCost(event.target.value);
                                            ClearFieldError("partsCost");
                                        }}
                                        placeholder="Ingresa el costo de repuestos"
                                        required
                                    />
                                </div>

                                {fieldErrors.partsCost && (
                                    <p className="formPage__fieldError" role="alert">
                                        {fieldErrors.partsCost}
                                    </p>
                                )}
                            </div>

                            <div className="diagnosisPage__total">
                                <span>Total del presupuesto</span>
                                <strong>
                                    {totalCost === null
                                        ? "—"
                                        : `$${totalCost.toLocaleString("es-CL", {
                                            minimumFractionDigits: 0,
                                            maximumFractionDigits: 2
                                        })}`}
                                </strong>
                            </div>

                            <button
                                type="submit"
                                className="formPage__button"
                                disabled={isSubmitting}
                            >
                                {isSubmitting
                                    ? "Guardando..."
                                    : "Registrar diagnóstico y presupuesto"}
                            </button>

                            <button
                                type="button"
                                className="diagnosisPage__cancelButton"
                                onClick={ResetForm}
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </button>
                        </form>
                    </section>
                )}
            </main>
        </div>
    );
}

function GetErrorMessage(error: unknown): string {
    if (error instanceof Error && !(error instanceof TypeError)) {
        return error.message;
    }

    return CONNECTION_ERROR_MESSAGE;
}
