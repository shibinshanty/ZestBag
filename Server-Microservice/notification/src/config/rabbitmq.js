const amqp = require("amqplib");

let connection;
let channel;

const connectRabbitMQ = async () => {
  try {
    const rabbitMQUrl =
      process.env.RABBITMQ_URL ||
      "amqp://admin:admin123@localhost:5672";

    connection = await amqp.connect(rabbitMQUrl);

    channel = await connection.createChannel();

    console.log("RabbitMQ connected successfully");

    return channel;
  } catch (error) {
    console.error(
      "RabbitMQ connection failed:",
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