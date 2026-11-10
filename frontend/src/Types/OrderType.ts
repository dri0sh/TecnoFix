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


// Orden disponible para realizar un diagnóstico (ORD-002)
export interface RepairOrderDiagnosisListDto {
    id: number;
    orderNumber: string;
    clientName: string;
    equipmentType: string;
    brandModel: string;
    reportedFault: string;
    receivedAt: string;
    status: string;
}

// Datos enviados para registrar el diagnóstico y presupuesto (ORD-002)
export interface RepairOrderDiagnosisRequestDto {
    orderId: number;
    technicalDiagnosis: string;
    laborCost: number;
    partsCost: number;
}

// Respuesta al registrar el diagnóstico y presupuesto (ORD-002)
export interface RepairOrderDiagnosisResponseDto {
    success: boolean;
    message: string;
    fieldErrors: Record<string, string>;
}
