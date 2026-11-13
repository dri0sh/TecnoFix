
import { Link } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import { NormalizeRole } from "../../Utils/Auth";
import { GetMenuOptions } from "../../Utils/Menu";
import "../../StandardPage.css";
import "./Home.css";

// Nombre de cada rol tal como se muestra al usuario
const ROLE_DISPLAY_NAMES: Record<string, string> = {
    administrador: "Administrador",
    tecnico: "Técnico",
    cliente: "Cliente"
};

/**
 * Página de inicio. Muestra como tarjetas las opciones disponibles según el rol del usuario.
 */
export function Home() {
    const { user } = useAuth();

    const role = user?.role ?? "";
    const options = GetMenuOptions(role);
    const roleName = ROLE_DISPLAY_NAMES[NormalizeRole(role)] ?? role;

    return (
        <div className="formPage">
            <main className="formPage__content homePage__content">
                <h1 className="formPage__title">
                    Bienvenido a TecnoFix
                </h1>

                <p className="formPage__subtitle">
                    Ingresaste como {roleName}. Selecciona lo que deseas hacer.
                </p>

                <div className="homePage__grid">
                    {options.map((option) => (
                        <Link
                            key={option.path}
                            to={option.path}
                            className="homePage__card"
                        >
                            <h2 className="homePage__cardTitle">
                                {option.label}
                            </h2>

                            <p className="homePage__cardDescription">
                                {option.description}
                            </p>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    );
}
