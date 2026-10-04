// Interface que corresponde al request del Backend del login
export interface LoginRequestDto {
    Correo: string;
    Password: string;
}

// Respuesta del Backend
export interface LoginResponseDto {
    name: string;
    rol: string;
    message: string;
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
    Exito: boolean;
    Mensaje: string;
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