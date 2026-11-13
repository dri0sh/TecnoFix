import { useEffect, useState } from "react";
import { LuCheck, LuClock, LuHistory, LuInfo, LuLaptop, LuReceipt } from "react-icons/lu";
import { GetClientOrders, GetOrderTracking } from "../../Api/Order";
import type {
    OrderStatusCode,
    OrderTrackingDto,
    OrderTrackingListItemDto,
    OrderTrackingLogDto
} from "../../Types/OrderType";
import "./OrderTracking.css";

const CONNECTION_ERROR_MESSAGE = "No se pudo conectar con el servidor. Intenta nuevamente.";

// Tamaño en píxeles de los íconos de la vista
const ICON_SIZE = 20;

// Pasos de la barra de avance, en el orden de la ERS
const STATUS_STEPS: OrderStatusCode[] = [
    "Received",
    "InDiagnosis",
    "Budgeted",
    "InRepair",
    "ReadyForPickup",
    "Delivered"
];

// Una orden rechazada queda detenida en el paso de «Presupuestada»
const REJECTED_STEP_INDEX = STATUS_STEPS.indexOf("Budgeted");

// Mensaje informativo para el cliente según el estado de la orden
const STATUS_MESSAGES: Record<OrderStatusCode, { title: string; description: string }> = {
    Received: {
        title: "Tu equipo fue recibido",
        description: "Pronto un técnico comenzará a revisarlo."
    },
    InDiagnosis: {
        title: "Tu equipo está siendo revisado",
        description: "El técnico está realizando el diagnóstico de la falla."
    },
    Budgeted: {
        title: "Tu presupuesto está listo",
        description: "Revisa el presupuesto de tu equipo en esta página."
    },
    InRepair: {
        title: "Tu equipo está en reparación",
        description: "El técnico está trabajando en la reparación."
    },
    ReadyForPickup: {
        title: "Tu equipo está listo para retiro",
        description: "Puedes retirarlo en TecnoFix."
    },
    Delivered: {
        title: "Tu equipo fue entregado",
        description: "La orden finalizó y el equipo ya fue retirado."
    },
    Rejected: {
        title: "Rechazaste el presupuesto",
        description: "Tu equipo está disponible para retiro sin reparar."
    }
};

// Vista de la bitácora: línea de tiempo o listado
type LogView = "timeline" | "list";

/** Número de orden con el formato visible, por ejemplo #000125. */
function FormatOrderNumber(orderNumber: number): string {
    return "#" + String(orderNumber).padStart(6, "0");
}

