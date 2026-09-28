const { getChannel } = require("../config/rabbitmq");
const Notification = require("../models/NotificationModel");

const QUEUE_NAME = "notification_queue";

const startConsumer = async () => {
  try {
    const channel = getChannel();

    await channel.assertQueue(QUEUE_NAME, {
      durable: true,
    });

    console.log(
      `RabbitMQ consumer listening on: ${QUEUE_NAME}`
    );

    channel.consume(QUEUE_NAME, async (message) => {
      if (!message) {
        return;
      }

      try {
        const data = JSON.parse(
          message.content.toString()
        );

        console.log("RabbitMQ message received:");
        console.log(data);

        if (data.event === "ORDER_CREATED") {
          const notification = await Notification.create({
            recipientType: "admin",
            userId: data.userId,
            type: "ORDER_CREATED",
            title: "New Order Created",
            message: `A new order ${data.orderId} has been created.`,
            orderId: data.orderId,
          });

         
          console.log(notification);
        }

        channel.ack(message);
      } catch (error) {
        console.error(
          "Failed to process RabbitMQ message:",
          error
        );

        channel.nack(message, false, false);
      }
    });
  } catch (error) {
    console.error(
      "RabbitMQ consumer error:",
      error
    );
  }
};

module.exports = startConsumer;