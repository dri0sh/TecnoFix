import { Link, useLocation, useNavigate } from "react-router-dom";
import { ClearSession, GetRole } from "../Utils/Auth";
import { GetMenuOptions, HOME_ROUTE } from "../Utils/Menu";
import "./Navigation.css";

/**
 * Barra de navegación superior. Muestra las opciones según el rol del usuario,
 * a partir de la misma lista que usa la página de inicio (Utils/Menu.ts).
 */
export function Navigation() {
    const location = useLocation();
    const navigate = useNavigate();

    const role = GetRole();

    // El login no debe mostrar navegación.
    if (!role || location.pathname === "/login") {
        return null;
    }

    const options = GetMenuOptions(role);

    function Logout() {
        ClearSession();
        navigate("/login", { replace: true });
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