import { ApiFetch } from "./Client";
import type {
    RepairOrderCreateRequestDto,
    RepairOrderCreateResponseDto,
    RepairOrderFormOptionsDto
} from "../Types/OrderType";

/**
 * Obtiene las listas del formulario de registrar orden (ORD-001):
 * clientes registrados y tipos de equipo habilitados.
 * Requiere una sesión de técnico o administrador.
 *
 * @returns Clientes y tipos de equipo.
 */
export function GetRepairOrderFormOptions(): Promise<RepairOrderFormOptionsDto> {
    return ApiFetch<RepairOrderFormOptionsDto>("/orders/form-options");
}

/**
 * Registra una nueva orden de reparación (ORD-001).
 * Si hay datos inválidos, lanza un ApiError con los errores de cada campo.
 *
 * @param request Datos del equipo recibido.
 * @returns Número de orden, estado asignado y fecha de recepción.
 */
export function RegisterRepairOrder(
    request: RepairOrderCreateRequestDto
): Promise<RepairOrderCreateResponseDto> {
    return ApiFetch<RepairOrderCreateResponseDto>("/orders", {
        method: "POST",
        body: JSON.stringify(request)
    });
}