import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { createProperty } from "../services/propertyService";

function AddProperty() {
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

    const [images, setImages] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (
        event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        setForm({
            ...form,
            [event.target.name]: event.target.value
        });
    };

    const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(event.target.files || []);

        if (selectedFiles.length > 4) {
            setError("You can upload a maximum of four images.");
            event.target.value = "";
            setImages([]);
            return;
        }

        setError("");
        setImages(selectedFiles);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");

        if (!localStorage.getItem("token")) {
            setError("Please log in before adding a property.");
            return;
        }

        if (images.length > 4) {
            setError("You can upload a maximum of four images.");
            return;
        }

        try {
            setLoading(true);

            const formData = new FormData();

            formData.append("title", form.title);
            formData.append("description", form.description);
            formData.append("propertyType", form.propertyType);
            formData.append("listingType", form.listingType);
            formData.append("price", form.price);

            // Send location as a JSON string
            const locationData = {
                address: form.address,
                city: form.city,
                state: form.state,
                pincode: form.pincode
            };

            formData.append("location", JSON.stringify(locationData));

            formData.append("bedrooms", form.bedrooms);
            formData.append("bathrooms", form.bathrooms);
            formData.append("area", form.area);

            // Append selected images
            images.forEach((image) => {
                formData.append("images", image);
            });

            await createProperty(formData);

            alert("Property created successfully.");
            navigate("/");
        } catch (err: any) {
            setError(
                err.response?.data?.message || "Unable to create property."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 px-6 py-10">
            <div className="mx-auto max-w-3xl">
                <Link to="/" className="font-medium text-blue-600 hover:underline">
                    ← Back to Home
                </Link>

                <div className="mt-6 rounded-xl bg-white p-6 shadow-sm sm:p-8">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Add New Property
                    </h1>

                    <p className="mt-2 text-gray-600">
                        Enter the property details and upload up to four images.
                    </p>

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
                                placeholder="Enter property title"
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
                                placeholder="Describe the property"
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

                        <div>
                            <label className="mb-2 block font-medium">
                                Property images (maximum 4)
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageChange}
                                className="w-full rounded-lg border border-gray-300 p-3"
                            />
                            <p className="mt-2 text-sm text-gray-500">
                                Selected: {images.length} of 4 images
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? "Creating Property..." : "Create Property"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AddProperty;