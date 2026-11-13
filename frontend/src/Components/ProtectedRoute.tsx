
import { Navigate } from "react-router-dom";
import { NormalizeRole } from "../Utils/Auth";
import { useAuth } from "../Context/AuthContext";

interface ProtectedRouteProps {
    allowedRoles: string[];
    children: React.ReactNode;
    allowUnauthenticated?: boolean;
}

export function ProtectedRoute({
    allowedRoles,
    children,
    allowUnauthenticated = false
}: ProtectedRouteProps) {
    const { user, isAuthenticated, isLoading } = useAuth();

    // Esperar a que el backend confirme el estado de la sesión.
    if (isLoading) {
        return <div>Cargando sesión...</div>;
    }

    // Permitir el acceso público cuando la ruta lo admite.
    if (!isAuthenticated) {
        if (allowUnauthenticated) {
            return <>{children}</>;
        }

        return <Navigate to="/login" replace />;
    }

    const role = user?.role;

    if (!role) {
        return <Navigate to="/login" replace />;
    }

    const normalizedRole = NormalizeRole(role);

    const canAccess = allowedRoles
        .map(NormalizeRole)
        .includes(normalizedRole);

    if (!canAccess) {
        return <Navigate to="/access-denied" replace />;
    }

    return <>{children}</>;
}
