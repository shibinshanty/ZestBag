const Order = require("../models/order");
const Cart = require("../models/cart");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const { publishEvent } = require("../rabbitmq/publisher");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ======================================================
// HELPER - GENERATE TRACKING TOKEN
// ======================================================

const generateTrackingToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// ======================================================
// CREATE RAZORPAY ORDER
// ======================================================

exports.createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    const options = {
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      order: razorpayOrder,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create Razorpay order",
    });
  }
};

// ======================================================
// VERIFY RAZORPAY PAYMENT
// ======================================================

exports.verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      shippingAddress,
      deliveryType,
      buyNow,
    } = req.body;

    // ==================================================
    // VALIDATE PAYMENT DETAILS
    // ==================================================

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment details are missing",
      });
    }

    // ==================================================
    // VALIDATE SHIPPING ADDRESS
    // ==================================================

    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.email ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.district ||
      !shippingAddress.state ||
      !shippingAddress.postalCode ||
      !shippingAddress.country
    ) {
      console.log(
        "Invalid shipping address received:",
        shippingAddress
      );

      return res.status(400).json({
        success: false,
        message: "Complete shipping address details are required",
      });
    }

    // ==================================================
    // VERIFY RAZORPAY SIGNATURE
    // ==================================================

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    // ==================================================
    // GET USER CART
    // ==================================================

    const cart = await Cart.findOne({
      user: req.user.id,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // ==================================================
    // DETERMINE PURCHASE ITEMS
    // ==================================================

    let orderItems = [];

    // ==================================================
    // BUY NOW
    // ==================================================

    if (buyNow && buyNow.productId) {
      const productId = String(buyNow.productId);
      const requestedQuantity = Number(buyNow.quantity);

      if (
        !requestedQuantity ||
        requestedQuantity <= 0 ||
        !Number.isInteger(requestedQuantity)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid Buy Now quantity",
        });
      }

      const cartItem = cart.items.find(
        (item) => String(item.productId) === productId
      );

      if (!cartItem) {
        return res.status(400).json({
          success: false,
          message:
            "Buy Now product is not available in your cart",
        });
      }

      orderItems = [
        {
          productId: cartItem.productId,
          title: cartItem.title,
          image: cartItem.image,
          quantity: requestedQuantity,
          price: cartItem.price,
        },
      ];
    }

    // ==================================================
    // NORMAL CART CHECKOUT
    // ==================================================

    else {
      const selectedItems = cart.items.filter(
        (item) => item.selected === true
      );

      if (selectedItems.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No products selected",
        });
      }

      orderItems = selectedItems.map((item) => ({
        productId: item.productId,
        title: item.title,
        image: item.image,
        quantity: item.quantity,
        price: item.price,
      }));
    }

    // ==================================================
    // CALCULATE PRODUCT TOTAL
    // ==================================================

    const productTotal = orderItems.reduce(
      (total, item) =>
        total + Number(item.price) * Number(item.quantity),
      0
    );

    // ==================================================
    // DELIVERY CHARGE
    // ==================================================

    const deliveryCharge =
      productTotal >= 999 || productTotal === 0
        ? 0
        : 49;

    const totalPrice = productTotal + deliveryCharge;

    // ==================================================
    // VERIFY RAZORPAY ORDER AMOUNT
    // ==================================================

    const razorpayOrder =
      await razorpay.orders.fetch(razorpay_order_id);

    const expectedAmount = Math.round(totalPrice * 100);

    if (
      Number(razorpayOrder.amount) !== expectedAmount
    ) {
      console.error("Razorpay amount mismatch:", {
        razorpayAmount: razorpayOrder.amount,
        expectedAmount,
      });

      return res.status(400).json({
        success: false,
        message:
          "Payment amount does not match the order amount",
      });
    }

    // ==================================================
    // ESTIMATED DELIVERY DATE
    // ==================================================

    const estimatedDeliveryDate = new Date();

    if (deliveryType === "Standard") {
      estimatedDeliveryDate.setDate(
        estimatedDeliveryDate.getDate() + 7
      );
    } else {
      estimatedDeliveryDate.setDate(
        estimatedDeliveryDate.getDate() + 2
      );
    }

    // ==================================================
    // GENERATE TRACKING TOKEN
    // ==================================================

    const trackingToken = generateTrackingToken();

    // ==================================================
    // CREATE ORDER
    // ==================================================

    const order = await Order.create({
      user: req.user.id,

      orderItems,

      shippingAddress: {
        fullName: shippingAddress.fullName,
        phone: shippingAddress.phone,
        email: shippingAddress.email,
        address: shippingAddress.address,
        city: shippingAddress.city,
        district: shippingAddress.district,
        state: shippingAddress.state,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country,
      },

      paymentMethod: "Online",

      paymentStatus: "Completed",

      paymentInfo: {
        transactionId: razorpay_payment_id,
        status: "Completed",
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      },

      isPaid: true,

      totalPrice,

      deliveryType,

      estimatedDeliveryDate,

      orderStatus: "Pending",

      trackingToken,
    });

    // ==================================================
    // UPDATE CART
    // ==================================================

    if (buyNow && buyNow.productId) {
      const productId = String(buyNow.productId);
      const purchasedQuantity = Number(buyNow.quantity);

      const cartItemIndex = cart.items.findIndex(
        (item) => String(item.productId) === productId
      );

      if (cartItemIndex !== -1) {
        const cartItem = cart.items[cartItemIndex];

        if (
          Number(cartItem.quantity) <= purchasedQuantity
        ) {
          // Remove product completely
          cart.items.splice(cartItemIndex, 1);
        } else {
          // Reduce only purchased quantity
          cartItem.quantity =
            Number(cartItem.quantity) -
            purchasedQuantity;

          // Keep item selected state unchanged
        }
      }
    } else {
      // Normal cart checkout
      cart.items = cart.items.filter(
        (item) => item.selected !== true
      );
    }

    await cart.save();

    // ==================================================
    // PUBLISH ORDER CREATED EVENT
    // ==================================================

    try {
      await publishEvent({
        event: "ORDER_CREATED",
        userId: req.user.id,
        orderId: order._id.toString(),
        totalPrice: order.totalPrice,
      });
    } catch (error) {
      console.error(
        "Failed to publish ORDER_CREATED event:",
        error.message
      );
    }

    // ==================================================
    // SUCCESS RESPONSE
    // ==================================================

    return res.status(201).json({
      success: true,
      message:
        "Payment verified and order created successfully",
      order,
    });
  } catch (error) {
    console.error(
      "Payment verification/order creation error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// CREATE COD ORDER
// ======================================================

exports.createOrder = async (req, res) => {
  try {
    const {
      shippingAddress,
      paymentMethod,
      deliveryType,
    } = req.body;

    const cart = await Cart.findOne({
      user: req.user.id,
    });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    // Get selected products only
    const selectedItems = cart.items.filter(
      (item) => item.selected === true
    );

    if (selectedItems.length === 0) {
      return res.status(400).json({
        message: "No products selected",
      });
    }

    // Calculate total price
    const totalPrice = selectedItems.reduce(
      (total, item) =>
        total + item.price * item.quantity,
      0
    );

    // Calculate delivery date
    const estimatedDeliveryDate = new Date();

    if (deliveryType === "Standard") {
      estimatedDeliveryDate.setDate(
        estimatedDeliveryDate.getDate() + 7
      );
    } else if (deliveryType === "Premium") {
      estimatedDeliveryDate.setDate(
        estimatedDeliveryDate.getDate() + 2
      );
    }

    // Generate tracking token
    const trackingToken = generateTrackingToken();

    // Create order
    const order = await Order.create({
      user: req.user.id,

      orderItems: selectedItems.map((item) => ({
        productId: item.productId,
        title: item.title,
        image: item.image,
        quantity: item.quantity,
        price: item.price,
      })),

      shippingAddress,

      paymentMethod,

      deliveryType,

      estimatedDeliveryDate,

      totalPrice,

      paymentStatus: "Pending",

      isPaid: false,

      paymentInfo: {
        status: "Pending",
      },

      orderStatus: "Pending",

      trackingToken,
    });

    // Remove selected items from cart
    cart.items = cart.items.filter(
      (item) => item.selected !== true
    );

    await cart.save();

    // ==================================================
    // PUBLISH ORDER CREATED EVENT
    // ==================================================

    try {
      await publishEvent({
        event: "ORDER_CREATED",
        userId: req.user.id,
        orderId: order._id.toString(),
        totalPrice: order.totalPrice,
      });
    } catch (error) {
      console.error(
        "Failed to publish ORDER_CREATED event:",
        error.message
      );
    }

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// ======================================================
// GET MY ORDERS
// ======================================================

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get my orders error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// GET ALL ORDERS - ADMIN
// ======================================================

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({
      createdAt: -1,
    });

    return res.status(200).json(orders);
  } catch (error) {
    console.error("Get all orders error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// ======================================================
// UPDATE ORDER STATUS - ADMIN
// ======================================================

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;

    const validStatus = [
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    if (!validStatus.includes(orderStatus)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    order.orderStatus = orderStatus;

    // If shipped
    if (orderStatus === "Shipped") {
      if (!order.shippedAt) {
        order.shippedAt = new Date();
      }

      // Generate token for old orders
      if (!order.trackingToken) {
        order.trackingToken = generateTrackingToken();
      }
    }

    // If delivered
    if (orderStatus === "Delivered") {
      order.deliveredAt = new Date();
    }

    // If cancelled
    if (orderStatus === "Cancelled") {
      order.cancellationReason =
        req.body.cancellationReason ||
        "Cancelled by admin";
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// GET ORDER BY ID - ADMIN
// ======================================================

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get order by ID error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// UPDATE ORDER TRACKING - ADMIN
// ======================================================

exports.updateOrderTracking = async (req, res) => {
  try {
    const {
      trackingNumber,
      courierName,
      trackingUrl,
    } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // Generate tracking token for old orders
    if (!order.trackingToken) {
      order.trackingToken = generateTrackingToken();
    }

    // Tracking number
    if (trackingNumber !== undefined) {
      order.trackingNumber =
        trackingNumber.trim();
    }

    // Courier
    if (courierName !== undefined) {
      order.courierName =
        courierName.trim();
    }

    // Courier tracking URL
    if (trackingUrl !== undefined) {
      order.trackingUrl =
        trackingUrl.trim();
    }

    // If shipped, save shipped time
    if (
      order.orderStatus === "Shipped" &&
      !order.shippedAt
    ) {
      order.shippedAt = new Date();
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message:
        "Tracking information updated successfully",
      trackingToken: order.trackingToken,
      order,
    });
  } catch (error) {
    console.error(
      "Update order tracking error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// PUBLIC CUSTOMER TRACKING
// ======================================================

exports.trackOrder = async (req, res) => {
  try {
    const { trackingToken } = req.params;

    if (!trackingToken) {
      return res.status(400).json({
        success: false,
        message: "Tracking token is required",
      });
    }

    const order = await Order.findOne({
      trackingToken,
    }).select(
      "_id trackingToken orderStatus courierName trackingNumber trackingUrl shippedAt outForDeliveryAt deliveredAt estimatedDeliveryDate createdAt"
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Tracking information not found",
      });
    }

    const orderNumber =
      "#" +
      order._id
        .toString()
        .slice(-8)
        .toUpperCase();

    return res.status(200).json({
      success: true,

      tracking: {
        orderNumber,

        orderStatus:
          order.orderStatus,

        courierName:
          order.courierName || null,

        trackingNumber:
          order.trackingNumber || null,

        trackingUrl:
          order.trackingUrl || null,

        shippedAt:
          order.shippedAt || null,

        outForDeliveryAt:
          order.outForDeliveryAt || null,

        deliveredAt:
          order.deliveredAt || null,

        estimatedDeliveryDate:
          order.estimatedDeliveryDate || null,

        createdAt:
          order.createdAt,
      },
    });
  } catch (error) {
    console.error(
      "Track order error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// ADMIN DASHBOARD
// ======================================================

exports.getAdminDashboard = async (req, res) => {
  try {
    // Total Orders
    const totalOrders = await Order.countDocuments();

    // Total Sales
    // Only completed payments are included
    const salesResult = await Order.aggregate([
      {
        $match: {
          paymentStatus: "Completed",
        },
      },
      {
        $group: {
          _id: null,
          totalSales: {
            $sum: "$totalPrice",
          },
        },
      },
    ]);

    const totalSales =
      salesResult.length > 0
        ? salesResult[0].totalSales
        : 0;

    // Order Status Summary
    const statusResult = await Order.aggregate([
      {
        $group: {
          _id: "$orderStatus",
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    const orderStatus = {};

    statusResult.forEach((item) => {
      orderStatus[item._id] = item.count;
    });

    // Recent Orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select(
        "_id userId totalPrice paymentStatus orderStatus createdAt trackingToken"
      );

    return res.status(200).json({
      success: true,

      dashboard: {
        totalSales,
        totalOrders,
        orderStatus,
        recentOrders,
      },
    });
  } catch (error) {
    console.error(
      "Order admin dashboard error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load order dashboard",
    });
  }
};