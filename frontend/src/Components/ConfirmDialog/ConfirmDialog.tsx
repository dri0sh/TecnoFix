import { useEffect } from "react";
import "./ConfirmDialog.css";

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
    variant?: "primary" | "danger";
    onConfirm: () => void;
    onCancel: () => void;
}

/**
 * Ventana reutilizable para confirmar operaciones antes de ejecutarlas.
 * Se utiliza para cumplir las confirmaciones requeridas por NF01.
 */
export function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    isLoading = false,
    variant = "primary",
    onConfirm,
    onCancel
}: ConfirmDialogProps) {

    // Permite cerrar la ventana utilizando la tecla Escape.
    useEffect(() => {
        if (!isOpen) return;

        function HandleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape" && !isLoading) {
                onCancel();
            }
        }

        document.addEventListener("keydown", HandleKeyDown);

        return () => {document.removeEventListener("keydown", HandleKeyDown);};
    }, [isOpen, isLoading, onCancel]);

    // Evita mostrar contenido cuando el diálogo está cerrado.
    if (!isOpen) return null;

    return (
        <div
            className="confirmDialog__overlay"
            role="presentation"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !isLoading) {
                    onCancel();
                }
            }}
        >
            <div
                className="confirmDialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-dialog-title"
                aria-describedby="confirm-dialog-message"
            >
                <h2
                    id="confirm-dialog-title"
                    className="confirmDialog__title"
                >
                    {title}
                </h2>

                <p
                    id="confirm-dialog-message"
                    className="confirmDialog__message"
                >
                    {message}
                </p>

                <div className="confirmDialog__actions">
                    <button
                        type="button"
                        className="confirmDialog__button confirmDialog__button--cancel"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </button>

                    <button
                        type="button"
                        className={`confirmDialog__button confirmDialog__button--${variant}`}
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? "Procesando..." : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}