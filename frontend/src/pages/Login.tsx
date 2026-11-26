import { useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [credentials, setCredentials] = useState({
        email: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setCredentials({
            ...credentials,
            [event.target.name]: event.target.value
        });
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            setLoading(true);
            setError("");

            await login(credentials);

            navigate("/");
        } catch (err: any) {
            setError(
                err.response?.data?.message || "Login failed."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
            <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">
                <Link to="/" className="text-2xl font-bold text-blue-700">
                    RealEstate
                </Link>

                <h1 className="mt-6 text-2xl font-bold text-gray-900">
                    Welcome back
                </h1>

                <p className="mt-2 text-gray-600">
                    Login to your RealEstate account.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <input
                        type="email"
                        name="email"
                        placeholder="Email address"
                        value={credentials.email}
                        onChange={handleChange}
                        required
                        className="w-full rounded-lg border border-gray-300 p-3"
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={credentials.password}
                        onChange={handleChange}
                        required
                        className="w-full rounded-lg border border-gray-300 p-3"
                    />

                    <div className="text-right">
                        <Link
                            to="/forgot-password"
                            className="text-sm font-medium text-blue-600 hover:underline"
                        >
                            Forgot Password?
                        </Link>
                    </div>

                    {error && (
                        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600">
                    Don't have an account?{" "}
                    <Link
                        to="/register"
                        className="font-medium text-blue-600 hover:underline"
                    >
                        Register
                    </Link>
                </p>

                <Link
                    to="/"
                    className="mt-5 block text-center text-sm text-gray-500 hover:text-blue-600"
                >
                    Back to Home
                </Link>
            </div>
        </div>
    );
}

export default Login;