// Interfaz que corresponde al request del Backend del login
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

// Errores genéricos de ASP.NET
export interface ApiErrorResponse {
  mensaje?: string;
  errors?: Record<string, string[]>;
}