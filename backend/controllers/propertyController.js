const mongoose = require("mongoose");
const Property = require("../models/Property");

// CREATE A NEW PROPERTY
const createProperty = async (req, res) => {
    try {
        const {
            title,
            description,
            propertyType,
            listingType,
            price,
            location,
            bedrooms,
            bathrooms,
            area
        } = req.body;

        let parsedLocation;

        try {
            parsedLocation =
                typeof location === "string"
                    ? JSON.parse(location)
                    : location;
        } catch (error) {
            return res.status(400).json({
                message: "Invalid location data"
            });
        }

        const property = await Property.create({
            title,
            description,
            propertyType,
            listingType,
            price,
            location: parsedLocation,
            bedrooms,
            bathrooms,
            area,
            images: req.imageUrls || [],
            owner: req.user.id
        });

        res.status(201).json({
            message: "Property created successfully",
            property
        });

    } catch (error) {
        console.error("Create property error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

// GET ALL PROPERTIES WITH FILTERS
const getAllProperties = async (req, res) => {
    try {
        const {
            minPrice,
            maxPrice,
            propertyType,
            location,
            minArea,
            maxArea
        } = req.query;

        const filter = {};

        // PRICE FILTER
        if (minPrice !== undefined || maxPrice !== undefined) {
            const priceFilter = {};

            if (minPrice !== undefined) {
                const min = Number(minPrice);

                if (!Number.isFinite(min) || min < 0) {
                    return res.status(400).json({
                        message: "Invalid minimum price"
                    });
                }

                priceFilter.$gte = min;
            }

            if (maxPrice !== undefined) {
                const max = Number(maxPrice);

                if (!Number.isFinite(max) || max < 0) {
                    return res.status(400).json({
                        message: "Invalid maximum price"
                    });
                }

                priceFilter.$lte = max;
            }

            if (
                priceFilter.$gte !== undefined &&
                priceFilter.$lte !== undefined &&
                priceFilter.$gte > priceFilter.$lte
            ) {
                return res.status(400).json({
                    message: "Minimum price cannot exceed maximum price"
                });
            }

            filter.price = priceFilter;
        }

        // PROPERTY TYPE FILTER
        if (propertyType) {
            const allowedTypes = [
                "apartment",
                "house",
                "villa",
                "plot",
                "commercial"
            ];

            if (!allowedTypes.includes(propertyType)) {
                return res.status(400).json({
                    message: "Invalid property type"
                });
            }

            filter.propertyType = propertyType;
        }

        // LOCATION FILTER
        if (location && location.trim()) {
            const searchLocation = location.trim().replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );

            filter.$or = [
                {
                    "location.address": {
                        $regex: searchLocation,
                        $options: "i"
                    }
                },
                {
                    "location.city": {
                        $regex: searchLocation,
                        $options: "i"
                    }
                },
                {
                    "location.state": {
                        $regex: searchLocation,
                        $options: "i"
                    }
                },
                {
                    "location.pincode": {
                        $regex: searchLocation,
                        $options: "i"
                    }
                }
            ];
        }

        // AREA FILTER
        if (minArea !== undefined || maxArea !== undefined) {
            const areaFilter = {};

            if (minArea !== undefined) {
                const min = Number(minArea);

                if (!Number.isFinite(min) || min < 0) {
                    return res.status(400).json({
                        message: "Invalid minimum area"
                    });
                }

                areaFilter.$gte = min;
            }

            if (maxArea !== undefined) {
                const max = Number(maxArea);

                if (!Number.isFinite(max) || max < 0) {
                    return res.status(400).json({
                        message: "Invalid maximum area"
                    });
                }

                areaFilter.$lte = max;
            }

            if (
                areaFilter.$gte !== undefined &&
                areaFilter.$lte !== undefined &&
                areaFilter.$gte > areaFilter.$lte
            ) {
                return res.status(400).json({
                    message: "Minimum area cannot exceed maximum area"
                });
            }

            filter.area = areaFilter;
        }

        const properties = await Property.find(filter)
            .populate("owner", "name")
            .sort({ createdAt: -1 });

        res.status(200).json({
            count: properties.length,
            properties
        });

    } catch (error) {
        console.error("Get properties error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

// GET MY PROPERTIES (LOGGED-IN USER ONLY)
const getMyProperties = async (req, res) => {
    try {
        const properties = await Property.find({
            owner: req.user.id
        })
            .populate("owner", "name")
            .sort({ createdAt: -1 });

        res.status(200).json({
            count: properties.length,
            properties
        });

    } catch (error) {
        console.error("Get my properties error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

// GET SINGLE PROPERTY
const getSingleProperty = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid property ID"
            });
        }

        const property = await Property.findById(id)
            .populate("owner", "name");

        if (!property) {
            return res.status(404).json({
                message: "Property not found"
            });
        }

        res.status(200).json({
            property
        });

    } catch (error) {
        console.error("Get single property error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

// UPDATE PROPERTY (OWNER ONLY)
const updateProperty = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid property ID"
            });
        }

        const property = await Property.findById(id);

        if (!property) {
            return res.status(404).json({
                message: "Property not found"
            });
        }

        if (property.owner.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                message: "You are not authorized to update this property"
            });
        }

        const allowedFields = [
            "title",
            "description",
            "propertyType",
            "listingType",
            "price",
            "location",
            "bedrooms",
            "bathrooms",
            "area"
        ];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                property[field] = req.body[field];
            }
        });

        const updatedProperty = await property.save();

        res.status(200).json({
            message: "Property updated successfully",
            property: updatedProperty
        });

    } catch (error) {
        console.error("Update property error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

// DELETE PROPERTY (OWNER ONLY)
const deleteProperty = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid property ID"
            });
        }

        const property = await Property.findById(id);

        if (!property) {
            return res.status(404).json({
                message: "Property not found"
            });
        }

        if (property.owner.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                message: "You are not authorized to delete this property"
            });
        }

        await property.deleteOne();

        res.status(200).json({
            message: "Property deleted successfully"
        });

    } catch (error) {
        console.error("Delete property error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    createProperty,
    getAllProperties,
    getMyProperties,
    getSingleProperty,
    updateProperty,
    deleteProperty
};
