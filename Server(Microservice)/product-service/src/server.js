const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const { connectRedis } = require("./config/redis");

const app = express();

const PORT = process.env.PORT || 5002;

const productRoute = require("./routes/productRoute");

app.use(cors());
app.use(express.json());

app.use("/api/products", productRoute);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((error) => {
    console.error("Connection Error", error);
  });

app.get("/", (req, res) => {
  res.send("Product Service is Running");
});

const startServer = async () => {
  try {
    await connectRedis();

    app.listen(PORT, () => {
      console.log(`Product Service is running on ${PORT}`);
    });
  } catch (error) {
    console.error(
      "Failed to start Product Service:",
      error.message
    );

    process.exit(1);
  }
};

startServer();