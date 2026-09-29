const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { redisClient } = require("../config/redis");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

//Register

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, membership } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    let user = await User.findOne({
      email: normalizedEmail,
    });

    if (user && user.isEmailVerified) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();

    if (user && !user.isEmailVerified) {
      user.name = name;
      user.password = hashedPassword;
      user.role = role || "user";
      user.membership = membership || "normal";
      user.emailOtp = otp;
      user.emailOtpExpires = new Date(Date.now() + 10 * 60 * 1000);

      await user.save();
    } else {
      user = await User.create({
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role: role || "user",
        membership: membership || "normal",
        isEmailVerified: false,
        emailOtp: otp,
        emailOtpExpires: new Date(Date.now() + 10 * 60 * 1000),
      });
    }

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: normalizedEmail,
      subject: "ZestBag Email Verification OTP",
      text: `Your ZestBag verification OTP is ${otp}. It expires in 10 minutes.`,
      html: `
        <h2>ZestBag Email Verification</h2>
        <p>Your verification OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP will expire in 10 minutes.</p>
      `,
    });

    return res.status(201).json({
      message: "OTP sent to your email",
      email: normalizedEmail,
    });
  } catch (error) {
    console.error("Registration error:", error);
    console.error("Registration error message:", error.message);
    console.error("Registration error code:", error.code);

    return res.status(500).json({
      message: "Registration failed",
    });
  }
};

//login

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    //Check Empty Fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and Password are Required",
      });
    }

    //Find User
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "User Not Exist",
      });
    }

    //Compare Password

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Incorrect Password",
      });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in",
      });
    }

    //Generate token

    const token = jwt.sign(
      { id: user._id, role: user.role, membership: user.membership },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    // User response
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      membership: user.membership,
    };

    res.status(200).json({
      message: "Login successful",
      token,
      user: userResponse,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// OTP verification

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        message: "Email is already verified",
      });
    }

    if (!user.emailOtp || !user.emailOtpExpires) {
      return res.status(400).json({
        message: "OTP not found. Please request a new OTP",
      });
    }

    if (user.emailOtpExpires < new Date()) {
      return res.status(400).json({
        message: "OTP has expired",
      });
    }

    if (user.emailOtp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    user.isEmailVerified = true;
    user.emailOtp = null;
    user.emailOtpExpires = null;

    await user.save();

    return res.status(200).json({
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("OTP verification error:", error);

    return res.status(500).json({
      message: "OTP verification failed",
    });
  }
};

//Resend Otp

exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        message: "Email is already verified",
      });
    }

    const otp = generateOtp();

    user.emailOtp = otp;
    user.emailOtpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: normalizedEmail,
      subject: "ZestBag New Verification OTP",
      text: `Your new ZestBag verification OTP is ${otp}.`,
      html: `
        <h2>ZestBag Email Verification</h2>
        <p>Your new verification OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP will expire in 10 minutes.</p>
      `,
    });

    return res.status(200).json({
      message: "New OTP sent successfully",
    });
  } catch (error) {
    console.error("Resend OTP error:", error);

    return res.status(500).json({
      message: "Unable to resend OTP",
    });
  }
};

// Get logged-in user's profile

exports.getProfile = async (req, res) => {
  try {
    const CACHE_KEY = `user:${req.user.id}`;
    const CACHE_TTL = 300;

    // Check Redis
    const cachedUser = await redisClient.get(CACHE_KEY);

    if (cachedUser) {
      console.log("User profile cache HIT");

      return res.status(200).json({
        success: true,
        user: JSON.parse(cachedUser),
      });
    }

    console.log("User profile cache MISS");

    // Fetch from MongoDB
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Store in Redis
    await redisClient.setEx(CACHE_KEY, CACHE_TTL, JSON.stringify(user));

    console.log("User profile stored in Redis");

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
};

// Update logged-in user's profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address, city, district, state, pincode } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.name = name.trim();
    user.phone = phone?.trim() || "";
    user.address = address?.trim() || "";
    user.city = city?.trim() || "";
    user.district = district?.trim() || "";
    user.state = state?.trim() || "";
    user.pincode = pincode?.trim() || "";

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        city: user.city,
        district: user.district,
        state: user.state,
        pincode: user.pincode,
        role: user.role,
        membership: user.membership,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

// Change logged-in user's password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All password fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match",
      });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isCurrentPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isCurrentPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to change password",
    });
  }
};

// Forgot Password

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address",
      });
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Store hashed token in database
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;

    // Token expires in 15 minutes
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);

    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: normalizedEmail,
      subject: "ZestBag Password Reset",
      text: `Reset your ZestBag password using this link: ${resetUrl}. This link will expire in 15 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2 style="color: #4a1d3f;">
            ZestBag Password Reset
          </h2>

          <p>
            We received a request to reset your ZestBag account password.
          </p>

          <p>
            Click the button below to create a new password.
          </p>

          <div style="margin: 30px 0;">
            <a
              href="${resetUrl}"
              style="
                display: inline-block;
                padding: 12px 24px;
                background-color: #4a1d3f;
                color: white;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
              "
            >
              Reset Password
            </a>
          </div>

          <p>
            This link will expire in <strong>15 minutes</strong>.
          </p>

          <p>
            If you did not request a password reset, you can safely ignore
            this email.
          </p>

          <p>
            Regards,<br />
            ZestBag Team
          </p>
        </div>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send password reset email",
    });
  }
};

// Reset Password

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Invalid password reset link",
      });
    }

    if (!password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and confirm password are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: {
        $gt: new Date(),
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Password reset link is invalid or has expired",
      });
    }

    // Prevent using the same password
    const isSamePassword = await bcrypt.compare(password, user.password);

    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from your current password",
      });
    }

    user.password = await bcrypt.hash(password, 10);

    // Invalidate reset token
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reset password",
    });
  }
};

// Validate Reset Password Token

exports.validateResetPasswordToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Invalid password reset link",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: {
        $gt: new Date(),
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Password reset link is invalid or has expired",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password reset link is valid",
    });
  } catch (error) {
    console.error("Validate reset token error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to validate password reset link",
    });
  }
};

exports.getAdminDashboard = async (req, res) => {
  try {
    const totalCustomers = await User.countDocuments({
      role: "user",
      isEmailVerified: true,
    });

    return res.status(200).json({
      success: true,
      dashboard: {
        totalCustomers,
      },
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load admin dashboard",
    });
  }
};

exports.getAdminUsers = async (req, res) => {
  try {
    const CACHE_KEY = "users:admin";
    const CACHE_TTL = 300;

    // Check Redis cache
    const cachedUsers = await redisClient.get(CACHE_KEY);

    if (cachedUsers) {
      console.log("Admin users cache HIT");

      return res.status(200).json({
        success: true,
        users: JSON.parse(cachedUsers),
      });
    }

    console.log("Admin users cache MISS");

    // Fetch from MongoDB
    const users = await User.find({
      role: "user",
    })
      .select(
        "_id name email phone address city district state pincode membership isEmailVerified createdAt",
      )
      .sort({ createdAt: -1 });

    // Store in Redis
    await redisClient.setEx(CACHE_KEY, CACHE_TTL, JSON.stringify(users));

    console.log("Admin users stored in Redis");

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Admin users error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load customers",
    });
  }
};
