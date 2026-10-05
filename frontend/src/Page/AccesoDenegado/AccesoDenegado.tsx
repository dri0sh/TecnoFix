import { Link } from "react-router-dom";
import "../../EstandarPage.css";

export function AccesoDenegado() {
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
                    to="/cambiar-password"
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