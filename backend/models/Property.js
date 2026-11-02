const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true
        },

        propertyType: {
            type: String,
            enum: ["apartment", "house", "villa", "plot", "commercial"],
            required: true
        },

        listingType: {
            type: String,
            enum: ["sale", "rent"],
            required: true
        },

        price: {
            type: Number,
            required: true
        },

        location: {
            address: {
                type: String,
                required: true
            },
            city: {
                type: String,
                required: true
            },
            state: {
                type: String,
                required: true
            },
            pincode: {
                type: String,
                required: true
            }
        },

        bedrooms: {
            type: Number,
            default: 0
        },

        bathrooms: {
            type: Number,
            default: 0
        },

        area: {
            type: Number,
            required: true
        },

        images: [{
            type: String
        }],

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

const Property = mongoose.model("Property", propertySchema);

module.exports = Property;