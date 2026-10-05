import { Link, useLocation, useNavigate } from "react-router-dom";
import { eliminarSesion, normalizarRol, obtenerRol } from "../Utils/Auth";
import "./Navigation.css";

export function Navigation() {
    const location = useLocation();
    const navigate = useNavigate();

    const rol = obtenerRol();

    // El login no debe mostrar navegación.
    if (!rol || location.pathname === "/login") {
        return null;
    }

    const rolNormalizado = normalizarRol(rol);

    function cerrarSesion() {
        eliminarSesion();
        navigate("/login", { replace: true });
    }

    return (
        <nav className="navigation">
            <div className="navigation__brand">TecnoFix</div>

            <div className="navigation__links">
                <Link to="/cambiar-password">Cambiar contraseña</Link>

                {(rolNormalizado === "tecnico" || rolNormalizado === "administrador") && (
                    <Link to="/registro-cliente">Registrar Cliente</Link>
                )}

                {rolNormalizado === "administrador" && (
                    <Link to="/registro-tecnico">Registrar Técnico</Link>
                )}

                <button type="button" className="navigation__logout" onClick={cerrarSesion}>
                    Cerrar sesión
                </button>
            </div>
        </nav>
    );
}