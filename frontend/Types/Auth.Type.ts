// Intercade que corresponde al request del Backend del login
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
//Datos de respuesta.
export interface RegistrarClienteResponseDto {
  id: number;
  name: string;
  correo: string;
  mensaje: string;
}
// Errores genericos de APP.net (400,401,404,500,etc)
export interface ApiErrorResponse {
  mensaje?: string;
  errors?: Record<string, string[]>;
}