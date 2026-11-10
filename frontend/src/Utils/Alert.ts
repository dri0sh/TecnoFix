import Swal from "sweetalert2";

const PRIMARY_COLOR = "#3a35e0";
const ERROR_COLOR = "#f56558";
const CANCEL_COLOR = "#6b6b78";

// Evita que el texto escrito por el usuario se interprete como HTML.
function EscapeHtml(value: string): string {
    const element = document.createElement("div");
    element.textContent = value;
    return element.innerHTML;
}

// Confirmación «¿Está seguro?» (NF01). Opcionalmente muestra los datos a registrar.
// Retorna true si el usuario acepta.
export async function ConfirmAction(text?: string, details?: Record<string, string>): Promise<boolean> {
    let html = text ? `<p>${EscapeHtml(text)}</p>` : "";

    if (details) {
        const rows = Object.entries(details)
            .map(([label, value]) => `<li><strong>${EscapeHtml(label)}:</strong> ${EscapeHtml(value)}</li>`)
            .join("");

        html += `<ul style="text-align: left; list-style: none; padding: 0;">${rows}</ul>`;
    }

    const result = await Swal.fire({
        title: "¿Está seguro?",
        html: html || undefined,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí",
        cancelButtonText: "Cancelar",
        confirmButtonColor: PRIMARY_COLOR,
        cancelButtonColor: CANCEL_COLOR,
        reverseButtons: true
    });

    return result.isConfirmed;
}

// Aviso de éxito que se cierra solo.
export async function ShowSuccessToast(message: string): Promise<void> {
    await Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: message,
        showConfirmButton: false,
        timer: 3000
    });
}

// Mensaje de error general (los errores de cada campo van bajo el campo).
export async function ShowError(message: string): Promise<void> {
    await Swal.fire({
        icon: "error",
        text: message,
        confirmButtonText: "Aceptar",
        confirmButtonColor: ERROR_COLOR
    });
}