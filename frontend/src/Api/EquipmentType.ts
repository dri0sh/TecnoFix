import { ApiFetch } from "./Client";
import type {
    EquipmentTypeDto,
    EquipmentTypeOperationResponseDto,
    EquipmentTypeRequestDto,
    EquipmentTypeStatusRequestDto
} from "../Types/EquipmentType";

/**
 * Obtiene todos los tipos de equipo registrados.
 * Incluye tanto los habilitados como los deshabilitados.
 * Requiere una sesión de Administrador.
 */
export function GetEquipmentTypes(): Promise<EquipmentTypeDto[]> {
    return ApiFetch<EquipmentTypeDto[]>("/equipment-types");
}

/**
 * Registra un nuevo tipo de equipo.
 * El nuevo tipo queda habilitado.
 */
export function CreateEquipmentType(request: EquipmentTypeRequestDto): Promise<EquipmentTypeOperationResponseDto> {
    return ApiFetch<EquipmentTypeOperationResponseDto>("/equipment-types", {
        method: "POST",
        body: JSON.stringify(request)
    });
}

/**
 * Edita el nombre y la descripción de un tipo de equipo.
 */
export function UpdateEquipmentType(id: number, request: EquipmentTypeRequestDto): Promise<EquipmentTypeOperationResponseDto> {
    return ApiFetch<EquipmentTypeOperationResponseDto>(
        `/equipment-types/${id}`,
        {
            method: "PUT",
            body: JSON.stringify(request)
        }
    );
}

/**
 * Habilita o deshabilita un tipo de equipo.
 */
export function SetEquipmentTypeStatus(id: number, request: EquipmentTypeStatusRequestDto): Promise<EquipmentTypeOperationResponseDto> {
    return ApiFetch<EquipmentTypeOperationResponseDto>(
        `/equipment-types/${id}/status`,
        {
            method: "PATCH",
            body: JSON.stringify(request)
        }
    );
}