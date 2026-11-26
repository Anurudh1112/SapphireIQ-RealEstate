import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            setLoading(true);
            setMessage("");
            setError("");

            const response = await api.post("/users/forgot-password", {
                email
            });

            setMessage(response.data.message);
            setEmail("");
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                "Unable to send password reset email. Please try again."
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
                    Forgot Password?
                </h1>

                <p className="mt-2 text-gray-600">
                    Enter your registered email address. We will send you a
                    password reset link.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                        className="w-full rounded-lg border border-gray-300 p-3"
                    />

                    {message && (
                        <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                            {message}
                        </p>
                    )}

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
                        {loading ? "Sending..." : "Send Reset Link"}
                    </button>
                </form>

                <Link
                    to="/login"
                    className="mt-6 block text-center text-sm font-medium text-blue-600 hover:underline"
                >
                    Back to Login
                </Link>
            </div>
        </div>
    );
}

export default ForgotPassword;
