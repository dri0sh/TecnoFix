import { apiFetch } from "./Client";
import type {
    CambiarPasswordRequestDto,
    CambiarPasswordResponseDto,
    TecnicoCreateDto,
    RegistroTecnicoResponseDto
} from "../Types/AuthType";

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
    });
}

/**
 * Realiza la petición al backend para registrar a un nuevo técnico en el sistema.
 * Requiere que la sesión actual pertenezca a un usuario con rol Administrador.
 *
 * @param request Objeto con los datos del técnico a dar de alta.
 * @returns Mensaje de confirmación entregado por la API.
 */
export function registrarTecnico(
    request: TecnicoCreateDto
): Promise<RegistroTecnicoResponseDto> {
    return apiFetch<RegistroTecnicoResponseDto>("/auth/register-tecnico", {
        method: "POST",
        body: JSON.stringify(request)
    });
}