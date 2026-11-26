const express = require("express");
const router = express.Router();

const {
    createAppointment,
    getMyAppointments,
    cancelAppointment
} = require("../controllers/appointmentController");

const protect = require("../middleware/authMiddleware");

// Guest booking - no authentication required.
router.post("/guest", createAppointment);

// Logged-in user booking - authentication required.
router.post("/", protect, createAppointment);

// Logged-in user can see their own appointments.
router.get("/my", protect, getMyAppointments);

// Logged-in user can cancel their own appointment.
router.patch("/:id/cancel", protect, cancelAppointment);

module.exports = router;