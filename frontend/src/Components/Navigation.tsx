
import { Link, useLocation, useNavigate } from "react-router-dom";
import { GetMenuOptions, HOME_ROUTE } from "../Utils/Menu";
import { Logout as LogoutRequest } from "../Api/Auth";
import { useAuth } from "../Context/AuthContext";
import "./Navigation.css";

/**
 * Barra de navegación superior. Muestra las opciones según el rol
 * del usuario autenticado mediante AuthContext.
 */
export function Navigation() {
    const location = useLocation();
    const navigate = useNavigate();

    const { user, isLoading, clearSession } = useAuth();

    // Esperar la verificación de la sesión.
    if (isLoading) {
        return null;
    }

    const role = user?.role;

    // El login y las sesiones no autenticadas no muestran navegación.
    if (!role || location.pathname === "/login") {
        return null;
    }

    const options = GetMenuOptions(role);

    async function Logout() {
        try {
            await LogoutRequest();

            clearSession();
            navigate("/login", { replace: true });
        } catch (error) {
            console.error("Error al cerrar sesión:", error);

            window.alert(
                "No fue posible cerrar la sesión en el servidor. Inténtelo nuevamente."
            );
        }
    }

    return (
        <nav className="navigation">
            <Link to={HOME_ROUTE} className="navigation__brand">
                TecnoFix
            </Link>

            <div className="navigation__links">
                {options.map((option) => (
                    <Link key={option.path} to={option.path}>
                        {option.label}
                    </Link>
                ))}

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
