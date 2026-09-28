const { getChannel } = require("../config/rabbitmq");

const QUEUE_NAME = "notification_queue";

const publishEvent = async (eventData) => {
  try {
    const channel = getChannel();

    await channel.assertQueue(QUEUE_NAME, {
      durable: true,
    });

    channel.sendToQueue(
      QUEUE_NAME,
      Buffer.from(JSON.stringify(eventData)),
      {
        persistent: true,
      }
    );

    console.log("RabbitMQ event published:");
    console.log(eventData);
  } catch (error) {
    console.error(
      "Failed to publish RabbitMQ event:",
      error.message
    );

    throw error;
  }
};

module.exports = {
  publishEvent,
};