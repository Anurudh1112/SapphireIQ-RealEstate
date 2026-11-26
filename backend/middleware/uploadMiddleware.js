const multer = require("multer");

// Store uploaded images temporarily in memory
const storage = multer.memoryStorage();

// Accept image files only
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed"), false);
    }
};

// Configure Multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        files: 4,
        fileSize: 5 * 1024 * 1024 // 5 MB per image
    }
});

// Allow a maximum of 4 property images
const uploadPropertyImages = upload.array("images", 4);

module.exports = uploadPropertyImages;