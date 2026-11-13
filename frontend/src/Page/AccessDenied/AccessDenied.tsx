import { Link } from "react-router-dom";
import "../../StandardPage.css";
import { HOME_ROUTE } from "../../Utils/Menu";

export function AccessDenied() {
    return (
        <div className="formPage">
            <main className="formPage__content">
                <h1 className="formPage__title">
                    Acceso denegado
                </h1>

                <p className="formPage__subtitle">
                    No tienes permisos para acceder a esta sección.
                </p>

                <Link
                    to={HOME_ROUTE}
                    className="formPage__button"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textDecoration: "none",
                        boxSizing: "border-box"
                    }}
                >
                    Volver
                </Link>
            </main>
        </div>
    );
}