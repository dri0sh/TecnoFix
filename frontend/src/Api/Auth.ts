import { apiFetch } from "./Client.ts";
import type {
    CambiarPasswordRequestDto,
    CambiarPasswordResponseDto,
    LoginRequestDto,
    LoginResponseDto
} from "../Types/AuthType.ts";

/**
 * Realiza la petición al backend para iniciar sesión (USU-001).
 * Si las credenciales son incorrectas, apiFetch lanza un Error
 * con el mensaje que entrega el backend.
 *
 * @param request Correo y contraseña ingresados.
 * @returns Datos del usuario autenticado.
 */
export function iniciarSesion(
    request: LoginRequestDto
): Promise<LoginResponseDto> {
    return apiFetch<LoginResponseDto>("/auth/login", {
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
export function cambiarPassword(
    request: CambiarPasswordRequestDto
): Promise<CambiarPasswordResponseDto> {
    return apiFetch<CambiarPasswordResponseDto>("/auth/cambiar-password", {
            method: "POST",
            body: JSON.stringify(request)
        }
    );
}