import api from "./api";
import type { Property, PropertyFilters } from "../types/property";

// Get all properties with optional filters
export const getAllProperties = (filters?: PropertyFilters) => {
    return api.get("/properties", {
        params: filters
    });
};

// Get properties created by the logged-in user
export const getMyProperties = () => {
    return api.get("/properties/my");
};

// Get a single property
export const getPropertyById = (id: string) => {
    return api.get(`/properties/${id}`);
};

// Create a property with images
export const createProperty = (formData: FormData) => {
    return api.post("/properties", formData);
};

// Update a property
export const updateProperty = (id: string, propertyData: Partial<Property>) => {
    return api.put(`/properties/${id}`, propertyData);
};

// Delete a property
export const deleteProperty = (id: string) => {
    return api.delete(`/properties/${id}`);
};