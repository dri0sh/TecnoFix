
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode
} from "react";
import { ApiFetch } from "../Api/Client";

interface SessionUser {
    userId: string;
    name: string;
    role: string;
}

interface AuthContextType {
    user: SessionUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    refreshSession: () => Promise<boolean>;
    clearSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<SessionUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshSession = useCallback(async (): Promise<boolean> => {
        setIsLoading(true);

        try {
            const session = await ApiFetch<SessionUser>("/auth/session");

            setUser(session);
            return true;
        } catch {
            setUser(null);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clearSession = useCallback(() => {
        setUser(null);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        void refreshSession();
    }, [refreshSession]);

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: user !== null,
                isLoading,
                refreshSession,
                clearSession
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth debe utilizarse dentro de un AuthProvider."
        );
    }

    return context;
}
