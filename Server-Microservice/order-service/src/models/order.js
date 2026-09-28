const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    orderItems: [
      {
        productId: String,

        title: {
          type: String,
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
        },

        price: {
          type: Number,
          required: true,
        },

        image: String,
      },
    ],

    shippingAddress: {
      fullName: {
        type: String,
        required: true,
      },

      phone: {
        type: String,
        required: true,
      },

      email: {
        type: String,
        required: true,
      },

      address: {
        type: String,
        required: true,
      },

      city: {
        type: String,
        required: true,
      },

      district: {
        type: String,
        required: true,
      },

      state: {
        type: String,
        required: true,
      },

      postalCode: {
        type: String,
        required: true,
      },

      country: {
        type: String,
        required: true,
        default: "India",
      },
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "Online"],
      default: "COD",
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Completed", "Failed"],
      default: "Pending",
    },

    paymentInfo: {
      transactionId: String,
      status: String,

      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
    },

    isPaid: {
      type: Boolean,
      default: false,
    },

    totalPrice: {
      type: Number,
      required: true,
    },

    deliveryType: {
      type: String,
      enum: ["Standard", "Premium"],
      default: "Standard",
    },

    estimatedDeliveryDate: {
      type: Date,
    },

    orderStatus: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },

    deliveredAt: {
      type: Date,
    },

    cancellationReason: {
      type: String,
    },

    trackingNumber: {
      type: String,
      trim: true,
    },

    trackingToken: {
      type: String,
      unique: true,
      index: true,
      trim: true,
    },

    courierName: {
      type: String,
      trim: true,
    },

    trackingUrl: {
      type: String,
      trim: true,
    },

    shippedAt: {
      type: Date,
    },

    outForDeliveryAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Order", orderSchema);
