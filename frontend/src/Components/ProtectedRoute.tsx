import { Navigate } from "react-router-dom";
import { estaAutenticado, normalizarRol, obtenerRol } from "../Utils/Auth";

interface ProtectedRouteProps {rolesPermitidos: string[]; children: React.ReactNode;}

export function ProtectedRoute({rolesPermitidos, children}: ProtectedRouteProps) {
    if (!estaAutenticado()) {
        return <Navigate to="/login" replace />;
    }

    const rol = obtenerRol();

    if (!rol) {
        return <Navigate to="/login" replace />;
    }

    const rolNormalizado = normalizarRol(rol);

    const puedeAcceder = rolesPermitidos.map(normalizarRol).includes(rolNormalizado);

    if (!puedeAcceder) {return <Navigate to="/acceso-denegado" replace />;}

    return <>{children}</>;
}