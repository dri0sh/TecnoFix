// Opción de una lista desplegable (cliente o tipo de equipo)
export interface SelectOptionDto {
    id: number;
    label: string;
}

// Listas del formulario de registrar orden (ORD-001)
export interface RepairOrderFormOptionsDto {
    clients: SelectOptionDto[];
    equipmentTypes: SelectOptionDto[];
}

// Datos que se envían al backend para registrar una orden (ORD-001)
export interface RepairOrderCreateRequestDto {
    clientId: number | null;
    equipmentTypeId: number | null;
    brandModel: string;
    serialNumber: string | null;
    reportedFault: string;
    accessories: string | null;
}

// Respuesta del backend al registrar una orden
export interface RepairOrderCreateResponseDto {
    message: string;
    orderNumber: number;
    status: string;
    receivedAt: string;
}