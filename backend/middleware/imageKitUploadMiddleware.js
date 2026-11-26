const imagekit = require("../config/imagekit");

// Upload property images to ImageKit
const uploadToImageKit = async (req, res, next) => {
    try {
        // If no images were uploaded, continue
        if (!req.files || req.files.length === 0) {
            req.imageUrls = [];
            return next();
        }

        // Upload all received images to ImageKit
        const uploadedImages = await Promise.all(
            req.files.map((file) =>
                imagekit.upload({
                    file: file.buffer,
                    fileName: file.originalname,
                    folder: "/sapphireiq/properties"
                })
            )
        );

        // Extract the hosted image URLs
        req.imageUrls = uploadedImages.map(
            (image) => image.url
        );

        next();

    } catch (error) {
        console.error("ImageKit upload error:", error);

        res.status(500).json({
            message: "Image upload failed"
        });
    }
};

module.exports = uploadToImageKit;