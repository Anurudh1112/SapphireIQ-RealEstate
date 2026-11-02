
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const transporter = require("../config/email");

// ===============================
// USER REGISTRATION
// ===============================

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Please provide all required fields"
            });
        }

        // Check password length
        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        // Check whether email already exists
        const existingUser = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = await User.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: hashedPassword
        });

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Registration error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ===============================
// USER LOGIN
// ===============================

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check required fields
        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide email and password"
            });
        }

        // Find user by email
        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Compare entered password with hashed password
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Send response
        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ===============================
// GET LOGGED-IN USER PROFILE
// ===============================

const getMe = async (req, res) => {
    try {
        res.status(200).json({
            user: req.user
        });

    } catch (error) {
        console.error("Get profile error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ===============================
// FORGOT PASSWORD
// ===============================

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Check email
        if (!email) {
            return res.status(400).json({
                message: "Please provide your email"
            });
        }

        // Find user
        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (!user) {
            return res.status(404).json({
                message: "No user found with this email"
            });
        }

        // Generate secure random token
        const resetToken = crypto.randomBytes(32).toString("hex");

        // Hash token before saving it
        const hashedToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        // Save hashed token and expiry time
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

        await user.save();

        // Create password reset URL
        const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        // Email content
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "SapphireIQ - Password Reset Request",

            text: `You requested a password reset. Click this link to reset your password: ${resetURL}. This link expires in 10 minutes.`,

            html: `
                <h2>Password Reset Request</h2>

                <p>Hello ${user.name},</p>

                <p>We received a request to reset your password.</p>

                <p>Click the button below to create a new password:</p>

                <a href="${resetURL}"
                   style="
                       display: inline-block;
                       padding: 12px 20px;
                       background-color: #2563eb;
                       color: white;
                       text-decoration: none;
                       border-radius: 5px;
                   ">
                    Reset Password
                </a>

                <p>This link will expire in 10 minutes.</p>

                <p>If you did not request this, please ignore this email.</p>

                <p>Regards,<br>SapphireIQ Team</p>
            `
        };

        // Send email
        try {
            await transporter.sendMail(mailOptions);

        } catch (emailError) {
            // Clear reset token if email fails
            user.resetPasswordToken = null;
            user.resetPasswordExpire = null;

            await user.save();

            throw emailError;
        }

        res.status(200).json({
            message: "Password reset email sent successfully"
        });

    } catch (error) {
        console.error("Forgot password error:", error);

        res.status(500).json({
            message: "Unable to send password reset email"
        });
    }
};


// ===============================
// RESET PASSWORD
// ===============================

const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        // Check new password
        if (!password) {
            return res.status(400).json({
                message: "Please provide a new password"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        // Hash the token received from the URL
        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        // Find user with valid token
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired password reset token"
            });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update user's password
        user.password = hashedPassword;

        // Clear password reset fields
        user.resetPasswordToken = null;
        user.resetPasswordExpire = null;

        await user.save();

        res.status(200).json({
            message: "Password reset successfully"
        });

    } catch (error) {
        console.error("Reset password error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ===============================
// EXPORT CONTROLLERS
// ===============================

module.exports = {
    registerUser,
    loginUser,
    getMe,
    forgotPassword,
    resetPassword
};
