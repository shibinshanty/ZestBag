const express = require("express");
const router = express.Router();

const {
  login,
  register,
  verifyOtp,
  resendOtp,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  validateResetPasswordToken,
  getAdminDashboard,
  getAdminUsers
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleWare");
const { authorizeRoles } = require("../middleware/roleMiddleWare");

router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/reset-password/:token",validateResetPasswordToken);



router.get("/admin", protect, authorizeRoles("admin"), (req, res) => {
  res.json({
    message: "Welcome Admin",
  });
});

router.get(
  "/admin/users",
  protect,
  authorizeRoles("admin"),
  getAdminUsers
);

router.get(
  "/admin/dashboard",
  protect,
  authorizeRoles("admin"),
  getAdminDashboard
);

module.exports = router;
