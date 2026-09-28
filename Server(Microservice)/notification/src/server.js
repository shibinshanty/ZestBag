const express = require("express");
const cors = require("cors");
require("dotenv").config();

const mongoose = require("mongoose");
const startConsumer = require("./rabbitmq/consumer");
const notificationRoutes = require("./routes/NotificationRoute");
const { connectRabbitMQ } = require("./config/rabbitmq");

const app = express();

const PORT = process.env.PORT || 5004;

app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.error("Connection Error", error);
  });

// Home route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Notification Service is Running",
  });
});

// Notification routes
app.use("/api/notifications", notificationRoutes);

// Start server
const startServer = async () => {
  try {
    await connectRabbitMQ();
    await startConsumer();

    app.listen(PORT, () => {
      console.log(`Notification Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start Notification Service:", error.message);
    process.exit(1);
  }
};

startServer();
