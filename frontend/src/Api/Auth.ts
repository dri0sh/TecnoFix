import { ApiFetch } from "./Client";
import type {
    PasswordChangeRequestDto,
    PasswordChangeResponseDto,
    LoginRequestDto,
    LoginResponseDto,
    TechnicianRegistrationRequestDto,
    TechnicianRegistrationResponseDto,
    ClientRegistrationRequestDto,
    ClientRegistrationResponseDto
} from "../Types/AuthType";

/**
 * Realiza la petición al backend para iniciar sesión (USU-001).
 * Si las credenciales son incorrectas, apiFetch lanza un Error
 * con el mensaje que entrega el backend.
 *
 * @param request Correo y contraseña ingresados.
 * @returns Datos del usuario autenticado.
 */
export function Login(
    request: LoginRequestDto
): Promise<LoginResponseDto> {
    return ApiFetch<LoginResponseDto>("/auth/login", {
        method: "POST",
        body: JSON.stringify(request)
    });
}

/**
 * Realiza la petición al backend para cambiar la contraseña
 * del usuario autenticado.
 *
 * @param request Datos necesarios para cambiar la contraseña.
 * @returns Resultado de la operación.
 */
export function ChangePassword(
    request: PasswordChangeRequestDto
): Promise<PasswordChangeResponseDto> {
    return ApiFetch<PasswordChangeResponseDto>("/auth/change-password", {
        method: "POST",
        body: JSON.stringify(request)
    });
}

/**
 * Realiza la petición al backend para registrar a un nuevo técnico en el sistema.
 * Requiere que la sesión actual pertenezca a un usuario con rol Administrador.
 *
 * @param request Objeto con los datos del técnico a dar de alta.
 * @returns Mensaje de confirmación entregado por la API.
 */
export function RegisterTechnician(
    request: TechnicianRegistrationRequestDto
): Promise<TechnicianRegistrationResponseDto> {
    return ApiFetch<TechnicianRegistrationResponseDto>(
        "/auth/register-technician",
        {
            method: "POST",
            body: JSON.stringify(request)
        }
    );
}

/**
 * Realiza la petición al backend para registrar a un nuevo cliente en el sistema.
 *
 * @param request Objeto con los datos del cliente a registrar.
 * @returns Datos y mensaje de confirmación entregados por la API.
 */
export function RegisterClient(request: ClientRegistrationRequestDto): Promise<ClientRegistrationResponseDto> {
    return ApiFetch<ClientRegistrationResponseDto>("/auth/register-client", {
        method: "POST",
        body: JSON.stringify(request)
    });
}