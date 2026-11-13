import { ApiFetch } from "./Client";
import type {
    RepairOrderCreateRequestDto,
    RepairOrderCreateResponseDto,
    RepairOrderFormOptionsDto,
    RepairOrderDiagnosisListDto,
    RepairOrderDiagnosisRequestDto,
    RepairOrderDiagnosisResponseDto,
    OrderTrackingDto,
    OrderTrackingListItemDto
} from "../Types/OrderType";

/**
 * Obtiene las listas del formulario de registrar orden (ORD-001).
 */
export function GetRepairOrderFormOptions(): Promise<RepairOrderFormOptionsDto> {
    return ApiFetch<RepairOrderFormOptionsDto>("/orders/form-options");
}

/**
 * Registra una nueva orden de reparación (ORD-001).
 */
export function RegisterRepairOrder(
    request: RepairOrderCreateRequestDto
): Promise<RepairOrderCreateResponseDto> {
    return ApiFetch<RepairOrderCreateResponseDto>("/orders", {
        method: "POST",
        body: JSON.stringify(request)
    });
}


/**
 * Registra un nuevo tipo de equipo desde el formulario de registrar orden (ORD-001).
 * Queda habilitado en el catálogo de tipos de equipo (ADM-001).
 *
 * @param name Nombre del nuevo tipo de equipo.
 */
export function AddEquipmentTypeFromOrder(name: string): Promise<{ message: string }> {
    return ApiFetch<{ message: string }>("/orders/equipment-types", {
        method: "POST",
        body: JSON.stringify({ name })
    });
}

/**
 * Obtiene las órdenes pendientes de diagnóstico (ORD-002).
 */
export function GetOrdersForDiagnosis(): Promise<RepairOrderDiagnosisListDto[]> {
    return ApiFetch<RepairOrderDiagnosisListDto[]>("/orders/diagnosis");
}

/**
 * Inicia el diagnóstico de una orden (ORD-002).
 */
export function StartOrderDiagnosis(orderId: number): Promise<{ message: string }> {
    return ApiFetch<{ message: string }>(`/orders/${orderId}/start-diagnosis`, {
        method: "PUT"
    });
}

/**
 * Registra el diagnóstico técnico y el presupuesto (ORD-002).
 */
export function RegisterDiagnosisAndBudget(
    request: RepairOrderDiagnosisRequestDto
): Promise<RepairOrderDiagnosisResponseDto> {
    return ApiFetch<RepairOrderDiagnosisResponseDto>("/orders/diagnosis/budget", {
        method: "POST",
        body: JSON.stringify(request)
    });
}

/**
 * Obtiene las órdenes del cliente autenticado para el selector del seguimiento (ORD-005).
 */
export function GetClientOrders(): Promise<OrderTrackingListItemDto[]> {
    return ApiFetch<OrderTrackingListItemDto[]>("/orders/mine");
}

/**
 * Obtiene el seguimiento completo de una orden del cliente autenticado (ORD-005).
 *
 * @param orderId Identificador de la orden.
 */
export function GetOrderTracking(orderId: number): Promise<OrderTrackingDto> {
    return ApiFetch<OrderTrackingDto>(`/orders/${orderId}/tracking`);
}