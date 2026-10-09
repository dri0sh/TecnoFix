import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ChangePassword } from "./Page/ChangePassword/ChangePassword";
import { RegisterTechnician } from "./Page/RegisterTechnician/RegisterTechnician";
import { Login } from "./Page/Login/Login";
import { RegisterClient } from "./Page/RegisterClient/RegisterClient";
import { ProtectedRoute } from "./Components/ProtectedRoute";
import { AccessDenied } from "./Page/AccessDenied/AccessDenied"
import { Navigation } from "./Components/Navigation";

function App() {
    return (
        <BrowserRouter>
            <Navigation />

            <Routes>
                <Route
                    path="/"
                    element={<Navigate to="/login" replace />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/change-password"
                    element={
                        <ProtectedRoute
                            allowedRoles={[
                                "administrador",
                                "tecnico",
                                "cliente"
                            ]}
                        >
                            <ChangePassword />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/register-client"
                    element={
                        <ProtectedRoute
                            allowedRoles={[
                                "administrador",
                                "tecnico"
                            ]}
                            allowUnauthenticated={true}
                        >
                            <RegisterClient />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/register-technician"
                    element={
                        <ProtectedRoute
                            allowedRoles={["administrador"]}
                        >
                            <RegisterTechnician />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/access-denied"
                    element={
                        <ProtectedRoute
                            allowedRoles={[
                                "administrador",
                                "tecnico",
                                "cliente"
                            ]}
                        >
                            <AccessDenied />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;