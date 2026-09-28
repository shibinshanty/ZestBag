// models/Cart.js
const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    items: [
      {
        productId: String,
        title: String,
        price: Number,
        image: String,
        quantity: {
          type: Number,
          default: 1,
        },
        selected: {              
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);