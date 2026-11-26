import { useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value
        });
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            setLoading(true);
            setError("");
            setSuccess("");

            await registerUser(formData);

            setSuccess("Registration successful! Please log in.");

            setTimeout(() => {
                navigate("/login");
            }, 1200);

        } catch (err: any) {
            setError(
                err.response?.data?.message || "Registration failed."
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
                    Create your account
                </h1>

                <p className="mt-2 text-gray-600">
                    Register to start listing properties.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <input
                        type="text"
                        name="name"
                        placeholder="Full name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full rounded-lg border border-gray-300 p-3"
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="Email address"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full rounded-lg border border-gray-300 p-3"
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password (minimum 6 characters)"
                        value={formData.password}
                        onChange={handleChange}
                        minLength={6}
                        required
                        className="w-full rounded-lg border border-gray-300 p-3"
                    />

                    {error && (
                        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                            {error}
                        </p>
                    )}

                    {success && (
                        <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                            {success}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                    >
                        {loading ? "Creating account..." : "Register"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="font-medium text-blue-600 hover:underline"
                    >
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Register;