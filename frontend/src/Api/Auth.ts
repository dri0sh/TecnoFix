import { apiFetch } from "./Client.ts";
import type {
    CambiarPasswordRequestDto,
    CambiarPasswordResponseDto
} from "../Types/AuthType.ts";

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