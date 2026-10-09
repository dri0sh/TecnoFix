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

// Errores genéricos de ASP.NET (400, 401, 404, 500, etc.)
export interface ApiErrorResponse {
    message?: string;
    errors?: Record<string, string[]>;
}

// Datos que se solicitan para registrar un técnico (USU-003)
export interface TechnicianRegistrationRequestDto {
    name: string;
    rut: string;
    email: string;
    phoneNumber: string;
}

// Respuesta del backend al registrar un técnico
export interface TechnicianRegistrationResponseDto {
    message: string;
}