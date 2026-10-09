import { Navigate } from "react-router-dom";
import {
    IsAuthenticated,
    NormalizeRole,
    GetRole
} from "../Utils/Auth";

interface ProtectedRouteProps {
    allowedRoles: string[];
    children: React.ReactNode;
    allowUnauthenticated?: boolean;
}

export function ProtectedRoute({allowedRoles, children, allowUnauthenticated = false}: ProtectedRouteProps) {
    if (!IsAuthenticated()) {
        if (allowUnauthenticated) {
            return <>{children}</>;
        }

        return <Navigate to="/login" replace />;
    }

    const role = GetRole();

    if (!role) { return <Navigate to="/login" replace />;}

    const normalizedRole = NormalizeRole(role);

    const canAccess = allowedRoles.map(NormalizeRole).includes(normalizedRole);

    if (!canAccess) {return <Navigate to="/access-denied" replace />;}

    return <>{children}</>;
}
