import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { getMyProperties } from "../services/propertyService";
import type { Property } from "../types/property";

interface AppointmentProperty {
    _id: string;
    title: string;
    images?: string[];
    location?: {
        address?: string;
        city?: string;
        state?: string;
    };
    price?: number;
}

interface Appointment {
    _id: string;
    property: AppointmentProperty | null;
    name: string;
    email: string;
    phone: string;
    appointmentDate: string;
    message?: string;
    status: "pending" | "confirmed" | "cancelled";
}

function Dashboard() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    const fetchDashboardData = async () => {
        try {
            setError("");

            const [propertyResponse, appointmentResponse] = await Promise.all([
                getMyProperties(),
                api.get("/appointments/my")
            ]);

            setProperties(propertyResponse.data.properties || []);
            setAppointments(appointmentResponse.data.appointments || []);
        } catch (error) {
            console.error("Dashboard loading error:", error);
            setError("Unable to load your dashboard. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleCancelAppointment = async (appointmentId: string) => {
        const confirmed = window.confirm(
            "Are you sure you want to cancel this appointment?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setCancellingId(appointmentId);

            await api.patch(`/appointments/${appointmentId}/cancel`);

            setAppointments((currentAppointments) =>
                currentAppointments.map((appointment) =>
                    appointment._id === appointmentId
                        ? { ...appointment, status: "cancelled" }
                        : appointment
                )
            );
        } catch (error) {
            console.error("Cancel appointment error:", error);
            alert("Unable to cancel this appointment. Please try again.");
        } finally {
            setCancellingId(null);
        }
    };

    const getStatusStyle = (status: Appointment["status"]) => {
        switch (status) {
            case "confirmed":
                return "bg-green-100 text-green-700";
            case "cancelled":
                return "bg-red-100 text-red-700";
            default:
                return "bg-yellow-100 text-yellow-700";
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-gray-600">Loading your dashboard...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="border-b bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5">
                    <Link
                        to="/"
                        className="text-xl font-bold text-blue-700"
                    >
                        RealEstate
                    </Link>

                    <Link
                        to="/"
                        className="text-sm font-medium text-gray-600 hover:text-blue-700"
                    >
                        Back to Home
                    </Link>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8">
                <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            My Dashboard
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Manage your property listings and appointments.
                        </p>
                    </div>

                    <Link
                        to="/properties/new"
                        className="rounded-lg bg-blue-600 px-5 py-3 text-center font-medium text-white hover:bg-blue-700"
                    >
                        + Add Property
                    </Link>
                </div>

                {error && (
                    <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
                        {error}
                        <button
                            onClick={fetchDashboardData}
                            className="ml-3 font-semibold underline"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {/* MY LISTINGS */}
                <section className="mb-12">
                    <div className="mb-5 flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900">
                            My Listings
                        </h2>
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                            {properties.length} properties
                        </span>
                    </div>

                    {properties.length === 0 ? (
                        <div className="rounded-xl border border-dashed bg-white p-8 text-center">
                            <h3 className="text-lg font-semibold text-gray-800">
                                You haven't listed any properties yet.
                            </h3>
                            <p className="mt-2 text-gray-500">
                                Add your first property to see it here.
                            </p>
                            <Link
                                to="/properties/new"
                                className="mt-4 inline-block rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
                            >
                                Add Your First Property
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {properties.map((property) => (
                                <div
                                    key={property._id}
                                    className="overflow-hidden rounded-xl border bg-white shadow-sm"
                                >
                                    {property.images?.[0] ? (
                                        <img
                                            src={property.images[0]}
                                            alt={property.title}
                                            className="h-48 w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-48 items-center justify-center bg-gray-200 text-gray-500">
                                            No image available
                                        </div>
                                    )}

                                    <div className="p-5">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {property.title}
                                        </h3>

                                        <p className="mt-1 text-sm text-gray-500">
                                            {property.location.city},{" "}
                                            {property.location.state}
                                        </p>

                                        <p className="mt-3 font-bold text-blue-700">
                                            ₹{property.price.toLocaleString("en-IN")}
                                            {property.listingType === "rent"
                                                ? " / month"
                                                : ""}
                                        </p>

                                        <div className="mt-4 flex gap-3">
                                            <Link
                                                to={`/properties/${property._id}`}
                                                className="flex-1 rounded-lg border border-blue-600 px-3 py-2 text-center text-sm font-medium text-blue-600 hover:bg-blue-50"
                                            >
                                                View
                                            </Link>

                                            <Link
                                                to={`/properties/${property._id}/edit`}
                                                className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
                                            >
                                                Edit
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* MY APPOINTMENTS */}
                <section>
                    <div className="mb-5 flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900">
                            My Appointments
                        </h2>
                        <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700">
                            {appointments.length} appointments
                        </span>
                    </div>

                    {appointments.length === 0 ? (
                        <div className="rounded-xl border border-dashed bg-white p-8 text-center">
                            <h3 className="text-lg font-semibold text-gray-800">
                                No appointments yet.
                            </h3>
                            <p className="mt-2 text-gray-500">
                                Your booked property viewings will appear here.
                            </p>
                            <Link
                                to="/"
                                className="mt-4 inline-block rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
                            >
                                Browse Properties
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {appointments.map((appointment) => (
                                <div
                                    key={appointment._id}
                                    className="rounded-xl border bg-white p-5 shadow-sm"
                                >
                                    <div className="flex flex-col justify-between gap-4 sm:flex-row">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {appointment.property?.title ||
                                                    "Property no longer available"}
                                            </h3>

                                            {appointment.property?.location && (
                                                <p className="mt-1 text-sm text-gray-500">
                                                    {appointment.property.location.city},{" "}
                                                    {appointment.property.location.state}
                                                </p>
                                            )}

                                            <p className="mt-3 text-sm text-gray-600">
                                                <strong>Appointment:</strong>{" "}
                                                {new Date(
                                                    appointment.appointmentDate
                                                ).toLocaleString("en-IN")}
                                            </p>

                                            <p className="mt-1 text-sm text-gray-600">
                                                <strong>Contact:</strong>{" "}
                                                {appointment.name} · {appointment.phone}
                                            </p>

                                            <p className="mt-1 text-sm text-gray-600">
                                                <strong>Email:</strong>{" "}
                                                {appointment.email}
                                            </p>

                                            {appointment.message && (
                                                <p className="mt-2 text-sm text-gray-600">
                                                    <strong>Message:</strong>{" "}
                                                    {appointment.message}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex flex-col items-start gap-3 sm:items-end">
                                            <span
                                                className={`rounded-full px-3 py-1 text-sm font-semibold capitalize ${getStatusStyle(
                                                    appointment.status
                                                )}`}
                                            >
                                                {appointment.status}
                                            </span>

                                            {appointment.status !== "cancelled" && (
                                                <button
                                                    onClick={() =>
                                                        handleCancelAppointment(
                                                            appointment._id
                                                        )
                                                    }
                                                    disabled={
                                                        cancellingId === appointment._id
                                                    }
                                                    className="rounded-lg border border-red-500 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {cancellingId === appointment._id
                                                        ? "Cancelling..."
                                                        : "Cancel Appointment"}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

export default Dashboard;