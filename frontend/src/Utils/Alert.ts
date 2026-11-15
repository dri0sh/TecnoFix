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


// Ventana con un campo de texto para agregar una opción nueva a una lista
// (especialidad, tipo de equipo). onSave la guarda y retorna el error, o null si se guardó.
// Retorna el texto agregado, o null si el usuario cancela.
export async function AskNewOption(
    title: string,
    label: string,
    onSave: (value: string) => Promise<string | null>
): Promise<string | null> {
    const result = await Swal.fire({
        title: title,
        input: "text",
        inputLabel: label,
        showCancelButton: true,
        confirmButtonText: "Agregar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: PRIMARY_COLOR,
        cancelButtonColor: CANCEL_COLOR,
        reverseButtons: true,
        showLoaderOnConfirm: true,
        allowOutsideClick: () => !Swal.isLoading(),
        preConfirm: async (value: string) => {
            const error = await onSave(value.trim());

            // Si hay error, se muestra en la misma ventana y no se cierra
            if (error) {
                Swal.showValidationMessage(error);
                return false;
            }

            return value.trim();
        }
    });

    return result.isConfirmed ? result.value : null;
}

// Confirmación de cambio de contraseña con cuenta regresiva.
export async function ShowPasswordChangeSuccess(): Promise<void> {
    let timerInterval: ReturnType<typeof setInterval> | undefined;

    await Swal.fire({
        icon: "success",
        title: "Contraseña actualizada",
        html: `
            <p>Tu contraseña se cambió correctamente.</p>
            <p>Serás redirigido al inicio de sesión en
            <strong id="password-countdown">3</strong> segundos.</p>
        `,
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
            const countdown = Swal.getHtmlContainer()?.querySelector(
                "#password-countdown"
            );

            timerInterval = setInterval(() => {
                const remaining = Swal.getTimerLeft();

                if (countdown && remaining !== undefined) {
                    countdown.textContent = String(
                        Math.max(0, Math.ceil(remaining / 1000))
                    );
                }
            }, 100);
        },
        willClose: () => {
            if (timerInterval !== undefined) {
                clearInterval(timerInterval);
            }
        }
    });
}
