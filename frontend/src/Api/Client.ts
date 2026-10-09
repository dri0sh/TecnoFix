import type { ApiErrorResponse } from "../Types/AuthType.ts";

/**
 * Dirección base del backend.
 * Esta dirección debe configurarse mediante la variable de entorno
 * VITE_API_URL y puede cambiar al momento de desplegar la aplicación.
 */
const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:5174/api";

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
function ExtractErrorMessage(body: ApiErrorResponse | null): string {
    if (body?.message) return body.message;

    if (body?.errors) {const firstField = Object.values(body.errors)[0];

        if (firstField?.length) return firstField[0];
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
export async function ApiFetch<TResponse>(path: string, options: RequestInit = {}): Promise<TResponse> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        credentials: "include",
        headers: {"Content-Type": "application/json", ...options.headers,},
    });

    const body = await response.json().catch(() => null);

    if (!response.ok) {const errorMessage = ExtractErrorMessage(body);
        throw new Error(errorMessage);
    }

    return body as TResponse;
}