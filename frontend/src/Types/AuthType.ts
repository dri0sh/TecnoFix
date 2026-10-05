// Datos que se envían al Backend para iniciar sesión (USU-001)
export interface LoginRequestDto {
    Correo: string;
    Contrasena: string;
}

// Respuesta del Backend al iniciar sesión
export interface LoginResponseDto {
    mensaje: string;
    correo: string;
    rol: string;
}

// Datos que se solicitan para crear el usuario
export interface RegistrarClienteRequestDto {
    name: string;
    correo: string;
    rut: string;
    telefono: string;
}

// Datos de respuesta
export interface RegistrarClienteResponseDto {
    id: number;
    name: string;
    correo: string;
    mensaje: string;
}

// Datos que se solicitan para cambiar la contraseña
export interface CambiarPasswordRequestDto {
    PasswordActual: string;
    PasswordNueva: string;
    ConfirmarPasswordNueva: string;
}

// Respuesta del Backend
export interface CambiarPasswordResponseDto {
    exito: boolean;
    mensaje: string;
}

// Errores genericos de ASP.NET (400, 401, 404, 500, etc.)
export interface ApiErrorResponse {
    mensaje?: string;
    errors?: Record<string, string[]>;
}

// Datos que se solicitan para registrar un técnico (USU-003)
export interface TecnicoCreateDto {
    Nombre: string;
    Rut: string;
    Correo: string;
    Telefono: string;
}

// Respuesta del Backend al registrar un técnico
export interface RegistroTecnicoResponseDto {
    mensaje: string;
}