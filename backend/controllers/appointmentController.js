
const mongoose = require("mongoose");
const Appointment = require("../models/Appointment");
const Property = require("../models/Property");

// CREATE APPOINTMENT (GUEST OR LOGGED-IN USER)
const createAppointment = async (req, res) => {
    try {
        const {
            propertyId,
            name,
            email,
            phone,
            appointmentDate,
            message
        } = req.body;

        if (
            !propertyId ||
            !name?.trim() ||
            !email?.trim() ||
            !phone?.trim() ||
            !appointmentDate
        ) {
            return res.status(400).json({
                message: "Please provide all required appointment details"
            });
        }

        if (!mongoose.isValidObjectId(propertyId)) {
            return res.status(400).json({
                message: "Invalid property ID"
            });
        }

        const property = await Property.findById(propertyId);

        if (!property) {
            return res.status(404).json({
                message: "Property not found"
            });
        }

        const parsedDate = new Date(appointmentDate);

        if (Number.isNaN(parsedDate.getTime())) {
            return res.status(400).json({
                message: "Please provide a valid appointment date"
            });
        }

        const appointment = await Appointment.create({
            property: propertyId,
            user: req.user ? req.user._id : null,
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            appointmentDate: parsedDate,
            message: message?.trim() || ""
        });

        const populatedAppointment = await Appointment.findById(
            appointment._id
        ).populate("property", "title images location");

        return res.status(201).json({
            message: "Appointment booked successfully",
            appointment: populatedAppointment
        });

    } catch (error) {
        console.error("Create appointment error:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};


// GET LOGGED-IN USER'S APPOINTMENTS
const getMyAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({
            user: req.user._id
        })
            .populate("property", "title images location price")
            .sort({ appointmentDate: 1 });

        return res.status(200).json({
            count: appointments.length,
            appointments
        });

    } catch (error) {
        console.error("Get appointments error:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};


// CANCEL AN APPOINTMENT (OWNER ONLY)
const cancelAppointment = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid appointment ID"
            });
        }

        const appointment = await Appointment.findById(id);

        if (!appointment) {
            return res.status(404).json({
                message: "Appointment not found"
            });
        }

        if (
            !appointment.user ||
            appointment.user.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                message: "You are not authorized to cancel this appointment"
            });
        }

        if (appointment.status === "cancelled") {
            return res.status(400).json({
                message: "Appointment is already cancelled"
            });
        }

        appointment.status = "cancelled";
        await appointment.save();

        return res.status(200).json({
            message: "Appointment cancelled successfully",
            appointment
        });

    } catch (error) {
        console.error("Cancel appointment error:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {
    createAppointment,
    getMyAppointments,
    cancelAppointment
};
