import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    ClearSession,
    NormalizeRole,
    GetRole
} from "../Utils/Auth";
import "./Navigation.css";

export function Navigation() {
    const location = useLocation();
    const navigate = useNavigate();

    const role = GetRole();

    // El login no debe mostrar navegación.
    if (!role || location.pathname === "/login") {
        return null;
    }

    const normalizedRole = NormalizeRole(role);

    function Logout() {ClearSession(); navigate("/login", { replace: true });}

    return (
        <nav className="navigation">
            <div className="navigation__brand">TecnoFix</div>

            <div className="navigation__links">
                <Link to="/change-password">
                    Cambiar contraseña
                </Link>

                {(normalizedRole === "tecnico" || normalizedRole === "administrador") && (
                    <Link to="/register-client">
                        Registrar Cliente
                    </Link>
                )}

                {normalizedRole === "administrador" && (
                    <Link to="/register-technician">
                        Registrar Técnico
                    </Link>
                )}

                <button
                    type="button"
                    className="navigation__logout"
                    onClick={Logout}
                >
                    Cerrar sesión
                </button>
            </div>
        </nav>
    );
}