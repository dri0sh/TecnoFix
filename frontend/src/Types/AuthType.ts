// Datos que se envían al backend para iniciar sesión (USU-001)
export interface LoginRequestDto {
    email: string;
    password: string;
}

// Respuesta del backend al iniciar sesión
export interface LoginResponseDto {
    message: string;
    email: string;
    role: string;
}

// Datos que se solicitan para crear un cliente
export interface ClientRegistrationRequestDto {
    name: string;
    email: string;
    rut: string;
    phoneNumber: string;
}

// Respuesta del backend al registrar un cliente
export interface ClientRegistrationResponseDto {
    id: number;
    name: string;
    email: string;
    message: string;
}

// Datos que se solicitan para cambiar la contraseña
export interface PasswordChangeRequestDto {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}

// Respuesta del backend al cambiar la contraseña
export interface PasswordChangeResponseDto {
    success: boolean;
    message: string;
}

// Errores del backend: "message" general, "fieldErrors" con un error por campo
// y "errors" (formato de la validación automática de ASP.NET)
export interface ApiErrorResponse {
    message?: string;
    fieldErrors?: Record<string, string>;
    errors?: Record<string, string[]>;
}

// Datos que se solicitan para registrar un técnico (USU-003):
// nombre y apellidos, correo electrónico y especialidad
export interface TechnicianRegistrationRequestDto {
    name: string;
    email: string;
    specialty: string;
}

// Respuesta del backend al registrar un técnico
export interface TechnicianRegistrationResponseDto {
    message: string;
}