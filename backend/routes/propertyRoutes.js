const express = require("express");
const router = express.Router();

const {
    createProperty,
    getAllProperties,
    getMyProperties,
    getSingleProperty,
    updateProperty,
    deleteProperty
} = require("../controllers/propertyController");

const protect = require("../middleware/authMiddleware");
const uploadPropertyImages = require("../middleware/uploadMiddleware");
const uploadToImageKit = require("../middleware/imageKitUploadMiddleware");

// Create a new property (protected, with image upload)
router.post(
    "/",
    protect,
    uploadPropertyImages,
    uploadToImageKit,
    createProperty
);

// Get all properties (public)
router.get("/", getAllProperties);

// Get logged-in user's properties (protected)
router.get("/my", protect, getMyProperties);

// Get a single property (public)
router.get("/:id", getSingleProperty);

// Update property (owner only)
router.put("/:id", protect, updateProperty);

// Delete property (owner only)
router.delete("/:id", protect, deleteProperty);

module.exports = router;