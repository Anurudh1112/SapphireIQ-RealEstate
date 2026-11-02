
const express = require("express");
const router = express.Router();

const {
    registerUser,
    loginUser,
    getMe,
    forgotPassword,
    resetPassword
} = require("../controllers/userController");

const protect = require("../middleware/authMiddleware");

// ===============================
// USER AUTHENTICATION ROUTES
// ===============================

// User registration
router.post("/register", registerUser);

// User login
router.post("/login", loginUser);

// Get logged-in user profile (protected route)
router.get("/me", protect, getMe);


// ===============================
// PASSWORD RESET ROUTES
// ===============================

// Request password reset email
router.post("/forgot-password", forgotPassword);

// Reset password using token
router.post("/reset-password/:token", resetPassword);


module.exports = router;
