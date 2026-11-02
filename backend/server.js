
const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// User routes
app.use("/api/users", userRoutes);

// Test route
app.get("/", (req, res) => {
    res.send("SapphireIQ RealEstate API is running!");
});

// Server port
const PORT = process.env.PORT || 5000;

// Connect database and start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
