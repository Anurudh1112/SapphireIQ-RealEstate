import { useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function ResetPassword() {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setMessage("");
        setError("");

        if (!token) {
            setError("Invalid password reset link.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            const response = await api.post(
                `/users/reset-password/${token}`,
                { password }
            );

            setMessage(response.data.message);

            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                "Unable to reset password. The link may be invalid or expired."
            );
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value);
    };

    const handleConfirmPasswordChange = (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        setConfirmPassword(event.target.value);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
            <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">
                <Link to="/" className="text-2xl font-bold text-blue-700">
                    RealEstate
                </Link>

                <h1 className="mt-6 text-2xl font-bold text-gray-900">
                    Reset Your Password
                </h1>

                <p className="mt-2 text-gray-600">
                    Enter your new password below.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <input
                        type="password"
                        placeholder="New password"
                        value={password}
                        onChange={handlePasswordChange}
                        required
                        minLength={6}
                        className="w-full rounded-lg border border-gray-300 p-3"
                    />

                    <input
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        required
                        minLength={6}
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
                        {loading ? "Updating..." : "Reset Password"}
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

export default ResetPassword;