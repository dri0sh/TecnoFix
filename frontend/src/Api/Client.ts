import type { ApiErrorResponse } from "../Types/AuthType.ts";

/**
 * Dirección base del backend.
 * Esta dirección debe configurarse mediante la variable de entorno
 * VITE_API_URL y puede cambiar al momento de desplegar la aplicación.
 */
const API_BASE_URL = import.meta.env.VITE_API_URL as string;

/**
 * Extrae el mensaje de error entregado por el backend.
 *
 * Si la respuesta contiene un mensaje general, se utiliza dicho mensaje.
 * En caso contrario, se intenta obtener el primer mensaje asociado
 * a un campo específico.
 *
 * @param body Respuesta de error entregada por el backend.
 * @returns Mensaje de error que será mostrado al usuario.
 */
function ExtraerMensajeError(body: ApiErrorResponse | null): string {
    if (body?.mensaje) return body.mensaje;

    if (body?.errors) {
        const primerCampo = Object.values(body.errors)[0];

        if (primerCampo?.length) return primerCampo[0];
    }

    return "Ocurrió un error inesperado, inténtelo nuevamente";
}

/**
 * Realiza una petición HTTP al backend.
 *
 * Incluye las credenciales necesarias para que el backend
 * pueda identificar al usuario mediante la cookie de autenticación.
 *
 * @param path Ruta del endpoint del backend.
 * @param options Opciones de la petición HTTP.
 * @returns Respuesta del backend convertida al tipo indicado.
 * @throws Error cuando el backend responde con un código HTTP no exitoso.
 */
export async function apiFetch<TRespuesta>(
    path: string,
    options: RequestInit = {}
): Promise<TRespuesta> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    });

    const body = await response.json().catch(() => null);

    if (!response.ok) {
        const mensajeError = ExtraerMensajeError(body);
        throw new Error(mensajeError);
    }

    return body as TRespuesta;
}