const express = require("express");
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  createRazorpayOrder,
  verifyRazorpayPayment,
  getOrderById,
  updateOrderTracking,
  trackOrder,
  getAdminDashboard
} = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");



router.get( "/admin/dashboard", protect, authorizeRoles("admin"),getAdminDashboard);
router.get("/track/:trackingToken",trackOrder);
router.post("/create", protect, authorizeRoles("user"), createOrder);
router.get("/myorders", protect, authorizeRoles("user"), getMyOrders);
router.get("/allorders", protect, authorizeRoles("admin"), getAllOrders);
router.get( "/:id", protect,authorizeRoles("admin"),getOrderById);
router.put("/updatetracking/:id",protect,authorizeRoles("admin"),updateOrderTracking);
router.put( "/updatestatus/:id",protect,authorizeRoles("admin"),updateOrderStatus);
router.post("/razorpay/create-order",protect,authorizeRoles("user"),createRazorpayOrder);
router.post("/razorpay/verify",protect,authorizeRoles("user"),verifyRazorpayPayment);

module.exports = router;
