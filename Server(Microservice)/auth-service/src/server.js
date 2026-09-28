const express = require("express");
require("dotenv").config();

const cors = require("cors");
const mongoose = require("mongoose");

const { connectRedis } = require("./config/redis");

const PORT = process.env.PORT || 5001;

const app = express();

const authRoutes = require("./routes/authRoute");

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Mongodb connected successfully");
  })
  .catch((error) => {
    console.error("Connection Error", error);
  });

// Auth routes
app.use("/api/auth", authRoutes);

// Home route
app.get("/", (req, res) => {
  res.send("Auth Service is Running");
});

// Start server
const startServer = async () => {
  try {
    // Connect Redis
    await connectRedis();

    app.listen(PORT, () => {
      console.log(`Auth Service Running On ${PORT}`);
    });
  } catch (error) {
    console.error(
      "Failed to start Auth Service:",
      error.message
    );

    process.exit(1);
  }
};

startServer();