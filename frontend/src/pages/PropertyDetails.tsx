import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { deleteProperty, getPropertyById } from "../services/propertyService";
import api from "../services/api";
import type { Property } from "../types/property";

function PropertyDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [property, setProperty] = useState<Property | null>(null);
    const [currentUserId, setCurrentUserId] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [bookingData, setBookingData] = useState({
        name: "",
        email: "",
        phone: "",
        appointmentDate: "",
        message: ""
    });

    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingMessage, setBookingMessage] = useState("");
    const [bookingError, setBookingError] = useState("");

    useEffect(() => {
        const fetchDetails = async () => {
            if (!id) {
                setError("Invalid property ID.");
                setLoading(false);
                return;
            }

            try {
                const propertyResponse = await getPropertyById(id);
                const data = propertyResponse.data;

                setProperty(data.property || data);

                const token = localStorage.getItem("token");

                if (token) {
                    try {
                        const userResponse = await api.get("/users/me");
                        const user = userResponse.data.user || userResponse.data;

                        setCurrentUserId(user._id || user.id || "");
                    } catch {
                        setCurrentUserId("");
                    }
                }
            } catch (err: any) {
                setError(
                    err.response?.data?.message || "Unable to load property."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [id]);

    const ownerId =
        property && typeof property.owner === "object"
            ? property.owner?._id
            : property?.owner;

    const isOwner =
        Boolean(currentUserId) &&
        Boolean(ownerId) &&
        currentUserId === ownerId;

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }).format(price);
    };

    const handleDelete = async () => {
        if (!id || !window.confirm("Are you sure you want to delete this property?")) {
            return;
        }

        try {
            await deleteProperty(id);
            alert("Property deleted successfully.");
            navigate("/");
        } catch (err: any) {
            alert(
                err.response?.data?.message || "Unable to delete property."
            );
        }
    };

    const handleBookingChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setBookingData({
            ...bookingData,
            [e.target.name]: e.target.value
        });
    };

    const handleBookingSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        if (!id) {
            setBookingError("Invalid property ID.");
            return;
        }

        try {
            setBookingLoading(true);
            setBookingError("");
            setBookingMessage("");

            // Select the booking route based on login status.
            const token = localStorage.getItem("token");
            const endpoint = token
                ? "/appointments"
                : "/appointments/guest";

            await api.post(endpoint, {
                propertyId: id,
                ...bookingData
            });

            setBookingMessage(
                "Your viewing appointment has been booked successfully! Its status is pending."
            );

            setBookingData({
                name: "",
                email: "",
                phone: "",
                appointmentDate: "",
                message: ""
            });
        } catch (err: any) {
            setBookingError(
                err.response?.data?.message ||
                "Unable to book your appointment. Please try again."
            );
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) {
        return <p className="p-10 text-center">Loading property...</p>;
    }

    if (error || !property) {
        return (
            <div className="p-10 text-center">
                <p className="text-red-600">{error || "Property not found."}</p>
                <Link to="/" className="mt-4 inline-block text-blue-600">
                    Back to Home
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white px-6 py-5 shadow-sm">
                <div className="mx-auto flex max-w-6xl items-center justify-between">
                    <Link to="/" className="text-2xl font-bold text-blue-700">
                        RealEstate
                    </Link>

                    <Link to="/" className="text-blue-600 hover:underline">
                        Back to Properties
                    </Link>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-6 py-10">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {property.title}
                        </h1>

                        <p className="mt-2 text-gray-600">
                            {property.location.address},{" "}
                            {property.location.city},{" "}
                            {property.location.state} -{" "}
                            {property.location.pincode}
                        </p>
                    </div>

                    {isOwner && (
                        <div className="flex gap-3">
                            <Link
                                to={`/properties/${property._id}/edit`}
                                className="rounded-lg bg-blue-600 px-5 py-2.5 text-white hover:bg-blue-700"
                            >
                                Edit Property
                            </Link>

                            <button
                                onClick={handleDelete}
                                className="rounded-lg bg-red-600 px-5 py-2.5 text-white hover:bg-red-700"
                            >
                                Delete Property
                            </button>
                        </div>
                    )}
                </div>

                <div className="mb-8 grid gap-4 sm:grid-cols-2">
                    {property.images?.length > 0 ? (
                        property.images.map((image, index) => (
                            <img
                                key={index}
                                src={image}
                                alt={`${property.title} ${index + 1}`}
                                className="h-72 w-full rounded-xl object-cover"
                            />
                        ))
                    ) : (
                        <div className="flex h-72 items-center justify-center rounded-xl bg-gray-200 text-gray-500 sm:col-span-2">
                            No property images available
                        </div>
                    )}
                </div>

                <section className="rounded-xl bg-white p-6 shadow-sm">
                    <p className="text-2xl font-bold text-blue-700">
                        {formatPrice(property.price)}
                    </p>

                    <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <p className="text-sm text-gray-500">Property type</p>
                            <p className="font-semibold capitalize">
                                {property.propertyType}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Listing type</p>
                            <p className="font-semibold capitalize">
                                {property.listingType}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Area</p>
                            <p className="font-semibold">{property.area} sq. ft.</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Bedrooms / Bathrooms</p>
                            <p className="font-semibold">
                                {property.bedrooms} / {property.bathrooms}
                            </p>
                        </div>
                    </div>

                    <hr className="my-6" />

                    <h2 className="mb-3 text-xl font-semibold">
                        Description
                    </h2>

                    <p className="whitespace-pre-line leading-7 text-gray-700">
                        {property.description}
                    </p>
                </section>

                <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Book a Property Viewing
                    </h2>

                    <p className="mt-2 text-gray-600">
                        Interested in this property? Schedule a viewing with us.
                        You can book as a guest or while logged in.
                    </p>

                    {bookingMessage && (
                        <div className="mt-5 rounded-lg bg-green-50 p-4 text-green-700">
                            {bookingMessage}
                        </div>
                    )}

                    {bookingError && (
                        <div className="mt-5 rounded-lg bg-red-50 p-4 text-red-700">
                            {bookingError}
                        </div>
                    )}

                    <form
                        onSubmit={handleBookingSubmit}
                        className="mt-6 grid gap-5 sm:grid-cols-2"
                    >
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={bookingData.name}
                                onChange={handleBookingChange}
                                required
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                                placeholder="Enter your full name"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={bookingData.email}
                                onChange={handleBookingChange}
                                required
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                                placeholder="Enter your email"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={bookingData.phone}
                                onChange={handleBookingChange}
                                required
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                                placeholder="Enter your phone number"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Preferred Date and Time
                            </label>
                            <input
                                type="datetime-local"
                                name="appointmentDate"
                                value={bookingData.appointmentDate}
                                onChange={handleBookingChange}
                                min={new Date().toISOString().slice(0, 16)}
                                required
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Message (Optional)
                            </label>
                            <textarea
                                name="message"
                                value={bookingData.message}
                                onChange={handleBookingChange}
                                rows={4}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                                placeholder="Any additional details..."
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <button
                                type="submit"
                                disabled={bookingLoading}
                                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {bookingLoading
                                    ? "Booking..."
                                    : "Book Viewing"}
                            </button>
                        </div>
                    </form>
                </section>
            </main>
        </div>
    );
}

export default PropertyDetails;