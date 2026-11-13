// Datos utilizados para registrar o editar un tipo de equipo.
export interface EquipmentTypeRequestDto {
    name: string;
    description: string | null;
}

// Tipo de equipo recibido desde el backend.
export interface EquipmentTypeDto {
    id: number;
    name: string;
    description: string | null;
    isEnabled: boolean;
}

// Datos enviados para cambiar el estado del tipo de equipo.
export interface EquipmentTypeStatusRequestDto {
    isEnabled: boolean;
}

// Respuesta de las operaciones sobre tipos de equipo.
export interface EquipmentTypeOperationResponseDto {
    success: boolean;
    message: string;
    fieldErrors: Record<string, string>;
    isDuplicateName: boolean;
    isNotFound: boolean;
    hasOrdersInProgress: boolean;
    equipmentType: EquipmentTypeDto | null;
}