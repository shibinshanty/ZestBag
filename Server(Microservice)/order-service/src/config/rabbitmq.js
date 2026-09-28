const amqp = require("amqplib");

let connection;
let channel;

const connectRabbitMQ = async () => {
  try {
    connection = await amqp.connect(
      "amqp://admin:admin123@localhost:5672"
    );

    channel = await connection.createChannel();

    console.log("Order Service RabbitMQ connected successfully");

    return channel;
  } catch (error) {
    console.error(
      "Order Service RabbitMQ connection failed:",
      error.message
    );

    throw error;
  }
};

const getChannel = () => {
  if (!channel) {
    throw new Error("RabbitMQ channel is not initialized");
  }

  return channel;
};

module.exports = {
  connectRabbitMQ,
  getChannel,
};