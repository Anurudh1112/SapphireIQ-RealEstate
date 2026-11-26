import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { getPropertyById, updateProperty } from "../services/propertyService";
import api from "../services/api";
import type { Property } from "../types/property";

function EditProperty() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: "",
        description: "",
        propertyType: "apartment",
        listingType: "sale",
        price: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        bedrooms: "0",
        bathrooms: "0",
        area: ""
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const loadProperty = async () => {
            if (!id) {
                setError("Invalid property ID.");
                setLoading(false);
                return;
            }

            const token = localStorage.getItem("token");

            if (!token) {
                setError("Please log in before editing a property.");
                setLoading(false);
                return;
            }

            try {
                const [propertyResponse, userResponse] = await Promise.all([
                    getPropertyById(id),
                    api.get("/users/me")
                ]);

                const data = propertyResponse.data;
                const property: Property = data.property || data;
                const user = userResponse.data.user || userResponse.data;

                const currentUserId = user._id || user.id;
                const ownerId =
                    typeof property.owner === "object"
                        ? property.owner?._id
                        : property.owner;

                if (!currentUserId || currentUserId !== ownerId) {
                    setError("You are not allowed to edit this property.");
                    return;
                }

                setAuthorized(true);

                setForm({
                    title: property.title,
                    description: property.description,
                    propertyType: property.propertyType,
                    listingType: property.listingType,
                    price: String(property.price),
                    address: property.location.address,
                    city: property.location.city,
                    state: property.location.state,
                    pincode: property.location.pincode,
                    bedrooms: String(property.bedrooms ?? 0),
                    bathrooms: String(property.bathrooms ?? 0),
                    area: String(property.area)
                });
            } catch (err: any) {
                setError(
                    err.response?.data?.message ||
                    "Unable to load property details."
                );
            } finally {
                setLoading(false);
            }
        };

        loadProperty();
    }, [id]);

    const handleChange = (
        event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        setForm({
            ...form,
            [event.target.name]: event.target.value
        });
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!id || !authorized) {
            setError("You are not authorized to update this property.");
            return;
        }

        try {
            setSaving(true);
            setError("");

            await updateProperty(id, {
                title: form.title,
                description: form.description,
                propertyType: form.propertyType as Property["propertyType"],
                listingType: form.listingType as Property["listingType"],
                price: Number(form.price),
                location: {
                    address: form.address,
                    city: form.city,
                    state: form.state,
                    pincode: form.pincode
                },
                bedrooms: Number(form.bedrooms),
                bathrooms: Number(form.bathrooms),
                area: Number(form.area)
            });

            alert("Property updated successfully.");
            navigate(`/properties/${id}`);
        } catch (err: any) {
            setError(
                err.response?.data?.message || "Unable to update property."
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <p className="p-10 text-center">Loading property...</p>;
    }

    if (error && !authorized) {
        return (
            <div className="p-10 text-center">
                <p className="text-red-600">{error}</p>
                <Link to="/" className="mt-4 inline-block text-blue-600">
                    Back to Home
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 px-6 py-10">
            <div className="mx-auto max-w-3xl">
                <Link
                    to={`/properties/${id}`}
                    className="font-medium text-blue-600 hover:underline"
                >
                    ← Back to Property
                </Link>

                <div className="mt-6 rounded-xl bg-white p-6 shadow-sm sm:p-8">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Edit Property
                    </h1>

                    {error && (
                        <p className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                            {error}
                        </p>
                    )}

                    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                        <div>
                            <label className="mb-2 block font-medium">
                                Property title
                            </label>
                            <input
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border border-gray-300 p-3"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block font-medium">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                required
                                rows={4}
                                className="w-full rounded-lg border border-gray-300 p-3"
                            />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 block font-medium">
                                    Property type
                                </label>
                                <select
                                    name="propertyType"
                                    value={form.propertyType}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 p-3"
                                >
                                    <option value="apartment">Apartment</option>
                                    <option value="house">House</option>
                                    <option value="villa">Villa</option>
                                    <option value="plot">Plot</option>
                                    <option value="commercial">Commercial</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block font-medium">
                                    Listing type
                                </label>
                                <select
                                    name="listingType"
                                    value={form.listingType}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 p-3"
                                >
                                    <option value="sale">For Sale</option>
                                    <option value="rent">For Rent</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block font-medium">
                                Price (₹)
                            </label>
                            <input
                                type="number"
                                name="price"
                                min="1"
                                value={form.price}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border border-gray-300 p-3"
                            />
                        </div>

                        <div>
                            <h2 className="mb-3 text-lg font-semibold">
                                Property location
                            </h2>

                            <div className="space-y-3">
                                <input
                                    name="address"
                                    value={form.address}
                                    onChange={handleChange}
                                    required
                                    placeholder="Street address"
                                    className="w-full rounded-lg border border-gray-300 p-3"
                                />

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <input
                                        name="city"
                                        value={form.city}
                                        onChange={handleChange}
                                        required
                                        placeholder="City"
                                        className="w-full rounded-lg border border-gray-300 p-3"
                                    />

                                    <input
                                        name="state"
                                        value={form.state}
                                        onChange={handleChange}
                                        required
                                        placeholder="State"
                                        className="w-full rounded-lg border border-gray-300 p-3"
                                    />

                                    <input
                                        name="pincode"
                                        value={form.pincode}
                                        onChange={handleChange}
                                        required
                                        placeholder="PIN code"
                                        className="w-full rounded-lg border border-gray-300 p-3"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <div>
                                <label className="mb-2 block font-medium">
                                    Bedrooms
                                </label>
                                <input
                                    type="number"
                                    name="bedrooms"
                                    min="0"
                                    value={form.bedrooms}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 p-3"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block font-medium">
                                    Bathrooms
                                </label>
                                <input
                                    type="number"
                                    name="bathrooms"
                                    min="0"
                                    value={form.bathrooms}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 p-3"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block font-medium">
                                    Area (sq. ft.)
                                </label>
                                <input
                                    type="number"
                                    name="area"
                                    min="1"
                                    value={form.area}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border border-gray-300 p-3"
                                />
                            </div>
                        </div>

                        <p className="text-sm text-gray-500">
                            Existing property images are kept unchanged in this
                            edit form.
                        </p>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving ? "Saving Changes..." : "Update Property"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default EditProperty;