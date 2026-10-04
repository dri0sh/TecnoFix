import type { ApiErrorResponse } from "../Types/Auth.Type";

const API_BASE_URL = import.meta.env.VITE_API_URL as string;

function ExtraerMensajeError(Body: ApiErrorResponse): string {
  if (Body.mensaje) return Body.mensaje;

  if (Body.errors) {
    const primerCampo = Object.values(Body.errors)[0];

    if (primerCampo?.length) {
      return primerCampo[0];
    }
  }

  return "Ocurrio un error inesperado, intentelo nuevamente";
}

export async function apiFetch<TResponse>(
  path: string,
  options: RequestInit = {}
): Promise<TResponse> {
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
    const mensajeError = ExtraerMensajeError(
      body as ApiErrorResponse
    );

    throw new Error(mensajeError);
  }

  return body as TResponse;
}