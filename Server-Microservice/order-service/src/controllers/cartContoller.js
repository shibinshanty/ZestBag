const Cart = require("../models/cart");

exports.addToCart = async (req, res) => {
  try {
    const {
      productId,
      title,
      price,
      image,
      quantity,
      selected
    } = req.body;

    let cart = await Cart.findOne({
      user: req.user.id
    });

    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: []
      });
    }

    const itemIndex = cart.items.findIndex(
      item =>
        item.productId.toString() === productId.toString()
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += Number(quantity);
    } else {
      cart.items.push({
        productId,
        title,
        price: Number(price),
        image,
        quantity: Number(quantity),
        selected: Boolean(selected)
      });
    }

    await cart.save();

    return res.status(200).json({
      message: "Item added to cart",
      cart: cart
    });
  } catch (error) {
    console.error("Add cart error:", error);

    return res.status(500).json({
      message: error.message
    });
  }
};

exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({
      user: req.user.id,
    });

    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: [],
      });
    }

    res.status(200).json(cart);
  } catch (error) {
    console.error("Get cart error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

exports.deleteFromCart = async (req, res) => {
  try {
    const { productId } = req.body;

    let cart = await Cart.findOne({
      user: req.user.id,
    });

    // Check if cart exists
    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    // Find and remove the item
    const itemIndex = cart.items.findIndex(
      (item) => item.productId === productId,
    );

    if (itemIndex > -1) {
      cart.items.splice(itemIndex, 1);
      await cart.save();

      res.status(200).json({
        message: "Item removed from cart",
        cart,
      });
    } else {
      res.status(404).json({
        message: "Item not found in cart",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.removeQuantityFromCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    let cart = await Cart.findOne({
      user: req.user.id,
    });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId === productId,
    );

    if (itemIndex > -1) {
      if (cart.items[itemIndex].quantity > quantity) {
        cart.items[itemIndex].quantity -= quantity;
      } else {
        cart.items.splice(itemIndex, 1);
      }

      await cart.save();

      res.status(200).json({
        message: "Quantity updated",
        cart,
      });
    } else {
      res.status(404).json({
        message: "Item not found in cart",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.selectCartItem = async (req, res) => {
  try {
    const { productId, selected } = req.body;

    if (!productId || typeof selected !== "boolean") {
      return res.status(400).json({
        message: "Invalid productId or selected value",
      });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find((item) => item.productId === productId);
    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    item.selected = selected;
    await cart.save();

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
