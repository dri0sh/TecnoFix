import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ChangePassword } from "./Page/ChangePassword/ChangePassword";
import { RegisterTechnician } from "./Page/RegisterTechnician/RegisterTechnician";
import { RegisterOrder } from "./Page/RegisterOrder/RegisterOrder";
import { Login } from "./Page/Login/Login";
import { RegisterClient } from "./Page/RegisterClient/RegisterClient";
import { ProtectedRoute } from "./Components/ProtectedRoute";
import { AccessDenied } from "./Page/AccessDenied/AccessDenied";
import { Navigation } from "./Components/Navigation";
import { Diagnosis } from "./Page/Diagnosis/Diagnosis";
import { EquipmentTypes } from "./Page/EquipmentTypes/EquipmentTypes";
import { Home } from "./Page/Home/Home";
import { OrderTracking } from "./Page/OrderTracking/OrderTracking";
import { HOME_ROUTE } from "./Utils/Menu";
import { AuthProvider, useAuth } from "./Context/AuthContext";

function AppRoutes() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <div>Cargando aplicación...</div>;
    }

    return (
        <>
            <Navigation />

            <Routes>
                <Route
                    path="/"
                    element={
                        <Navigate
                            to={isAuthenticated ? HOME_ROUTE : "/login"}
                            replace
                        />
                    }
                />

                <Route path="/login" element={<Login />} />

                <Route
                    path="/home"
                    element={
                        <ProtectedRoute allowedRoles={["administrador", "tecnico", "cliente"]}>
                            <Home />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/change-password"
                    element={
                        <ProtectedRoute allowedRoles={["administrador", "tecnico", "cliente"]}>
                            <ChangePassword />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/register-client"
                    element={
                        <ProtectedRoute
                            allowedRoles={["tecnico"]}
                            allowUnauthenticated={true}
                        >
                            <RegisterClient />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/register-technician"
                    element={
                        <ProtectedRoute allowedRoles={["administrador"]}>
                            <RegisterTechnician />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/register-order"
                    element={
                        <ProtectedRoute allowedRoles={["administrador", "tecnico"]}>
                            <RegisterOrder />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/access-denied"
                    element={
                        <ProtectedRoute allowedRoles={["administrador", "tecnico", "cliente"]}>
                            <AccessDenied />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/diagnosis"
                    element={
                        <ProtectedRoute allowedRoles={["tecnico"]}>
                            <Diagnosis />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/equipment-types"
                    element={
                        <ProtectedRoute allowedRoles={["administrador"]}>
                            <EquipmentTypes />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/order-tracking"
                    element={
                        <ProtectedRoute allowedRoles={["cliente"]}>
                            <OrderTracking />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
