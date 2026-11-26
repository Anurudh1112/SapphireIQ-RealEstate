import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link } from "react-router-dom";

import { getAllProperties } from "../services/propertyService";
import { getLoggedInUser, logoutUser } from "../services/authService";
import type { AuthUser } from "../services/authService";
import type { Property, PropertyFilters } from "../types/property";

function Home() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

    const [filters, setFilters] = useState({
        minPrice: "",
        maxPrice: "",
        propertyType: "",
        location: "",
        minArea: "",
        maxArea: ""
    });

    const fetchProperties = async (searchFilters?: PropertyFilters) => {
        try {
            setLoading(true);
            setError("");

            const response = await getAllProperties(searchFilters);
            const data = response.data;

            setProperties(
                Array.isArray(data) ? data : data.properties || []
            );
        } catch (err: any) {
            setError(
                err.response?.data?.message || "Unable to load properties."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProperties();

        const token = localStorage.getItem("token");

        if (token) {
            getLoggedInUser()
                .then((response) => {
                    setCurrentUser(response.data.user);
                })
                .catch(() => {
                    logoutUser();
                    setCurrentUser(null);
                });
        }
    }, []);

    const handleLogout = () => {
        logoutUser();
        setCurrentUser(null);
    };

    const handleFilterChange = (
        event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setFilters({
            ...filters,
            [event.target.name]: event.target.value
        });
    };

    const handleSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const searchFilters: PropertyFilters = {};

        if (filters.minPrice) {
            searchFilters.minPrice = Number(filters.minPrice);
        }

        if (filters.maxPrice) {
            searchFilters.maxPrice = Number(filters.maxPrice);
        }

        if (filters.propertyType) {
            searchFilters.propertyType = filters.propertyType;
        }

        if (filters.location.trim()) {
            searchFilters.location = filters.location.trim();
        }

        if (filters.minArea) {
            searchFilters.minArea = Number(filters.minArea);
        }

        if (filters.maxArea) {
            searchFilters.maxArea = Number(filters.maxArea);
        }

        fetchProperties(searchFilters);
    };

    const handleReset = () => {
        setFilters({
            minPrice: "",
            maxPrice: "",
            propertyType: "",
            location: "",
            minArea: "",
            maxArea: ""
        });

        fetchProperties();
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }).format(price);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">
                    <Link to="/" className="text-2xl font-bold text-blue-700">
                        RealEstate
                    </Link>

                    <div className="flex flex-wrap items-center gap-3">
                        {currentUser ? (
                            <>
                                <span className="text-sm text-gray-700">
                                    Hello, {currentUser.name}
                                </span>

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-100"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-100"
                                >
                                    Login
                                </Link>

                                <Link
                                    to="/register"
                                    className="rounded-lg border border-blue-600 px-4 py-2.5 font-medium text-blue-600 hover:bg-blue-50"
                                >
                                    Register
                                </Link>
                            </>
                        )}

                        <Link
                            to="/properties/new"
                            className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
                        >
                            Add Property
                        </Link>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-6 py-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Find Your Perfect Property
                    </h1>

                    <p className="mt-2 text-gray-600">
                        Explore properties available for sale and rent.
                    </p>
                </div>

                <form
                    onSubmit={handleSearch}
                    className="mb-10 rounded-xl bg-white p-6 shadow-sm"
                >
                    <h2 className="mb-5 text-xl font-semibold">
                        Filter Properties
                    </h2>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <input
                            type="number"
                            name="minPrice"
                            placeholder="Minimum price"
                            value={filters.minPrice}
                            onChange={handleFilterChange}
                            className="rounded-lg border border-gray-300 p-3"
                        />

                        <input
                            type="number"
                            name="maxPrice"
                            placeholder="Maximum price"
                            value={filters.maxPrice}
                            onChange={handleFilterChange}
                            className="rounded-lg border border-gray-300 p-3"
                        />

                        <select
                            name="propertyType"
                            value={filters.propertyType}
                            onChange={handleFilterChange}
                            className="rounded-lg border border-gray-300 p-3"
                        >
                            <option value="">All property types</option>
                            <option value="apartment">Apartment</option>
                            <option value="house">House</option>
                            <option value="villa">Villa</option>
                            <option value="plot">Plot</option>
                            <option value="commercial">Commercial</option>
                        </select>

                        <input
                            type="text"
                            name="location"
                            placeholder="City, state or location"
                            value={filters.location}
                            onChange={handleFilterChange}
                            className="rounded-lg border border-gray-300 p-3"
                        />

                        <input
                            type="number"
                            name="minArea"
                            placeholder="Minimum area"
                            value={filters.minArea}
                            onChange={handleFilterChange}
                            className="rounded-lg border border-gray-300 p-3"
                        />

                        <input
                            type="number"
                            name="maxArea"
                            placeholder="Maximum area"
                            value={filters.maxArea}
                            onChange={handleFilterChange}
                            className="rounded-lg border border-gray-300 p-3"
                        />
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                        <button
                            type="submit"
                            className="rounded-lg bg-blue-600 px-6 py-2.5 text-white hover:bg-blue-700"
                        >
                            Apply Filters
                        </button>

                        <button
                            type="button"
                            onClick={handleReset}
                            className="rounded-lg border border-gray-300 px-6 py-2.5 text-gray-700 hover:bg-gray-100"
                        >
                            Reset
                        </button>
                    </div>
                </form>

                <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-gray-900">
                        Available Properties
                    </h2>

                    <span className="text-sm text-gray-500">
                        {properties.length} properties found
                    </span>
                </div>

                {loading && (
                    <p className="py-10 text-center text-gray-600">
                        Loading properties...
                    </p>
                )}

                {error && (
                    <p className="rounded-lg bg-red-50 p-4 text-red-600">
                        {error}
                    </p>
                )}

                {!loading && !error && properties.length === 0 && (
                    <p className="rounded-lg bg-white p-10 text-center text-gray-600">
                        No properties found. Try changing your filters.
                    </p>
                )}

                {!loading && !error && properties.length > 0 && (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {properties.map((property) => (
                            <article
                                key={property._id}
                                className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md"
                            >
                                {property.images?.[0] ? (
                                    <img
                                        src={property.images[0]}
                                        alt={property.title}
                                        className="h-52 w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-52 items-center justify-center bg-gray-200 text-gray-500">
                                        No image available
                                    </div>
                                )}

                                <div className="p-5">
                                    <div className="mb-2 flex items-center justify-between gap-2">
                                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium capitalize text-blue-700">
                                            {property.propertyType}
                                        </span>

                                        <span className="text-xs font-medium uppercase text-gray-500">
                                            For {property.listingType}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {property.title}
                                    </h3>

                                    <p className="mt-1 text-sm text-gray-500">
                                        {property.location.city},{" "}
                                        {property.location.state}
                                    </p>

                                    <p className="mt-3 text-xl font-bold text-blue-700">
                                        {formatPrice(property.price)}
                                    </p>

                                    <p className="mt-2 text-sm text-gray-600">
                                        {property.area} sq. ft. ·{" "}
                                        {property.bedrooms} bedrooms ·{" "}
                                        {property.bathrooms} bathrooms
                                    </p>

                                    <Link
                                        to={`/properties/${property._id}`}
                                        className="mt-5 block rounded-lg bg-gray-900 px-4 py-2.5 text-center font-medium text-white hover:bg-gray-800"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default Home;