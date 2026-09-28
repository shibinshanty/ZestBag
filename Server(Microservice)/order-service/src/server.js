const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const { connectRabbitMQ } = require("./config/rabbitmq");

const PORT = process.env.PORT || 5003;

const cartRoutes = require("./routes/cartRoute");
const orderRoutes = require("./routes/orderRoute");

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Mongodb connected Successfully");
  })
  .catch((error) => {
    console.log("Connection Error", error);
  });

app.get("/", (req, res) => {
  res.send("Order Service is Running");
});

const startServer = async () => {
  try {
    await connectRabbitMQ();

    app.listen(PORT, () => {
      console.log(`Order Service is Running on ${PORT}`);
    });
  } catch (error) {
    console.error(
      "Failed to start Order Service:",
      error.message
    );

    process.exit(1);
  }
};

startServer();