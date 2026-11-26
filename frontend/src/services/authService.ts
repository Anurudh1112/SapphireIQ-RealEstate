import api from "./api";
export interface AuthUser {
    id: string;
    _id?: string;
    name: string;
    email: string;
    role: string;
}

interface LoginResponse {
    message: string;
    token: string;
    user: AuthUser;
}

interface RegisterResponse {
    message: string;
    user: AuthUser;
}

export const registerUser = (userData: {
    name: string;
    email: string;
    password: string;
}) => {
    return api.post<RegisterResponse>("/users/register", userData);
};

export const loginUser = (credentials: {
    email: string;
    password: string;
}) => {
    return api.post<LoginResponse>("/users/login", credentials);
};

export const getLoggedInUser = () => {
    return api.get<{ user: AuthUser }>("/users/me");
};

export const logoutUser = () => {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("auth-changed"));
};