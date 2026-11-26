export interface Property {
    _id: string;
    title: string;
    description: string;
    propertyType: "apartment" | "house" | "villa" | "plot" | "commercial";
    listingType: "sale" | "rent";
    price: number;

    location: {
        address: string;
        city: string;
        state: string;
        pincode: string;
    };

    bedrooms: number;
    bathrooms: number;
    area: number;
    images: string[];

    owner: string | {
        _id?: string;
        name: string;
    };

    createdAt?: string;
    updatedAt?: string;
}

export interface PropertyFilters {
    minPrice?: number;
    maxPrice?: number;
    propertyType?: string;
    location?: string;
    minArea?: number;
    maxArea?: number;
}