/** Fecha y hora en la zona horaria del usuario, por ejemplo 08/11/2026 · 10:30. */
function FormatDateTime(value: string): string {
    const date = new Date(value);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}/${month}/${date.getFullYear()} · ${hours}:${minutes}`;
}

/** Monto en pesos chilenos, por ejemplo $25.000. */
function FormatCurrency(value: number): string {
    return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0
    }).format(value);
}

/** Cantidad de tramos que se pintan en la barra de avance. */
function GetFilledSteps(statusCode: OrderStatusCode): number {
    if (statusCode === "Rejected") {
        return REJECTED_STEP_INDEX + 1;
    }

    return STATUS_STEPS.indexOf(statusCode) + 1;
}

/** Bitácora en línea de tiempo: el evento más reciente va primero y lleva el check. */
function LogTimeline({ logs }: { logs: OrderTrackingLogDto[] }) {
    return (
        <ol className="orderTracking__timeline">
            {logs.map((log, index) => (
                <li key={`${log.createdAt}-${index}`} className="orderTracking__timelineItem">
                    <span
                        className={
                            "orderTracking__marker" +
                            (index === 0 ? "" : " orderTracking__marker--dot")
                        }
                        aria-hidden="true"
                    >
                        {index === 0 && <LuCheck size={ICON_SIZE} aria-hidden="true" />}
                    </span>

                    <p className="orderTracking__logStatus">{log.status}</p>
                    <p className="orderTracking__logDate">{FormatDateTime(log.createdAt)}</p>
                    <p className="orderTracking__logComment">{log.comment}</p>
                </li>
            ))}
        </ol>
    );
}

/** Bitácora en listado: una fila por evento. */
function LogList({ logs }: { logs: OrderTrackingLogDto[] }) {
    return (
        <ul className="orderTracking__logList">
            {logs.map((log, index) => (
                <li key={`${log.createdAt}-${index}`} className="orderTracking__logRow">
                    <div>
                        <p className="orderTracking__logStatus">{log.status}</p>
                        <p className="orderTracking__logComment">{log.comment}</p>
                    </div>
                    <p className="orderTracking__logDate">{FormatDateTime(log.createdAt)}</p>
                </li>
            ))}
        </ul>
    );
}

/**
 * Vista para que el cliente consulte el seguimiento de sus órdenes (ORD-005).
 * Muestra el estado actual, los datos del equipo, el presupuesto (si existe)
 * y la bitácora de estados. El backend entrega solo las órdenes del cliente autenticado.
 */
export function OrderTracking() {
    const [orders, setOrders] = useState<OrderTrackingListItemDto[]>([]);
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    const [tracking, setTracking] = useState<OrderTrackingDto | null>(null);
    const [logView, setLogView] = useState<LogView>("timeline");
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);
    const [isLoadingTracking, setIsLoadingTracking] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Al abrir la vista se cargan las órdenes del cliente y se selecciona la más reciente
    useEffect(() => {
        let isCancelled = false;

        GetClientOrders()
            .then((items) => {
                if (isCancelled) return;

                setOrders(items);
                setSelectedOrderId(items.length > 0 ? items[0].id : null);
            })
            .catch((error: unknown) => {
                if (!isCancelled) setErrorMessage(GetErrorMessage(error));
            })
            .finally(() => {
                if (!isCancelled) setIsLoadingOrders(false);
            });

        return () => {
            isCancelled = true;
        };
    }, []);

    // Cada vez que cambia la orden seleccionada se carga su seguimiento
    useEffect(() => {
        if (selectedOrderId === null) return;

        let isCancelled = false;

        setIsLoadingTracking(true);
        setErrorMessage(null);

        GetOrderTracking(selectedOrderId)
            .then((data) => {
                if (!isCancelled) setTracking(data);
            })
            .catch((error: unknown) => {
                if (!isCancelled) setErrorMessage(GetErrorMessage(error));
            })
            .finally(() => {
                if (!isCancelled) setIsLoadingTracking(false);
            });

        return () => {
            isCancelled = true;
        };
    }, [selectedOrderId]);

    const statusMessage = tracking ? STATUS_MESSAGES[tracking.statusCode] : null;
    const filledSteps = tracking ? GetFilledSteps(tracking.statusCode) : 0;
    const isRejected = tracking?.statusCode === "Rejected";

    return (
        <div className="orderTracking">
            <main className="orderTracking__content">
                <h1 className="orderTracking__title">Seguimiento de reparación</h1>

                <p className="orderTracking__subtitle">
                    Consulta el estado y el historial de tus equipos.
                </p>

                {errorMessage && (
                    <p className="orderTracking__error" role="alert">
                        {errorMessage}
                    </p>
                )}

                {isLoadingOrders && (
                    <p className="orderTracking__muted">Cargando órdenes...</p>
                )}

                {!isLoadingOrders && orders.length === 0 && !errorMessage && (
                    <p className="orderTracking__empty">Aún no tienes órdenes registradas.</p>
                )}

                {orders.length > 0 && (
                    <div className="orderTracking__field">
                        <label className="orderTracking__label" htmlFor="orderSelect">
                            Selecciona una orden
                        </label>

                        <select
                            id="orderSelect"
                            className="orderTracking__select"
                            value={selectedOrderId ?? ""}
                            onChange={(event) => setSelectedOrderId(Number(event.target.value))}
                        >
                            {orders.map((order) => (
                                <option key={order.id} value={order.id}>
                                    {FormatOrderNumber(order.orderNumber)} · {order.equipmentType} {order.brandModel}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {isLoadingTracking && (
                    <p className="orderTracking__muted">Cargando seguimiento...</p>
                )}

                {tracking && statusMessage && (
                    <>
                        {/* Estado actual */}
                        <section className="orderTracking__card">
                            <div className="orderTracking__cardHeader">
                                <div>
                                    <p className="orderTracking__orderNumber">
                                        ORDEN {FormatOrderNumber(tracking.orderNumber)}
                                    </p>
                                    <h2 className="orderTracking__equipment">
                                        {tracking.equipmentType} {tracking.brandModel}
                                    </h2>
                                </div>

                                <span
                                    className={
                                        "orderTracking__badge" +
                                        (isRejected ? " orderTracking__badge--rejected" : "")
                                    }
                                >
                                    {tracking.status}
                                </span>
                            </div>

                            <hr className="orderTracking__divider" />

                            <p className="orderTracking__sectionTitle">Estado de la reparación</p>

                            <div
                                className="orderTracking__progress"
                                role="progressbar"
                                aria-valuemin={0}
                                aria-valuemax={STATUS_STEPS.length}
                                aria-valuenow={filledSteps}
                                aria-label={`Estado de la reparación: ${tracking.status}`}
                            >
                                {STATUS_STEPS.map((step, index) => (
                                    <span
                                        key={step}
                                        className={
                                            "orderTracking__step" +
                                            (index < filledSteps
                                                ? isRejected
                                                    ? " orderTracking__step--rejected"
                                                    : " orderTracking__step--done"
                                                : "")
                                        }
                                    />
                                ))}
                            </div>

                            <div className="orderTracking__progressLabels">
                                <span>Recibida</span>
                                <span>Entregada</span>
                            </div>

                            <div
                                className={
                                    "orderTracking__notice" +
                                    (isRejected ? " orderTracking__notice--rejected" : "")
                                }
                            >
                                <LuInfo size={ICON_SIZE} aria-hidden="true" />
                                <div>
                                    <p className="orderTracking__noticeTitle">{statusMessage.title}</p>
                                    <p className="orderTracking__noticeText">{statusMessage.description}</p>
                                </div>
                            </div>
                        </section>

                        {/* Datos del equipo y falla reportada */}
                        <section className="orderTracking__card">
                            <h2 className="orderTracking__cardTitle">
                                <LuLaptop size={ICON_SIZE} aria-hidden="true" />
                                Información del equipo
                            </h2>

                            <dl className="orderTracking__details">
                                <div>
                                    <dt>Tipo de equipo</dt>
                                    <dd>{tracking.equipmentType}</dd>
                                </div>

                                <div>
                                    <dt>Número de serie</dt>
                                    <dd>{tracking.serialNumber ?? "—"}</dd>
                                </div>

                                <div>
                                    <dt>Marca y modelo</dt>
                                    <dd>{tracking.brandModel}</dd>
                                </div>

                                <div className="orderTracking__detailsWide">
                                    <dt>Falla reportada</dt>
                                    <dd>{tracking.reportedFault}</dd>
                                </div>
                            </dl>
                        </section>

                        {/* Presupuesto, si existe */}
                        <section className="orderTracking__card">
                            <h2 className="orderTracking__cardTitle">
                                <LuReceipt size={ICON_SIZE} aria-hidden="true" />
                                Presupuesto
                            </h2>

                            {tracking.budget ? (
                                <dl className="orderTracking__budget">
                                    {tracking.budget.technicalDiagnosis && (
                                        <div className="orderTracking__budgetWide">
                                            <dt>Diagnóstico técnico</dt>
                                            <dd>{tracking.budget.technicalDiagnosis}</dd>
                                        </div>
                                    )}

                                    <div className="orderTracking__budgetRow">
                                        <dt>Mano de obra</dt>
                                        <dd>{FormatCurrency(tracking.budget.laborCost)}</dd>
                                    </div>

                                    <div className="orderTracking__budgetRow">
                                        <dt>Repuestos</dt>
                                        <dd>{FormatCurrency(tracking.budget.partsCost)}</dd>
                                    </div>

                                    <div className="orderTracking__budgetRow orderTracking__budgetRow--total">
                                        <dt>Total</dt>
                                        <dd>{FormatCurrency(tracking.budget.totalCost)}</dd>
                                    </div>
                                </dl>
                            ) : (
                                <div className="orderTracking__placeholder">
                                    <LuClock size={ICON_SIZE} aria-hidden="true" />
                                    <p>Presupuesto aún no disponible</p>
                                </div>
                            )}
                        </section>

                        {/* Bitácora de estados */}
                        <section className="orderTracking__card">
                            <h2 className="orderTracking__cardTitle">
                                <LuHistory size={ICON_SIZE} aria-hidden="true" />
                                Bitácora de estados
                            </h2>

                            <div className="orderTracking__tabs" role="tablist">
                                <button
                                    type="button"
                                    role="tab"
                                    aria-selected={logView === "timeline"}
                                    className={
                                        "orderTracking__tab" +
                                        (logView === "timeline" ? " orderTracking__tab--active" : "")
                                    }
                                    onClick={() => setLogView("timeline")}
                                >
                                    Línea de tiempo
                                </button>

                                <button
                                    type="button"
                                    role="tab"
                                    aria-selected={logView === "list"}
                                    className={
                                        "orderTracking__tab" +
                                        (logView === "list" ? " orderTracking__tab--active" : "")
                                    }
                                    onClick={() => setLogView("list")}
                                >
                                    Listado
                                </button>
                            </div>

                            {logView === "timeline"
                                ? <LogTimeline logs={tracking.logs} />
                                : <LogList logs={tracking.logs} />}
                        </section>
                    </>
                )}
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