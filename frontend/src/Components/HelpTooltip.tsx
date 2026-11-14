import { useId } from "react";
import "./HelpTooltip.css";

interface HelpTooltipProps {
    label: string;
    text: string;
}

/**
 * Ayuda en línea tipo tooltip (NF03). Muestra un botón «?» que despliega el texto
 * al pasar el mouse o al enfocarlo con el teclado.
 *
 * @param label Nombre del campo, para lectores de pantalla.
 * @param text Texto de ayuda que se muestra.
 */
export function HelpTooltip({ label, text }: HelpTooltipProps) {
    const tooltipId = useId();

    return (
        <span className="formPage__help">
            <button
                type="button"
                className="formPage__helpButton"
                aria-describedby={tooltipId}
                aria-label={`Ayuda: ${label}`}
            >
                ?
            </button>

            <span id={tooltipId} className="formPage__helpText" role="tooltip">
                {text}
            </span>
        </span>
    );
}