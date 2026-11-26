import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";
import type { ReactNode } from "react";

import {
    getLoggedInUser,
    loginUser,
    logoutUser
} from "../services/authService";

import type { AuthUser } from "../services/authService";

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    login: (credentials: {
        email: string;
        password: string;
    }) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            setUser(null);
            return;
        }

        try {
            const response = await getLoggedInUser();
            setUser(response.data.user);
        } catch {
            logoutUser();
            setUser(null);
        }
    };

    // Initialize authentication and listen for logout events.
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                await refreshUser();
            } finally {
                setLoading(false);
            }
        };

        const handleAuthChange = () => {
            setUser(null);
        };

        initializeAuth();

        window.addEventListener("auth-changed", handleAuthChange);

        return () => {
            window.removeEventListener("auth-changed", handleAuthChange);
        };
    }, []);

    const login = async (credentials: {
        email: string;
        password: string;
    }) => {
        const response = await loginUser(credentials);

        localStorage.setItem("token", response.data.token);
        setUser(response.data.user);
    };

    const logout = () => {
        logoutUser();
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
                refreshUser
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
};